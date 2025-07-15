from rest_framework import serializers
from .models import ProjectEntry, TaskEntry

class ProjectEntrySerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    tasks = serializers.SerializerMethodField()
    completed = serializers.SerializerMethodField()

    class Meta:
        model = ProjectEntry
        fields = ['user','id', 'project_title', 'description', 'date', 'tasks', 'completed']
        read_only_fields = ['user']

    def get_tasks(self,obj):
        return TaskEntry.objects.filter(project_id=obj.id).count()
    
    def get_completed(self, obj):
        return TaskEntry.objects.filter(project_id=obj.id, is_completed=True).count()
    
class TaskEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskEntry
        fields= '__all__'
        read_only_fields =['date']
