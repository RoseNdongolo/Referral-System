from django.contrib import admin
from .models import Hospital, Specialty, HospitalDepartment

admin.site.register(Hospital)
admin.site.register(Specialty)
admin.site.register(HospitalDepartment)