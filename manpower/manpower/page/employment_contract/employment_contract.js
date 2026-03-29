frappe.pages['employment-contract'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Employment Contract'),
        single_column: true
    });

    $(frappe.render_template('employment_contract', {})).appendTo(page.main);

    let route_options = frappe.route_options || {};
    let employee_id = route_options.employee_id;
    let location = route_options.location;
    let contract_date = route_options.contract_date;

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
                populateContract(emp, location, contract_date);
            }
        }
    });

    function populateContract(emp, location, contract_date) {
        let auth = null;
        if(emp.custom_auth_name && emp.custom_auth_name.length > 0) {
            auth = emp.custom_auth_name[0];
        }

        let $wrap = $(wrapper);
        $wrap.find('#f_location').val(location || '');
        $wrap.find('#f_date').val(contract_date || '');
        
        $wrap.find('#f_company').val(auth ? auth.arabic_company_name : '');
        $wrap.find('#f_auth_name').val(auth ? auth.name1 : '');
        $wrap.find('#f_auth_civil').val(auth ? auth.civil_id : '');
        $wrap.find('#f_company_spec').val(auth ? auth.custom_specialization_ : '');

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
