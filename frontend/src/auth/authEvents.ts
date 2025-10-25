// src/auth/authEvents.ts
export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout'
} as const;

export const emitAuthEvent = (eventName: keyof typeof AUTH_EVENTS) => {
  window.dispatchEvent(new CustomEvent(AUTH_EVENTS[eventName]));
};