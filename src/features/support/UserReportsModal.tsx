"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, MessageCircle, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import Button from "@/ui/Button";
import { AdminService } from "@/service";

interface UserReport {
  id: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  unread_count?: number;
}

interface UserReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserReportsModal({ isOpen, onClose }: UserReportsModalProps) {
  const { t } = useTranslation();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewReportForm, setShowNewReportForm] = useState(false);
  const [newReport, setNewReport] = useState({ subject: "", message: "" });
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getMyReports();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.subject.trim() || !newReport.message.trim()) return;

    try {
      setSubmitting(true);
      // We need to add this method to AdminService
      await AdminService.createUserReport(newReport.subject, newReport.message);
      alert("הדיווח נשלח בהצלחה!");
      setNewReport({ subject: "", message: "" });
      setShowNewReportForm(false);
      fetchReports();
    } catch (error) {
      alert("שגיאה בשליחת הדיווח");
    } finally {
      setSubmitting(false);
    }
  };

  const openReportConversation = async (report: UserReport) => {
    try {
      setSelectedReport(report);
      const data = await AdminService.getReportConversations(report.id);
      setConversations(data);
      // Mark as read
      await AdminService.markReportAsRead(report.id);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !newMessage.trim()) return;

    try {
      setSubmitting(true);
      await AdminService.addReportMessage(selectedReport.id, newMessage.trim());
      setNewMessage("");
      // Refresh conversations
      const data = await AdminService.getReportConversations(selectedReport.id);
      setConversations(data);
    } catch (error) {
      alert("שגיאה בשליחת ההודעה");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return "ממתין לטיפול";
      case 'in_progress': return "בטיפול";
      case 'resolved': return "טופל";
      default: return "לא ידוע";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {selectedReport ? `דיווח: ${selectedReport.subject}` : "הדיווחים שלי"}
          </h2>
          <button
            onClick={() => {
              if (selectedReport) {
                setSelectedReport(null);
                setConversations([]);
              } else {
                onClose();
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">
          {selectedReport ? (
            /* Conversation View */
            <div className="p-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(selectedReport.status)}
                  <span className="font-medium">{getStatusText(selectedReport.status)}</span>
                </div>
                <h3 className="font-semibold">{selectedReport.subject}</h3>
                <p className="text-gray-600 mt-1">{selectedReport.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(selectedReport.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>

              {conversations.length > 0 && (
                <div className="space-y-3 mb-4">
                  {conversations.map((conv, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        conv.sender_type === 'admin' 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500 mr-8'
                          : 'bg-gray-50 border-l-4 border-l-gray-400 ml-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {conv.sender_type === 'admin' ? 'צוות התמיכה' : 'אני'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                      <p className="text-sm">{conv.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedReport.status !== 'resolved' && (
                <form onSubmit={sendMessage} className="border-t pt-4">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="הכנס הודעה..."
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={submitting || !newMessage.trim()}>
                      {submitting ? "שולח..." : "שלח הודעה"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : showNewReportForm ? (
            /* New Report Form */
            <div className="p-4">
              <form onSubmit={handleSubmitNewReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">נושא הדיווח</label>
                  <input
                    type="text"
                    value={newReport.subject}
                    onChange={(e) => setNewReport({ ...newReport, subject: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="תאר את הבעיה בקצרה"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">פירוט הבעיה</label>
                  <textarea
                    value={newReport.message}
                    onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
                    className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="תאר את הבעיה בפירוט..."
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewReportForm(false)}
                  >
                    ביטול
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "שולח..." : "שלח דיווח"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Reports List */
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>לא נמצאו דיווחים</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => openReportConversation(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(report.status)}
                            <h3 className="font-medium">{report.subject}</h3>
                            {report.unread_count && report.unread_count > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {report.unread_count}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">{report.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                            <span>{getStatusText(report.status)}</span>
                          </div>
                        </div>
                        <MessageCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!selectedReport && !showNewReportForm && (
          <div className="border-t p-4">
            <Button
              onClick={() => setShowNewReportForm(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              דיווח על בעיה חדשה
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}