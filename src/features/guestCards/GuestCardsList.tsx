"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Calendar, Clock, Users } from "lucide-react";

type GuestCardData = {
  id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  spots: number;
  image: string;
  tags: string[];
};

const fakeGuests: GuestCardData[] = [
  {
    id: "1",
    name: "אתי",
    location: "תל אביב",
    date: "20.08.2025",
    time: "13:00",
    spots: 2,
    image: "https://picsum.photos/400/200?random=1",
    tags: ["חילוני", "חם ואוהב", "שיח עמוק", "שקט"],
  },
  {
    id: "2",
    name: "יוסי",
    location: "חיפה",
    date: "21.08.2025",
    time: "19:30",
    spots: 4,
    image: "https://picsum.photos/400/200?random=2",
    tags: ["דתי-לאומי", "חם ואוהב", "משפחתי"],
  },
  {
    id: "3",
    name: "נועה",
    location: "ירושלים",
    date: "15.08.2025",
    time: "18:45",
    spots: 3,
    image: "https://picsum.photos/400/200?random=3",
    tags: ["חברים צעירים", "שקט", "צמחוני/טבעוני"],
  },
  {
    id: "4",
    name: "שמעון",
    location: "אשדוד",
    date: "22.08.2025",
    time: "20:00",
    spots: 5,
    image: "https://picsum.photos/400/200?random=4",
    tags: ["משפחתי", "חם ואוהב", "כולל לינה"],
  },
  {
    id: "5",
    name: "Leah & David",
    location: "תל אביב",
    date: "10.08.2025",
    time: "19:00",
    spots: 6,
    image: "https://picsum.photos/400/200?random=5",
    tags: ["דתי-לאומי", "חם ואוהב", "כולל לינה"],
  },
];

export default function GuestCardsList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredGuests = fakeGuests.filter(
    (guest) =>
      guest.location.toLowerCase().includes(search.toLowerCase()) ||
      guest.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* תיבת חיפוש משופרת */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
        />
      </div>

      {/* רשימת כרטיסים משופרת */}
      {filteredGuests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
            >
              {/* תמונה */}
              <div className="w-full h-48 sm:h-56 relative overflow-hidden">
                <Image
                  src={guest.image}
                  alt={guest.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {guest.spots} מקומות
                </div>
              </div>

              {/* תוכן */}
              <div className="p-4 sm:p-5 space-y-3">
                {/* שם ומיקום */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                    {guest.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{guest.location}</span>
                  </div>
                </div>

                {/* תאריך וזמן */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{guest.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{guest.time}</span>
                  </div>
                </div>

                {/* תגיות */}
                <div className="flex flex-wrap gap-2">
                  {guest.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-gray-50 text-gray-700 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {guest.tags.length > 3 && (
                    <span className="px-2 py-1 rounded-lg border border-gray-200 text-xs bg-gray-50 text-gray-700 font-medium">
                      +{guest.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* כפתור התעניינות */}
                <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 text-sm">
                  אני מתעניין
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="h-16 w-16 mx-auto" />
          </div>
          <p className="text-gray-500 text-lg">{t("search.noResults")}</p>
          <p className="text-gray-400 text-sm mt-2">נסו לשנות את החיפוש שלכם</p>
        </div>
      )}
    </div>
  );
}
