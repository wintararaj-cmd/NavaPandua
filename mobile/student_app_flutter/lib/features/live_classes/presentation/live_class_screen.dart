
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../cubit/live_class_cubit.dart';
import '../data/models/live_class.dart';
import '../../../core/constants/app_colors.dart';

class LiveClassScreen extends StatefulWidget {
  const LiveClassScreen({super.key});

  @override
  State<LiveClassScreen> createState() => _LiveClassScreenState();
}

class _LiveClassScreenState extends State<LiveClassScreen> {
  @override
  void initState() {
    super.initState();
    context.read<LiveClassCubit>().fetchLiveClasses();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Live Classes', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: BlocBuilder<LiveClassCubit, LiveClassState>(
        builder: (context, state) {
          if (state is LiveClassLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is LiveClassError) {
            return Center(child: Text(state.message));
          } else if (state is LiveClassLoaded) {
            if (state.liveClasses.isEmpty) {
              return const Center(child: Text('No live classes scheduled.'));
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.liveClasses.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final liveClass = state.liveClasses[index];
                return _LiveClassItem(liveClass: liveClass);
              },
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _LiveClassItem extends StatelessWidget {
  final LiveClass liveClass;

  const _LiveClassItem({required this.liveClass});

  @override
  Widget build(BuildContext context) {
    final isLive = liveClass.status == 'LIVE';
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isLive ? AppColors.primary : AppColors.border, width: isLive ? 2 : 1),
        boxShadow: isLive ? [
          BoxShadow(color: AppColors.primary.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
        ] : [],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isLive ? Colors.red : AppColors.gray100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    if (isLive) ...[
                      const Icon(Icons.circle, color: Colors.white, size: 8),
                      const SizedBox(width: 4),
                    ],
                    Text(
                      liveClass.status,
                      style: TextStyle(
                        color: isLive ? Colors.white : AppColors.textSecondary,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '${liveClass.startTime} - ${liveClass.endTime}',
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            liveClass.title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 4),
          Text(
            '${liveClass.subjectName} • ${liveClass.teacherName}',
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isLive ? () {
                // TODO: launch(liveClass.meetingUrl);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Joining classroom...')),
                );
              } : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: isLive ? AppColors.primary : AppColors.gray200,
                foregroundColor: isLive ? Colors.white : AppColors.textSecondary,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                isLive ? 'JOIN CLASS NOW' : 'NOT STARTED',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
