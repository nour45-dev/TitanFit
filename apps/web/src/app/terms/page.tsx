import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, FileText, Scale, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'شروط الاستخدام (مسودة) | TitanFit',
  description: 'قالب مسودة شروط الاستخدام وإخلاء المسؤولية للنسخة التجريبية من منصة TitanFit.',
};

export default function TermsOfUsePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Draft Legal Specialist Notice Banner */}
        <div
          role="alert"
          data-testid="terms-draft-notice"
          className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-5 text-amber-950 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            <div className="space-y-1">
              <p className="text-sm font-black sm:text-base">
                ⚠️ تنبيه مهم: هذه الوثيقة «مسودة استرشادية تحتاج إلى مراجعة مختص قانوني»
              </p>
              <p className="text-xs leading-relaxed text-amber-900 sm:text-sm">
                هذا القالب وُضع لأغراض الشفافية في النسخة التجريبية (Demo Prototype) لمنصة TitanFit، ولا يُمثّل عقداً تجارياً نهائياً أو استشارة قانونية. يجب مراجعته واعتماده من مستشار قانوني مختص قبل تفعيل أي اشتراكات مدفوعة أو تعاقدات تجارية.
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 border border-amber-200">
                <Scale className="h-3.5 w-3.5" />
                مسودة شروط الاستخدام — نسخة تجريبية
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                شروط وأحكام الاستخدام وإخلاء المسؤولية (Terms of Use)
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

          {/* Section 1: Nature of Demo */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <FileText className="h-5 w-5 text-amber-600" />
              <h2>١. طبيعة المنصة (نسخة تجريبية / Demo Prototype)</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              منصة <strong>TitanFit</strong> المعروضة حالياً هي نموذج أولي تفاعلي (Interactive Prototype) مخصص لاستعراض واجهات إدارة الأندية الرياضية، حاسبة السعرات، والتمارين التفاعلية. جميع عمليات الدفع الإلكتروني (إنستاباي، فودافون كاش، فوري، Paymob) وخدمات التعاقد للشركات (B2B White-Label) هي في مرحلة <strong>«قريباً / قائمة انتظار»</strong> ولا تُنشئ أي التزام مالي أو تعاقدي فوري.
            </p>
          </section>

          {/* Section 2: Medical & Nutritional Disclaimer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h2>٢. إخلاء المسؤولية الغذائية والرياضية</h2>
            </div>
            <ul className="list-disc space-y-2 ps-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              <li>
                جميع حسابات السعرات الحرارية والماكروز (البروتين، الكربوهيدرات، الدهون) والخطط الغذائية والتمارين الرياضية المعروضة في المنصة هي <strong>تقديرات استرشادية وتثقيفية تقريبية</strong> مبنية على معادلة Mifflin-St Jeor للأشخاص البالغين الأصحاء.
              </li>
              <li>
                لا تُعد محتويات المنصة أو الكتيبات المجانية استشارة طبية أو تشخيصاً أو علاجاً، ولا تغني عن مراجعة طبيب مختص أو أخصائي تغذية مؤهل قبل البدء في أي برنامج غذائي أو رياضي، خاصةً لمن يعانون من أمراض مزمنة أو إصابات سابقة أو الحوامل والمرضعات ومن هم دون 18 عاماً.
              </li>
              <li>
                أمثلة التحول المعروضة في الموقع هي <strong>أمثلة توضيحية افتراضية</strong> لما يمكن تحقيقه حسابياً عند الالتزام بعجز سعرات معتدل، وتختلف النتائج الفعلية من شخص لآخر حسب العوامل الوراثية والالتزام ومستوى النشاط.
              </li>
            </ul>
          </section>

          {/* Section 3: Data Storage & User Responsibility */}
          <section className="space-y-3">
            <h2 className="text-base font-black text-slate-900 sm:text-lg">
              ٣. تخزين البيانات في النسخة التجريبية
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              تُحفظ التعديلات التجريبية محلياً في متصفح المستخدم (`localStorage` و`sessionStorage`) وفي ذاكرة الجلسة التجريبية المؤقتة. يوافق المستخدم على عدم استخدام النسخة التجريبية لتخزين بيانات حقيقية حساسة أو سرية. للاطلاع على جدول البيانات الكامل ومكان حفظها، يُرجى مراجعة{' '}
              <Link href="/privacy" className="font-black text-amber-700 underline">
                سياسة الخصوصية
              </Link>
              .
            </p>
          </section>

          {/* Footer navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-600">
            <Link href="/privacy" className="text-amber-700 hover:underline">
              اقرأ أيضاً: سياسة الخصوصية وتفاصيل البيانات المخزنة ←
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
