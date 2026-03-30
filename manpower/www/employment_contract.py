import frappe
from frappe.utils import formatdate, getdate

def get_context(context):
    employee_id = frappe.form_dict.get('employee_id')
    location = frappe.form_dict.get('location', '')
    contract_date = frappe.form_dict.get('contract_date', '')
    
    context.location = location
    context.contract_date = contract_date
    context.emp = None
    context.company = None
    
    if employee_id:
        try:
            emp = frappe.get_doc("Employee", employee_id)
            context.emp = emp
            context.nationality = emp.custom_nationality
            if context.nationality:
                # Try to get translated name
                context.nationality_ar = frappe._(context.nationality, "ar")
                
            if emp.company:
                company = frappe.get_doc("Company", emp.company)
                context.company = company
                
                if company.custom_auth_name:
                    auth = company.custom_auth_name[0]
                    context.auth_name = auth.name1
                    context.auth_civil = auth.civil_id
                    context.arabic_company_name = auth.arabic_company_name
        except Exception as e:
            frappe.log_error(f"Error fetching contract data: {e}")
            
    # For no cache
    context.no_cache = 1
    
    return context
