import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def after_migrate():
    custom_fields = {
        "Employee": [
            dict(
                fieldname='custom_manpower',
                label='Manpower',
                fieldtype='Tab Break',
                insert_after='dashboard_tab'
            ),
            dict(
                fieldname='custom_arabic_name',
                label='Arabic Name',
                fieldtype='Data',
                insert_after='custom_manpower'
            ),
            dict(
                fieldname='custom_arabic_title',
                label='Arabic Title',
                fieldtype='Data',
                insert_after='custom_arabic_name'
            ),
            dict(
                fieldname='custom_nationality',
                label='الجنسية',
                fieldtype='Select',
                options='الكويت\nمصر\nالسعودية\nالإمارات\nعمان\nالبحرين\nقطر\nاليمن\nالأردن\nفلسطين\nسوريا\nلبنان\nالعراق\nالسودان\nليبيا\nتونس\nالجزائر\nالمغرب\nموريتانيا\nالصومال\nجيبوتي\nالهند\nباكستان\nبنغلاديش\nالفلبين\nسريلانكا\nنيبال\nإندونيسيا\nأخرى',
                insert_after='custom_arabic_title'
            ),
            dict(
                fieldname='custom_civil_id',
                label='الرقم المدني',
                fieldtype='Data',
                insert_after='custom_nationality'
            )
        ],
        "Company": [
            dict(
                fieldname='custom_manpower',
                label='Manpower',
                fieldtype='Tab Break',
                insert_after='dashboard_tab'
            ),
            dict(
                fieldname='custom_contract_logo',
                label='Contract Logo',
                fieldtype='Attach Image',
                insert_after='custom_manpower'
            ),
            dict(
                fieldname='custom_specialization_',
                label='Company Specialization (Arabic)',
                fieldtype='Data',
                insert_after='custom_contract_logo'
            ),
            dict(
                fieldname='custom_auth_name',
                label='Auth Name',
                fieldtype='Table',
                options='authorized manpower details',
                insert_after='custom_specialization_'
            )
        ]
    }
    
    create_custom_fields(custom_fields, ignore_validate=True)
