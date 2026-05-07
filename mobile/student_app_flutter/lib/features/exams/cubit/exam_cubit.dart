
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/exam_repository.dart';
import '../data/models/exam.dart';

abstract class ExamState {}

class ExamInitial extends ExamState {}
class ExamLoading extends ExamState {}
class ExamLoaded extends ExamState {
  final List<Exam> exams;
  ExamLoaded(this.exams);
}
class ReportCardLoaded extends ExamState {
  final ReportCard reportCard;
  ReportCardLoaded(this.reportCard);
}
class ExamError extends ExamState {
  final String message;
  ExamError(this.message);
}

class ExamCubit extends Cubit<ExamState> {
  final ExamRepository _repository;

  ExamCubit(this._repository) : super(ExamInitial());

  Future<void> fetchExams() async {
    emit(ExamLoading());
    try {
      final exams = await _repository.getExams();
      emit(ExamLoaded(exams));
    } catch (e) {
      emit(ExamError(e.toString()));
    }
  }

  Future<void> fetchReportCard(String examId) async {
    emit(ExamLoading());
    try {
      final reportCard = await _repository.getReportCard(examId);
      emit(ReportCardLoaded(reportCard));
    } catch (e) {
      emit(ExamError(e.toString()));
    }
  }
}
