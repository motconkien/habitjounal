from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import TaskEntry, ProjectEntry
from .serializers import TaskEntrySerializer, ProjectEntrySerializer
from rest_framework.exceptions import PermissionDenied

# Create your views here.
class ProjectEntryViewSet(viewsets.ModelViewSet):
    queryset = ProjectEntry.objects.all()
    serializer_class = ProjectEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    #ensures users only see their own entries
    def get_queryset(self):
        if getattr(self,'swagger_fake_view', False):
            return ProjectEntry.objects.none()
        return self.queryset.filter(user=self.request.user)
    
    #assigns the user automatically (so they don't send it)
    def perform_create(self, serializer):
        if getattr(self,'swagger_fake_view', False):
            return 
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You have to log in to create project")
        return serializer.save(user=self.request.user)

class TaskEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TaskEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self,'swagger_fake_view', False):
            return TaskEntry.objects.none()
        project_id = self.request.query_params.get('project')
        user = self.request.user
        queryset = TaskEntry.objects.filter(project__user = user)
        if project_id:
            queryset = queryset.filter(project__id=project_id)
        return queryset
    
    def perform_create(self, serializer):
        if getattr(self,'swagger_fake_view', False):
            return 
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You have to log in to create task")
        
        project = serializer.validated_data['project']
        title = serializer.validated_data['task_title']
        
        if project.user != self.request.user:
            raise PermissionDenied("You cannot add task to a project that is not yours.")

        if TaskEntry.objects.filter(project=project,task_title=title).exists():
            raise serializer.ValidationError("Task with this title already exists in this project.")
        serializer.save()