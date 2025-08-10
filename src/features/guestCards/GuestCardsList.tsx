"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
    tags: ["חילוני", "חם ואוהב", "שיח עמוק", "שקט"]
  },
  {
    id: "2",
    name: "יוסי",
    location: "חיפה",
    date: "21.08.2025",
    time: "19:30",
    spots: 4,
    image: "https://picsum.photos/400/200?random=2",
    tags: ["דתי-לאומי", "חם ואוהב", "משפחתי"]
  },
  {
    id: "3",
    name: "נועה",
    location: "ירושלים",
    date: "15.08.2025",
    time: "18:45",
    spots: 3,
    image: "https://picsum.photos/400/200?random=3",
    tags: ["חברים צעירים", "שקט", "צמחוני/טבעוני"]
  },
  {
    id: "4",
    name: "שמעון",
    location: "אשדוד",
    date: "22.08.2025",
    time: "20:00",
    spots: 5,
    image: "https://picsum.photos/400/200?random=4",
    tags: ["משפחתי", "חם ואוהב", "כולל לינה"]
  },
  {
    id: "5",
    name: "Leah & David",
    location: "תל אביב",
    date: "10.08.2025",
    time: "19:00",
    spots: 6,
    image: "https://picsum.photos/400/200?random=5",
    tags: ["דתי-לאומי", "חם ואוהב", "כולל לינה"]
  }
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
      {/* תיבת חיפוש */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={t("search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md p-2"
        />
      </div>

      {/* רשימת כרטיסים */}
      {filteredGuests.length > 0 ? (
        filteredGuests.map((guest) => (
          <div key={guest.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="w-full h-40 relative rounded-lg overflow-hidden">
              <Image src={guest.image} alt={guest.name} fill className="object-cover" />
            </div>

            <div className="flex items-center justify-between">
              <div className="font-bold">
                {guest.name} — {guest.location}
              </div>
              <div className="text-sm text-gray-500">
                {guest.date} • {guest.time} • {guest.spots} מקומות
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {guest.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full border text-sm bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">{t("search.noResults")}</div>
      )}
    </div>
  );
}
