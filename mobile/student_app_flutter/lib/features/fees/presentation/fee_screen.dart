
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../cubit/fee_cubit.dart';
import '../data/models/fee.dart';
import '../../../core/constants/app_colors.dart';

class FeeScreen extends StatefulWidget {
  const FeeScreen({super.key});

  @override
  State<FeeScreen> createState() => _FeeScreenState();
}

class _FeeScreenState extends State<FeeScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<FeeCubit>().fetchFees();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Fees & Payments', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          tabs: const [
            Tab(text: 'Pending Dues'),
            Tab(text: 'Payment History'),
          ],
        ),
      ),
      body: BlocBuilder<FeeCubit, FeeState>(
        builder: (context, state) {
          if (state is FeeLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is FeeError) {
            return Center(child: Text(state.message));
          } else if (state is FeeLoaded) {
            return TabBarView(
              controller: _tabController,
              children: [
                _DuesTab(allocations: state.allocations, summary: state.summary),
                _HistoryTab(history: state.history),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _DuesTab extends StatelessWidget {
  final List<FeeAllocation> allocations;
  final FeeSummary summary;

  const _DuesTab({required this.allocations, required this.summary});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () => context.read<FeeCubit>().fetchFees(),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            _FeeSummaryCard(summary: summary),
            const SizedBox(height: 24),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: allocations.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final fee = allocations[index];
                return _FeeAllocationItem(fee: fee);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _FeeSummaryCard extends StatelessWidget {
  final FeeSummary summary;

  const _FeeSummaryCard({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Total Pending Balance',
            style: TextStyle(color: Colors.white60, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            '₹${summary.totalPending.toStringAsFixed(0)}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 36,
              fontWeight: FontWeight.black,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _MiniStat(label: 'Expected', value: '₹${summary.totalExpected.toInt()}'),
              _MiniStat(label: 'Collected', value: '₹${summary.totalCollected.toInt()}'),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String label;
  final String value;

  const _MiniStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white38, fontSize: 10, fontWeight: FontWeight.bold, uppercase: true)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _FeeAllocationItem extends StatelessWidget {
  final FeeAllocation fee;

  const _FeeAllocationItem({required this.fee});

  @override
  Widget build(BuildContext context) {
    final statusColor = fee.status == 'PAID' ? Colors.green : (fee.status == 'PARTIAL' ? Colors.orange : Colors.red);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fee.feeTypeName,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      'Due: ${fee.dueDate}',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  fee.status,
                  style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Amount', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  Text('₹${fee.amount}', style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Paid', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  Text('₹${fee.paidAmount}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('Remaining', style: TextStyle(color: AppColors.textSecondary, fontSize: 10)),
                  Text('₹${fee.remainingAmount}', style: const TextStyle(fontWeight: FontWeight.black, color: Colors.red, fontSize: 16)),
                ],
              ),
            ],
          ),
          if (fee.status != 'PAID') ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implement Razorpay integration
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Payment Gateway initializing...')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text('PAY NOW', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.2)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _HistoryTab extends StatelessWidget {
  final List<FeePayment> history;

  const _HistoryTab({required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Center(child: Text('No payment history found.'));
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: history.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final payment = history[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const CircleAvatar(
                backgroundColor: Color(0xFFECFDF5),
                child: Icon(Icons.check, color: Colors.green),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Payment Received',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      'Mode: ${payment.paymentMode} | ${payment.paymentDate}',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                    ),
                    Text(
                      'TXN: ${payment.transactionId}',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 10, fontStyle: FontStyle.italic),
                    ),
                  ],
                ),
              ),
              Text(
                '₹${payment.amountPaid}',
                style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.green),
              ),
            ],
          ),
        );
      },
    );
  }
}
