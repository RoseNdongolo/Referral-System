from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ReceptionistProfile, MedicalDirectorProfile


class UserAdmin(BaseUserAdmin):
    model = User
    list_display = ('username', 'email', 'role', 'phone_number', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'phone_number')
    ordering = ('username',)
    fieldsets = BaseUserAdmin.fieldsets + (('Extra Info', {'fields': ('role', 'phone_number')}),)
    add_fieldsets = BaseUserAdmin.add_fieldsets + (('Extra Info', {'fields': ('role', 'phone_number')}),)


admin.site.register(User, UserAdmin)
admin.site.register(ReceptionistProfile)
admin.site.register(MedicalDirectorProfile)