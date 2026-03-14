// Umami track helper
// umami er globalt tilgængelig via scriptet i <head>

export const trackEvent = (eventName: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(eventName, data);
  }
};
