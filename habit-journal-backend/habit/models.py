from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Habit(models.Model):
    #save database: daily and show on ui: Daily => tuple
    FREQUENCY_CHOICES = [
        ('daily','Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly')
    ]
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateField(auto_now_add=True)
    frequency = models.CharField(max_length=20,choices=FREQUENCY_CHOICES,default='daily')

    def __str__(self):
        return f"{self.name} ({self.frequency})"
    
class HabitRecord(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE)
    date = models.DateField()
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('habit','date')

    def __str__(self):
        return f"{self.habit} ({self.date}) - {self.is_completed}"