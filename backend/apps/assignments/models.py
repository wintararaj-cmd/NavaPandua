from django.db import models
from apps.core.models import BaseModel

class Assignment(BaseModel):
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='assignments')
    teacher = models.ForeignKey('teachers.Teacher', on_delete=models.CASCADE, related_name='assignments')
    target_class = models.ForeignKey('classes.Class', on_delete=models.CASCADE, related_name='assignments')
    section = models.ForeignKey('classes.Section', on_delete=models.CASCADE, related_name='assignments', null=True, blank=True)
    subject = models.ForeignKey('subjects.Subject', on_delete=models.CASCADE, related_name='assignments')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    attachment = models.FileField(upload_to='assignments/questions/', blank=True, null=True)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2, default=100)

    class Meta:
        db_table = 'assignments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.subject.name}"

class AssignmentSubmission(BaseModel):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='submissions')
    submitted_file = models.FileField(upload_to='assignments/submissions/')
    remarks = models.TextField(blank=True)
    
    # Grading
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    teacher_feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assignment_submissions'
        unique_together = ['assignment', 'student']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.assignment.title}"
