"use client";

import { useMemo } from "react";
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
import { useHostProfile, useUnreadCount, usePendingHostingRequests } from "@/shared/lib/hooks";
import { queryClient } from "@/shared/lib/queryClient";

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
  const { t } = useTranslation();
  
  // Use React Query hooks instead of manual state management
  const { data: hostProfile } = useHostProfile();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: hasNewHostingRequests = false } = usePendingHostingRequests();
  
  const isHost = !!hostProfile;
  const hasUnread = unreadCount > 0;


  const hostNavItem: NavigationItem = useMemo(() => isHost
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
      }, [isHost, hasNewHostingRequests, t]);

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

  // Prefetch page data on hover/focus for instant navigation
  const handlePrefetch = async (href: string) => {
    if (!user?.id) return;

    try {
      // Prefetch route-specific data based on path
      if (href === "/profile") {
        // Prefetch user profile data
        queryClient.prefetchQuery({
          queryKey: ['user-profile', user.id],
          queryFn: async () => {
            const { UserService } = await import("@/service");
            return UserService.getCurrentUser();
          },
          staleTime: 15 * 60 * 1000,
        });
        
        // Also prefetch host profile if user might be a host
        queryClient.prefetchQuery({
          queryKey: ['host-profile', user.id],
          queryFn: async () => {
            const { HostService } = await import("@/service/host");
            return HostService.getCurrentUserHostProfile();
          },
          staleTime: 10 * 60 * 1000,
        });
      } else if (href === "/messages") {
        // Prefetch conversations list
        queryClient.prefetchQuery({
          queryKey: ['conversations', user.id],
          queryFn: async () => {
            const { ChatService } = await import("@/service");
            return ChatService.getConversations();
          },
          staleTime: 5 * 60 * 1000,
        });
      } else if (href === "/manage-hosting") {
        // Prefetch host requests data
        queryClient.prefetchQuery({
          queryKey: ['my-hosting-requests-as-host', user.id],
          queryFn: async () => {
            const { HostingRequestService } = await import("@/service/HostingRequest");
            return HostingRequestService.getMyHostRequests({});
          },
          staleTime: 8 * 60 * 1000,
        });
      } else if (href === "/personal-area") {
        // Prefetch my requests data
        queryClient.prefetchQuery({
          queryKey: ['my-hosting-requests', user.id],
          queryFn: async () => {
            const { HostingRequestService } = await import("@/service/HostingRequest");
            return HostingRequestService.getMyHostRequests({});
          },
          staleTime: 10 * 60 * 1000,
        });
      } else if (href === "/") {
        // Prefetch countries list for home page
        queryClient.prefetchQuery({
          queryKey: ['countries'],
          queryFn: async () => {
            const { LocationService } = await import("@/service");
            return LocationService.getCountriesWithHosts();
          },
          staleTime: 30 * 60 * 1000,
        });
      }
    } catch (error) {
      // Silently fail prefetch attempts
      console.warn('Prefetch failed for:', href, error);
    }
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
                onMouseEnter={() => handlePrefetch(item.href)}
                onFocus={() => handlePrefetch(item.href)}
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
