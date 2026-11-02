# ADR 0001: Server-Side Authentication, Multi-Tenant RLS & Zero-Client-Leak Architecture

- **Status:** Revised & Proposed (Awaiting Final Approval before PR 1)
- **Date:** 2026-11-02
- **Author:** Senior Full-Stack & QA Engineer
- **Target Branch:** `security/server-auth`

---

## 1. السياق والمشكلة (Context & Problem Statement)

أثبت الفحص المعماري واختبار الأمان الآلي وجود ثغرة معمارية من الدرجة الأولى (**P0 Critical**):
1. **التحقق من الهوية يتم على المتصفح فقط (Client-Side Auth):**
   ملف `apps/web/src/lib/platform-store.tsx` يحمل تعليمة `'use client'` ويقوم بمطابقة بيانات الدخول محلياً دون أي اتصال بسيرفر الباك إند.
2. **تسريب بيانات الأندية في الـ Client Bundle:**
   يتم تضمين مصفوفة الأندية وأكواد الدخول وقوالب الحسابات داخل ملفات الـ JavaScript الثابتة (`.next/static/chunks/page-*.js`) التي يتم إرسالها لمتصفح الزوار، مع وجود كلمات سر fallback.
3. **حفظ بيانات الأندية والمستخدمين في LocalStorage:**
   يتم تخزين بيانات الأندية والملاك في المتصفح (`titanfit.tenants.v1`)، مما يتيح التلاعب بها وتجاوز العزل.

---

## 2. مسار البيانات الجديد (Target Data Flow)

سيتوقف المتصفح تماماً عن الاحتفاظ بأي أسرار أو أكواد أو منطق تحقق، ويتحول إلى واجهة عرض وتفاعل نظيفة:

$$\begin{aligned}
\text{متصفح المستخدم (Browser)} &\xrightarrow{\text{HTTP POST (Credentials / Code)}} \text{Next.js BFF / API Route} \\
&\xrightarrow{\text{Internal REST / Reverse Proxy}} \text{apps/api (NestJS Core Engine)} \\
&\xrightarrow{\text{PostgreSQL Session with RLS}} \text{PostgreSQL (Multi-Tenant DB)}
\end{aligned}$$

- **مسح الـ LocalStorage القديم تلقائياً:** عند تحميل التطبيق لأول مرة في الإصدار الجديد، يقوم الكود بمسح مفاتيح `titanfit.tenants.v1` و `titanfit.auth.*` تلقائياً من متصفح المستخدم لمنع أي تعارض.
- **تخزين تفضيلات العرض فقط:** لا يُحفظ في المتصفح سوى اللغة المختارة (`ar`/`en`) والثيم (`light`/`dark`).

---

## 3. معمارية المصادقة وحماية الجلسات (Server-Side Auth & Sessions)

1. **تشفير كلمات المرور (Password Hashing):**
   - استخدام خوارزمية **`Argon2id`** (المعيار الموصى به من OWASP).
   - منع وإلغاء أي كلمات سر افتراضية (Fallback) نهائياً؛ لا يمكن تسجيل الدخول إلا ببيانات معتمدة ومسجلة في قاعدة البيانات.
2. **جدول الجلسات المركزي (`sessions` Table):**
   - إضافة جدول `sessions` في قاعدة البيانات:
     ```prisma
     model Session {
       id           String   @id @default(uuid())
       userId       String
       tenantId     String
       refreshTokenHash String
       userAgent    String?
       ipAddress    String?
       expiresAt    DateTime
       createdAt    DateTime @default(now())
       revokedAt    DateTime?
       user         User     @relation(fields: [userId], references: [id])
       tenant       Tenant   @relation(fields: [tenantId], references: [id])
     }
     ```
   - **ميزة الإلغاء الشامل (Revocation):** إمكانية عمل "تسجيل الخروج من جميع الأجهزة الأخرى" فوراً بإلغاء كل الجلسات في الجدول للمستخدم المعني.
