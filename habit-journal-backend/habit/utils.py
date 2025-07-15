# add streak calculation 
from datetime import timedelta,date
from .models import HabitRecord
def streak(habit):
  
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
    return streak