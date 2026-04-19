from django.db import models
from apps.core.models import BaseModel

class Period(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='periods')
    name = models.CharField(max_length=50)  # e.g., "Period 1", "Morning Assembly"
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_break = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'periods'
        ordering = ['start_time']

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"

class TimetableEntry(BaseModel):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='timetable_entries')
    target_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='timetable_entries')
    section = models.ForeignKey('classes.Section', on_delete=models.CASCADE, related_name='timetable_entries')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    period = models.ForeignKey(Period, on_delete=models.CASCADE)
    
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, null=True, blank=True)
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.SET_NULL, null=True, blank=True)
    room_number = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'timetable_entries'
        unique_together = ['school', 'target_class', 'section', 'day_of_week', 'period']
        ordering = ['day_of_week', 'period__start_time']

    def __str__(self):
        return f"{self.get_day_of_week_display()} - {self.period.name} - {self.subject.name if self.subject else 'Free'}"
