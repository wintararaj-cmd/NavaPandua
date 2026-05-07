
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubit/assignment_cubit.dart';
import '../data/models/assignment.dart';
import '../../../core/constants/app_colors.dart';
import '../../../features/auth/data/auth_repository.dart';
import '../data/assignment_repository.dart';

class AssignmentScreen extends StatefulWidget {
  const AssignmentScreen({super.key});

  @override
  State<AssignmentScreen> createState() => _AssignmentScreenState();
}

class _AssignmentScreenState extends State<AssignmentScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<AssignmentCubit>().fetchAssignments();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.read<AuthRepository>().getUser();
    final isTeacher = user?.role == 'TEACHER' || user?.role == 'SCHOOL_ADMIN' || user?.role == 'SUPER_ADMIN';

    if (isTeacher) {
      return const _TeacherAssignmentView();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Homework & Assignments', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: 'To-Do'),
            Tab(text: 'Submitted'),
          ],
        ),
      ),
      body: BlocBuilder<AssignmentCubit, AssignmentState>(
        builder: (context, state) {
          if (state is AssignmentLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is AssignmentError) {
            return Center(child: Text(state.message));
          } else if (state is AssignmentLoaded) {
            final pending = state.assignments.where((a) => a.status == 'PENDING').toList();
            final completed = state.assignments.where((a) => a.status != 'PENDING').toList();
            
            return TabBarView(
              controller: _tabController,
              children: [
                _AssignmentList(assignments: pending, isPending: true),
                _AssignmentList(assignments: completed, isPending: false),
              ],
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }
}

class _AssignmentList extends StatelessWidget {
  final List<Assignment> assignments;
  final bool isPending;

  const _AssignmentList({required this.assignments, required this.isPending});

  @override
  Widget build(BuildContext context) {
    if (assignments.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.assignment_turned_in_outlined, size: 64, color: AppColors.gray300),
            const SizedBox(height: 16),
            Text(
              isPending ? 'No pending assignments!' : 'No submissions yet.',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: assignments.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final assignment = assignments[index];
        return _AssignmentItem(assignment: assignment);
      },
    );
  }
}

class _AssignmentItem extends StatelessWidget {
  final Assignment assignment;

  const _AssignmentItem({required this.assignment});

  @override
  Widget build(BuildContext context) {
    final isOverdue = DateTime.parse(assignment.dueDate).isBefore(DateTime.now()) && assignment.status == 'PENDING';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isOverdue ? Colors.red.withOpacity(0.3) : AppColors.border),
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
                  color: AppColors.gray100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  assignment.subjectName,
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 10),
                ),
              ),
              Text(
                'Due: ${assignment.dueDate}',
                style: TextStyle(
                  color: isOverdue ? Colors.red : AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: isOverdue ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            assignment.title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            assignment.description,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.person_outline, size: 16, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text(assignment.teacherName, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
              if (assignment.status == 'PENDING')
                ElevatedButton(
                  onPressed: () => _showSubmitDialog(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  child: const Text('SUBMIT'),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: assignment.status == 'GRADED' ? Colors.green.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    assignment.status,
                    style: TextStyle(
                      color: assignment.status == 'GRADED' ? Colors.green : Colors.blue,
                      fontWeight: FontWeight.bold,
                      fontSize: 10,
                    ),
                  ),
                ),
            ],
          ),
          if (assignment.status == 'GRADED') ...[
            const Divider(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Grade Received:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(
                  '${assignment.marks?.toStringAsFixed(0)} Points',
                  style: const TextStyle(fontWeight: FontWeight.black, fontSize: 16, color: Colors.green),
                ),
              ],
            ),
            if (assignment.feedback != null)
              Padding(
                padding: const EdgeInsets.top(8.0),
                child: Text(
                  'Feedback: "${assignment.feedback}"',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, fontStyle: FontStyle.italic),
                ),
              ),
          ],
        ],
      ),
    );
  }

  void _showSubmitDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit Assignment'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Paste Drive Link or Submission URL',
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                context.read<AssignmentCubit>().submitAssignment(assignment.id, controller.text);
                Navigator.pop(context);
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}

