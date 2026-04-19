from decimal import Decimal
from .models import ExamGrade

class GradingService:
    @staticmethod
    def calculate_grade(exam_result):
        """
        Calculates and assigns grade to an ExamResult instance based on marks.
        """
        if exam_result.is_absent:
            return None

        # Get full marks from schedule
        full_marks = exam_result.exam_schedule.full_marks
        if not full_marks or full_marks == 0:
            return None

        marks = exam_result.marks_obtained
        percentage = (marks / full_marks) * 100
        
        # Find matching grade
        # We filter by school and percentage range
        # percent_from <= percentage <= percent_upto
        grade = ExamGrade.objects.filter(
            school=exam_result.school,
            percent_from__lte=percentage,
            percent_upto__gte=percentage
        ).first()

        return grade

    @staticmethod
    def calculate_gpa(student, exam):
        """
        Calculates GPA for a student in a specific exam
        """
        from .models import ExamResult
        
        results = ExamResult.objects.filter(
            student=student,
            exam_schedule__exam=exam
        ).select_related('grade')
        
        if not results.exists():
            return Decimal('0.00')
            
        total_grade_points = Decimal('0.00')
        count = 0
        
        for result in results:
            if result.grade:
                total_grade_points += result.grade.grade_point
                count += 1
                
        if count == 0:
            return Decimal('0.00')
            
        return round(total_grade_points / count, 2)
