"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Home,
  User,
  Plus,
  Calendar,
  Briefcase,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/Providers/AuthProvider";
import { HostService, ChatService } from "@/service";

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
  const [unreadCount, setUnreadCount] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsHost(false);
        setUnreadCount(0);
        return;
      }
      try {
        const [hostProfile, unreadMessages] = await Promise.all([
          HostService.getCurrentUserHostProfile().catch(() => null),
          ChatService.getUnreadCount().catch((error) => {
            console.warn("Chat service not available:", error.message);
            return 0;
          })
        ]);
        
        setIsHost(!!hostProfile);
        setUnreadCount(unreadMessages);
      } catch (error) {
        console.error("Failed to check status:", error);
        setIsHost(false);
        setUnreadCount(0);
      }
    };
    check();

    // Update unread count every 30 seconds
    const interval = setInterval(async () => {
      if (user) {
        try {
          const chatCount = await ChatService.getUnreadCount();
          setUnreadCount(chatCount);
        } catch (error) {
          console.warn("Chat service not available for unread count update:", (error as Error).message);
          setUnreadCount(0);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const hostNavItem: NavigationItem = isHost
    ? {
        id: "manage-hosting",
        label: t("nav.manageHosting", { defaultValue: "נהל אירוח" }),
        icon: Calendar,
        href: "/manage-hosting",
      }
    : {
        id: "host",
        label: t("nav.publish", { defaultValue: "פרסם אירוח" }),
        icon: Plus,
        href: "/host",
      };

  const navigationItems: NavigationItem[] = [
    {
      id: "home",
      label: t("nav.home"),
      icon: Home,
      href: "/",
    },
    {
      id: "personal-area",
      label: t("nav.myRequests", { defaultValue: "הבקשות שלי" }),
      icon: Briefcase,
      href: "/personal-area",
    },
    {
      id: "messages",
      label: t("nav.messages", { defaultValue: "הודעות" }),
      icon: MessageCircle,
      href: "/messages",
      badge: unreadCount,
    },
    hostNavItem,
    {
      id: "profile",
      label: t("nav.profile", { defaultValue: "פרופיל" }),
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
