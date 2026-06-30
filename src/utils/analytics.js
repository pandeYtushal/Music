import { logger } from './logger';

const isProd = import.meta.env.PROD;

export const analytics = {
  trackEvent: (eventName, params = {}) => {
    // In production, dispatch to analytics endpoints (like Google Analytics, Vercel Web Analytics, Mixpanel)
    if (isProd) {
      // Example:
      // if (window.gtag) window.gtag('event', eventName, params);
      // if (window.va) window.va.track(eventName, params);
      logger.info(`[Analytics Event] ${eventName}`, params);
    } else {
      logger.debug(`[Analytics Event]: "${eventName}"`, params);
    }
  },
  trackPageView: (pageName) => {
    if (isProd) {
      logger.info(`[Analytics Page View] ${pageName}`);
    } else {
      logger.debug(`[Analytics Page View]: "${pageName}"`);
    }
  }
};
