import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.fees.models import FeeAllocation, FeePayment
from django.db.models import Sum
from django.db import transaction

def fix_fee_balances():
    print("Fixing Fee Allocation balances...")
    allocations = FeeAllocation.objects.all()
    fixed_count = 0
    
    with transaction.atomic():
        for alloc in allocations:
            # Calculate actual paid amount from payment records
            actual_paid = FeePayment.objects.filter(allocation=alloc).aggregate(Sum('amount_paid'))['amount_paid__sum'] or 0
            
            if alloc.paid_amount != actual_paid:
                print(f"Correcting {alloc}: {alloc.paid_amount} -> {actual_paid}")
                alloc.paid_amount = actual_paid
                
                # Update status
                if alloc.paid_amount >= alloc.amount:
                    alloc.status = 'PAID'
                elif alloc.paid_amount > 0:
                    alloc.status = 'PARTIAL'
                else:
                    alloc.status = 'UNPAID'
                
                alloc.save()
                fixed_count += 1
                
    print(f"Successfully fixed {fixed_count} allocations.")

if __name__ == "__main__":
    fix_fee_balances()
