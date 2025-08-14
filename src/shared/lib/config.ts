// קונפיגורציה של האפליקציה
export const config = {
  // Base URL של ה-backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002",

  // Endpoints של ה-API
  API_ENDPOINTS: {
    AUTH: {
      REGISTER: "/register",
      LOGIN: "/login",
      LOGOUT: "/logout",
      REFRESH: "/refresh",
      VERIFY_EMAIL: "/verify-email",
      FORGOT_PASSWORD: "/forgot-password",
      RESET_PASSWORD: "/reset-password",
      GOOGLE: "/google",
      FACEBOOK: "/facebook",
    },
    USER: {
      PROFILE: "/user/profile",
      UPDATE: "/user/update",
      DELETE: "/user/delete",
    },
    LOCATION: {
      COUNTRIES: "/countries",
      CITIES: "/cities",
      SEARCH: "/search",
      GEOCODE: "/geocode",
      REVERSE_GEOCODE: "/reverse-geocode",
      NEARBY: "/nearby",
      POPULAR: "/popular",
      AUTOCOMPLETE: "/autocomplete",
    },
    PARSHA: {
      CURRENT: "/parsha/current",
      BY_DATE: "/parsha/by-date",
      BY_YEAR: "/parsha/by-year",
      NEXT: "/parsha/next",
      PREVIOUS: "/parsha/previous",
      RANGE: "/parsha/range",
      HOLIDAYS: "/parsha/holidays",
      SEARCH: "/parsha/search",
    },
    HOST: {
      CREATE: "/host/create",
      UPDATE: "/host/update",
      DELETE: "/host/delete",
      GET: "/host/get",
      LIST: "/host/list",
    },
    GUEST: {
      CREATE: "/guest/create",
      UPDATE: "/guest/update",
      DELETE: "/guest/delete",
      GET: "/guest/get",
      LIST: "/guest/list",
    },
    HOSTING_REQUEST: {
      CREATE: "/hosting-request/create",
      UPDATE: "/hosting-request/update",
      DELETE: "/hosting-request/delete",
      GET: "/hosting-request/get",
      LIST: "/hosting-request/list",
      ACCEPT: "/hosting-request/accept",
      REJECT: "/hosting-request/reject",
    },
  },
};

// פונקציה ליצירת URL מלא
export const createApiUrl = (endpoint: string): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// פונקציה ליצירת URL של endpoint ספציפי
export const getApiUrl = (
  category: keyof typeof config.API_ENDPOINTS,
  endpoint: string
): string => {
  const categoryEndpoints = config.API_ENDPOINTS[category];
  if (categoryEndpoints && endpoint in categoryEndpoints) {
    return createApiUrl(
      categoryEndpoints[endpoint as keyof typeof categoryEndpoints]
    );
  }
  throw new Error(`Endpoint ${endpoint} not found in category ${category}`);
};
