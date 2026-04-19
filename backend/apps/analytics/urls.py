
from django.urls import path
from .views import DashboardStatsView, PerformanceAnalyticsView, ReportViewSet

app_name = 'analytics'

urlpatterns = [
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('performance/', PerformanceAnalyticsView.as_view(), name='performance_analytics'),
    path('reports/export/', ReportViewSet.as_view(), name='report_export'),
]
