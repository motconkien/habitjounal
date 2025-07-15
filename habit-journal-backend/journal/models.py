from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class JournalEntry(models.Model):
    MOOD_CHOICES = [
        ("happy", "Happy 😊"),
        ("sad", "Sad 😢"),
        ("angry", "Angry 😡"),
        ("anxious", "Anxious 😰"),
        ("fearful", "Fearful 😨"),
        ("productive", "Productive 🚀"),
        ("tired", "Tired 😴"),
        ("bored", "Bored 😐"),
        ("fun", "Fun 😄"),
        ("calm", "Calm 🧘"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    mood = models.CharField(choices=MOOD_CHOICES, default='happy')

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.title}"