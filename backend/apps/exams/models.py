
from django.db import models
from apps.core.models import BaseModel

class ExamGrade(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='exam_grades')
    name = models.CharField(max_length=10) # A+, A, B, etc.
    percent_from = models.DecimalField(max_digits=5, decimal_places=2)
    percent_upto = models.DecimalField(max_digits=5, decimal_places=2)
    grade_point = models.DecimalField(max_digits=4, decimal_places=2, default=0)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.percent_from}% - {self.percent_upto}%)"

    class Meta:
        db_table = 'exam_grades'

class Exam(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='exams')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'exams'

class ExamSchedule(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='exam_schedules')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    duration_minutes = models.IntegerField(default=180)
    room_number = models.CharField(max_length=50, blank=True)
    full_marks = models.DecimalField(max_digits=5, decimal_places=2)
    passing_marks = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.exam.name} - {self.subject.name}"

    class Meta:
        db_table = 'exam_schedules'

class ExamResult(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='exam_results')
    exam_schedule = models.ForeignKey(ExamSchedule, on_delete=models.CASCADE, related_name='results')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='exam_results')
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.ForeignKey(ExamGrade, on_delete=models.SET_NULL, null=True, blank=True)
    remarks = models.TextField(blank=True)
    is_absent = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.student.user.first_name} - {self.exam_schedule.subject.name}: {self.marks_obtained}"

    class Meta:
        db_table = 'exam_results'
        unique_together = ('exam_schedule', 'student')
