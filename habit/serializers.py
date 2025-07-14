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
        model = HabitRecord
        fields = '__all__'
        validators = [] 

    def validate(self, data):
        request = self.context.get('request')
        method = request.method if request else None

        habit = data.get('habit')
        date = data.get('date')

        if method == 'POST' and habit and date:
            existing = HabitRecord.objects.filter(habit=habit, date=date).first()
            if existing and existing.habit.user != request.user:
                raise serializers.ValidationError("You cannot modify records that are not yours.")

        return data