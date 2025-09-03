"use client";

import React, { useState, useEffect } from 'react';
import { AdminService } from '../../service/admin';
import { MessageCircle, Clock, CheckCircle, Send, Badge } from 'lucide-react';

interface UserReport {
  id: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
  unread_count?: number;
}

interface Conversation {
  id: string;
  sender_type: 'user' | 'admin';
  sender_name: string;
  sender_email: string;
  message: string;
  created_at: string;
  read_by_user: boolean;
  read_by_admin: boolean;
}

export const MyReports: React.FC = () => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getMyReports();
      setReports(data);
      setError(null);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async (reportId: string) => {
    try {
      const data = await AdminService.getReportConversations(reportId);
      setConversations(data);
      
      // Mark as read when viewing
      await AdminService.markReportAsRead(reportId);
      
      // Update the reports list to remove unread count
      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, unread_count: 0 } : report
      ));
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedReportId) return;

    try {
      setSendingMessage(true);
      await AdminService.addReportMessage(selectedReportId, newMessage);
      setNewMessage('');
      
      // Reload conversations
      await loadConversations(selectedReportId);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const selectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    loadConversations(reportId);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_progress':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'בהמתנה';
      case 'in_progress':
        return 'בטיפול';
      case 'resolved':
        return 'נפתר';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">טוען דיווחים...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">הדיווחים שלי</h2>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">עדיין לא שלחת דיווחים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">רשימת דיווחים</h3>
            {reports.map((report) => (
              <div
                key={report.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedReportId === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => selectReport(report.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(report.status)}
                      <span className="text-sm font-medium text-gray-600">
                        {getStatusText(report.status)}
                      </span>
                      {report.unread_count && report.unread_count > 0 && (
                        <Badge className="w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                          {report.unread_count}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{report.subject}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{report.message}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      נשלח: {formatDate(report.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conversation Panel */}
          <div className="border rounded-lg">
            {selectedReportId ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">שיחה</h3>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 max-h-96 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      עדיין אין הודעות בשיחה זו
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex ${
                          conversation.sender_type === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            conversation.sender_type === 'user'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {conversation.sender_type === 'admin' ? 'מנהל המערכת' : 'אני'}
                          </div>
                          <div className="text-sm">{conversation.message}</div>
                          <div className="text-xs opacity-75 mt-1">
                            {formatDate(conversation.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input */}
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="כתוב הודעה..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingMessage ? 'שולח...' : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                בחר דיווח כדי לראות את השיחה
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};