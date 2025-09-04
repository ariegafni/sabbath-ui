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
import { HostingRequestService } from "@/service/HostingRequest";

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  showBadge?: boolean;
};

export default function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [hasNewHostingRequests, setHasNewHostingRequests] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setIsHost(false);
        setHasUnread(false);
        setHasNewHostingRequests(false);
        return;
      }
      try {
        const hostProfile = await HostService.getCurrentUserHostProfile().catch(() => null);
        setIsHost(!!hostProfile);

        const [unreadMessages, hostingRequests] = await Promise.all([
          ChatService.getUnreadCount().catch(() => 0),
          hostProfile
            ? HostingRequestService.getMyHostRequests({ status: "pending" }).catch(() => [])
            : Promise.resolve([]),
        ]);

        setHasUnread(unreadMessages > 0);
        setHasNewHostingRequests((hostingRequests?.length ?? 0) > 0);
      } catch {
        setIsHost(false);
        setHasUnread(false);
        setHasNewHostingRequests(false);
      }
    };
    check();

    const interval = setInterval(async () => {
      if (user) {
        try {
          const chatCount = await ChatService.getUnreadCount();
          setHasUnread(chatCount > 0);

          if (isHost) {
            const pendingRequests = await HostingRequestService.getMyHostRequests({
              status: "pending",
            });
            setHasNewHostingRequests((pendingRequests?.length ?? 0) > 0);
          }
        } catch {
          setHasUnread(false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, isHost]);

  const hostNavItem: NavigationItem = isHost
    ? {
        id: "manage-hosting",
        label: t("nav.manageHosting", { defaultValue: "נהל אירוח" }),
        icon: Calendar,
        href: "/manage-hosting",
        showBadge: hasNewHostingRequests, // יציג פלוס רק אם יש בקשות תלויות
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
      showBadge: hasUnread,
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
    if (href === "/") return pathname === "/";
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
                  <Icon className={`h-6 w-6 ${active ? "text-blue-600" : "text-gray-500"}`} />
                  {item.showBadge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3 flex items-center justify-center">
                      <Plus className="h-2 w-2 text-white stroke-[3]" />
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
