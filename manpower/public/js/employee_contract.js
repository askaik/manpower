frappe.ui.form.on('Employee', {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus === 0) {
            frm.add_custom_button(__('Generate Contract'), function() {
                if (!frm.doc.company) {
                    frappe.msgprint(__('Employee has no company assigned.'));
                    return;
                }
                frappe.call({
                    method: 'frappe.client.get',
                    args: { doctype: 'Company', name: frm.doc.company },
                    callback: function(r) {
                        let auth_options = [];
                        if (r.message && r.message.custom_auth_name) {
                            r.message.custom_auth_name.forEach(function(a) {
                                if (a.name1) auth_options.push(a.name1);
                            });
                        }
                        let d = new frappe.ui.Dialog({
                            title: __('Enter Contract Details'),
                            fields: [
                                {
                                    label: __('Location / Region'),
                                    fieldname: 'location',
                                    fieldtype: 'Select',
                                    options: 'العاصمة\nحولي\nالاحمدي\nالجهراء\nمبارك الكبير\nالفروانية',
                                    reqd: 1
                                },
                                {
                                    label: __('Authorized Signatory / المفوض بالتوقيع'),
                                    fieldname: 'auth_name',
                                    fieldtype: 'Select',
                                    options: auth_options.join('\n'),
                                    reqd: auth_options.length > 0 ? 1 : 0
                                },
                                {
                                    label: __('Date'),
                                    fieldname: 'contract_date',
                                    fieldtype: 'Date',
                                    default: frappe.datetime.get_today(),
                                    reqd: 1
                                }
                            ],
                            primary_action_label: __('Generate'),
                            primary_action: function(values) {
                                d.hide();
                                const params = new URLSearchParams({
                                    employee_id: frm.doc.name,
                                    location: values.location,
                                    auth_name: values.auth_name || '',
                                    contract_date: values.contract_date
                                }).toString();
                                window.open('/employment_contract?' + params, '_blank');
                            }
                        });
                        d.show();
                    }
                });
            }, __('Manpower'));
        }
    }
});
