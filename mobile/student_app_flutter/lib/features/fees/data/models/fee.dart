
class FeeAllocation {
  final String id;
  final String feeTypeName;
  final double amount;
  final double paidAmount;
  final double remainingAmount;
  final String dueDate;
  final String status; // PAID, PARTIAL, UNPAID

  FeeAllocation({
    required this.id,
    required this.feeTypeName,
    required this.amount,
    required this.paidAmount,
    required this.remainingAmount,
    required this.dueDate,
    required this.status,
  });

  factory FeeAllocation.fromJson(Map<String, dynamic> json) {
    return FeeAllocation(
      id: json['id'] ?? '',
      feeTypeName: json['fee_type_name'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      paidAmount: (json['paid_amount'] ?? 0).toDouble(),
      remainingAmount: (json['remaining_amount'] ?? 0).toDouble(),
      dueDate: json['due_date'] ?? '',
      status: json['status'] ?? 'UNPAID',
    );
  }
}

class FeePayment {
  final String id;
  final double amountPaid;
  final String paymentDate;
  final String paymentMode;
  final String transactionId;

  FeePayment({
    required this.id,
    required this.amountPaid,
    required this.paymentDate,
    required this.paymentMode,
    required this.transactionId,
  });

  factory FeePayment.fromJson(Map<String, dynamic> json) {
    return FeePayment(
      id: json['id'] ?? '',
      amountPaid: (json['amount_paid'] ?? 0).toDouble(),
      paymentDate: json['payment_date'] ?? '',
      paymentMode: json['payment_mode'] ?? '',
      transactionId: json['transaction_id'] ?? '',
    );
  }
}

class FeeSummary {
  final double totalExpected;
  final double totalCollected;
  final double totalPending;

  FeeSummary({
    required this.totalExpected,
    required this.totalCollected,
    required this.totalPending,
  });

  factory FeeSummary.fromJson(Map<String, dynamic> json) {
    return FeeSummary(
      totalExpected: (json['total_expected'] ?? 0).toDouble(),
      totalCollected: (json['total_collected'] ?? 0).toDouble(),
      totalPending: (json['total_pending'] ?? 0).toDouble(),
    );
  }
}
