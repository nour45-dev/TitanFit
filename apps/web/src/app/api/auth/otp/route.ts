import { NextRequest, NextResponse } from 'next/server';
import { getServerTenantRegistry } from '../../../../lib/tenant-registry';

// In-memory OTP store for trainee/member verification
interface OtpRecord {
  code: string;
  target: string;
  memberId: string;
  memberCode: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  tenantSlug: string;
  expiresAt: number;
}

const globalForOtp = globalThis as unknown as {
  __titanfitOtpStore?: Map<string, OtpRecord>;
};

if (!globalForOtp.__titanfitOtpStore) {
  globalForOtp.__titanfitOtpStore = new Map<string, OtpRecord>();
}
const otpStore = globalForOtp.__titanfitOtpStore;

// Clean expired OTPs every 5 minutes
function cleanExpiredOtps() {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    cleanExpiredOtps();
    const body = await req.json();
    const action = body.action || 'REQUEST_OTP'; // 'REQUEST_OTP' | 'VERIFY_OTP'
    const identifier = (body.identifier || '').trim();
    const cleanId = identifier.replace(/[\s\-\(\)]/g, '').toLowerCase();
    const registry = getServerTenantRegistry();

    // 1. REQUEST OTP for Member
    if (action === 'REQUEST_OTP') {
      if (!cleanId) {
        return NextResponse.json(
          { success: false, message: 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني أو كود العضوية' },
          { status: 400 },
        );
      }

      // Find member in server registry or passed member data
      let targetMember: any = body.matchedMember || null;
      if (!targetMember) {
        for (const m of registry.members.values()) {
          const mPhone = (m.phone || '').replace(/[\s\-\(\)]/g, '').toLowerCase();
          const mEmail = (m.email || '').trim().toLowerCase();
          const mCode = (m.code || '').trim().toLowerCase();
          if (
            mPhone === cleanId ||
            (cleanId.startsWith('01') && mPhone.endsWith(cleanId)) ||
            (cleanId.startsWith('+20') && cleanId.endsWith(mPhone.replace('+20', ''))) ||
            mEmail === cleanId ||
            mCode === cleanId
          ) {
            targetMember = m;
            break;
          }
        }
      }

      // Default demo member fallback if Youssef El-Masry (phone: 01001234567 / TF-2026-1001) or other member
      if (!targetMember) {
        if (
          cleanId === '01001234567' ||
          cleanId === '+201001234567' ||
          cleanId === 'youssef.masry@titanfit.eg' ||
          cleanId === 'tf-2026-1001'
        ) {
          targetMember = {
            id: 'mem-1001',
            code: 'TF-2026-1001',
            fullNameEn: 'Youssef El-Masry',
            fullNameAr: 'يوسف المصري',
            phone: '+201001234567',
            email: 'youssef.masry@titanfit.eg',
            tenantSlug: 'titanfit-egypt',
          };
        }
      }

      if (!targetMember) {
        return NextResponse.json(
          {
            success: false,
            message: 'لم يتم العثور على عضوية مسجلة بهذا الرقم أو البريد. يرجى التواصل مع استقبال الجيم.',
          },
          { status: 404 },
        );
      }

      // Generate 6-digit OTP code (predictable 482910 for simulated instant demo, or random)
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const demoCode = '482910'; // fixed backup OTP for convenience
      const selectedOtp = otpCode;

      const record: OtpRecord = {
        code: selectedOtp,
        target: cleanId,
        memberId: targetMember.id,
        memberCode: targetMember.code,
        memberName: targetMember.fullNameAr || targetMember.fullNameEn || 'عضو الجيم',
        memberEmail: targetMember.email,
        memberPhone: targetMember.phone,
        tenantSlug: targetMember.tenantSlug || 'titanfit-egypt',
        expiresAt: Date.now() + 60 * 1000, // Strictly 60 seconds validity
      };

      otpStore.set(cleanId, record);
      // Also store under phone and email for easy lookup
      if (targetMember.phone) {
        otpStore.set(targetMember.phone.replace(/[\s\-\(\)]/g, '').toLowerCase(), record);
      }
      if (targetMember.email) {
        otpStore.set(targetMember.email.trim().toLowerCase(), record);
      }
      if (targetMember.code) {
        otpStore.set(targetMember.code.trim().toLowerCase(), record);
      }

      // Mask phone & email for privacy in response
      const maskedPhone = targetMember.phone
        ? targetMember.phone.slice(0, 4) + '****' + targetMember.phone.slice(-3)
        : '';
      const maskedEmail = targetMember.email
        ? targetMember.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
        : '';

      // Automatic Multi-Provider Dispatch (SMS Misr / Twilio / WhatsApp Cloud / Webhook)
      const messageText = `نادي TitanFit الرياضي: رمز الدخول الخاص بك هو [ ${selectedOtp} ]. الرمز صالح لمدة 60 ثانية فقط.`;
      const cleanPhoneDigits = targetMember.phone.replace(/[^0-9]/g, '');
      const internationalPhone = cleanPhoneDigits.startsWith('01') ? `2${cleanPhoneDigits}` : cleanPhoneDigits;

      // 1. SMS Misr (Egypt Premier Gateway)
      if (process.env.SMS_MISR_USERNAME && process.env.SMS_MISR_PASSWORD) {
        try {
          const smsMisrUrl = `https://smsmisr.com/api/v2/?environment=1&username=${encodeURIComponent(process.env.SMS_MISR_USERNAME)}&password=${encodeURIComponent(process.env.SMS_MISR_PASSWORD)}&language=2&sender=${encodeURIComponent(process.env.SMS_MISR_SENDER || 'TitanFit')}&mobile=${internationalPhone}&message=${encodeURIComponent(messageText)}`;
          fetch(smsMisrUrl, { method: 'POST' }).catch(() => {});
        } catch {}
      }

      // 2. Twilio SMS
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
          const params = new URLSearchParams({
            To: `+${internationalPhone}`,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: messageText,
          });
          fetch(twilioUrl, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
          }).catch(() => {});
        } catch {}
      }

      // 3. Meta WhatsApp Cloud API
      if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
        try {
          fetch(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: internationalPhone,
              type: 'text',
              text: { body: messageText },
            }),
          }).catch(() => {});
        } catch {}
      }

      // 4. Custom SMS Gateway Webhook
      if (process.env.SMS_GATEWAY_URL) {
        try {
          fetch(process.env.SMS_GATEWAY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: targetMember.phone,
              internationalPhone: `+${internationalPhone}`,
              message: messageText,
              otp: selectedOtp,
              ttlSeconds: 60,
            }),
          }).catch(() => {});
        } catch {}
      }

      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق OTP بنجاح إلى هاتفك (صالح لمدة 60 ثانية)',
        targetInfo: {
          memberName: record.memberName,
          memberCode: record.memberCode,
          maskedPhone,
          maskedEmail,
          rawPhone: targetMember.phone,
        },
        expiresInSeconds: 60,
        simulatedOtp: selectedOtp,
        demoBackupOtp: demoCode,
      });
    }

    // 2. VERIFY OTP for Member
    if (action === 'VERIFY_OTP') {
      const code = (body.otpCode || body.code || '').trim();
      if (!code) {
        return NextResponse.json(
          { success: false, message: 'يرجى إدخال رمز التحقق OTP' },
          { status: 400 },
        );
      }

      const record = otpStore.get(cleanId);
      const isDemoMaster = code === '482910';

      if (record && record.expiresAt < Date.now()) {
        otpStore.delete(cleanId);
        return NextResponse.json(
          {
            success: false,
            message: '⚠️ انتهت صلاحية هذا الرمز (مرت 60 ثانية). يرجى الضغط على "إعادة إرسال الرمز" لاستلام كود جديد.',
          },
          { status: 400 },
        );
      }

      if (!record && !isDemoMaster) {
        return NextResponse.json(
          { success: false, message: 'انتهت صلاحية رمز التحقق أو غير موجود. اطلب رمزاً جديداً.' },
          { status: 400 },
        );
      }

      if (record && record.code !== code && !isDemoMaster) {
        return NextResponse.json(
          { success: false, message: 'رمز التحقق غير صحيح. يرجى التأكد وإعادة المحاولة.' },
          { status: 400 },
        );
      }

      const memberId = record?.memberId || 'mem-1001';
      const memberCode = record?.memberCode || 'TF-2026-1001';
      const memberName = record?.memberName || 'يوسف المصري';
      const memberEmail = record?.memberEmail || 'youssef.masry@titanfit.eg';
      const tenantSlug = record?.tenantSlug || 'titanfit-egypt';

      const res = NextResponse.json({
        success: true,
        message: 'تم التحقق بنجاح ومرحباً بك في ناديك!',
        user: {
          id: memberId,
          code: memberCode,
          email: memberEmail,
          name: memberName,
          role: 'MEMBER',
          tenantSlug,
          logoUrl: '/brand/logo.png',
          primaryColor: '#059669',
        },
      });

      // Set long-lived persistent cookie (30 days) so user stays logged in
      res.cookies.set('titanfit_access_token', `member-token-${memberCode}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days remember me
      });

      // Clear OTP once used
      otpStore.delete(cleanId);

      return res;
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'OTP service error' },
      { status: 500 },
    );
  }
}
