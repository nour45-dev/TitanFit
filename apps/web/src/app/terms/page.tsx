import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Scale, ShieldAlert } from 'lucide-react';

export const metadata = {
  title: 'شروط الاستخدام | TitanFit',
  description: 'شروط وأحكام استخدام منصة TitanFit السحابية لإدارة الأندية الرياضية.',
};

export default function TermsOfUsePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 border border-amber-200">
                <Scale className="h-3.5 w-3.5" />
                الشروط والأحكام المعتمدة
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                شروط وأحكام الاستخدام (Terms of Use)
              </h1>
              <p className="mt-1 text-xs text-slate-500">
                منصة TitanFit السحابية لإدارة الأندية الرياضية والتغذية والمدفوعات
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

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <FileText className="h-5 w-5 text-amber-600" />
              <h2>١. نطاق الخدمة والاشتراكات</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              توفر منصة <strong>TitanFit</strong> نظام تشغيل سحابي متكامل للأندية الرياضية والمدربين (SaaS) يشمل إدارة الأعضاء، بوابات الدخول بالـ QR، الكاشير ونقطة البيع، وتطبيق المتدربين وفق الباقة المختارة (Starter أو Pro + AI أو Enterprise) ومدة الاشتراك المفعّلة بعد توثيق إيصال السداد.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <h2>٢. إخلاء المسؤولية الغذائية والرياضية</h2>
            </div>
            <ul className="list-disc space-y-2 ps-5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              <li>
                جميع حسابات السعرات الحرارية والماكروز والخطط الغذائية والتمارين وردود المساعد الذكي (AI) هي إرشادات رياضية وتثقيفية مبنية على معادلة Mifflin-St Jeor للأشخاص البالغين الأصحاء.
              </li>
              <li>
                لا تُعد هذه الإرشادات بديلاً عن الاستشارة الطبية المتخصصة، ويُنصح بمراجعة الطبيب المختص أو أخصائي التغذية المؤهل قبل البدء في أي برنامج غذائي أو تدريبي، خاصةً في حالات الأمراض المزمنة أو الإصابات.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-black text-slate-900 sm:text-lg">
              ٣. مسؤولية الحسابات وخصوصية البيانات
            </h2>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              يلتزم مالك النادي بالحفاظ على سرية بيانات الدخول الخاصة بإدارة ناديه وكود انضمام المتدربين. للاطلاع على تفاصيل حماية وعزل البيانات، يُرجى مراجعة{' '}
              <Link href="/privacy" className="font-black text-amber-700 underline">
                سياسة الخصوصية
              </Link>
              .
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-600">
            <Link href="/privacy" className="text-amber-700 hover:underline">
              اقرأ أيضاً: سياسة الخصوصية ←
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
