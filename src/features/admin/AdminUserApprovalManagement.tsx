"use client";

import { useState, useEffect } from "react";
import { 
  Check,
  X,
  Eye,
  User,
  Mail,
  Calendar,
  MapPin,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldX
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminService } from "@/service/admin";
import { UserStatusReason, USER_STATUS_MESSAGES } from "@/shared/types/userStatus";

export default function AdminUserApprovalManagement() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<{
    action: 'approve' | 'disapprove';
    reason?: UserStatusReason;
    reasonDescription?: string;
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await AdminService.getUsersWithStatus();
      setUsers(result);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async () => {
    if (!selectedUser || !approvalAction) return;

    try {
      setUpdating(true);
      await AdminService.updateUserApprovalStatus(
        selectedUser.id,
        approvalAction.action === 'approve',
        approvalAction.reason,
        approvalAction.reasonDescription
      );
      
      alert(`סטטוס המשתמש ${approvalAction.action === 'approve' ? 'אושר' : 'בוטל'} בהצלחה`);
      setShowApprovalModal(false);
      setSelectedUser(null);
      setApprovalAction(null);
      await loadUsers();
    } catch (error) {
      console.error("Error updating approval status:", error);
      alert("שגיאה בעדכון סטטוס המשתמש. אנא נסה שוב.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (user: any) => {
    if (user.is_approved) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ShieldCheck className="h-3 w-3 ml-1" />
          מאושר
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <ShieldX className="h-3 w-3 ml-1" />
        לא מאושר
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">טוען משתמשים...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ניהול אישור משתמשים
          </h2>
          <p className="text-gray-600">
            נהל את סטטוס האישור של משתמשים במערכת
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline">
          רענן רשימה
        </Button>
      </div>

      {/* Users List */}
      {users.length > 0 ? (
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {user.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      {getStatusBadge(user)}
                    </div>
                    
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                    
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      נרשם: {new Date(user.created_at).toLocaleDateString('he-IL')}
                    </p>
                    
                    {user.city && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" />
                        {user.city}, {user.country}
                      </p>
                    )}

                    {!user.is_approved && user.status_reason && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-800 font-medium">
                          סיבת חסימה: {USER_STATUS_MESSAGES[user.status_reason as UserStatusReason]}
                        </p>
                        {user.status_reason_description && (
                          <p className="text-xs text-yellow-700 mt-1">
                            {user.status_reason_description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    צפה
                  </Button>
                  
                  {user.is_approved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setApprovalAction({ action: 'disapprove' });
                        setShowApprovalModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 ml-1" />
                      בטל אישור
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(user);
                        setApprovalAction({ action: 'approve' });
                        setShowApprovalModal(true);
                      }}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <Check className="h-4 w-4 ml-1" />
                      אשר
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">אין משתמשים במערכת</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">פרטי משתמש</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {selectedUser.profile_image ? (
                      <img 
                        src={selectedUser.profile_image} 
                        alt={`${selectedUser.first_name} ${selectedUser.last_name}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-semibold">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </h4>
                      {getStatusBadge(selectedUser)}
                    </div>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">תאריך הרשמה</label>
                    <p className="text-gray-600">{new Date(selectedUser.created_at).toLocaleDateString('he-IL')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">סטטוס אימות</label>
                    <p className={`text-sm ${selectedUser.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedUser.is_verified ? 'מאומת' : 'לא מאומת'}
                    </p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">טלפון</label>
                      <p className="text-gray-600">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">מיקום</label>
                      <p className="text-gray-600">{selectedUser.city}, {selectedUser.country}</p>
                    </div>
                  )}
                </div>

                {!selectedUser.is_approved && selectedUser.status_reason && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">פרטי חסימה</h5>
                    <p className="text-sm text-yellow-700 mb-1">
                      סיבה: {USER_STATUS_MESSAGES[selectedUser.status_reason as UserStatusReason]}
                    </p>
                    {selectedUser.status_reason_description && (
                      <p className="text-sm text-yellow-700">
                        הסבר נוסף: {selectedUser.status_reason_description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Action Modal */}
      {showApprovalModal && selectedUser && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  approvalAction.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {approvalAction.action === 'approve' ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {approvalAction.action === 'approve' ? 'אישור משתמש' : 'ביטול אישור משתמש'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {approvalAction.action === 'disapprove' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    בחר סיבה לביטול האישור
                  </label>
                  <select
                    value={approvalAction.reason || ''}
                    onChange={(e) => setApprovalAction({
                      ...approvalAction,
                      reason: e.target.value as UserStatusReason
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">בחר סיבה...</option>
                    <option value={UserStatusReason.EMAIL_NOT_VERIFIED}>אימייל לא מאומת</option>
                    <option value={UserStatusReason.PHONE_NOT_VERIFIED}>טלפון לא מאומת</option>
                    <option value={UserStatusReason.PROFILE_INCOMPLETE}>פרופיל לא שלם</option>
                    <option value={UserStatusReason.GENERAL_BLOCK}>חסימה כללית</option>
                  </select>
                </div>
              )}

              {approvalAction.action === 'disapprove' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הסבר נוסף (אופציונלי)
                  </label>
                  <textarea
                    value={approvalAction.reasonDescription || ''}
                    onChange={(e) => setApprovalAction({
                      ...approvalAction,
                      reasonDescription: e.target.value
                    })}
                    placeholder="הוסף הסבר נוסף לסיבת הביטול..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAction(null);
                  }}
                  disabled={updating}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleApprovalChange}
                  disabled={
                    updating || 
                    (approvalAction.action === 'disapprove' && !approvalAction.reason)
                  }
                  className={approvalAction.action === 'approve' 
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  ) : (
                    approvalAction.action === 'approve' ? (
                      <Check className="h-4 w-4 ml-2" />
                    ) : (
                      <X className="h-4 w-4 ml-2" />
                    )
                  )}
                  {approvalAction.action === 'approve' ? 'אשר משתמש' : 'בטל אישור'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}