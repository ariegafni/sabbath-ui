import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { HostService, ChatService, HostingRequestService } from "@/service";
import { useAuth } from "@/Providers/AuthProvider";

export function useHostProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['host-profile', user?.id],
    queryFn: () => HostService.getCurrentUserHostProfile(),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Host profile rarely changes, cache for 10 minutes
  });
}

export function useUnreadCount() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: ChatService.getUnreadCount,
    enabled: !!user,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes instead of 30 seconds
  });
}

export function usePendingHostingRequests() {
  const { user } = useAuth();
  const { data: hostProfile } = useHostProfile();
  
  return useQuery({
    queryKey: ['pending-hosting-requests', user?.id],
    queryFn: () => HostingRequestService.getMyHostRequests({ status: "pending" }),
    enabled: !!user && !!hostProfile,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
    select: (data) => (data?.length ?? 0) > 0, // Transform to boolean
  });
}

export function useMessages(conversationId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { ChatService } = await import("@/service");
      const data = await ChatService.getMessages(conversationId);
      // Remove duplicates
      return data.filter(
        (message, index, self) =>
          index === self.findIndex((m) => m.id === message.id)
      );
    },
    enabled: !!user && !!conversationId,
    staleTime: 1 * 60 * 1000, // Messages are more dynamic, cache for 1 minute
  });
}

export function useUserProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      const { UserService } = await import("@/service");
      return UserService.getCurrentUser();
    },
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // User profile rarely changes
  });
}

// Countries and hosts data hooks
export function useCountries() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const { LocationService } = await import("@/service");
      
      // Get countries with hosts data
      const countriesWithHosts = await LocationService.getCountriesWithHosts();
      
      // Transform to base countries for name resolution
      const baseCountries = countriesWithHosts.map((c) => ({
        place_id: c.country_place_id,
        name: "",
      }));
      
      // Resolve country names using Google Maps (if needed)
      let namedCountries = baseCountries;
      try {
        // Only resolve names if Google Maps is available
        if (typeof window !== 'undefined') {
          namedCountries = await resolveCountryNames(baseCountries);
        }
      } catch (error) {
        console.warn("Could not resolve country names:", error);
        // Continue with base countries if name resolution fails
      }
      
      // Enrich with hosts data
      const enrichedCountries = namedCountries.map((c) => {
        const bucket = countriesWithHosts.find(
          (b) => b.country_place_id === c.place_id
        );
        const hosts = bucket?.hosts || [];
        return { 
          ...c, 
          hosts, 
          host_count: hosts.length,
          display_name: (c as any).display_name || c.name || `Country ${c.place_id}`,
        };
      });
      
      return enrichedCountries;
    },
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // Countries rarely change, cache for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
}

// Helper function to resolve country names
async function resolveCountryNames(items: any[]) {
  return new Promise<any[]>((resolve) => {
    // Load Google Maps if not already loaded
    const loadGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        return Promise.resolve();
      }
      return new Promise<void>((res) => {
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=he`;
        s.async = true;
        s.onload = () => res();
        s.onerror = () => res(); // Continue even if Google Maps fails to load
        document.body.appendChild(s);
      });
    };

    loadGoogle().then(() => {
      if (!(window as any).google?.maps?.places) {
        // Return original items if Google Maps is not available
        resolve(items.map(item => ({ ...item, display_name: item.name || `Country ${item.place_id}` })));
        return;
      }

      const service = new (window as any).google.maps.places.PlacesService(
        document.createElement("div")
      );

      const getName = (place_id: string): Promise<string> =>
        new Promise((res) => {
          service.getDetails(
            {
              placeId: place_id,
              fields: ["address_components", "formatted_address"],
            },
            (place: any, status: any) => {
              if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
                const countryComponent = place.address_components?.find(
                  (comp: any) => comp.types.includes("country")
                );
                res(countryComponent?.long_name || place.formatted_address || `Country ${place_id}`);
              } else {
                res(`Country ${place_id}`);
              }
            }
          );
        });

      Promise.all(items.map((c) => getName(c.place_id))).then(names => {
        const namedCountries = items.map((c, i) => ({ 
          ...c, 
          display_name: names[i] 
        }));
        resolve(namedCountries);
      });
    });
  });
}

export function useHosts(countryPlaceId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['hosts', countryPlaceId],
    queryFn: async () => {
      if (!countryPlaceId) return [];
      const { HostService } = await import("@/service/host");
      return HostService.getHostsByCountry(countryPlaceId);
    },
    enabled: !!user && !!countryPlaceId,
    staleTime: 15 * 60 * 1000, // Hosts data cache for 15 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
}

// Conversations and chat data hooks
export function useConversations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      const { ChatService } = await import("@/service");
      return ChatService.getConversations();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Conversations change more frequently, 5 minutes cache
    refetchInterval: 10 * 60 * 1000, // Auto-refetch every 10 minutes
  });
}

export function useConversation(conversationId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { ChatService } = await import("@/service");
      return ChatService.getConversation(conversationId);
    },
    enabled: !!user && !!conversationId,
    staleTime: 2 * 60 * 1000, // Individual conversation cache for 2 minutes
  });
}

// Hosting requests data hooks
export function useMyHostingRequests(filters?: any) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-hosting-requests', user?.id, filters],
    queryFn: async () => {
      const { HostingRequestService } = await import("@/service/HostingRequest");
      return HostingRequestService.getMyGuestRequests(filters);
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // Hosting requests cache for 10 minutes
    refetchInterval: 15 * 60 * 1000, // Auto-refetch every 15 minutes
  });
}

export function useMyHostingRequestsAsHost(filters?: any) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-hosting-requests-as-host', user?.id, filters],
    queryFn: async () => {
      const { HostingRequestService } = await import("@/service/HostingRequest");
      return HostingRequestService.getMyHostRequests(filters || {});
    },
    enabled: !!user,
    staleTime: 8 * 60 * 1000, // Host requests cache for 8 minutes
    refetchInterval: 12 * 60 * 1000, // Auto-refetch every 12 minutes
  });
}

// Hook to automatically prefetch critical data during idle time
export function usePrefetchManager() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.id) return;
    
    const prefetchData = async () => {
      const { prefetchManager } = await import("./prefetch");
      
      // Prefetch user-related data first
      await prefetchManager.prefetchUserData(user.id);
      
      // Then prefetch navigation data
      setTimeout(() => {
        prefetchManager.prefetchNavigationData(user.id);
      }, 1000);
    };
    
    // Start prefetching after component mounts
    const timer = setTimeout(prefetchData, 2000);
    
    return () => clearTimeout(timer);
  }, [user?.id]);
}