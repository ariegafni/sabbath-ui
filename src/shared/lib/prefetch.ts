import { queryClient } from "./queryClient";

class PrefetchManager {
  private prefetchQueue: Set<string> = new Set();
  private isIdle = true;
  private idleTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Listen for user activity to determine idle state
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, this.handleActivity, true);
      });

      // Check for idle state every 2 seconds
      this.startIdleCheck();
    }
  }

  private handleActivity = () => {
    this.isIdle = false;
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    // Consider idle after 1 second of no activity
    this.idleTimer = setTimeout(() => {
      this.isIdle = true;
      this.processPrefetchQueue();
    }, 1000);
  };

  private startIdleCheck() {
    // Initial idle state after 2 seconds
    this.idleTimer = setTimeout(() => {
      this.isIdle = true;
      this.processPrefetchQueue();
    }, 2000);
  }

  // Queue prefetch operations to run during idle time
  queuePrefetch(queryKey: string[], queryFn: () => Promise<any>, options: { staleTime?: number } = {}) {
    const key = JSON.stringify(queryKey);
    
    if (this.prefetchQueue.has(key)) return;
    this.prefetchQueue.add(key);

    if (this.isIdle) {
      this.executePrefetch(queryKey, queryFn, options);
      this.prefetchQueue.delete(key);
    }
  }

  private processPrefetchQueue() {
    if (!this.isIdle) return;

    // Process prefetch queue with slight delays to avoid blocking
    Array.from(this.prefetchQueue).forEach((keyStr, index) => {
      setTimeout(() => {
        if (this.isIdle && this.prefetchQueue.has(keyStr)) {
          // We need to store the queryFn somehow - let's refactor this approach
          this.prefetchQueue.delete(keyStr);
        }
      }, index * 100); // Stagger prefetches by 100ms
    });
  }

  private async executePrefetch(queryKey: string[], queryFn: () => Promise<any>, options: { staleTime?: number }) {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options.staleTime || 5 * 60 * 1000,
      });
    } catch (error) {
      console.warn('Prefetch failed for:', queryKey, error);
    }
  }

  // Prefetch critical user data
  async prefetchUserData(userId: string) {
    if (!userId || !this.isIdle) return;

    const prefetches = [
      // Host profile
      {
        queryKey: ['host-profile', userId],
        queryFn: async () => {
          const { HostService } = await import('@/service/host');
          return HostService.getCurrentUserHostProfile();
        },
      },
      // User profile data
      {
        queryKey: ['user-profile', userId],
        queryFn: async () => {
          const { UserService } = await import('@/service');
          return UserService.getCurrentUser();
        },
      },
    ];

    // Execute prefetches with delays
    for (const [index, prefetch] of prefetches.entries()) {
      if (!this.isIdle) break;
      
      setTimeout(async () => {
        if (this.isIdle) {
          await this.executePrefetch(prefetch.queryKey, prefetch.queryFn, { staleTime: 10 * 60 * 1000 });
        }
      }, index * 200);
    }
  }

  // Prefetch navigation-related data
  async prefetchNavigationData(userId: string) {
    if (!userId || !this.isIdle) return;

    const prefetches = [
      // Unread count for messages
      {
        queryKey: ['unread-count', userId],
        queryFn: async () => {
          const { ChatService } = await import('@/service');
          return ChatService.getUnreadCount();
        },
        staleTime: 2 * 60 * 1000,
      },
      // Hosting requests
      {
        queryKey: ['pending-hosting-requests', userId],
        queryFn: async () => {
          const { HostingRequestService } = await import('@/service/HostingRequest');
          return HostingRequestService.getMyHostRequests({ status: "pending" });
        },
        staleTime: 5 * 60 * 1000,
      },
      // Countries list (for home page)
      {
        queryKey: ['countries'],
        queryFn: async () => {
          const { LocationService } = await import('@/service');
          return LocationService.getCountriesWithHosts();
        },
        staleTime: 30 * 60 * 1000,
      },
      // Conversations list (for messages page)
      {
        queryKey: ['conversations', userId],
        queryFn: async () => {
          const { ChatService } = await import('@/service');
          return ChatService.getConversations();
        },
        staleTime: 5 * 60 * 1000,
      },
      // My hosting requests (for personal area)
      {
        queryKey: ['my-hosting-requests', userId],
        queryFn: async () => {
          const { HostingRequestService } = await import('@/service/HostingRequest');
          return HostingRequestService.getMyHostRequests({});
        },
        staleTime: 10 * 60 * 1000,
      },
    ];

    // Execute with delays
    for (const [index, prefetch] of prefetches.entries()) {
      if (!this.isIdle) break;
      
      setTimeout(async () => {
        if (this.isIdle) {
          await this.executePrefetch(prefetch.queryKey, prefetch.queryFn, { staleTime: prefetch.staleTime });
        }
      }, index * 400); // Increased delay between prefetches
    }
  }

  destroy() {
    if (typeof window !== 'undefined') {
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        window.removeEventListener(event, this.handleActivity, true);
      });
    }
    
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
  }
}

export const prefetchManager = new PrefetchManager();