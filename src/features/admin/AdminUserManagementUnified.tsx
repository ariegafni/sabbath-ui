"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Home, 
  Search, 
  Trash2, 
  AlertTriangle,
  User,
  Mail,
  Calendar,
  MapPin,
  MessageSquare,
  X,
  Eye,
  Shield,
  ShieldCheck,
  ShieldX,
  Edit3,
  Check
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminService } from "@/service/admin";
import { UserStatusReason, USER_STATUS_MESSAGES } from "@/shared/types/userStatus";

interface AdminUserManagementUnifiedProps {
  type: 'users' | 'hosts';
}

export default function AdminUserManagementUnified({ type }: AdminUserManagementUnifiedProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Approval modal state
  const [approvalAction, setApprovalAction] = useState<{
    action: 'approve' | 'disapprove';
    reason?: UserStatusReason;
    reasonDescription?: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      setLoading(true);
      let result;
      if (type === 'users') {
        // Use the unified users endpoint that includes approval status
        result = await AdminService.getUsersWithStatus();
      } else {
        result = await AdminService.getAllHosts();
      }
      setData(result);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedItem || !removeReason.trim()) return;
    
    try {
      setRemoving(true);
      if (type === 'users') {
        await AdminService.blockUser(selectedItem.id, removeReason.trim());
      } else {
        await AdminService.removeHost(selectedItem.id, removeReason.trim());
      }
      
      alert(`${type === 'users' ? 'המשתמש נחסם' : 'המארח הוסר'} בהצלחה`);
      setShowRemoveModal(false);
      setSelectedItem(null);
      setRemoveReason("");
      await loadData();
    } catch (error) {
      console.error(`Error removing ${type}:`, error);
      alert(`שגיאה בהסרת ${type === 'users' ? 'המשתמש' : 'המארח'}. אנא נסה שוב.`);
    } finally {
      setRemoving(false);
    }
  };

  const handleApprovalChange = async () => {
    if (!selectedItem || !approvalAction) return;

    try {
      setUpdating(true);
      await AdminService.updateUserApprovalStatus(
        selectedItem.id,
        approvalAction.action === 'approve',
        approvalAction.reason,
        approvalAction.reasonDescription
      );
      
      alert('סטטוס המשתמש עודכן בהצלחה');
      setShowApprovalModal(false);
      setApprovalAction(null);
      setSelectedItem(null);
      await loadData();
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('שגיאה בעדכון סטטוס המשתמש. אנא נסה שוב.');
    } finally {
      setUpdating(false);
    }
  };

  const openApprovalModal = (user: any, action: 'approve' | 'disapprove') => {
    setSelectedItem(user);
    setApprovalAction({ action });
    setShowApprovalModal(true);
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (type === 'users') {
      return (
        item.first_name?.toLowerCase().includes(searchLower) ||
        item.last_name?.toLowerCase().includes(searchLower) ||
        item.email?.toLowerCase().includes(searchLower)
      );
    } else {
      return (
        item.name?.toLowerCase().includes(searchLower) ||
        item.user?.first_name?.toLowerCase().includes(searchLower) ||
        item.user?.last_name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.city?.toLowerCase().includes(searchLower)
      );
    }
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">טוען {type === 'users' ? 'משתמשים' : 'מארחים'}...</p>
      </div>
    );
  }

  const getApprovalBadge = (user: any) => {
    if (user.is_approved === undefined || user.is_approved) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
          <ShieldCheck className="h-3 w-3" />
          מאושר
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
          <ShieldX className="h-3 w-3" />
          לא מאושר
        </div>
      );
    }
  };

  const getStatusReasonText = (reason?: string) => {
    if (!reason) return null;
    const reasonKey = reason as UserStatusReason;
    return USER_STATUS_MESSAGES[reasonKey] || reason;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ניהול {type === 'users' ? 'משתמשים' : 'מארחים'}
          </h2>
          <p className="text-gray-600">
            צפה ונהל {type === 'users' ? 'משתמשים רשומים והרשאותיהם' : 'מארחים פעילים'} במערכת
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          רענן רשימה
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`חפש ${type === 'users' ? 'משתמש' : 'מארח'}...`}
            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>מציג {filteredData.length} מתוך {data.length} {type === 'users' ? 'משתמשים' : 'מארחים'}</span>
      </div>

      {/* Data List */}
      {filteredData.length > 0 ? (
        <div className="grid gap-4">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {type === 'users' ? (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.profile_image ? (
                        <img 
                          src={item.profile_image} 
                          alt={`${item.first_name} ${item.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {item.first_name} {item.last_name}
                        </h3>
                        {getApprovalBadge(item)}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="h-4 w-4" />
                        {item.email}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        נרשם: {new Date(item.created_at).toLocaleDateString('he-IL')}
                      </p>
                      {!item.is_approved && item.status_reason && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          סיבה: {getStatusReasonText(item.status_reason)}
                        </p>
                      )}
                      {!item.is_approved && item.status_reason_description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {item.status_reason_description}
                        </p>
                      )}
                      {item.phone && (
                        <p className="text-xs text-gray-500 mt-1">טלפון: {item.phone}</p>
                      )}
                      {item.city && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {item.city}, {item.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      צפה
                    </Button>
                    
                    {/* Approval buttons */}
                    {item.is_approved ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openApprovalModal(item, 'disapprove')}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <ShieldX className="h-4 w-4 ml-1" />
                        בטל אישור
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openApprovalModal(item, 'approve')}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <ShieldCheck className="h-4 w-4 ml-1" />
                        אשר
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowRemoveModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      חסום
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {item.photo_url || item.user?.profile_image ? (
                        <img 
                          src={item.photo_url || item.user?.profile_image} 
                          alt={item.name || `${item.user?.first_name} ${item.user?.last_name}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Home className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name || (item.user ? `${item.user.first_name} ${item.user.last_name}` : 'ללא שם')}
                      </h3>
                      {item.user?.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Mail className="h-4 w-4" />
                          {item.user.email}
                        </p>
                      )}
                      {item.city && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {item.city}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>אירחו מקסימום: {item.max_guests} אורחים</span>
                        <span>סה&quot;כ אירוחים: {item.total_hostings}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.is_always_available 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.is_always_available ? 'זמין תמיד' : 'זמינות מוגבלת'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      צפה
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowRemoveModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      הסר
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {type === 'users' ? (
              <Users className="h-8 w-8 text-gray-400" />
            ) : (
              <Home className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <p className="text-gray-500">
            {searchTerm 
              ? `לא נמצאו ${type === 'users' ? 'משתמשים' : 'מארחים'} עבור "${searchTerm}"`
              : `אין ${type === 'users' ? 'משתמשים' : 'מארחים'} במערכת`
            }
          </p>
        </div>
      )}

      {/* Item Details Modal - Same as before */}
      {selectedItem && !showRemoveModal && !showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">
                  פרטי {type === 'users' ? 'משתמש' : 'מארח'}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {type === 'users' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      {selectedItem.profile_image ? (
                        <img 
                          src={selectedItem.profile_image} 
                          alt={`${selectedItem.first_name} ${selectedItem.last_name}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {selectedItem.first_name} {selectedItem.last_name}
                      </h4>
                      <p className="text-gray-600">{selectedItem.email}</p>
                      <div className="mt-1">{getApprovalBadge(selectedItem)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">תאריך הרשמה</label>
                      <p className="text-gray-600">{new Date(selectedItem.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">סטטוס אימות</label>
                      <p className={`text-sm ${selectedItem.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedItem.is_verified ? 'מאומת' : 'לא מאומת'}
                      </p>
                    </div>
                    {selectedItem.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">טלפון</label>
                        <p className="text-gray-600">{selectedItem.phone}</p>
                      </div>
                    )}
                    {selectedItem.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">מיקום</label>
                        <p className="text-gray-600">{selectedItem.city}, {selectedItem.country}</p>
                      </div>
                    )}
                  </div>
                  
                  {!selectedItem.is_approved && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-900 mb-2">פרטי אי-אישור:</h5>
                      {selectedItem.status_reason && (
                        <p className="text-sm text-red-700 mb-1">
                          <strong>סיבה:</strong> {getStatusReasonText(selectedItem.status_reason)}
                        </p>
                      )}
                      {selectedItem.status_reason_description && (
                        <p className="text-sm text-red-700">
                          <strong>תיאור נוסף:</strong> {selectedItem.status_reason_description}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedItem.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ביוגרפיה</label>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedItem.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Host details - same as before
                <div>Host details here...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedItem && approvalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  approvalAction.action === 'approve' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {approvalAction.action === 'approve' ? (
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <ShieldX className="h-5 w-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {approvalAction.action === 'approve' ? 'אישור משתמש' : 'ביטול אישור משתמש'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedItem.first_name} {selectedItem.last_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {approvalAction.action === 'disapprove' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סיבת אי-אישור
                    </label>
                    <select
                      value={approvalAction.reason || ''}
                      onChange={(e) => setApprovalAction({
                        ...approvalAction,
                        reason: e.target.value as UserStatusReason
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">בחר סיבה</option>
                      <option value={UserStatusReason.EMAIL_NOT_VERIFIED}>אימייל לא מאומת</option>
                      <option value={UserStatusReason.PHONE_NOT_VERIFIED}>טלפון לא מאומת</option>
                      <option value={UserStatusReason.PROFILE_INCOMPLETE}>פרופיל לא שלם</option>
                      <option value={UserStatusReason.GENERAL_BLOCK}>חסימה כללית</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תיאור נוסף (אופציונלי)
                    </label>
                    <textarea
                      value={approvalAction.reasonDescription || ''}
                      onChange={(e) => setApprovalAction({
                        ...approvalAction,
                        reasonDescription: e.target.value
                      })}
                      placeholder="תיאור מפורט יותר של הסיבה..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                    />
                  </div>
                </>
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
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                  }
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  ) : (
                    approvalAction.action === 'approve' ? (
                      <ShieldCheck className="h-4 w-4 ml-2" />
                    ) : (
                      <ShieldX className="h-4 w-4 ml-2" />
                    )
                  )}
                  {approvalAction.action === 'approve' ? 'אשר משתמש' : 'בטל אישור'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal - Same as before but updated text */}
      {showRemoveModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    אישור חסימת {type === 'users' ? 'משתמש' : 'מארח'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type === 'users' 
                      ? 'המשתמש יחסם לגמרי מהמערכת ולא יוכל להתחבר.'
                      : 'פעולה זו אינה הפיכה'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                האם אתה בטוח שברצונך לחסום את {type === 'users' ? 'המשתמש' : 'המארח'}:{' '}
                <strong>
                  {type === 'users' 
                    ? `${selectedItem.first_name} ${selectedItem.last_name}` 
                    : (selectedItem.name || `${selectedItem.user?.first_name} ${selectedItem.user?.last_name}`)
                  }
                </strong>?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיבת החסימה (נדרש)
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="הסבר את הסיבה לחסימת החשבון..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setRemoveReason("");
                  }}
                  disabled={removing}
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleRemove}
                  disabled={!removeReason.trim() || removing}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {removing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent ml-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 ml-2" />
                  )}
                  חסום לצמיתות
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}