3. **إدارة الـ Tokens:**
   - **Access Token:** مدة صلاحية قصيرة (15 دقيقة) موقع بـ Secret قوي من الـ `env` فقط، مشفر داخل **`HttpOnly + Secure + SameSite=Strict` Cookie** لمنع سرقته عبر هجمات XSS.
   - **Refresh Token Rotation:** كل طلب تجديد يصدر Token جديد ويبطل القديم تلقائياً في جدول الجلسات لمنع هجمات الـ Token Replay.
   - **حماية CSRF:** استخدام Double-Submit CSRF Token أو توقيع Header في جميع طلبات التعديل (POST/PUT/DELETE).

---

## 4. معمارية هوية المتدرب ودخول النادي (المرحلة الأولى + التوسع)

بناءً على القرار المعتمد (**الخيار ب: هوية مستقلة لكل عضو**):

### أ) المرحلة الأولى (Phase 1):
1. **أكواد الانضمام لمرة واحدة (One-Time Join Codes):**
   - إلغاء فكرة الـ PIN الثابت المشترك للنادي.
   - يعتمد النظام أكواد انضمام عشوائية مشفرة (Cryptographic Tokens) بطول $\ge 10$ أحرف وأرقام، يصدرها نظام الاستقبال لكل متدرب أو حملة اشتراك، وتنتهي صلاحيتها تلقائياً فور استخدامها لمرة واحدة أو بعد مرور ٢٤ ساعة من إصدارها.
2. **منع هجمات حجب الخدمة (No Club-Wide Lockout / DoS Prevention):**
   - تم استبعاد خيار إغلاق النادي بأكمله عند تكرار 5 محاولات فاشلة، لأن هذا التصميم يعرّض النادي لثغرة حجب الخدمة (Denial-of-Service - DoS)، حيث يمكن لأي طرف خبيث تعمد إدخال 5 محاولات خاطئة لمنع جميع المشتركين الجدد من التسجيل.
   - بدلاً من ذلك، يعتمد الأمان على طبقتين متكاملتين:
     - **تقييد المعدل على مستوى الـ IP و User-Agent (`@nestjs/throttler`):** حظر فوري لأي IP يتجاوز 5 محاولات فاشلة خلال 15 دقيقة.
     - **التأخير الزمني المتدرج للنادي (Progressive Backoff per Tenant):** عند رصد محاولات فاشلة متتالية موجهة لنادي معين، لا يتم حظر النادي، بل يفرض السيرفر تأخيراً زمنياً متصاعداً (Exponential Backoff: 1s ثم 2s ثم 4s) قبل الرد على المحاولة التالية، مما يُحبط هجمات الـ Brute Force بالكامل دون إغلاق التسجيل على المتدربين الشرعيين.
3. **تسجيل العضو بالهاتف وكود التفعيل الشخصي:**
   - يدخل المتدرب كود الانضمام لمرة واحدة لربط جهازه بالنادي.
   - يُسجل برقم هاتفه، ويحصل على كود تفعيل شخصي مشفر (Personal Activation Code) يربط حسابه بعضويته.

### ب) معمارية الـ OTP Provider Interface القابلة للتوسع (Phase 2):
- تصميم واجهة برمجية موحدة في `apps/api`:
  ```typescript
  export interface OtpProvider {
    sendOtp(phone: string, code: string, template: 'AR' | 'EN'): Promise<boolean>;
    verifyOtp(phone: string, code: string): Promise<boolean>;
  }
  ```
- تتيح الواجهة تبديل المزود مستقبلاً بسلاسة (WhatsApp Business Cloud API، أو SMS عبر Twilio / Infobip / Vodafone Misr) دون تعديل كود الـ Auth الأساسي.

---

## 5. عزل الأندية التام (Tenant Isolation & Non-Bypassable PostgreSQL RLS)

