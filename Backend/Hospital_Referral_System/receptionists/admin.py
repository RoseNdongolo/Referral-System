from django.contrib import admin
from .models import ReceptionistProfile

@admin.register(ReceptionistProfile)
class ReceptionistProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'employee_id', 'is_active', 'shift']
    list_filter = ['is_active', 'shift']
    search_fields = ['user__username', 'employee_id']