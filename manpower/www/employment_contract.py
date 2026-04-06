import frappe
import traceback

def get_context(context):
    employee_id = frappe.form_dict.get('employee_id')
    context.location = frappe.form_dict.get('location', '')
    context.contract_date = frappe.form_dict.get('contract_date', '')
    
    context.emp = None
    context.company = None
    context.debug_msg = "Starting data fetch..."
    
    if employee_id:
        try:
            emp = frappe.get_doc("Employee", employee_id)
            context.emp = emp
            context.debug_msg += f" | Found Employee: {emp.name}"
            
            context.nationality = emp.get('custom_nationality')
            if context.nationality:
                context.nationality_ar = frappe._(context.nationality, lang="ar")
                
            company_name = emp.get('company')
            if company_name:
                company = frappe.get_doc("Company", company_name)
                context.company = company
                context.debug_msg += f" | Found Company: {company.name}"
                
                auth_name_param = frappe.form_dict.get('auth_name')
                auth_list = company.get('custom_auth_name')
                
                if auth_list:
                    context.debug_msg += f" | Found Auth List ({len(auth_list)} entries)"
                    auth_entry = None
                    if auth_name_param:
                        for a in auth_list:
                            if a.get('name1') == auth_name_param:
                                auth_entry = a
                                break
                    if not auth_entry:
                        auth_entry = auth_list[0]
                        
                    context.auth_name = auth_entry.get('name1')
                    context.auth_civil = auth_entry.get('civil_id')
                    context.arabic_company_name = auth_entry.get('arabic_company_name')
                else:
                    context.debug_msg += " | No Auth List found"
        except Exception as e:
            err = traceback.format_exc()
            context.debug_msg += f" | EXCEPTION: {str(e)} - {err}"
            frappe.log_error(title="Error fetching contract data", message=err)
            
    # For no cache
    context.no_cache = 1
    
    return context
