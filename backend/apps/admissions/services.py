from django.db import transaction
from django.utils import timezone
from apps.accounts.models import User
from apps.students.models import Student
from apps.schools.models import SchoolSettings
from apps.core.utils import generate_next_id
from apps.fees.models import FeeMaster, FeeAllocation

class AdmissionService:
    @staticmethod
    def handle_admission_fee(application):
        """Creates or updates fee allocation for an admission application."""
        # Look for Admission Fee for this specific class
        admission_fee_master = FeeMaster.objects.filter(
            school=application.school,
            target_class=application.target_class,
            fee_type__name__icontains='Admission'
        ).first()
        
        # Fallback to Global Admission Fee if class-specific not found
        if not admission_fee_master:
            admission_fee_master = FeeMaster.objects.filter(
                school=application.school,
                target_class__isnull=True,
                fee_type__name__icontains='Admission'
            ).first()
            
        if admission_fee_master:
            allocation, created = FeeAllocation.objects.get_or_create(
                school=application.school,
                application=application,
                fee_master=admission_fee_master,
                defaults={
                    'amount': admission_fee_master.amount,
                    'status': 'PAID' if application.application_fee_paid else 'UNPAID',
                    'paid_amount': admission_fee_master.amount if application.application_fee_paid else 0
                }
            )
            if not created:
                # Sync payment status if changed
                if application.application_fee_paid and allocation.status != 'PAID':
                    allocation.status = 'PAID'
                    allocation.paid_amount = allocation.amount
                    allocation.save()
                elif not application.application_fee_paid and allocation.status == 'PAID':
                    allocation.status = 'UNPAID'
                    allocation.paid_amount = 0
                    allocation.save()
            return allocation
        return None

    @staticmethod
    def get_next_roll_number(school, target_class):
        """Calculates the next available roll number for a class."""
        max_roll = 0
        existing_rolls = Student.objects.filter(
            school=school,
            current_class=target_class
        ).values_list('roll_number', flat=True)
        
        for roll in existing_rolls:
            if roll and roll.isdigit():
                max_roll = max(max_roll, int(roll))
        
        return str(max_roll + 1)

    @staticmethod
    def ensure_student_record(application):
        """Creates or updates Student and User record for an ADMITTED application."""
        if application.status != 'ADMITTED':
            return None
            
        username = f"app_{application.application_number.lower()}"
        user = User.objects.filter(username=username).first()
        
        if not user:
            school_settings = SchoolSettings.objects.filter(school=application.school).first()
            prefix = school_settings.student_id_prefix if school_settings else 'STU'
            length = school_settings.id_number_length if school_settings else 6
            
            admission_number = generate_next_id(Student, 'admission_number', prefix, length)
            email = f"{username}@school.local"
            
            user = User.objects.create(
                username=username,
                email=email,
                first_name=application.first_name,
                last_name=application.last_name,
                role='STUDENT',
                school=application.school,
                gender=application.gender,
                date_of_birth=application.date_of_birth,
            )
            user.set_password('Welcome@123')
            user.save()
            
        # Ensure student profile exists for the user
        student = Student.objects.filter(user=user).first()
        
        # Calculate next roll number if not set
        next_roll = None
        if not student or not student.roll_number:
            next_roll = AdmissionService.get_next_roll_number(
                application.school, 
                application.target_class
            )

        if not student:
            school_settings = SchoolSettings.objects.filter(school=application.school).first()
            prefix = school_settings.student_id_prefix if school_settings else 'STU'
            length = school_settings.id_number_length if school_settings else 6
            admission_number = generate_next_id(Student, 'admission_number', prefix, length)
            
            student = Student.objects.create(
                user=user,
                school=application.school,
                admission_number=admission_number,
                roll_number=next_roll,
                current_class=application.target_class,
                admission_date=application.admission_date or timezone.now().date(),
                middle_name=application.middle_name,
                place_of_birth=application.place_of_birth,
                mother_tongue=application.mother_tongue,
                nationality=application.nationality,
                religion=application.religion,
                caste=application.caste,
                blood_group=application.blood_group,
                father_name=application.father_name,
                father_phone=application.father_phone,
                father_email=application.father_email,
                mother_name=application.mother_name,
                mother_phone=application.mother_phone,
                mother_email=application.mother_email,
                address=application.address,
                city=application.city,
                state=application.state,
                postal_code=application.postal_code,
                status='ACTIVE',
                photo=application.photo,
            )
        else:
            # Update existing student record with application details
            student.current_class = application.target_class
            if not student.roll_number:
                student.roll_number = next_roll
            
            # Sync User fields
            user.first_name = application.first_name
            user.last_name = application.last_name
            user.gender = application.gender
            user.date_of_birth = application.date_of_birth
            user.save()
            
            # Sync other fields from application
            student.middle_name = application.middle_name
            student.father_name = application.father_name
            student.mother_name = application.mother_name
            student.father_phone = application.father_phone
            student.mother_phone = application.mother_phone
            student.address = application.address
            student.city = application.city
            student.state = application.state
            student.photo = application.photo
            student.save()
            
        # Link application fee to the student record if not already linked
        FeeAllocation.objects.filter(application=application).update(student=student)
        return student
