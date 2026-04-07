frappe.pages['employment-contract'].on_page_load = function(wrapper) {
    let page_html = $(wrapper).html();

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Employment Contract'),
        single_column: true
    });

    $(page_html).appendTo(page.main);

    let urlParams = new URLSearchParams(window.location.search);
    let route_options = frappe.route_options || {};
    let employee_id = route_options.employee_id || urlParams.get('employee_id');
    let location = route_options.location || urlParams.get('location');
    let contract_date = route_options.contract_date || urlParams.get('contract_date');
    let selected_auth = route_options.auth_name || urlParams.get('auth_name') || '';

    if(!employee_id) {
        frappe.msgprint(__('Please access this page directly from an Employee profile to generate the contract.'));
        return;
    }

    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "Employee",
            name: employee_id
        },
        callback: function(r) {
            if(r.message) {
                let emp = r.message;
                if(emp.company) {
                    frappe.call({
                        method: "frappe.client.get",
                        args: { doctype: "Company", name: emp.company },
                        callback: function(rc) {
                            populateContract(emp, rc.message || {}, location, contract_date, selected_auth);
                        }
                    });
                } else {
                    populateContract(emp, {}, location, contract_date, selected_auth);
                }
            }
        }
    });

    function populateContract(emp, company, location, contract_date, selected_auth) {
        let auth = null;
        if(company.custom_auth_name && company.custom_auth_name.length > 0) {
            auth = selected_auth
                ? (company.custom_auth_name.find(a => a.name1 === selected_auth) || company.custom_auth_name[0])
                : company.custom_auth_name[0];
        }

        let $wrap = $(wrapper);
        $wrap.find('#f_location').val(location || '');
        $wrap.find('#f_date').val(contract_date || '');

        $wrap.find('#f_company').val(auth ? auth.arabic_company_name : '');
        $wrap.find('#f_auth_name').val(auth ? auth.name1 : '');
        $wrap.find('#f_auth_civil').val(auth ? auth.civil_id : '');
        $wrap.find('#f_company_spec').val(company.custom_specialization_ || '');

        $wrap.find('#f_emp_name').val(emp.custom_arabic_name || emp.employee_name || '');
        $wrap.find('#f_nationality').val(emp.custom_nationality || '');
        $wrap.find('#f_emp_civil').val(emp.custom_civil_id || '');
        $wrap.find('#f_title').val(emp.custom_arabic_title || emp.designation || '');

        setTimeout(() => {
            if(typeof window.autoFillDay === 'function') window.autoFillDay();
            if(typeof window.updatePreview === 'function') window.updatePreview();

            $wrap.find('#f_date').trigger('input');
            $wrap.find('#f_location').trigger('input');
        }, 500);
    }
}

