from rest_framework import serializers
from .models import Habit, HabitRecord

class HabitSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Habit
        fields = "__all__"
        read_only_fields =['user']

class HabitRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model=HabitRecord
        fields ="__all__"
        read_only_fields =['date']