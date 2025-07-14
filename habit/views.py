from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Habit, HabitRecord
from .serializers import HabitSerializer, HabitRecordSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date,timedelta
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from .utils import streak
from rest_framework import status



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
    
    #supporter
    def streak(self,habit):
  
        today = date.today()
        streak = 0

        #check backward day by day 
        today_record = HabitRecord.objects.filter(habit=habit, date=today).first()
        day = today if today_record and today_record.is_completed else today - timedelta(days=1)
        while True:
            record = HabitRecord.objects.filter(habit=habit, date=day).first()
            if not record or not record.is_completed:
                break
            streak += 1
            day -= timedelta(days=1)
        return streak
    
    @action(detail=False, methods=['get'], url_path='records-summary')
    def records_summary(self, request):
        habits = self.get_queryset()
        summary = []


        for habit in habits:
            records = HabitRecord.objects.filter(habit=habit)
            record_dict = {
                r.date.isoformat(): r.is_completed for r in records
            }
            streak = self.streak(habit)

            #calculate the consistency
            today = date.today()

            records_completed = HabitRecord.objects.filter(habit=habit, is_completed=True).count()
            if habit.frequency == 'daily':
                total = (today - habit.created_at).days + 1
            elif habit.frequency == 'weekly':
                total = ((today - habit.created_at).days // 7) + 1
            elif habit.frequency == 'monthly':
                total = (today.year - habit.created_at.year) * 12 + (today.month - habit.created_at.month) + 1
            else:
                total = 0

            consistency = records_completed/total if total > 0 else 0
            summary.append({
                "id": habit.id,
                "name": habit.name,
                "records": record_dict,
                "streak": streak,
                "consistency": consistency
            })

        return Response(summary)
    
    @action(detail=False, methods=['get'], url_path='habit-statistic')
    def habit_statistics(self,request):
        habits = self.get_queryset()
        stats = {
        'total_habits': Habit.objects.filter(user=self.request.user).count(),
        'daily': {'number_habits': 0, 'completed': 0, 'total': 0, 'percentage': 0},
        'weekly': {'number_habits': 0,'completed': 0, 'total': 0, 'percentage': 0},
        'monthly': {'number_habits': 0,'completed': 0, 'total': 0, 'percentage': 0},
    }
        today = date.today()

        for habit in habits:
            records_completed = HabitRecord.objects.filter(habit=habit, is_completed=True).count()

            if habit.frequency == 'daily':
                total = (today - habit.created_at).days + 1
            elif habit.frequency == 'weekly':
                total = ((today - habit.created_at).days // 7) + 1
            elif habit.frequency == 'monthly':
                total = (today.year - habit.created_at.year) * 12 + (today.month - habit.created_at.month) + 1
            else:
                total = 0

            stats[habit.frequency]['total'] += total
            stats[habit.frequency]['completed'] += records_completed
        for freq in ['daily', 'weekly', 'monthly']:
            freq_total = stats[freq]['total']
            freq_completed = stats[freq]['completed']
            stats[freq]['percentage'] = round(freq_completed / freq_total * 100, 2) if freq_total > 0 else 0
            stats[freq]['number_habits'] = Habit.objects.filter(user=self.request.user,frequency=freq).count()
            # stats[habit.frequency]['percentage'] = round(records_completed/total,2)*100 if total > 0 else 0
        return Response(stats)

    
    @action(detail=False, methods=['get'], url_path='frequency-choices')
    def frequency_choices(self, request):
        return Response(self.serializer_class.Meta.model.FREQUENCY_CHOICES)


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
        is_completed = self.request.data.get('is_completed', True)

        if habit.user != self.request.user:
            raise PermissionDenied("You cannot add record to a habit that is not yours.")
        
        if not habit or not date:
            return Response({"detail": "habit and date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            record = HabitRecord.objects.get(habit_id=habit, date=date)
            if record.habit.user != self.request.user:
                raise PermissionDenied("This record is not yours.")
            # Update existing
            record.is_completed = is_completed
            record.save()
            serializer = HabitRecordSerializer(record)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except HabitRecord.DoesNotExist:
            # Create new
            serializer = HabitRecordSerializer(data=self.request.data)
            serializer.is_valid(raise_exception=True)
            habit_obj = serializer.validated_data['habit']
            if habit_obj.user != self.request.user:
                raise PermissionDenied("You cannot add record to a habit that is not yours.")
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

