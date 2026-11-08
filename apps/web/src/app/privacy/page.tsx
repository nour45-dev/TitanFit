import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Database, Lock, ShieldCheck, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'سياسة الخصوصية (مسودة) | TitanFit',
  description: 'قالب مسودة سياسة الخصوصية وتوضيح البيانات المخزنة محلياً في النسخة التجريبية لمنصة TitanFit.',
};

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Draft Legal Specialist Notice Banner */}
        <div
          role="alert"
          data-testid="legal-draft-notice"
          className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-5 text-amber-950 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-black sm:text-base">
                ⚠️ تنبيه مهم: هذه الوثيقة «مسودة استرشادية تحتاج إلى مراجعة مختص قانوني»
              </p>
              <p className="text-xs leading-relaxed text-amber-900 sm:text-sm">
                هذا النص قالب أولي لسياسة الخصوصية خاص بالنموذج التجريبي (Demo Prototype) لمنصة TitanFit، ولا يُعد استشارة قانونية ملزمة. يجب عرضه على محامٍ أو مستشار قانوني مختص بقوانين حماية البيانات الشخصية (مثل قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020) قبل الإطلاق التجاري الرسمي.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                مسودة سياسة الخصوصية — نسخة تجريبية
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                سياسة الخصوصية وحماية البيانات (Privacy Policy)
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                آخر تحديث للمسودة: نوفمبر 2026 • حالة المنصة: نموذج تجريبي استعراضي (Demo Prototype)
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-800 transition hover:bg-slate-100"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </div>

          {/* Section 1: What data is collected and where it is stored */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Database className="h-5 w-5 text-amber-600" />
              <h2>١. ما هي البيانات التي يتم جمعها وأين يتم تخزينها؟</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              نظراً لأن المنصة تعمل حالياً كـ <strong>نسخة تجريبية (Demo Prototype)</strong>، فإن جميع البيانات التي تدخلها أثناء التصفح تُعالَج وتُخزَّن محلياً داخل متصفحك أو في ذاكرة الجلسة المؤقتة، ولا يتم إرسالها إلى أي أطراف خارجية:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 font-black text-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-start">نوع البيانات</th>
                    <th className="px-4 py-3 text-start">الغرض من الاستخدام</th>
                    <th className="px-4 py-3 text-start">مكان التخزين الفعلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-bold">مدخلات حاسبة السعرات (الجنس، السن، الوزن، الطول، النشاط)</td>
                    <td className="px-4 py-3">حساب السعرات اليومية (BMR/TDEE) وتوليد مقادير الوصفات لحظياً</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">ذاكرة المتصفح اللحظية فقط (React Client State) — لا تُحفظ على السيرفر</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">البريد الإلكتروني لنموذج الكتاب المجاني (E-Book)</td>
                    <td className="px-4 py-3">تخصيص غلاف ملف الـ PDF الذي يُنشأ ويُحمّل مباشرة داخل جهازك</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">محلياً داخل المتصفح أثناء توليد ملف الـ PDF فقط (Client-Side PDF)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">تفضيل اللغة والمظهر (العربية/الإنجليزية • الوضع النهاري/الليلي)</td>
                    <td className="px-4 py-3">تذكّر إعدادات العرض المفضلة للمستخدم</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-800">التخزين المحلي للمتصفح (Browser localStorage)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">بيانات لوحة التحكم التجريبية (الأعضاء، الباقات، الفواتير، المكملات)</td>
                    <td className="px-4 py-3">محاكاة تجربة إدارة الجيم والأندية (CRUD Demo)</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-800">التخزين المحلي للمتصفح (`localStorage: titanfit-demo-*`) وذاكرة السيرفر التجريبية المؤقتة (In-Memory State)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">حالة إغلاق شريط التنبيه وتوكن الجلسة التجريبية</td>
                    <td className="px-4 py-3">محاكاة تسجيل الدخول والأدوار في النسخة الاستعراضية</td>
                    <td className="px-4 py-3 font-mono text-xs text-sky-800">تخزين الجلسة (`sessionStorage`) وكوكي جلسة محلي مؤقت (`HttpOnly Cookie`)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Warning against real sensitive data */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Lock className="h-5 w-5 text-amber-600" />
              <h2>٢. عدم إدخال بيانات شخصية أو طبية أو مالية حقيقية</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              بما أن المنصة في مرحلة العرض التجريبي (Demo Prototype)، نُهيب بجميع الزوار والمختبرين <strong>عدم إدخال أي بيانات شخصية حقيقية، أو سجلات طبية فعلية، أو أرقام بطاقات بنكية حقيقية</strong>. جميع نماذج الدفع والفواتير المعروضة هي محاكاة برمجية لأغراض استعراض التصميم فقط.
            </p>
          </section>

          {/* Section 3: How to clear your data */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Trash2 className="h-5 w-5 text-amber-600" />
              <h2>٣. كيف يمكنك مسح بياناتك المخزنة محلياً؟</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              يمكنك في أي وقت مسح كافة البيانات التجريبية المخزنة على متصفحك بالكامل عن طريق مسح بيانات الموقع (Clear Site Data / LocalStorage & Cookies) من إعدادات المتصفح، أو الضغط على زر «إعادة ضبط البيانات التجريبية» داخل لوحة التحكم.
            </p>
          </section>

          {/* Footer navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-600">
            <Link href="/terms" className="text-amber-700 hover:underline">
              اقرأ أيضاً: شروط الاستخدام (مسودة تحتاج مراجعة مختص) ←
            </Link>
            <Link href="/" className="text-slate-800 hover:underline">
              العودة إلى TitanFit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
