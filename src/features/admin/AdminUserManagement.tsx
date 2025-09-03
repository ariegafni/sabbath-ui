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
  Eye
} from "lucide-react";
import Button from "@/ui/Button";
import { AdminService } from "@/service/admin";

interface AdminUserManagementProps {
  type: 'users' | 'hosts';
}

export default function AdminUserManagement({ type }: AdminUserManagementProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [removeReason, setRemoveReason] = useState("");
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = type === 'users' ? await AdminService.getAllUsers() : await AdminService.getAllHosts();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            ניהול {type === 'users' ? 'משתמשים' : 'מארחים'}
          </h2>
          <p className="text-gray-600">
            צפה ונהל {type === 'users' ? 'משתמשים רשומים' : 'מארחים פעילים'} במערכת
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
                  <div className="flex items-start gap-4">
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
                      <h3 className="font-semibold text-gray-900">
                        {item.first_name} {item.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="h-4 w-4" />
                        {item.email}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4" />
                        נרשם: {new Date(item.created_at).toLocaleDateString('he-IL')}
                      </p>
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

      {/* Item Details Modal */}
      {selectedItem && !showRemoveModal && (
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
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">תאריך הרשמה</label>
                      <p className="text-gray-600">{new Date(selectedItem.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">סטטוס</label>
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
                  
                  {selectedItem.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ביוגרפיה</label>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedItem.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      {selectedItem.photo_url || selectedItem.user?.profile_image ? (
                        <img 
                          src={selectedItem.photo_url || selectedItem.user?.profile_image} 
                          alt={selectedItem.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <Home className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">
                        {selectedItem.name || (selectedItem.user ? `${selectedItem.user.first_name} ${selectedItem.user.last_name}` : 'ללא שם')}
                      </h4>
                      <p className="text-gray-600">{selectedItem.user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">עיר</label>
                      <p className="text-gray-600">{selectedItem.city}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">מקסימום אורחים</label>
                      <p className="text-gray-600">{selectedItem.max_guests}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">סה&quot;כ אירוחים</label>
                      <p className="text-gray-600">{selectedItem.total_hostings}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">זמינות</label>
                      <p className={`text-sm ${selectedItem.is_always_available ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedItem.is_always_available ? 'זמין תמיד' : 'זמינות מוגבלת'}
                      </p>
                    </div>
                  </div>
                  
                  {selectedItem.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">תיאור</label>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedItem.description}</p>
                    </div>
                  )}
                  
                  {selectedItem.bio && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">ביוגרפיה</label>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedItem.bio}</p>
                    </div>
                  )}

                  {selectedItem.languages && selectedItem.languages.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">שפות</label>
                      <div className="flex gap-2 mt-1">
                        {selectedItem.languages.map((lang: string) => (
                          <span key={lang} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
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
                    {type === 'users' ? 'אישור חסימת משתמש' : 'אישור הסרה'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {type === 'users' 
                      ? 'המשתמש יחסם מהמערכת ולא יוכל להתחבר. ניתן לבטל חסימה בהמשך.'
                      : 'פעולה זו אינה הפיכה'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                האם אתה בטוח שברצונך {type === 'users' ? 'לחסום את המשתמש' : 'להסיר את המארח'}:{' '}
                <strong>
                  {type === 'users' 
                    ? `${selectedItem.first_name} ${selectedItem.last_name}` 
                    : (selectedItem.name || `${selectedItem.user?.first_name} ${selectedItem.user?.last_name}`)
                  }
                </strong>?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  סיבת ההסרה (נדרש)
                </label>
                <textarea
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  placeholder="הסבר את הסיבה להסרת החשבון..."
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
                  {type === 'users' ? 'חסום משתמש' : 'הסר מארח'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}