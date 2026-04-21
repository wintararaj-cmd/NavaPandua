from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('classes', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='class',
            name='class_type',
            field=models.CharField(
                choices=[('CLASS', 'Class'), ('COURSE', 'Course')],
                default='CLASS',
                help_text='Whether this is a traditional class (Grade) or a course',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='class',
            name='duration_weeks',
            field=models.IntegerField(
                blank=True,
                null=True,
                help_text='Duration in weeks (for courses only)',
            ),
        ),
        migrations.AddField(
            model_name='class',
            name='course_fee',
            field=models.DecimalField(
                blank=True,
                null=True,
                decimal_places=2,
                max_digits=10,
                help_text='Base course fee (for courses only)',
            ),
        ),
    ]
