import frappe
import traceback

def get_context(context):
    employee_id = frappe.form_dict.get('employee_id')
    context.location = frappe.form_dict.get('location', '')
    context.contract_date = frappe.form_dict.get('contract_date', '')
    
    context.emp = None
    context.company = None
    context.debug_msg = "Starting data fetch..."
    
    # Pre-declare pure string fields for Jinja to safely bind into <input value="...">
    context.val_emp_name = ''
    context.val_nationality = ''
    context.val_emp_civil = ''
    context.val_title = ''
    context.val_company_name = ''
    context.val_auth_name = ''
    context.val_auth_civil = ''
    context.val_company_spec = ''
    
    if employee_id:
        try:
            emp = frappe.get_doc("Employee", employee_id)
            context.emp = emp
            context.debug_msg += f" | Found Employee: {emp.name}"
            
            context.val_emp_name = emp.get('custom_arabic_name') or emp.get('employee_name') or ''
            context.val_emp_civil = emp.get('custom_civil_id') or ''
            context.val_title = emp.get('custom_arabic_title') or emp.get('designation') or ''
            
            context.nationality = emp.get('custom_nationality')
            if context.nationality:
                try:
                    context.val_nationality = frappe._(context.nationality, lang="ar")
                except Exception:
                    context.val_nationality = context.nationality
                
            company_name = emp.get('company')
            if company_name:
                company = frappe.get_doc("Company", company_name)
                context.company = company
                context.debug_msg += f" | Found Company: {company.name}"
                
                context.val_company_name = company.get('company_name') or ''
                context.val_company_spec = company.get('custom_specialization_') or ''
                
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
                        
                    context.val_auth_name = auth_entry.get('name1') or ''
                    context.val_auth_civil = auth_entry.get('civil_id') or ''
                    
                    if auth_entry.get('arabic_company_name'):
                        context.val_company_name = auth_entry.get('arabic_company_name')
                else:
                    context.debug_msg += " | No Auth List found"
        except Exception as e:
            err = traceback.format_exc()
            context.debug_msg += f" | EXCEPTION: {str(e)} - {err}"
            frappe.log_error(title="Error fetching contract data", message=err)
            
    # For no cache
    context.no_cache = 1
    
    return context
