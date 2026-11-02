# ADR 0001: Server-Side Authentication, Multi-Tenant RLS & Zero-Client-Leak Architecture

- **Status:** Proposed (Awaiting Owner Review & Approval)
- **Date:** 2026-11-02
- **Author:** Senior Full-Stack & QA Engineer
- **Target Branch:** `security/server-auth`

---

## 1. السياق والمشكلة (Context & Problem Statement)

أثبت الفحص المعماري واختبار الأمان الآلي (`security-bundle.spec.ts`) وجود ثغرة معمارية من الدرجة الأولى (**P0 Critical**):
1. **التحقق من الهوية يتم على المتصفح فقط (Client-Side Auth):**
   ملف `apps/web/src/lib/platform-store.tsx` يحمل تعليمة `'use client'` ويقوم بمطابقة بيانات الدخول والـ PIN محلياً دون أي اتصال بسيرفر الباك إند.
2. **تسريب بيانات الأندية والـ Credentials في الـ Client Bundle:**
   يتم تضمين مصفوفة الأندية والـ PINs السريّة وقوالب الحسابات داخل ملفات الـ JavaScript الثابتة (`.next/static/chunks/page-*.js`) التي يتم إرسالها لمتصفح أي زائر، بالإضافة إلى استخدام كلمة سر افتراضية fallback (`coach123`).
3. **حفظ بيانات الأندية والمستخدمين في LocalStorage:**
   يتم تخزين بيانات الأندية والملاك في المتصفح (`titanfit.tenants.v1`)، مما يتيح التلاعب بها وتجاوز العزل.

---

## 2. مسار البيانات الجديد (Target Data Flow)

سيتوقف المتصفح تماماً عن الاحتفاظ بأي أسرار أو أكواد أو منطق تحقق، ويتحول إلى واجهة عرض وتفاعل نظيفة:

$$\begin{aligned}
\text{متصفح المستخدم (Browser)} &\xrightarrow{\text{HTTP POST (Credentials / PIN)}} \text{Next.js BFF / API Route} \\
&\xrightarrow{\text{Internal REST with Header Validation}} \text{apps/api (NestJS Core Engine)} \\
&\xrightarrow{\text{PostgreSQL Session with RLS}} \text{PostgreSQL (Multi-Tenant DB)}
\end{aligned}$$

- **إلغاء تخزين الأندية في LocalStorage:** لن يتم تخزين سوى تفضيلات الواجهة العامة للمستخدم (مثل اللغة المختارة `ar/en` والثيم `light/dark`).
- **حالة الجلسة:** تُحفظ فقط في الذاكرة الحية (React Memory State) وتُستعلم عند تحميل الصفحة من السيرفر عبر `/api/v1/auth/me`.

---

## 3. معمارية المصادقة وحماية الجلسات (Server-Side Auth & Session Architecture)

1. **تشفير كلمات المرور (Password Hashing):**
   - استخدام خوارزمية **`Argon2id`** (المعيار الذهبي ضد هجمات الـ GPU والـ Rainbow Tables).
   - إلغاء أي باسورد افتراضي نهائياً (إزالة `coach123` و `owner123` fallback).
2. **إدارة الـ Tokens والجلسات:**
   - **Access Token:** مدة صلاحية قصيرة (15 دقيقة) يحتوي على المعرف المجهول `userId`، ومعرف النادي `tenantId`، وصلاحيات الدور `permissions`.
   - **تخزين الـ Token:** داخل **`HttpOnly + Secure + SameSite=Strict` Cookie**، مما يمنع نهائياً سرقته بواسطة هجمات XSS في المتصفح.
   - **Refresh Token Rotation:** تجديد الـ Access Token تلقائياً، مع إبطال الـ Token القديم وتخزينه كـ Hash في قاعدة البيانات لمنع إعادة استخدامه (Replay Attack Prevention).
   - **حماية CSRF:** استخدام تقنية Double-Submit Cookie أو توقيع CSRF Header للعمليات المعدلة (POST/PUT/DELETE).

---

## 4. تصميم التحقق من الـ PIN واقتراح بديل للمتدربين

### الوضع المطلوب للـ Gym PIN:
- لا يُخزن الـ PIN كنص صريح (Plaintext) أبداً؛ بل يُخزن كـ **Salted Hash (Argon2id)** في جدول النادي `tenants`.
- التحقق يتم حصراً في السيرفر عبر `apps/api`.
- حماية ضد التخمين: تفعيل **Rate Limiting** عبر `@nestjs/throttler` (بحد أقصى 5 محاولات خاطئة لكل دقيقة)، مع **Lockout** مؤقت للـ IP عند تكرار الفشل.

### دراسة مقترح: (دخول المتدرب بالموبايل + OTP مقابل كود الـ PIN السري):

