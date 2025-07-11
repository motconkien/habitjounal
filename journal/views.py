from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import JournalEntry
from .serializers import JournalEntrySerializer
from rest_framework.exceptions import PermissionDenied

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self,'swagger_fake_view', False):
            return JournalEntry.objects.none()
        return self.queryset.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        if getattr(self,'swagger_fake_view', False):
            return JournalEntry.objects.none()
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You have to log in to create journal")
        serializer.save(user=self.request.user)