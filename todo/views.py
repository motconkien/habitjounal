from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import TaskEntry, ProjectEntry
from .serializers import TaskEntrySerializer, ProjectEntrySerializer

# Create your views here.
class ProjectEntryViewSet(viewsets.ModelViewSet):
    queryset = ProjectEntry.objects.all()
    serializer_class = ProjectEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    #ensures users only see their own entries
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
    
    #assigns the user automatically (so they don't send it)
    def perform_create(self, serializer):
        return serializer.save(user=self.request.user)

class TaskEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TaskEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = TaskEntry.objects.filter(project__user = user)
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project__id=project_id)
        return queryset
    
    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        title = serializer.validated_data['task_title']

        if TaskEntry.objects.filter(project=project,task_title=title).exists():
            raise serializer.ValidationError("Task with this title already exists in this project.")
        serializer.save()