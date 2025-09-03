"use client";

import { useState } from "react";
import { 
  Users, 
  Home, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  Activity,
  RefreshCw
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminStats } from "@/service/admin";

interface AdminStatisticsProps {
  stats: AdminStats | null;
  onRefresh: () => Promise<void>;
}

export default function AdminStatistics({ stats, onRefresh }: AdminStatisticsProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'host_creation':
        return <Home className="h-4 w-4 text-green-600" />;
      case 'hosting_request':
        return <MessageSquare className="h-4 w-4 text-orange-600" />;
      case 'hosting_approved':
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'הרשמת משתמש חדש';
      case 'host_creation':
        return 'יצירת פרופיל מארח';
      case 'hosting_request':
        return 'בקשת אירוח חדשה';
      case 'hosting_approved':
        return 'אישור אירוח';
      default:
        return 'פעילות';
    }
  };

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">טוען נתוני סטטיסטיקות...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">סטטיסטיקות מפורטות</h2>
          <p className="text-gray-600">נתונים מלאים על הפעילות באפליקציה</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          רענן נתונים
        </Button>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">סה"כ משתמשים רשומים</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-green-600 mt-1">פעילים באפליקציה</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">מארחים פעילים</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalHosts}</p>
              <p className="text-xs text-green-600 mt-1">זמינים לאירוח</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">בקשות אירוח</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalHostingRequests}</p>
              <p className="text-xs text-orange-600 mt-1">סה"כ נשלחו</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">אירוחים מאושרים</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approvedHostings}</p>
              <p className="text-xs text-purple-600 mt-1">הושלמו בהצלחה</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">בקשות ממתינות</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              <p className="text-xs text-yellow-600 mt-1">טעונות טיפול</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">שיחות פעילות</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalConversations}</p>
              <p className="text-xs text-blue-600 mt-1">צ&apos;אטים במערכת</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">שיעור הצלחה</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalHostingRequests > 0 
                  ? Math.round((stats.approvedHostings / stats.totalHostingRequests) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-green-600 mt-1">אירוחים מאושרים</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="h-6 w-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">פעילות אחרונה במערכת</h3>
        </div>

        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getActivityLabel(activity.type)}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      {activity.user && (
                        <p className="text-xs text-gray-500 mt-1">
                          משתמש: {activity.user.name} ({activity.user.email})
                        </p>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleDateString('he-IL')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString('he-IL')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">אין פעילות אחרונה להצגה</p>
          </div>
        )}
      </div>
    </div>
  );
}