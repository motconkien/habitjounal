# Generated by Django 5.2.4 on 2025-07-13 05:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('journal', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='journalentry',
            name='mood',
            field=models.CharField(choices=[('happy', 'Happy 😊'), ('sad', 'Sad 😢'), ('angry', 'Angry 😡'), ('anxious', 'Anxious 😰'), ('fearful', 'Fearful 😨'), ('productive', 'Productive 🚀'), ('tired', 'Tired 😴'), ('bored', 'Bored 😐'), ('fun', 'Fun 😄'), ('calm', 'Calm 🧘')], default='happy'),
        ),
    ]
