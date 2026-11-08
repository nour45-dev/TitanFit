import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export interface CheckoutRequest {
  tenantSlug: string;
  memberId: string;
  memberNameAr: string;
  memberNameEn: string;
  planId: string;
  planNameAr: string;
  planNameEn: string;
  amountEgp: number;
  paymentProvider: 'PAYMOB_CARD' | 'FAWRY' | 'INSTAPAY' | 'CASH';
  phone: string;
  instaPayReference?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutRequest = await req.json();
    const {
      tenantSlug = 'titanfit-cairo',
      memberId,
      memberNameAr,
      memberNameEn,
      planId,
      planNameAr,
      planNameEn,
      amountEgp,
      paymentProvider = 'PAYMOB_CARD',
      phone,
      instaPayReference,
    } = body;

    if (!memberId || !amountEgp) {
      return NextResponse.json(
        { success: false, message: 'Missing required checkout fields (memberId, amountEgp)' },
        { status: 400 }
      );
    }

    // 14% Egyptian Tax Authority (ETA) VAT calculation
    const vatRate = 0.14;
    const subtotalEgp = Math.round((amountEgp / (1 + vatRate)) * 100) / 100;
    const vatEgp = Math.round((amountEgp - subtotalEgp) * 100) / 100;
    const invoiceNumber = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const qrVerificationHash = createHmac('sha256', 'titanfit-eta-secret')
      .update(`${invoiceNumber}:${amountEgp}:${memberId}:${new Date().toISOString().slice(0, 10)}`)
      .digest('hex');

    let gatewayData: any = {};

    switch (paymentProvider) {
      case 'PAYMOB_CARD': {
        const orderId = `PM-ORD-${Date.now()}`;
        const paymentToken = `pm_tok_${Buffer.from(orderId).toString('base64').slice(0, 16)}`;
        gatewayData = {
          orderId,
          paymentToken,
          iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/789012?payment_token=${paymentToken}`,
          instructionAr: 'محاكاة تجريبية للدفع بالبطاقة البنكية عبر بوابة Paymob (بيئة اختبار)',
          instructionEn: 'Simulated card checkout preview via Paymob sandbox environment',
        };
        break;
      }

      case 'FAWRY': {
        const fawryReferenceNumber = `7${Math.floor(100000000 + Math.random() * 900000000)}`;
        gatewayData = {
          fawryReferenceNumber,
          expiresInHours: 48,
          instructionAr: `ادفع كود الخدمة (788) عبر أي منفذ فوري أو تطبيق MyFawry برقم المرجع: ${fawryReferenceNumber}`,
          instructionEn: `Pay service code (788) at any Fawry POS or MyFawry app using Ref: ${fawryReferenceNumber}`,
        };
        break;
      }

      case 'INSTAPAY': {
        const ref = instaPayReference || `IPA-${Math.floor(100000 + Math.random() * 900000)}`;
        gatewayData = {
          instaPayAddress: 'titanfit@instapay',
          referenceNumber: ref,
          instructionAr: `حوّل المبلغ لحساب إنستاباي titanfit@instapay وضع رقم المرجع: ${ref}`,
          instructionEn: `Transfer to InstaPay IPA titanfit@instapay quoting reference: ${ref}`,
        };
        break;
      }

      case 'CASH':
      default: {
        gatewayData = {
          instructionAr: 'تم تسجيل الدفع النقدي في خزينة الاستقبال بنجاح',
          instructionEn: 'Cash payment registered successfully at reception POS',
        };
        break;
      }
    }

    const invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      tenantSlug,
      memberId,
      memberNameAr,
      memberNameEn,
      planId,
      planNameAr,
      planNameEn,
      subtotalEgp,
      discountEgp: 0,
      vatEgp,
      totalEgp: amountEgp,
      method: paymentProvider,
      referenceCode: gatewayData.fawryReferenceNumber || gatewayData.referenceNumber || invoiceNumber,
      status: paymentProvider === 'INSTAPAY' && !instaPayReference ? 'PENDING' : 'PAID',
      qrVerificationHash,
      createdAt: new Date().toISOString().slice(0, 10),
      cashierName: 'Front Desk Reception',
    };

    return NextResponse.json({
      success: true,
      paymentProvider,
      invoice,
      gateway: gatewayData,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
