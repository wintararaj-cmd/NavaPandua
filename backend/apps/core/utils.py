from django.db.models import Max
import re

def generate_next_id(model_class, field_name, prefix, length):
    """
    Generate the next sequential ID for a given model and field.
    Format: [PREFIX][SEQUENTIAL_NUMBER]
    The sequential number is zero-padded to match 'length'.
    """
    # Get the max current ID with that prefix
    # Note: We filter by prefix to avoid mixing different ID formats if they exist
    queryset = model_class.objects.filter(**{f"{field_name}__startswith": prefix})
    max_id_obj = queryset.aggregate(Max(field_name))
    max_id = max_id_obj.get(f"{field_name}__max")
    
    if not max_id:
        # Start from 1 if no records exist
        next_num = 1
    else:
        # Extract the numeric part from the end of the string
        # This handles cases like STU000001 -> 1
        numeric_part = max_id[len(prefix):]
        try:
            next_num = int(numeric_part) + 1
        except (ValueError, TypeError):
            # Fallback if the format is unexpected
            next_num = 1
            
    # Format the next ID
    # Example: STU + 1 padded to 6 -> STU000001
    return f"{prefix}{str(next_num).zfill(length)}"
