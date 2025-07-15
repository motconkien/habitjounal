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
        validators = []

    def validate(self, data):
        request = self.context.get('request')
        method = request.method if request else None
        project_title = data.get('project_title')

        if project_title and request:
            user = request.user
            queryset = ProjectEntry.objects.filter(user=user, project_title=project_title)

            if self.instance:  # during update
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError({"project_title": ["You already have a project with this title."]})
        
        return data

    
    def get_tasks(self,obj):
        return TaskEntry.objects.filter(project_id=obj.id).count()
    
    def get_completed(self, obj):
        return TaskEntry.objects.filter(project_id=obj.id, is_completed=True).count()
    
class TaskEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskEntry
        fields= '__all__'
        read_only_fields =['date']
