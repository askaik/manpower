app_name = "manpower"
app_title = "Manpower Kuwait Cont"
app_publisher = "User"
app_description = "Frappe custom module for Manpower Kuwait Employment Contracts"
app_email = "test@example.com"
app_license = "mit"
required_apps = ["erpnext"]

doctype_js = {
    "Employee": "public/js/employee_contract.js"
}

after_migrate = "manpower.setup.install.after_migrate"