| المعيار | الخيار أ: الدخول بالـ PIN السري للنادي فقط (الحالي) | الخيار ب: كود الـ PIN كود انضمام + الدخول برقم الموبايل و OTP (المقترح) |
| :--- | :--- | :--- |
| **المزايا (Pros)** | • تجربة مستخدم سريعة وفورية بدون إدخال بيانات معقدة.<br>• لا يتطلب تكلفة بوابة رسائل SMS.<br>• ممتاز للنوادي الصغيرة وتجربة التطبيق بدون شروط. | • **هوية فردية موثقة لكل متدرب:** يرى كل متدرب بياناته الخاصة فقط (وزنه، قياساته، سجله الطبي) ولا يشاركه أحد.<br>• **منع مشاركة الحسابات:** يمنع متدرب غير مشترك من استخدام PIN الجيم.<br>• متوافق مع معايير حماية البيانات الطبية والخصوصية. |
| **العيوب (Cons)** | • **انعدام الخصوصية الفردية:** جميع المتدربين في نفس الجيم يدخلون بنفس الكود، مما يجعل بيانات التمارين مشتركة أو تابعة لمتصفح محلي فقط.<br>• إذا تسرب الـ PIN لأي شخص يمكنه فتح بوابة النادي. | • يتطلب وجود بوابة إرسال SMS (أو WhatsApp OTP API مثل Twilio / Infobip) وتكلفتها لكل رسالة.<br>• خطوة إضافية أثناء تسجيل الدخول لأول مرة. |
| **التوصية الهندسية** | مناسب كـ Guest/Demo Mode أو عند فتح تطبيق الجيم على شاشة مشتركة بالصالة. | **هو الخيار الموصى به لمنصة SaaS إنتاجية احترافية.** حيث يدخل المتدرب كود النادي مرة واحدة لربط اشتراكه بناديه، ثم يوثق حسابه برقم هاتفه. |

---

## 5. عزل الأندية التام (Tenant Isolation & Non-Bypassable PostgreSQL RLS)

- **استخراج الـ Tenant:** يتم استخراج `tenantId` من توقيع الـ JWT المفحوص على السيرفر، ولا يُقبل أي `tenantId` مرسل من طرف العميل (Client Request Body/Params).
- **تنفيذ الـ RLS على مستوى قاعدة البيانات:**
  في كل Transaction ومعاملة في قاعدة البيانات يتم تنفيذ:
  ```sql
  SET LOCAL app.tenant_id = 'cairo-titans';
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

## 7. أمان الـ API والعقود

- **حماية الترويسات (Helmet & CSP):** استخدام `@fastify/helmet` لفرض `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `HSTS`, وترويسة `Content-Security-Policy` بوضع `Report-Only` أولاً لمراجعة الـ Console قبل التفعيل الصارم.
- **إحكام CORS:** تقييد الأصول المسموح بها بدقة لنطاق المنصة فقط (`NEXT_PUBLIC_WEB_URL` ولا يُسمح بـ `*`).
- **التحقق بـ Zod:** ربط جميع طلبات الـ HTTP والـ Payloads بمخططات Zod المعرفة في `packages/contracts` على السيرفر لرفض أي حقول إضافية أو حقن نصوص ضارة.
- **تطبيق الـ RBAC:** تطبيق حارس الصلاحيات `AuthRbacGuard` للتحقق من `hasAllPermissions` لكل endpoint بناءً على الصلاحيات الـ 71 المعرفة في `packages/contracts`.

---

## 8. خطة مراحل التنفيذ التدريجي (Phased Rollout Plan — منفصلة في فرع `security/server-auth`)

| المرحلة (PR) | نطاق العمل | معايير القبول والاختبار |
| :--- | :--- | :--- |
| **PR 1: Core Auth, Tenants & Server Sessions** | • إنشاء مسارات `/api/v1/auth/login` و `/logout` و `/me` في `apps/api`.<br>• تشفير الباسوردات بـ Argon2id.<br>• إرسال الـ JWT في HttpOnly Cookie.<br>• إزالة `INITIAL_TENANTS` من `apps/web`. | نجاح `security-bundle.spec.ts` مع صفر تسريبات، واجتياز اختبارات تسجيل دخول الأدمن وصاحب الجيم. |
| **PR 2: Member Joining (PIN / OTP) & Trainees Portal** | • إنشاء مسار الانضمام وتوثيق المتدرب.<br>• تطبيق الـ Throttler على مدخلات الـ PIN لمنع التخمين.<br>• ربط تطبيق المتدرب PWA ببيانات عضويته الخاصة. | منع أي كود خاطئ بعد 5 محاولات، ودخول المتدرب لناديه فقط. |
| **PR 3: Members CRM, Subscriptions & Staff Modules** | • تفعيل عزل الـ RLS على جداول الأعضاء والاشتراكات والحصص.<br>• ربط شاشات لوحة صاحب الجيم بالـ API الحقيقي. | محاولة Tenant A طلب أعضاء Tenant B ترجع 403 Forbidden دائماً. |
| **PR 4: Billing, Egyptian Gateways & Webhooks** | • محاكاة بوابات الدفع (فوري، Paymob، إنستاباي).<br>• التحقق الصارم من توقيع الـ Webhooks (HMAC SHA-256).<br>• حماية العمليات المتكررة عبر `Idempotency-Key`. | رفض أي Webhook بدون توقيع سليم، ومنع تكرار تحصيل نفس الفاتورة. |

---
**في انتظار موافقتك الصريحة على هذه الوثيقة قبل الشروع في كتابة أي سطر كود على فرع `security/server-auth`.**
