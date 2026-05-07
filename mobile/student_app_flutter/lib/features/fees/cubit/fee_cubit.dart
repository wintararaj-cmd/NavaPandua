
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/fee_repository.dart';
import '../data/models/fee.dart';

abstract class FeeState {}

class FeeInitial extends FeeState {}
class FeeLoading extends FeeState {}
class FeeLoaded extends FeeState {
  final FeeSummary summary;
  final List<FeeAllocation> allocations;
  final List<FeePayment> history;
  FeeLoaded(this.summary, this.allocations, this.history);
}
class FeeError extends FeeState {
  final String message;
  FeeError(this.message);
}

class FeeCubit extends Cubit<FeeState> {
  final FeeRepository _repository;

  FeeCubit(this._repository) : super(FeeInitial());

  Future<void> fetchFees() async {
    emit(FeeLoading());
    try {
      final summary = await _repository.getFeeSummary();
      final allocations = await _repository.getFeeAllocations();
      final history = await _repository.getPaymentHistory();
      emit(FeeLoaded(summary, allocations, history));
    } catch (e) {
      emit(FeeError(e.toString()));
    }
  }
}
