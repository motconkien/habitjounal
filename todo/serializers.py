from rest_framework import serializers
from .models import ProjectEntry, TaskEntry

class ProjectEntrySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = ProjectEntry
        fields = '__all__'
        read_only_fields = ['user']

class TaskEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskEntry
        fields= '__all__'
        read_only_fields =['date']
