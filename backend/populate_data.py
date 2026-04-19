
import os
import django
import random
from datetime import date, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.organizations.models import Organization
from apps.schools.models import School
from apps.classes.models import Class, Section
from apps.students.models import Student
from apps.teachers.models import Teacher

User = get_user_model()

def create_sample_data():
    print("Starting data population...")

    # 1. Create Organization
    org, created = Organization.objects.get_or_create(
        name="Global Education Systems",
        defaults={
            "subdomain": "globaledu",
            "email": "contact@globaledu.com",
            "phone": "+1-555-0123",
            "address_line1": "123 Education Blvd",
            "city": "New York",
            "state": "NY",
            "postal_code": "10001",
            "country": "USA",
            "owner": User.objects.filter(is_superuser=True).first()
        }
    )
    if created:
        print(f"Created Organization: {org.name}")
    else:
        print(f"Organization already exists: {org.name}")

    # 2. Create School
    # Check School model fields first
    school, created = School.objects.get_or_create(
        name="Springfield High School",
        organization=org,
        defaults={
            "code": "SPH001",
            "email": "info@springfield.edu",
            "phone": "+1-555-0199",
            "address_line1": "742 Evergreen Terrace",
            "city": "Springfield",
            "state": "IL",
            "postal_code": "62704",
            "country": "USA",
            "is_active": True
        }
    )
    if created:
        print(f"Created School: {school.name}")
    else:
        print(f"School already exists: {school.name}")

    # 3. Create Teachers
    teachers = []
    departments = ['Mathematics', 'Science', 'English', 'History', 'Physics']
    
    for i in range(5):
        email = f"teacher{i+1}@springfield.edu"
        user, created = User.objects.get_or_create(
            email=email,
            username=f"teacher{i+1}",
            defaults={
                "role": User.UserRole.TEACHER,
                "first_name": f"Teacher",
                "last_name": f"{i+1}",
                "is_active": True,
                "organization": org,
                "school": school
            }
        )
        if created:
            user.set_password("teacher123")
            user.save()
            
            # Create Teacher Profile
            teacher, t_created = Teacher.objects.get_or_create(
                user=user,
                defaults={
                    "school": school,
                    "department": departments[i],
                    "designation": "Senior Teacher",
                    "employee_id": f"EMP{1000+i}",
                    "qualification": "M.Ed",
                    "joining_date": date.today() - timedelta(days=random.randint(100, 1000))
                }
            )
            teachers.append(teacher)
            print(f"Created Teacher: {user.email}")
        else:
             # Try to get existing teacher profile
             try:
                 teacher = Teacher.objects.get(user=user)
                 teachers.append(teacher)
             except Teacher.DoesNotExist:
                 pass

    # 4. Create Classes and Sections
    classes = []
    standards = ['9', '10', '11', '12']
    sections = ['A', 'B']
    
    for std in standards:
        cls_obj, created = Class.objects.get_or_create(
            name=f"Class {std}",
            school=school,
            defaults={
                "code": f"C{std}",
                "description": f"Standard {std}"
            }
        )
        classes.append(cls_obj)
        
        for sec in sections:
            section, s_created = Section.objects.get_or_create(
                name=sec,
                class_group=cls_obj,
                defaults={
                    "room_number": f"{std}-{sec}",
                    "capacity": 40
                }
            )
            # Assign a random teacher as class teacher if available
            if teachers and s_created:
                section.class_teacher = random.choice(teachers)
                section.save()
                
    print(f"Created {len(classes)} Classes with {len(standards) * len(sections)} Sections")

    # 5. Create Students
    if not classes:
        print("❌ No classes found, skipping student creation")
        return

    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"]

    for i in range(20):
        first = random.choice(first_names)
        last = random.choice(last_names)
        email = f"student{i+1}@springfield.edu"
        
        user, created = User.objects.get_or_create(
            email=email,
            username=f"student{i+1}",
            defaults={
                "role": User.UserRole.STUDENT,
                "first_name": first,
                "last_name": last,
                "is_active": True,
                "organization": org,
                "school": school
            }
        )
        
        if created:
            user.set_password("student123")
            user.save()
            
            # Assign to a random class/section
            target_class = random.choice(classes)
            target_section = random.choice(target_class.sections.all())
            
            student, s_created = Student.objects.get_or_create(
                user=user,
                defaults={
                    "school": school,
                    "admission_number": f"ADM{2024000+i}",
                    "current_class": target_class,
                    "section": target_section,
                    "roll_number": f"{target_section.name}{i+1}",
                    "father_name": f"Mr. {last}",
                    "mother_name": f"Mrs. {last}",
                    "admission_date": date.today()
                }
            )
            print(f"Created Student: {first} {last} in {target_class.name}-{target_section.name}")

    print("\nData population completed successfully!")
    print("\nSummary:")
    print(f"- Organization: {Organization.objects.count()}")
    print(f"- Schools: {School.objects.count()}")
    print(f"- Teachers: {Teacher.objects.count()}")
    print(f"- Classes: {Class.objects.count()}")
    print(f"- Students: {Student.objects.count()}")

if __name__ == "__main__":
    create_sample_data()
