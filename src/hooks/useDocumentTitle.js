import { useEffect } from 'react';
import { analytics } from '../utils/analytics';

const BASE_TITLE = 'MeldMusic';

/**
 * Sets the document title while the component is mounted.
 * Resets to the base title on unmount.
 *
 * @param {string} title — page-specific title segment (e.g. "Search")
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    const finalTitle = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    document.title = finalTitle;
    
    // Dispatch page view to centralized production analytics
    analytics.trackPageView(title || 'Home');
    
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocumentTitle;
