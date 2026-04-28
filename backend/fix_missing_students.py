import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.students.models import Student
from apps.admissions.models import AdmissionApplication
from django.utils import timezone
from django.db import transaction

admitted_apps = AdmissionApplication.objects.filter(status='ADMITTED')

for application in admitted_apps:
    student_exists = Student.objects.filter(admission_number=application.application_number).exists()
    if not student_exists:
        print(f"Creating student for application: {application.application_number} ({application.first_name} {application.last_name})")
        with transaction.atomic():
            username = f"app_{application.application_number.lower()}"
            email = f"{username}@school.local"
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': application.first_name,
                    'last_name': application.last_name,
                    'role': 'STUDENT',
                    'school': application.school,
                    'gender': application.gender,
                    'date_of_birth': application.date_of_birth,
                }
            )
            if created:
                user.set_password('Welcome@123')
                user.save()
            
            Student.objects.create(
                user=user,
                school=application.school,
                admission_number=application.application_number,
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
                father_qualification=application.father_qualification,
                father_college=application.father_college,
                father_occupation=application.father_occupation,
                father_occupation_type=application.father_occupation_type,
                father_organisation=application.father_organisation,
                father_designation=application.father_designation,
                father_income=application.father_income,
                father_office_address=application.father_office_address,
                
                mother_name=application.mother_name,
                mother_phone=application.mother_phone,
                mother_email=application.mother_email,
                mother_qualification=application.mother_qualification,
                mother_college=application.mother_college,
                mother_associated_with=application.mother_associated_with,
                
                address=application.address,
                city=application.city,
                state=application.state,
                postal_code=application.postal_code,
                
                previous_school_name=application.previous_school_name,
                previous_school_address=application.previous_school_address,
                previous_school_city=application.previous_school_city,
                previous_school_state=application.previous_school_state,
                previous_school_country=application.previous_school_country,
                previous_school_pincode=application.previous_school_pincode,
                previous_school_principle_name=application.previous_school_principle_name,
                previous_school_board=application.previous_school_board,
                previous_school_class=application.previous_school_class,
                previous_school_medium=application.previous_school_medium,
                
                is_single_parent=application.is_single_parent,
                legal_guardian=application.legal_guardian,
                is_guardian_father=application.is_guardian_father,
                is_guardian_mother=application.is_guardian_mother,
                
                category=application.category,
                staff_name=application.staff_name,
                staff_id=application.staff_id,
                
                primary_contact_person=application.primary_contact_person,
                primary_contact_phone=application.primary_contact_phone,
                relationship_with_student=application.relationship_with_student,
                
                second_language=application.second_language,
                third_language=application.third_language,
                academic_performance=application.academic_performance,
                
                status='ACTIVE',
                photo=application.photo,
                father_photo=application.father_photo,
                mother_photo=application.mother_photo,
            )
            print("Successfully created student.")
    else:
        print(f"Student already exists for application: {application.application_number}")
