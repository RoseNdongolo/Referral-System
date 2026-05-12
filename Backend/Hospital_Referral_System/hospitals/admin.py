from django.contrib import admin
from .models import Hospital, HospitalSpecialty, HospitalDepartment

admin.site.register(Hospital)
admin.site.register(HospitalSpecialty)
admin.site.register(HospitalDepartment)