from rest_framework import serializers
from accounts.models import User

class ReceptionistSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    employee_id = serializers.CharField(source='receptionist_profile.employee_id', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'phone_number', 'role', 'employee_id', 'full_name'
        ]
        read_only_fields = ['id', 'role', 'employee_id']   # allow username, first_name, etc. to be writable

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()