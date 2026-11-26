import React from 'react';
import Link from 'next/link';
import { ArrowRight, Database, Lock, ShieldCheck, Trash2 } from 'lucide-react';

export const metadata = {
  title: 'سياسة الخصوصية | TitanFit',
  description: 'سياسة الخصوصية وحماية وعزل بيانات الأندية الرياضية والمتدربين على منصة TitanFit.',
};

export default function PrivacyPolicyPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 py-10 px-4 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                حماية وعزل البيانات المعتمدة
              </span>
              <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                سياسة الخصوصية وحماية البيانات (Privacy Policy)
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

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Database className="h-5 w-5 text-amber-600" />
              <h2>١. أنواع البيانات التي تُعالَج وطريقة حمايتها</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              تلتزم منصة <strong>TitanFit</strong> بأعلى معايير الخصوصية وعزل البيانات بين الأندية المشتركة، ولا يتم بيع أو مشاركة بيانات أي نادٍ أو متدرب مع أي طرف خارجي:
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="border-b border-slate-200 bg-slate-100 font-black text-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-start">نوع البيانات</th>
                    <th className="px-4 py-3 text-start">الغرض من الاستخدام</th>
                    <th className="px-4 py-3 text-start">آلية الحماية والعزل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-4 py-3 font-bold">بيانات الأندية المشتركة والأعضاء والفواتير</td>
                    <td className="px-4 py-3">إدارة الاشتراكات، بوابات الـ QR، الفروع، ونقطة بيع المكملات</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">عزل تام لكل نادٍ عبر PostgreSQL FORCE RLS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">جلسات تسجيل الدخول والصلاحيات</td>
                    <td className="px-4 py-3">التحقق الآمن من هوية مالك النادي والمدربين والمتدربين</td>
                    <td className="px-4 py-3 font-mono text-xs text-sky-800">كوكيز جلسة محمية (HttpOnly Secure Cookies)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">إيصالات سداد اشتراكات الـ SaaS</td>
                    <td className="px-4 py-3">مراجعة وتوثيق التحويلات وتفعيل باقات الأندية</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-800">مشفرة ومقصورة على مراجعة إدارة المنصة فقط</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">حاسبة السعرات العامة وتفضيلات اللغة والمظهر</td>
                    <td className="px-4 py-3">حساب الاحتياج اليومي وحفظ إعدادات العرض</td>
                    <td className="px-4 py-3 font-mono text-xs text-emerald-800">تُعالج محلياً في متصفح المستخدم</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Lock className="h-5 w-5 text-amber-600" />
              <h2>٢. العزل التام لبيانات كل نادٍ رياضي (Multi-Tenant Isolation)</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              يعمل كل نادٍ رياضي مشترك داخل نطاق بيانات مستقل ومعزول بالكامل (Tenant Partition)، بحيث لا يمكن لأي نادٍ الاطلاع على أعضاء أو فواتير أو محتوى أي نادٍ آخر على المنصة، وتُحمى جميع بوابات الدخول برموز QR دوارة مشفرة بمعيار <code>HMAC-SHA256</code>.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
              <Trash2 className="h-5 w-5 text-amber-600" />
              <h2>٣. حقوق المشتركين وحذف البيانات</h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              يحق لمالك النادي في أي وقت تصدير بيانات ناديه بالكامل بصيغة CSV/PDF أو طلب تعديل أو حذف بيانات حسابه بالتواصل المباشر مع فريق الدعم الفني الرسمي للمنصة.
            </p>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs font-bold text-slate-600">
            <Link href="/terms" className="text-amber-700 hover:underline">
              اقرأ أيضاً: شروط الاستخدام ←
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
