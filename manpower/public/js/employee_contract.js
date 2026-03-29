frappe.ui.form.on('Employee', {
    refresh: function(frm) {
        if (!frm.is_new() && frm.doc.docstatus === 0) {
            frm.add_custom_button(__('Generate Contract'), function() {
            let d = new frappe.ui.Dialog({
                title: __('Enter Contract Details'),
                fields: [
                    {
                        label: 'Location / Region',
                        fieldname: 'location',
                        fieldtype: 'Select',
                        options: 'العاصمة\nحولي\nالاحمدي',
                        reqd: 1
                    },
                    {
                        label: 'Date',
                        fieldname: 'contract_date',
                        fieldtype: 'Date',
                        default: frappe.datetime.get_today(),
                        reqd: 1
                    }
                ],
                primary_action_label: __('Generate'),
                primary_action: function(values) {
                    d.hide();
                    frappe.set_route('employment-contract', {
                        employee_id: frm.doc.name,
                        location: values.location,
                        contract_date: values.contract_date
                    });
                }
            });
            d.show();
        }, __('Manpower'));
        }
    }
});
