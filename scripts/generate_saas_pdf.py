import os
import subprocess
import shutil

html_content = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>كراسة الباقات الرسمية والاشتراكات الشهرية - TitanFit SaaS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
      @bottom-center {
        content: "منظومة TitanFit لإدارة الأندية والصالات الرياضية — العرض التجاري المعتمد 2026";
        font-size: 8pt;
        color: #94a3b8;
        font-family: 'Cairo', sans-serif;
      }
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      background-color: #ffffff;
      color: #1e293b;
      line-height: 1.5;
      direction: rtl;
      text-align: right;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      page-break-after: always;
      padding: 6px;
      position: relative;
    }
    .page:last-child {
      page-break-after: avoid;
    }

    /* TOP ACCENT BAR */
    .top-accent-bar {
      height: 4px;
      background: linear-gradient(90deg, #d97706, #f59e0b, #059669);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    /* HEADER */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1.5px solid #e2e8f0;
      margin-bottom: 18px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      border: 2px solid #d97706;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fbbf24;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }
    .brand-title {
      font-size: 23px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .brand-title span {
      color: #d97706;
    }
    .brand-subtitle {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
    }
    .doc-meta {
      text-align: left;
      direction: ltr;
      font-size: 9.5px;
      color: #64748b;
      font-family: 'Tajawal', sans-serif;
    }
    .doc-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #92400e;
      font-weight: 800;
      font-size: 9.5px;
      margin-bottom: 3px;
      direction: rtl;
    }

    /* HERO BANNER - WHITE THEME */
    .hero-banner {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #cbd5e1;
      border-right: 5px solid #d97706;
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }
    .hero-title {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 5px;
    }
    .hero-title span {
      color: #d97706;
    }
    .hero-desc {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.6;
    }

    /* PLANS GRID - CLEAN CRISP WHITE CARDS */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 18px;
    }
    .plan-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px 12px;
      position: relative;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .plan-card.featured {
      background: #ffffff;
      border: 2px solid #d97706;
      box-shadow: 0 8px 24px rgba(217, 119, 6, 0.12);
    }
    .featured-badge {
      position: absolute;
      top: -11px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #d97706, #b45309);
      color: #ffffff;
      font-size: 9px;
      font-weight: 900;
      padding: 2.5px 12px;
      border-radius: 20px;
      white-space: nowrap;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
    }
    .plan-icon {
      font-size: 24px;
      margin-bottom: 6px;
    }
    .plan-name {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .plan-target {
      font-size: 9.5px;
      color: #64748b;
      margin-bottom: 10px;
      height: 28px;
      line-height: 1.35;
    }
    .plan-price-box {
      background: #f8fafc;
      border-radius: 10px;
      padding: 8px;
      margin-bottom: 10px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .plan-price-monthly {
      font-size: 21px;
      font-weight: 900;
      color: #0f172a;
      font-family: 'Tajawal', sans-serif;
    }
    .plan-price-unit {
      font-size: 10.5px;
      color: #64748b;
      font-weight: 700;
    }
    .plan-price-annual {
      font-size: 9.5px;
      color: #059669;
      font-weight: 800;
      margin-top: 2px;
    }
    .plan-specs {
      list-style: none;
      font-size: 10px;
      color: #334155;
      display: flex;
      flex-direction: column;
      gap: 5.5px;
      margin-bottom: 10px;
      flex-grow: 1;
    }
    .plan-specs li {
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.3;
    }
    .plan-specs li::before {
      content: "✓";
      color: #059669;
      font-weight: 900;
      font-size: 11px;
      flex-shrink: 0;
    }

    /* ROI / BUSINESS CASE - CRISP GREEN / WHITE ACCENT */
    .roi-section {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-right: 4px solid #059669;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .roi-title {
      font-size: 12px;
      font-weight: 900;
      color: #065f46;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .roi-desc {
      font-size: 10px;
      color: #047857;
      line-height: 1.55;
    }

    /* TABLE CONTAINER - LIGHT ENTERPRISE TABLE */
    .table-container {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
    .table-header-title {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      background: #f1f5f9;
      border-bottom: 1.5px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5px;
    }
    th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 800;
      padding: 8px 10px;
      text-align: right;
      border-bottom: 1.5px solid #cbd5e1;
    }
    th:not(:first-child) {
      text-align: center;
      width: 22%;
    }
    td {
      padding: 6.5px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    td:not(:first-child) {
      text-align: center;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .check-yes {
      color: #059669;
      font-weight: 800;
      font-size: 11px;
    }
    .check-no {
      color: #94a3b8;
      font-weight: 600;
    }
    .badge-highlight {
      background: #dbeafe;
      color: #1e40af;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 8.5px;
      font-weight: 800;
    }

    /* HIGHLIGHT PILL */
    .pill-gold {
      background: #fef3c7;
      color: #b45309;
      padding: 1.5px 6px;
      border-radius: 4px;
      font-size: 8.5px;
      font-weight: 800;
    }

    /* STEPS BOX */
    .steps-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .steps-title {
      font-size: 12px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .steps-list {
      font-size: 9.5px;
      color: #334155;
      padding-right: 16px;
      line-height: 1.6;
    }

    /* FOOTER & CONTACT */
    .commercial-footer {
      border-top: 1.5px solid #e2e8f0;
      padding-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
    }
    .contact-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #0f172a;
      font-weight: 800;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXECUTIVE COMMERCIAL PROPOSAL -->
  <div class="page">
    <div class="top-accent-bar"></div>

    <div class="header">
      <div class="logo-container">
        <div class="logo-badge">👑</div>
        <div>
          <div class="brand-title">TitanFit <span>SaaS</span></div>
          <div class="brand-subtitle">نظام التشغيل السحابي المتكامل لإدارة الأندية والصالات الرياضية</div>
        </div>
      </div>
      <div class="doc-meta">
        <div class="doc-badge">وثيقة العرض التجاري المعتمد 2026</div>
        <div>تاريخ الإصدار: نوفمبر 2026</div>
        <div>العملة: الجنيه المصري (EGP)</div>
        <div>الرابط الرسمي: titanfit.up.railway.app</div>
      </div>
    </div>

    <div class="hero-banner">
      <div class="hero-title">باقات اشتراك شهرية مدروسة تناسب <span>حجم وطموح ناديك الرياضي</span></div>
      <div class="hero-desc">
        صُممت باقات <strong>TitanFit SaaS</strong> لتمنح صاحب الجيم أعلى قيمة تشغيلية وعائداً استثمارياً فورياً من الشهر الأول. تشمل كل باقة بنية سحابية مستقلة فائقة السرعة، نسخاً احتياطياً يومياً، وتطبيق متدرب PWA ذكياً بالـ OTP يقلل الهدر ويزيد تجديد الاشتراكات بنسبة تفوق 35%.
      </div>
    </div>

    <!-- 3 TIER CARDS - WHITE CRISP -->
    <div class="plans-grid">
      <!-- STARTER -->
      <div class="plan-card">
        <div class="plan-icon">🥉</div>
        <div class="plan-name">باقة البداية (Starter)</div>
        <div class="plan-target">للصالات الفردية والناشئة ومراكز الفيتنس الخاصة</div>
        <div class="plan-price-box">
          <div class="plan-price-monthly">950 <span class="plan-price-unit">ج.م / شهرياً</span></div>
          <div class="plan-price-annual">أو 800 ج.م/شهر عند الدفع السنوي (وفّر 1,800 ج)</div>
        </div>
        <ul class="plan-specs">
          <li><strong>فرع واحد</strong> مستقل</li>
          <li>حتى <strong>150 مشترك نشط</strong></li>
          <li><strong>2 مدربين</strong> وكباتن</li>
          <li>لوحة التحكم السريعة والتحصيلات</li>
          <li>إدارة الأعضاء والاشتراكات والمصروفات</li>
          <li>تطبيق المتدرب PWA والدخول بالـ OTP</li>
          <li>دعم فني وتحديثات مستمرة</li>
        </ul>
      </div>

      <!-- PRO (FEATURED) -->
      <div class="plan-card featured">
        <div class="featured-badge">⭐ الأكثر طلباً ومبيعاً</div>
        <div class="plan-icon">🥈</div>
        <div class="plan-name">باقة النمو الاحترافي (Pro)</div>
        <div class="plan-target">للجيمات المتوسطة والنشطة التي تبحث عن أتمتة كاملة</div>
        <div class="plan-price-box" style="background:#fffbeb; border-color:#fde68a;">
          <div class="plan-price-monthly" style="color:#b45309;">1,950 <span class="plan-price-unit">ج.م / شهرياً</span></div>
          <div class="plan-price-annual" style="color:#059669;">أو 1,650 ج.م/شهر عند الدفع السنوي (وفّر 3,600 ج)</div>
        </div>
        <ul class="plan-specs">
          <li><strong>حتى فرعين</strong></li>
          <li>حتى <strong>600 مشترك نشط</strong></li>
          <li><strong>8 مدربين</strong> وتتبع الحصص</li>
          <li><strong>كل مميزات باقة البداية بالكامل</strong></li>
          <li>بوابات الدخول والـ Turnstiles وQR</li>
          <li>شات المدرب والمتدرب Realtime (بديل واتساب)</li>
          <li>جدول الحصص والتمارين الجماعية (Classes)</li>
          <li>كافيه وبار المكملات ونقاط البيع (POS)</li>
          <li>إدارة عمولات المدربين وحصص الـ PT</li>
        </ul>
      </div>

      <!-- ELITE -->
      <div class="plan-card">
        <div class="plan-icon">🥇</div>
        <div class="plan-name">باقة النخبة والسلاسل (Elite)</div>
        <div class="plan-target">لسلاسل الجيمات والأندية الكبرى والـ Mega Gyms</div>
        <div class="plan-price-box">
          <div class="plan-price-monthly">3,450 <span class="plan-price-unit">ج.م / شهرياً</span></div>
          <div class="plan-price-annual">أو 2,900 ج.م/شهر عند الدفع السنوي (وفّر 6,600 ج)</div>
        </div>
        <ul class="plan-specs">
          <li><strong>فروع ومقرات غير محدودة</strong></li>
          <li><strong>مشتركون غير محدودين</strong></li>
          <li><strong>مدربون وطاقم غير محدود</strong></li>
          <li><strong>كل مميزات باقة النمو الاحترافي</strong></li>
          <li>استوديو رفع فيديوهات وتمارين محمي Anti-Rip</li>
          <li>تقارير الـ BI المالية والتحليلات وتصدير CSV</li>
          <li>هوية بصرية كاملة (White-Label) ورابط مخصص</li>
          <li>مدير حساب تقني مخصص وخادم معزول</li>
        </ul>
      </div>
    </div>

    <!-- ROI HIGHLIGHT -->
    <div class="roi-section">
      <div class="roi-title">💡 دراسة الجدوى والعائد الاستثماري المباشر (ROI):</div>
      <div class="roi-desc">
        متوسط اشتراك العضو الشهري في الصالات المصرية يتراوح بين <strong>350 إلى 700 ج.م</strong>. هذا يعني أن اشتراك باقة <strong>TitanFit Pro</strong> (1,950 ج.م) تتم تغطيته بالكامل عبر اشتراك <strong>3 إلى 5 أعضاء جدد فقط</strong>! المنصة تحمي ناديك من تسريب الاشتراكات غير المدفوعة وتزيد متوسط مبيعات بار المكملات والـ PT بأكثر من <strong>25%</strong>.
      </div>
    </div>

    <div class="commercial-footer">
      <div>TitanFit Software Engineering & Cloud Solutions — وثيقة عرض سعر معتمدة</div>
      <div class="contact-item">📞 المبيعات والدعم: 01001234567 | support@titanfit.com</div>
    </div>
  </div>

  <!-- PAGE 2: DETAILED FEATURE MATRIX & SPECIFICATIONS -->
  <div class="page">
    <div class="top-accent-bar"></div>

    <div class="header">
      <div class="logo-container">
        <div class="logo-badge">👑</div>
        <div>
          <div class="brand-title">TitanFit <span>SaaS</span></div>
          <div class="brand-subtitle">جدول المقارنة التفصيلي للميزات والخدمات الفنية</div>
        </div>
      </div>
      <div class="doc-meta">
        <div>مصفوفة الصلاحيات والميزات (Feature Matrix)</div>
        <div>إصدار المنصة: 3.2.0 Enterprise</div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header-title">
        <span>المقارنة الشاملة بين باقات TitanFit</span>
        <span class="badge-highlight">ضمان تجربة واسترداد كامل خلال 14 يوماً</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>الميزة / الخاصية التشغيلية</th>
            <th>باقة البداية (Starter)<br><span style="color:#d97706; font-weight:900;">950 ج.م/ش</span></th>
            <th>باقة النمو (Pro)<br><span style="color:#d97706; font-weight:900;">1,950 ج.م/ش</span></th>
            <th>باقة النخبة (Elite)<br><span style="color:#d97706; font-weight:900;">3,450 ج.م/ش</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>عدد الفروع والمقرات المغطاة</td>
            <td>فرع 1</td>
            <td>حتى فرعين (2)</td>
            <td>غير محدود ∞</td>
          </tr>
          <tr>
            <td>الحد الأقصى للأعضاء والمشتركين النشطين</td>
            <td>150 مشترك</td>
            <td>600 مشترك</td>
            <td>غير محدود ∞</td>
          </tr>
          <tr>
            <td>حسابات المدربين والكباتن</td>
            <td>2 مدربين</td>
            <td>8 مدربين</td>
            <td>غير محدود ∞</td>
          </tr>
          <tr>
            <td>لوحة إدارة الأعضاء والاشتراكات والمدفوعات</td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>تطبيق المتدرب الذكي PWA والدخول بدون كلمة سر (OTP)</td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>بوابات الدخول الإلكترونية والـ Turnstiles وQR Access</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>جدول الحصص التدريبية والتمارين الجماعية (Classes)</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>شات المحادثة المباشرة Realtime بين المدرب والمتدرب</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>إدارة مبيعات كافيه وبار المكملات ونقاط البيع (POS)</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>إدارة فريق المدربين وتوزيع المتدربين وعمولات الـ PT</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
            <td><span class="check-yes">✓ متوفر</span></td>
          </tr>
          <tr>
            <td>استوديو رفع فيديوهات التمارين والوصفات المحمي (Anti-Rip DRM)</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر بتقنية حصرية</span></td>
          </tr>
          <tr>
            <td>التقارير المالية الموسعة، تحليلات الـ BI، وتصدير CSV / Excel</td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-no">✕ غير مشمول</span></td>
            <td><span class="check-yes">✓ متوفر بصيغ متعددة</span></td>
          </tr>
          <tr>
            <td>تخصيص الهوية البصرية الكاملة (White-Label) والرابط الخاص</td>
            <td><span class="check-no">✕ شعار TitanFit</span></td>
            <td><span class="check-no">✕ شعار TitanFit</span></td>
            <td><span class="check-yes">✓ هويتك الخاصة 100%</span></td>
          </tr>
          <tr>
            <td>النسخ الاحتياطي السحابي اليومي والتشفير البنكي AES-256</td>
            <td><span class="check-yes">✓ يومي</span></td>
            <td><span class="check-yes">✓ فوري ومستمر</span></td>
            <td><span class="check-yes">✓ سيرفر معزول مخصص</span></td>
          </tr>
          <tr>
            <td>مستوى الدعم الفني وتدريب الطاقم (SLA)</td>
            <td>تذاكر وبريد إلكتروني</td>
            <td>واتساب مباشر وأولوية</td>
            <td>مدير حساب تقني مخصص 24/7</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ONBOARDING & SETUP -->
    <div class="steps-box">
      <div class="steps-title">🚀 خطوات التفعيل والانطلاق (جاهزية كاملة خلال 24 ساعة):</div>
      <ol class="steps-list">
        <li><strong>اختيار الباقة المناسبة:</strong> تحديد الباقة الشهرية أو السنوية المناسبة لحجم صالتك وطاقتها الاستيعابية.</li>
        <li><strong>تجهيز الحساب السحابي:</strong> رفع شعارك، بيانات فروعك، وإعداد رسوم الاشتراكات في أقل من ساعة.</li>
        <li><strong>استيراد بيانات المشتركين:</strong> فريق الدعم ينقل بيانات أعضائك الحاليين من الدفاتر أو شيتات Excel مجاناً.</li>
        <li><strong>تدريب الريسبشن والمدربين:</strong> جلسة تدريبية أونلاين لشرح كافة وظائف المنصة وتطبيق المتدرب لكباتنك.</li>
      </ol>
    </div>

    <div class="commercial-footer">
      <div>منظومة TitanFit الرياضية — حقوق النشر والتوزيع 2026 محفوظة بالكامل</div>
      <div style="color:#b45309; font-weight:800;">جاهز لبدء تجربتك المجانية؟ تواصل معنا اليوم!</div>
    </div>
  </div>

</body>
</html>
"""

html_path = "C:/Users/Nour Eldin/.gemini/antigravity/scratch/gymos/apps/web/public/titanfit-saas-proposal.html"
pdf_public_path = "C:/Users/Nour Eldin/.gemini/antigravity/scratch/gymos/apps/web/public/titanfit-saas-pricing-proposal.pdf"
pdf_artifact_path = "C:/Users/Nour Eldin/.gemini/antigravity/brain/ef1dd8b4-d6c8-4966-8ecc-57d0d9b918aa/titanfit-saas-pricing-proposal.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"White-theme HTML written to {html_path}")

# Run Chrome headless to render pristine vector PDF
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    f"--print-to-pdf={pdf_public_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
print(f"Chrome PDF returncode: {res.returncode}")
if os.path.exists(pdf_public_path):
    print(f"PDF generated successfully at {pdf_public_path} ({os.path.getsize(pdf_public_path)} bytes)")
    shutil.copyfile(pdf_public_path, pdf_artifact_path)
    print(f"PDF copied to artifact path: {pdf_artifact_path}")
else:
    print(f"Failed. Stderr: {res.stderr}")
