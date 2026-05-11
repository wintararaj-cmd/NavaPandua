from django.db.models import Max
import re

def generate_next_id(model_class, field_name, prefix, length):
    """
    Generate the next sequential ID for a given model and field.
    Format: [PREFIX][SEQUENTIAL_NUMBER]
    The sequential number is zero-padded to match 'length'.
    """
    # Get all IDs with that prefix
    queryset = model_class.objects.filter(**{f"{field_name}__startswith": prefix}).values_list(field_name, flat=True)
    
    max_num = 0
    for id_str in queryset:
        if id_str and id_str.startswith(prefix):
            numeric_part = id_str[len(prefix):]
            try:
                num = int(numeric_part)
                if num > max_num:
                    max_num = num
            except (ValueError, TypeError):
                continue
                
    next_num = max_num + 1
            
    # Format the next ID
    # Example: STU + 1 padded to 6 -> STU000001
    return f"{prefix}{str(next_num).zfill(length)}"
