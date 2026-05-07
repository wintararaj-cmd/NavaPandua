
import '../../../core/network/api_client.dart';
import 'models/fee.dart';

class FeeRepository {
  final ApiClient _apiClient;

  FeeRepository(this._apiClient);

  Future<FeeSummary> getFeeSummary() async {
    try {
      final response = await _apiClient.get('/fees/student-summary/');
      return FeeSummary.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<FeeAllocation>> getFeeAllocations() async {
    try {
      final response = await _apiClient.get('/fees/allocations/');
      return (response.data['results'] as List)
          .map((e) => FeeAllocation.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<List<FeePayment>> getPaymentHistory() async {
    try {
      final response = await _apiClient.get('/fees/payments/');
      return (response.data['results'] as List)
          .map((e) => FeePayment.fromJson(e))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> initiatePayment(String allocationId) async {
    try {
      final response = await _apiClient.post('/fees/allocations/$allocationId/pay/');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }
}
