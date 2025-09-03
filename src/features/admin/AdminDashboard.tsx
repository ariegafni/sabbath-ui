"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Home, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Settings,
  FileText,
  AlertTriangle,
  Shield
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminService, AdminStats } from "@/service/admin";
import AdminStatistics from "./AdminStatistics";
import AdminUserReports from "./AdminUserReports";
import AdminUserManagement from "./AdminUserManagement";

type AdminView = 'dashboard' | 'statistics' | 'reports' | 'users' | 'hosts';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const statsData = await AdminService.getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'statistics':
        return <AdminStatistics stats={stats} onRefresh={loadDashboardData} />;
      case 'reports':
        return <AdminUserReports />;
      case 'users':
        return <AdminUserManagement type="users" />;
      case 'hosts':
        return <AdminUserManagement type="hosts" />;
      default:
        return renderDashboardOverview();
    }
  };

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה"כ משתמשים</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">סה"כ מארחים</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalHosts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">בקשות אירוח</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalHostingRequests || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">אירוחים מאושרים</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.approvedHostings || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">משתמשים חסומים</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalBlockedUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">סטטיסטיקות מפורטות</h3>
          </div>
          <p className="text-gray-600 mb-4">צפה בנתונים מפורטים ודוחות על הפעילות באפליקציה</p>
          <Button 
            onClick={() => setCurrentView('statistics')}
            variant="outline" 
            className="w-full"
          >
            צפה בסטטיסטיקות
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold">דיווחי משתמשים</h3>
          </div>
          <p className="text-gray-600 mb-4">נהל דיווחים ופניות שהתקבלו ממשתמשי האפליקציה</p>
          <Button 
            onClick={() => setCurrentView('reports')}
            variant="outline" 
            className="w-full"
          >
            צפה בדיווחים
          </Button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold">ניהול משתמשים</h3>
          </div>
          <p className="text-gray-600 mb-4">נהל משתמשים ומארחים, הסר חשבונות והגבל גישה</p>
          <div className="flex gap-2">
            <Button 
              onClick={() => setCurrentView('users')}
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              משתמשים
            </Button>
            <Button 
              onClick={() => setCurrentView('hosts')}
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              מארחים
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">פעילות אחרונה</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString('he-IL')} {' '}
                    {new Date(activity.timestamp).toLocaleTimeString('he-IL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">אזור ניהול</h1>
              <p className="text-gray-600 text-sm">פאנל ניהול האפליקציה</p>
            </div>
            <div className="flex gap-2">
              {currentView !== 'dashboard' && (
                <Button 
                  onClick={() => setCurrentView('dashboard')}
                  variant="outline"
                  size="sm"
                >
                  חזרה לדשבורד
                </Button>
              )}
              <Button 
                onClick={loadDashboardData}
                variant="outline"
                size="sm"
              >
                רענן נתונים
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      {currentView === 'dashboard' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8 space-x-reverse">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                סקירה כללית
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderCurrentView()}
      </div>
    </div>
  );
}