- **استخراج الـ Tenant:** يتم استخراج `tenantId` من توقيع الـ JWT المفحوص على السيرفر، ولا يُقبل أي `tenantId` مرسل من طرف العميل (Client Request Body/Params).
- **تنفيذ الـ RLS على مستوى قاعدة البيانات:**
  في كل Transaction ومعاملة في قاعدة البيانات يتم تنفيذ:
  ```sql
  SET LOCAL app.tenant_id = 'current-tenant-uuid';
  ```
  حيث تمنع سياسات RLS في PostgreSQL قراءة أو تعديل أي سطر لا يتطابق فيه `tenant_id` مع سياق الجلسة، حتى لو تم استدعاء الـ Query مباشرة من الباك إند.

---

## 6. تطهير الـ Client Bundle والـ Seed Data

1. **إزالة مصفوفة الأندية من الـ Web Code:**
   حذف مصفوفات `INITIAL_TENANTS` و `INITIAL_MEMBERS` وكلمات السر من `apps/web/src/lib/platform-store.tsx`.
2. **الـ Seed يعمل على السيرفر فقط:**
   يتم تشغيل `prisma db seed` من خلال بيئة السيرفر والـ CI/CD، وتُستمد كلمات السر من متغيرات البيئة الخاصة ببيئة التطوير (`.env.local`) دون كتابة أي باسورد صريح في الكود.
3. **تفعيل اختبار الأمان الآلي:**
   استمرار تشغيل `apps/web/src/security-bundle.spec.ts` كحارس أمني يفشل الـ Build تلقائياً لو تم تضمين أي كلمة سر أو PIN في ملفات الـ Static JS.

---

## 7. أمان الـ API وإعدادات النشر على Railway

- **إعدادات CORS والكوكيز بين Web و API:**
  - يتم ضبط CORS في `apps/api` بدقة لاستقبال الطلبات من نطاق الويب فقط:
    ```typescript
    origin: [process.env.NEXT_PUBLIC_WEB_URL, 'https://titanfit.up.railway.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    ```
  - الكوكيز تُضبط بـ `domain: '.railway.app'` (أو Custom Domain المشترك) لتبادل جلسات الـ Auth الآمنة بين الـ Subdomains.
- **حماية الترويسات وخطة ترقية سياسة أمان المحتوى (CSP Transition Roadmap):**
  - **المرحلة 1 (الحالية - Report-Only):**
    - تفعيل ترويسة `Content-Security-Policy-Report-Only` في `next.config.js` و `apps/api` (عبر `@fastify/helmet`).
    - رصد وتسجيل تقارير المخالفات للمصادر الخارجية (YouTube Embed، Google Fonts، مسارات الـ Webhooks).
  - **المرحلة 2 (التطهير ودمج Nonces):**
    - تحويل أي سكربتات مضمنة (Inline Scripts) إلى سياق معتمد باستخدام Cryptographic Nonce يُنشأ لكل طلب في Next.js Middleware.
    - حصر نطاقات بوابات الدفع المصرية المعتمدة (Paymob, Fawry, InstaPay) ضمن الـ Whitelist.
  - **المرحلة 3 (الانتقال لـ Enforce الصارم):**
    - **معيار التحويل الإلزامي:** تحقيق **صفر مخالفات (0 Violations)** في سجلات الـ CSP لمدة 7 أيام متتالية في بيئة الإنتاج التجريبية.
    - تحويل الترويسة رسمياً إلى `Content-Security-Policy: enforce` مع حظر `unsafe-inline` نهائياً لحماية المنصة من هجمات XSS وحقن النصوص الخبيثة.
- **النسخ الاحتياطي وإدارة الـ Migrations:**
  - استخدام `prisma migrate deploy` في خطوة الـ Pre-deploy على السيرفر بصلاحية `DATABASE_MIGRATION_URL`.
  - تفعيل سكريبت النسخ الاحتياطي التلقائي اليومي لقاعدة البيانات `infra/scripts/pg-backup-to-s3.mjs` على S3-compatible storage مشفر.

