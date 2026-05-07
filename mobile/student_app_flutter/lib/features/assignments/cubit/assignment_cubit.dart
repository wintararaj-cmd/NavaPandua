
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/assignment_repository.dart';
import '../data/models/assignment.dart';

abstract class AssignmentState {}

class AssignmentInitial extends AssignmentState {}
class AssignmentLoading extends AssignmentState {}
class AssignmentLoaded extends AssignmentState {
  final List<Assignment> assignments;
  AssignmentLoaded(this.assignments);
}
class AssignmentError extends AssignmentState {
  final String message;
  AssignmentError(this.message);
}

class AssignmentCubit extends Cubit<AssignmentState> {
  final AssignmentRepository _repository;

  AssignmentCubit(this._repository) : super(AssignmentInitial());

  Future<void> fetchAssignments() async {
    emit(AssignmentLoading());
    try {
      final assignments = await _repository.getAssignments();
      emit(AssignmentLoaded(assignments));
    } catch (e) {
      emit(AssignmentError(e.toString()));
    }
  }

  Future<void> submitAssignment(String assignmentId, String url) async {
    try {
      await _repository.submitAssignment(assignmentId, url);
      fetchAssignments(); // Refresh list
    } catch (e) {
      emit(AssignmentError(e.toString()));
    }
  }

  // Teacher Methods
  Future<void> createAssignment(Map<String, dynamic> data) async {
    try {
      await _repository.createAssignment(data);
      fetchAssignments();
    } catch (e) {
      emit(AssignmentError(e.toString()));
    }
  }

  Future<void> gradeSubmission(String submissionId, double marks, String feedback) async {
    try {
      await _repository.gradeSubmission(submissionId, marks, feedback);
      // We might need to refresh submissions for a specific assignment
    } catch (e) {
      emit(AssignmentError(e.toString()));
    }
  }
}
