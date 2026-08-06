// src/constants/api.ts
export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  PROFILE: {
    GET: '/api/profile',
    UPDATE: '/api/profile',
  },
  RESIDENTS: {
    BASE: '/api/residents',
    LIST: '/api/residents', // GET list (supports query params)
    DETAIL: (id: string) => `/api/residents/${id}`,
    CREATE: '/api/residents', // POST
    UPDATE: (id: string) => `/api/residents/${id}`,
    DELETE: (id: string) => `/api/residents/${id}`,
  },
  COMPLAINTS: {
    BASE: '/api/complaints',
    // future endpoints …
  },
  VISITORS: {
    BASE: '/api/visitors',
  },
  NOTICES: {
    BASE: '/api/notices',
  },
  BILLS: {
    BASE: '/api/bills',
  },
  PAYMENTS: {
    BASE: '/api/payments',
  },
  EMERGENCY_CONTACTS: {
    BASE: '/api/emergency-contacts',
  },
};
