"use client";

import { useEffect, useState } from "react";
import { Home, MessageCircle, Plus, User, Calendar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/Providers/AuthProvider";
import { HostService } from "@/service";

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
};

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsHost(false);
        return;
      }
      try {
        const hostProfile = await HostService.getCurrentUserHostProfile();
        setIsHost(!!hostProfile);
      } catch (error) {
        console.error("Failed to check host status:", error);
        setIsHost(false);
      }
    };
    check();
  }, [user]);

  const hostNavItem: NavigationItem = isHost
    ? {
        id: "manage-hosting",
        label: "נהל אירוח",
        icon: Calendar,
        href: "/manage-hosting",
      }
    : {
        id: "host",
        label: "פרסם אירוח",
        icon: Plus,
        href: "/host",
      };

  const navigationItems: NavigationItem[] = [
    {
      id: "home",
      label: "בית",
      icon: Home,
      href: "/",
    },
    {
      id: "messages",
      label: "הודעות",
      icon: MessageCircle,
      href: "/messages",
      badge: 5, // TODO: Get unread messages count
    },
    hostNavItem,
    {
      id: "profile",
      label: "פרופיל",
      icon: User,
      href: "/profile",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors ${
                  active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`h-6 w-6 ${
                      active ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
