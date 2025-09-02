"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  User,
  Calendar,
  Send,
  Eye,
  X,
  FileText
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminService, UserReport } from "@/service/admin";

export default function AdminUserReports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'resolved'>('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsData = await AdminService.getUserReports();
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    try {
      setUpdatingStatus(true);
      await AdminService.updateReportStatus(reportId, newStatus, adminNotes || undefined);
      await loadReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus, admin_notes: adminNotes });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('שגיאה בעדכון הסטטוס. אנא נסה שוב.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedReport || !replyMessage.trim()) return;
    
    try {
      setSendingReply(true);
      await AdminService.sendSystemMessage(selectedReport.user_id, replyMessage.trim());
      alert('הההודעה נשלחה בהצלחה למשתמש');
      setShowReplyModal(false);
      setReplyMessage("");
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('שגיאה בשליחת ההודעה. אנא נסה שוב.');
    } finally {
      setSendingReply(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'resolved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'ממתין';
      case 'in_progress':
        return 'בטיפול';
      case 'resolved':
        return 'נפתר';
      default:
        return status;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">טוען דיווחי משתמשים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">דיווחי משתמשים</h2>
          <p className="text-gray-600">נהל פניות ודיווחים ממשתמשי האפליקציה</p>
        </div>
        <Button onClick={loadReports} variant="outline">
          רענן דיווחים
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200 inline-flex">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          הכל ({reports.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-yellow-100 text-yellow-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ממתינים ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          בטיפול ({reports.filter(r => r.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'resolved'
              ? 'bg-green-100 text-green-700'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          נפתרו ({reports.filter(r => r.status === 'resolved').length})
        </button>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.subject}</h3>
                    <p className="text-sm text-gray-600">
                      {report.user_name} ({report.user_email})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.created_at).toLocaleDateString('he-IL')} {' '}
                      {new Date(report.created_at).toLocaleTimeString('he-IL')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusLabel(report.status)}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">{report.message}</p>
              </div>

              {report.admin_notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>הערות אדמין:</strong> {report.admin_notes}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(report);
                    setAdminNotes(report.admin_notes || '');
                  }}
                >
                  <Eye className="h-4 w-4 ml-1" />
                  צפה בפרטים
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowReplyModal(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 ml-1" />
                  שלח תגובה
                </Button>

                {report.status !== 'resolved' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(report.id, 'resolved')}
                    disabled={updatingStatus}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 ml-1" />
                    סמן כנפתר
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">אין דיווחים {filter !== 'all' ? `בקטגוריה "${getStatusLabel(filter)}"` : ''}</p>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && !showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{selectedReport.subject}</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">פרטי המשתמש</h4>
                <p className="text-sm text-gray-600">שם: {selectedReport.user_name}</p>
                <p className="text-sm text-gray-600">אימייל: {selectedReport.user_email}</p>
                <p className="text-sm text-gray-600">
                  תאריך דיווח: {new Date(selectedReport.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">הודעת המשתמש</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.message}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">הערות אדמין</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="הוסף הערות פנימיות..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'in_progress')}
                    disabled={updatingStatus}
                    variant={selectedReport.status === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                  >
                    סמן בטיפול
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                    disabled={updatingStatus}
                    variant={selectedReport.status === 'resolved' ? 'default' : 'outline'}
                    size="sm"
                  >
                    סמן כנפתר
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowReplyModal(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  שלח תגובה למשתמש
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">שליחת תגובה</h3>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                תגובה ל{selectedReport.user_name} בנושא: {selectedReport.subject}
              </p>
            </div>

            <div className="p-6">
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="כתוב את התגובה למשתמש..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
                  disabled={sendingReply}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || sendingReply}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {sendingReply ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  ) : (
                    <Send className="h-4 w-4 ml-2" />
                  )}
                  שלח תגובה
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}