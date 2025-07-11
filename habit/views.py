from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Habit, HabitRecord
from .serializers import HabitSerializer, HabitRecordSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date,timedelta
from rest_framework.exceptions import PermissionDenied


# Create your views here.
class HabitViewset(viewsets.ModelViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer
    permission_classes = [permissions.IsAuthenticated]

    #ensures users only see their own entries
    def get_queryset(self):
        if getattr(self,'swagger_fake_view',False):
            return Habit.objects.none()
        return self.queryset.filter(user=self.request.user)
    
    #assigns the user automatically (so they don't send it)
    def perform_create(self, serializer):
        if getattr(self, 'swagger_fake_view', False):
            return
        if not self.request.user.is_authenticated:
            raise PermissionDenied("You have loggin to create Habit.")
        return serializer.save(user=self.request.user)
    
    #add streak calculation 
    @action(detail=True, methods=['GET'])
    def streak(self,request, pk = None):
        habit = self.get_object() #automatically take habit by pk
        today = date.today()
        streak = 0

        #check backward day by day 
        day = today
        while True:
            try:
                record = HabitRecord.objects.get(habit=habit,date=day)
                if record.is_completed:
                    streak +=1 
                    day -= timedelta(days=1)
                else:
                    break
            except Exception as e:
                break
        return Response({"habit": habit.name, "streak": streak})


class HabitRecordViewSet(viewsets.ModelViewSet):
    queryset = HabitRecord.objects.all()
    serializer_class = HabitRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self,'swagger_fake_view', False):
            return HabitRecord.objects.none()
        user = self.request.user
        queryset = HabitRecord.objects.filter(habit__user = user)
        habit_id = self.request.query_params.get('habit')
        if habit_id:
            queryset = queryset.filter(habit__id=habit_id)
        return queryset
    
    def perform_create(self, serializer):
        if getattr(self, 'swagger_fake_view', False):
            return
        habit = serializer.validated_data['habit']
        date = serializer.validated_data['date']

        if habit.user != self.request.user:
            raise PermissionDenied("You cannot add record to a habit that is not yours.")

        if HabitRecord.objects.filter(habit=habit, date=date).exists():
            raise serializer.ValidationError("This habit has already been marked for this date.")
        serializer.save()