class _TeacherAssignmentView extends StatelessWidget {
  const _TeacherAssignmentView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Assignment Management', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () => _showCreateAssignmentDialog(context),
          ),
        ],
      ),
      body: BlocBuilder<AssignmentCubit, AssignmentState>(
        builder: (context, state) {
          if (state is AssignmentLoading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state is AssignmentLoaded) {
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: state.assignments.length,
              separatorBuilder: (context, index) => const SizedBox(height: 16),
              itemBuilder: (context, index) {
                final assignment = state.assignments[index];
                return _TeacherAssignmentCard(assignment: assignment);
              },
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  void _showCreateAssignmentDialog(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Use the Web Portal for complex attachments. Simple creation coming soon.')),
    );
  }
}

class _TeacherAssignmentCard extends StatefulWidget {
  final Assignment assignment;
  const _TeacherAssignmentCard({required this.assignment});

  @override
  State<_TeacherAssignmentCard> createState() => _TeacherAssignmentCardState();
}

class _TeacherAssignmentCardState extends State<_TeacherAssignmentCard> {
  bool _isExpanded = false;
  List<dynamic> _submissions = [];
  bool _loadingSubmissions = false;

  void _toggleSubmissions() async {
    setState(() => _isExpanded = !_isExpanded);
    if (_isExpanded && _submissions.isEmpty) {
      setState(() => _loadingSubmissions = true);
      try {
        final subs = await context.read<AssignmentRepository>().getSubmissions(widget.assignment.id);
        setState(() => _submissions = subs);
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
      } finally {
        setState(() => _loadingSubmissions = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          ListTile(
            title: Text(widget.assignment.title, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${widget.assignment.subjectName} • Due: ${widget.assignment.dueDate}'),
            trailing: Icon(_isExpanded ? Icons.expand_less : Icons.expand_more),
            onTap: _toggleSubmissions,
          ),
          if (_isExpanded) ...[
            const Divider(height: 1),
            if (_loadingSubmissions)
              const Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator())
            else if (_submissions.isEmpty)
              const Padding(padding: EdgeInsets.all(16.0), child: Text('No submissions yet.'))
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _submissions.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final sub = _submissions[index];
                  final isGraded = sub['graded_at'] != null;
                  return ListTile(
                    leading: CircleAvatar(child: Text(sub['student_name'][0])),
                    title: Text(sub['student_name']),
                    subtitle: Text(isGraded ? 'Graded: ${sub['marks_obtained']}' : 'Pending Grade'),
                    trailing: TextButton(
                      onPressed: () => _showGradeDialog(context, sub),
                      child: Text(isGraded ? 'Update' : 'Grade'),
                    ),
                  );
                },
              ),
          ],
        ],
      ),
    );
  }

  void _showGradeDialog(BuildContext context, dynamic submission) {
    final marksController = TextEditingController(text: submission['marks_obtained']?.toString() ?? '');
    final feedbackController = TextEditingController(text: submission['teacher_feedback'] ?? '');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Grade: ${submission['student_name']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: marksController,
              decoration: const InputDecoration(labelText: 'Marks Obtained'),
              keyboardType: TextInputType.number,
            ),
            TextField(
              controller: feedbackController,
              decoration: const InputDecoration(labelText: 'Feedback'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final marks = double.tryParse(marksController.text) ?? 0;
              await context.read<AssignmentCubit>().gradeSubmission(submission['id'], marks, feedbackController.text);
              Navigator.pop(context);
              setState(() => _submissions = []); // Force reload
              _toggleSubmissions();
            },
            child: const Text('Save Grade'),
          ),
        ],
      ),
    );
  }
}
