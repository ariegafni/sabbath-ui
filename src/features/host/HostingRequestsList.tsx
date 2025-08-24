"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, MessageSquare, User, Check, X, Clock, AlertCircle } from "lucide-react";
import Button from "@/ui/Button";
import { HostingRequestService, HostingRequest, RespondToHostingRequestRequest } from "@/service/HostingRequest";

interface HostingRequestsListProps {
  className?: string;
}

export default function HostingRequestsList({ className = "" }: HostingRequestsListProps) {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<HostingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    fetchHostingRequests();
  }, [selectedStatus]);

  const fetchHostingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = selectedStatus !== "all" ? { status: selectedStatus as any } : undefined;
      const data = await HostingRequestService.getMyHostRequests(filters);
      setRequests(data);
    } catch (err) {
      console.error("Error fetching hosting requests:", err);
      setError("שגיאה בטעינת בקשות האירוח");
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string, status: "accepted" | "rejected", responseMessage?: string) => {
    try {
      const responseData: RespondToHostingRequestRequest = {
        id: requestId,
        status,
        response_message: responseMessage,
      };

      await HostingRequestService.respondToHostingRequest(responseData);
      
      // עדכון הרשימה
      await fetchHostingRequests();
      
      alert(status === "accepted" ? "בקשת האירוח אושרה בהצלחה!" : "בקשת האירוח נדחתה");
      
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("שגיאה בתגובה לבקשת האירוח");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "accepted":
        return <Check className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <X className="w-5 h-5 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "ממתין לתגובה";
      case "accepted":
        return "אושר";
      case "rejected":
        return "נדחה";
      case "cancelled":
        return "בוטל";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">טוען בקשות אירוח...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchHostingRequests} variant="outline">
          נסה שוב
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">אין בקשות אירוח</h3>
        <p className="text-gray-600">עדיין לא התקבלו בקשות אירוח</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">בקשות אירוח</h2>
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-sm text-gray-600">סטטוס:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">הכל</option>
            <option value="pending">ממתין לתגובה</option>
            <option value="accepted">אושר</option>
            <option value="rejected">נדחה</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Request Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                {request.guest_profile_image ? (
                  <img
                    src={request.guest_profile_image}
                    alt={request.guest_name || "אורח"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {request.guest_name || "אורח"}
                  </h3>
                  <p className="text-sm text-gray-600">מבקש אירוח</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                {getStatusIcon(request.status)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>תאריך מבוקש: {formatDate(request.requested_date)}</span>
              </div>
              
              <div className="flex items-start space-x-2 space-x-reverse text-sm text-gray-600">
                <MessageSquare className="w-4 h-4 mt-0.5" />
                <span className="flex-1">{request.message}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                נשלח ב: {formatDate(request.created_at)}
              </div>
            </div>

            {/* Action Buttons */}
            {request.status === "pending" && (
              <div className="flex items-center space-x-3 space-x-reverse pt-4 border-t">
                <Button
                  onClick={() => handleRespondToRequest(request.id, "accepted")}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 ml-2" />
                  אשר
                </Button>
                <Button
                  onClick={() => handleRespondToRequest(request.id, "rejected")}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 ml-2" />
                  דחה
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
