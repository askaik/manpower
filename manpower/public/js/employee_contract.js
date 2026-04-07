frappe.ui.form.on('Employee', {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus === 0) {
            frm.add_custom_button(__('Generate Contract'), function() {
            // Fetch company data to pre-fill dialog
            let company_name = frm.doc.company || '';
            let auth_options = [];

            function show_dialog(auth_opts) {
                let fields = [
                    {
                        label: 'Company',
                        fieldname: 'company',
                        fieldtype: 'Link',
                        options: 'Company',
                        default: company_name,
                        reqd: 1
                    },
                    {
                        label: 'اسم المفوض بالتوقيع',
                        fieldname: 'auth_name',
                        fieldtype: 'Select',
                        options: auth_opts.join('\n'),
                        reqd: 1
                    },
                    {
                        label: 'Location / Region',
                        fieldname: 'location',
                        fieldtype: 'Select',
                        options: 'العاصمة\nحولي\nالفروانية\nالجهراء\nالأحمدي\nمبارك الكبير',
                        reqd: 1
                    },
                    {
                        label: 'Date',
                        fieldname: 'contract_date',
                        fieldtype: 'Date',
                        default: frappe.datetime.get_today(),
                        reqd: 1
                    }
                ];

                let d = new frappe.ui.Dialog({
                    title: __('Enter Contract Details'),
                    fields: fields,
                    primary_action_label: __('Generate'),
                    primary_action: function(values) {
                        d.hide();
                        const params = new URLSearchParams({
                            employee_id: frm.doc.name,
                            company: values.company,
                            auth_name: values.auth_name,
                            location: values.location,
                            contract_date: values.contract_date
                        }).toString();
                        // Open the public Web Page mapped by the www/ directory
                        window.open('/employment_contract?' + params, '_blank');
                    }
                });
                d.show();
            }

            if (company_name) {
                frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Company",
                        name: company_name
                    },
                    callback: function(r) {
                        if (r.message && r.message.custom_auth_name) {
                            auth_options = r.message.custom_auth_name.map(function(row) {
                                return row.name1;
                            });
                        }
                        show_dialog(auth_options);
                    }
                });
            } else {
                show_dialog(auth_options);
            }
        }, __('Manpower'));
        }
    }
});