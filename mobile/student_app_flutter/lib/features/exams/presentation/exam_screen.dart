
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/exam_cubit.dart';
import '../data/models/exam.dart';
import '../../../core/constants/app_colors.dart';

class ExamScreen extends StatefulWidget {
  const ExamScreen({super.key});

  @override
  State<ExamScreen> createState() => _ExamScreenState();
}

class _ExamScreenState extends State<ExamScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ExamCubit>().fetchExams();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exams & Results', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: BlocBuilder<ExamCubit, ExamState>(
        builder: (context, state) {
          if (state is ExamLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is ExamError) {
            return Center(child: Text(state.message));
          } else if (state is ExamLoaded) {
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.exams.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final exam = state.exams[index];
                return _ExamItem(exam: exam);
              },
            );
          } else if (state is ReportCardLoaded) {
            return _ReportCardView(reportCard: state.reportCard);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _ExamItem extends StatelessWidget {
  final Exam exam;

  const _ExamItem({required this.exam});

  @override
  Widget build(BuildContext context) {
    final statusColor = exam.status == 'COMPLETED' ? Colors.green : (exam.status == 'ONGOING' ? Colors.orange : Colors.blue);

    return InkWell(
      onTap: exam.status == 'COMPLETED' 
          ? () => context.read<ExamCubit>().fetchReportCard(exam.id)
          : null,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.assignment_outlined, color: statusColor),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    exam.title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    '${exam.startDate} - ${exam.endDate}',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    exam.status,
                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
                  ),
                ),
                if (exam.status == 'COMPLETED')
                  const Text(
                    'View Result →',
                    style: TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ReportCardView extends StatelessWidget {
  final ReportCard reportCard;

  const _ReportCardView({required this.reportCard});

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        context.read<ExamCubit>().fetchExams();
        return false;
      },
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(24),
              ),
              child: Column(
                children: [
                  Text(
                    reportCard.examTitle,
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${reportCard.totalPercentage.toStringAsFixed(1)}%',
                    style: const TextStyle(color: Colors.white, fontSize: 48, fontWeight: FontWeight.black),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _StatTile(label: 'Grade', value: reportCard.overallGrade),
                      const SizedBox(width: 32),
                      _StatTile(label: 'Status', value: reportCard.resultStatus),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Subject-wise Performance',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: reportCard.results.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final result = reportCard.results[index];
                return _ResultItem(result: result);
              },
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.read<ExamCubit>().fetchExams(),
              child: const Text('Back to Exams'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  final String label;
  final String value;

  const _StatTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
      ],
    );
  }
}

class _ResultItem extends StatelessWidget {
  final ExamResult result;

  const _ResultItem({required this.result});

  @override
  Widget build(BuildContext context) {
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
              Text(result.subjectName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text('Grade: ${result.grade}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
            ],
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: result.marksObtained / result.maxMarks,
            backgroundColor: AppColors.gray100,
            color: AppColors.primary,
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Marks: ${result.marksObtained} / ${result.maxMarks}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              if (result.remarks.isNotEmpty)
                Text(result.remarks, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontStyle: FontStyle.italic)),
            ],
          ),
        ],
      ),
    );
  }
}
