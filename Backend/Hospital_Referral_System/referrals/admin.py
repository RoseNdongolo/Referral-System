from django.contrib import admin
from .models import Referral, ReferralAttachment

admin.site.register(Referral)
admin.site.register(ReferralAttachment)