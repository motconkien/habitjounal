from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class ProjectEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project_title = models.CharField(max_length=255)
    description = models.CharField(max_length=255,null=True)
    date = models.DateField(auto_now_add=True)    

    def __str__(self):
        return f"{self.project_title} - {self.date} - {self.user.username}"

class TaskEntry(models.Model):
    project = models.ForeignKey(ProjectEntry,on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    task_title = models.CharField(max_length=255)
    task_content = models.TextField()
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.project.project_title} - {self.date} - {self.task_title}"