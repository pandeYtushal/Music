import { useEffect } from 'react';

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
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => { document.title = prev; };
  }, [title]);
};

export default useDocumentTitle;