---

## 8. خطوات نشر `apps/api` و PostgreSQL على Railway

1. **إنشاء خدمة PostgreSQL على Railway:**
   - إضافة خدمة Database من نوع PostgreSQL 16 على مشروع Railway.
   - إنشاء قاعدة البيانات وتعيين المتغير السري `DATABASE_URL` و `DATABASE_MIGRATION_URL`.
2. **نشر خدمة `apps/api`:**
   - إنشاء خدمة جديدة في Railway وربطها بنفس الـ GitHub Repo.
   - تعيين Root Directory إلى `apps/api`.
   - ضبط أمر البناء: `pnpm --filter @gymos/config build && pnpm --filter @gymos/contracts build && pnpm --filter @gymos/database build && pnpm --filter @gymos/api build`.
   - ضبط أمر التشغيل: `pnpm --filter @gymos/api start`.
   - ربط متغيرات البيئة السرية من Railway:
     - `DATABASE_URL`, `DATABASE_MIGRATION_URL`
     - `JWT_SECRET`, `JWT_REFRESH_SECRET`
     - `CORS_ORIGIN=https://titanfit.up.railway.app`
3. **تحديث خدمة `apps/web` على Railway:**
   - إضافة متغير البيئة: `NEXT_PUBLIC_API_URL=https://api-titanfit.up.railway.app/api/v1`.
   - إعادة نشر الـ Web تلقائياً.

---

## 9. خطة مراحل التنفيذ التدريجي (Phased PR Plan)

| المرحلة (PR) | نطاق العمل | معايير القبول والاختبار |
| :--- | :--- | :--- |
| **PR 1: Core Auth, Tenants, Sessions Table & Server Endpoints** | • إنشاء مسارات `/api/v1/auth/login` و `/logout` و `/me` و `/sessions/revoke` في `apps/api`.<br>• تشفير الباسوردات بـ Argon2id.<br>• إرسال الـ JWT في HttpOnly Cookie.<br>• إزالة `INITIAL_TENANTS` من `apps/web` ومسح localStorage القديم. | اجتياز `security-bundle.spec.ts` مع صفر تسريبات، واجتياز اختبارات تسجيل دخول الأدمن وصاحب الجيم. |
| **PR 2: Member Unique Identity (Long Code + Personal Code + OTP Interface)** | • إنشاء مسار الانضمام وتوثيق المتدرب برقم الهاتف.<br>• تطبيق الـ Throttler على مستوى النادي لمنع التخمين.<br>• واجهة `OtpProvider` الجاهزة لربط الرسائل لاحقاً.<br>• ربط تطبيق المتدرب PWA ببيانات عضويته الخاصة. | منع أي كود خاطئ بعد 5 محاولات على مستوى النادي، ودخول المتدرب لبياناته فقط. |
| **PR 3: Members CRM, Subscriptions & Staff Modules with Server RLS** | • تفعيل عزل الـ RLS على جداول الأعضاء والاشتراكات والحصص.<br>• ربط شاشات لوحة صاحب الجيم بـ API السيرفر الحقيقي. | محاولة Tenant A طلب أعضاء Tenant B ترجع 403 Forbidden دائماً. |
| **PR 4: Billing, Egyptian Gateways & Signed Webhooks** | • محاكاة بوابات الدفع (فوري، Paymob، إنستاباي).<br>• التحقق الصارم من توقيع الـ Webhooks (HMAC SHA-256).<br>• حماية العمليات المتكررة عبر `Idempotency-Key`. | رفض أي Webhook بدون توقيع سليم، ومنع تكرار تحصيل نفس الفاتورة. |

---
**في انتظار موافقتك الصريحة على هذه النسخة المعدلة من ADR 0001 قبل البدء في PR 1.**