// Global scope bindings for Frappe HTML bindings

  window.contractType = 'fixed';

  window.customScrollTo = function(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    event.currentTarget.classList.add('active');
  }

  window.selectContractType = function(type) {
    contractType = type;
    document.getElementById('toggle-fixed').classList.toggle('selected', type === 'fixed');
    document.getElementById('toggle-open').classList.toggle('selected', type === 'open');
    document.getElementById('years-field').classList.toggle('hidden', type === 'open');
    updatePreview();
  }

  window.autoFillDay = function() {
    const dateVal = document.getElementById('f_date').value;
    const dayInput = document.getElementById('f_day');
    if (!dateVal) { dayInput.value = ''; return; }
    const arabicDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const d = new Date(dateVal + 'T00:00:00');
    dayInput.value = arabicDays[d.getDay()];
  }

  window.val = function(id, placeholder) {
    const v = document.getElementById(id).value.trim();
    if (v) return "<span class=\"field-val\">" + v + "</span>";
    return "<span class=\"field-empty\">" + placeholder + "</span>";
  }

  window.raw = function(id) {
    return document.getElementById(id).value.trim();
  }

  window.fmtDate = function(id) {
    const v = raw(id);
    if (!v) return "<span class=\"field-empty\">التاريخ</span>";
    const d = new Date(v);
    const opts = { year: 'numeric', month: 'long', day: 'numeric' };
    return "<span class=\"field-val\">" + d.toLocaleDateString('ar-KW', opts) + "</span>";
  }

  window.updatePreview = function() {
    const location  = val('f_location', 'الموقع');
    const day       = val('f_day', 'اليوم');
    const date      = fmtDate('f_date');
    const company   = val('f_company', 'اسم الشركة');
    const authName  = val('f_auth_name', 'اسم المفوض');
    const authCivil = val('f_auth_civil', 'الرقم المدني');
    const empName   = val('f_emp_name', 'اسم الموظف');
    const natl      = val('f_nationality', 'الجنسية');
    const empCivil  = val('f_emp_civil', 'الرقم المدني');
    const compSpec  = val('f_company_spec', 'مجال العمل');
    const title     = val('f_title', 'المسمى الوظيفي');
    const salary    = val('f_salary', 'الراتب');
    const effDate   = fmtDate('f_effective_date');
    const years     = val('f_years', 'عدد السنوات');

    const clause6Fixed = "هذا العقد محدد المدة ويبدأ اعتبارا من " + effDate + " ولمدة " + years + " سنوات، ويجوز تجديد العقد بموافقة الطرفين لمدد مماثلة بحد أقصى خمس سنوات ميلادية.";
    const clause6Open  = "هذا العقد غير محدد المدة ويبدأ اعتبارا من " + effDate + ".";
    const clause6 = contractType === 'fixed' ? clause6Fixed : clause6Open;

    document.getElementById('contract-preview').innerHTML = "\n      <div class=\"contract-title\">\n        <img src=\"Public-Authority-of-Manpower1.png\" alt=\"الهيئة العامة للقوى العاملة\" style=\"width:153px;height:auto;margin-bottom:10px;\">\n        <h2>نموذج عـقـد عـمـل</h2>\n        <p>في القطاع الأهلي · دولة الكويت</p>\n      </div>\n\n      <div class=\"contract-meta\">\n        الهيئة العامة للقوى العاملة / " + location + "\n        &nbsp;&nbsp;|&nbsp;&nbsp;\n        يوم " + day + " الموافق " + date + "\n      </div>\n\n      <p class=\"contract-intro\">تحرر هذا العقد بين كل من:</p>\n\n      <div class=\"party-block\">\n        <span class=\"party-tag\">الطرف الأول · صاحب العمل</span>\n        <table>\n          <tr><td>الشركة</td><td>" + company + "</td></tr>\n          <tr><td>المفوض بالتوقيع</td><td>" + authName + "</td></tr>\n          <tr><td>الرقم المدني</td><td>" + authCivil + "</td></tr>\n        </table>\n      </div>\n\n      <div class=\"party-block\">\n        <span class=\"party-tag\">الطرف الثاني · الموظف</span>\n        <table>\n          <tr><td>الاسم</td><td>" + empName + "</td></tr>\n          <tr><td>الجنسية</td><td>" + natl + "</td></tr>\n          <tr><td>الرقم المدني</td><td>" + empCivil + "</td></tr>\n        </table>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">تمهيد</span></div>\n        <div class=\"clause-body\">\n          يمتلك الطرف الأول منشأة باسم " + company + " تعمل في مجال " + compSpec + "، ويرغب في التعاقد مع الطرف الثاني للعمل لديه بمهنة " + title + "، وبعد أن أقر الطرفان بأهليتهما في إبرام هذا العقد تم الاتفاق على ما يلي:\n        </div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الأول</span></div>\n        <div class=\"clause-body\">يعتبر التمهيد السابق جزءاً لا يتجزأ من هذا العقد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الثاني</span><span class=\"clause-name\">طبيعة العمل</span></div>\n        <div class=\"clause-body\">تعاقد الطرف الأول مع الطرف الثاني للعمل لديه بمهنة " + title + " داخل دولة الكويت.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الثالث</span><span class=\"clause-name\">فترة التجربة</span></div>\n        <div class=\"clause-body\">يخضع الطرف الثاني لفترة تجربة لمدة لا تزيد عن <strong>100 يوم عمل</strong>، ويحق لكل طرف إنهاء العقد خلال تلك الفترة دون إخطار.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الرابع</span><span class=\"clause-name\">قيمة الأجر</span></div>\n        <div class=\"clause-body\">يتقاضى الطرف الثاني عن تنفيذ هذا العقد أجراً مقداره " + salary + " دينار يدفع في نهاية كل شهر، ولا يجوز للطرف الأول تخفيض الأجر أثناء سريان هذا العقد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الخامس</span><span class=\"clause-name\">نفاذ العقد</span></div>\n        <div class=\"clause-body\">يبدأ نفاذ العقد اعتباراً من " + effDate + "، ويلتزم الطرف الثاني بالقيام بأداء عمله طوال مدة نفاذه.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند السادس</span><span class=\"clause-name\">مدة العقد</span></div>\n        <div class=\"clause-body\">" + clause6 + "</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند السابع</span><span class=\"clause-name\">الإجازة السنوية</span></div>\n        <div class=\"clause-body\">للطرف الثاني الحق في إجازة سنوية مدفوعة الأجر مدتها <strong>30 يوماً</strong>، ولا يستحقها عن السنة الأولى إلا بعد انقضاء مدة تسعة أشهر تحسب من تاريخ نفاذ العقد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الثامن</span><span class=\"clause-name\">عدد ساعات العمل</span></div>\n        <div class=\"clause-body\">لا يجوز للطرف الأول تشغيل الطرف الثاني لمدة تزيد عن <strong>ثماني ساعات</strong> يومياً تتخللها فترة راحة لا تقل عن ساعة، باستثناء الحالات المقررة قانوناً.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند التاسع</span><span class=\"clause-name\">قيمة تذكرة السفر</span></div>\n        <div class=\"clause-body\">يتحمل الطرف الأول مصاريف عودة الطرف الثاني إلى بلده عند انتهاء علاقة العمل ومغادرته نهائياً للبلاد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند العاشر</span><span class=\"clause-name\">التأمين ضد إصابات وأمراض العمل</span></div>\n        <div class=\"clause-body\">يلتزم الطرف الأول بالتأمين على الطرف الثاني ضد إصابات وأمراض العمل، كما يلتزم بقيمة التأمين الصحي طبقاً للقانون رقم (1) لسنة 1999.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الحادي عشر</span><span class=\"clause-name\">مكافأة نهاية الخدمة</span></div>\n        <div class=\"clause-body\">يستحق الطرف الثاني مكافأة نهاية الخدمة المنصوص عليها بالقوانين المنظمة.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الثاني عشر</span><span class=\"clause-name\">القانون الواجب التطبيق</span></div>\n        <div class=\"clause-body\">تسري أحكام قانون العمل في القطاع الأهلي رقم 6 لسنة 2010 والقرارات المنفذة له فيما لم يرد بشأنه نص في هذا العقد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الثالث عشر</span><span class=\"clause-name\">شروط خاصة</span></div>\n        <div class=\"clause-body\">1: لا يوجد<br>2: لا يوجد</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الرابع عشر</span><span class=\"clause-name\">المحكمة المختصة</span></div>\n        <div class=\"clause-body\">تختص المحكمة الكلية ودوائرها العمالية طبقاً لأحكام القانون رقم 46 لسنة 1987 بنظر كافة المنازعات الناشئة عن تطبيق أو تفسير هذا العقد.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند الخامس عشر</span><span class=\"clause-name\">لغة العقد</span></div>\n        <div class=\"clause-body\">حرر هذا العقد باللغة العربية، ويعتد بنصوص اللغة العربية عند وقوع أي تعارض.</div>\n      </div>\n\n      <div class=\"clause\">\n        <div class=\"clause-title\"><span class=\"clause-num\">البند السادس عشر</span><span class=\"clause-name\">نسخ العقد</span></div>\n        <div class=\"clause-body\">حرر هذا العقد من ثلاث نسخ بيد كل طرف نسخة للعمل بموجبها والثالثة تودع لدى الهيئة العامة للقوى العاملة.</div>\n      </div>\n\n      <div class=\"signature-row\">\n        <div class=\"sig-party\">\n          <p>الطرف الأول</p>\n          <div class=\"sig-line\"></div>\n        </div>\n        <div class=\"sig-party\">\n          <p>الطرف الثاني</p>\n          <div class=\"sig-line\"></div>\n        </div>\n      </div>\n    ";
  }


  window.exportPDF = function() {
    // Open a clean window with only the contract content -- avoids ERPNext wrapper interference
    const content = document.getElementById('contract-preview').innerHTML;
    const printWin = window.open('', '_blank');
    printWin.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>عقد-عمل</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 15mm;
    @bottom-center {
      content: counter(page);
      font-family: 'Tajawal', sans-serif;
      font-size: 10pt;
      color: #5a7080;
    }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body {
    font-family: 'Tajawal', sans-serif;
    direction: rtl;
    color: #1a2a3a;
    background: #fff;
    padding: 0;
    line-height: 1.9;
    font-size: 12pt;
  }

  /* Header */
  .contract-title {
    text-align: center;
    margin-bottom: 6px;
  }
  .contract-title img {
    display: block;
    margin: 0 auto 2px;
    width: 150px;
    height: auto;
  }
  .contract-title h2 {
    font-size: 18pt;
    font-weight: 700;
    color: #0E2841;
    margin-top: 2px;
  }
  .contract-title p {
    font-size: 11pt;
    font-weight: 500;
    color: #5a7080;
  }

  /* Meta line */
  .contract-meta {
    text-align: center;
    margin: 10px 0;
    padding: 8px;
    font-size: 10pt;
    color: #5a7080;
  }

  /* Intro */
  .contract-intro {
    margin: 16px 0;
    font-size: 11pt;
    font-weight: 600;
    text-align: right;
  }

  /* Party blocks */
  .party-block {
    background: #f7f8fa;
    border-radius: 6px;
    padding: 0 20px 14px 20px;
    margin: 10px 0;
    border-right: 3px solid #2C7DA5;
    border-left: 3px solid #2C7DA5;
    overflow: hidden;
  }
  .party-block .party-tag {
    display: block;
    text-align: center;
    background: #2C7DA5;
    color: #fff;
    font-size: 10pt;
    font-weight: 700;
    padding: 4px 10px;
    margin: 0 -20px 10px -20px;
    border-radius: 0;
  }
  .party-block table { width: 100%; border-collapse: collapse; }
  .party-block td { padding: 5px 0; font-size: 10.5pt; text-align: right; }
  .party-block td:first-child { font-weight: 700; width: 160px; color: #0E2841; }
  .party-block td:last-child { color: #5a7080; }

  /* Clauses */
  .clause {
    margin: 16px 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .clause-title {
    font-size: 11pt;
    font-weight: 700;
    color: #0E2841;
    margin-bottom: 4px;
    text-align: right;
    line-height: 2;
  }
  .clause-num {
    display: inline-block;
    background: #0E2841;
    color: #fff;
    font-size: 9pt;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 4px;
    vertical-align: middle;
    line-height: 1.6;
  }
  .clause-name {
    display: inline;
    font-size: 11pt;
    font-weight: 700;
    color: #0E2841;
    padding-right: 14px;
    margin-right: 8px;
    border-right: 2px solid rgba(44,125,165,0.35);
    vertical-align: middle;
  }
  .clause-body {
    font-size: 10.5pt;
    line-height: 1.9;
    color: #1a2a3a;
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .field-val { color: #2C7DA5; font-weight: 700; }
  .field-empty { color: #ccc; font-weight: 400; font-style: italic; font-size: 9pt; }

  /* Signatures */
  .signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
    padding-top: 20px;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .sig-party { text-align: center; width: 40%; }
  .sig-party p { font-size: 11pt; font-weight: 700; color: #0E2841; margin-bottom: 50px; }
  .sig-line { border-bottom: 1px solid #1a2a3a; width: 160px; margin: 0 auto; }
</style>
</head>
<body>
${content}
</body>
</html>`);
    printWin.document.close();
    // Wait for fonts to load, then print
    printWin.onload = function() {
      setTimeout(function() {
        printWin.print();
      }, 400);
    };
  }

  // Initialize preview on load
  updatePreview();
