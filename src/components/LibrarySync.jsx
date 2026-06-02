import { useEffect, useRef } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from '../store/useAuthStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { sanitizeLibrary } from '../utils/library';

const LibrarySync = () => {
  const user = useAuthStore(state => state.user);
  const favorites = usePlayerStore(state => state.favorites);
  const recentlyPlayed = usePlayerStore(state => state.recentlyPlayed);
  const playlists = usePlayerStore(state => state.playlists);
  const autoplay = usePlayerStore(state => state.autoplay);
  const shuffle = usePlayerStore(state => state.shuffle);
  const repeatMode = usePlayerStore(state => state.repeatMode);
  const quality = usePlayerStore(state => state.quality);
  const setLibraryFromCloud = usePlayerStore(state => state.setLibraryFromCloud);
  const loadedUserRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      loadedUserRef.current = null;
      return;
    }

    let cancelled = false;

    const loadLibrary = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'library', 'state');
        const snapshot = await getDoc(ref);
        if (cancelled) return;

        if (snapshot.exists()) {
          setLibraryFromCloud(sanitizeLibrary(snapshot.data()));
        }

        loadedUserRef.current = user.uid;
      } catch (error) {
        console.error('[Melody] Failed to load library from Firestore:', error);
        loadedUserRef.current = user.uid;
      }
    };

    loadLibrary();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user?.uid, setLibraryFromCloud]);

  useEffect(() => {
    if (!user?.uid || loadedUserRef.current !== user.uid) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'library', 'state');
        await setDoc(ref, {
          ...sanitizeLibrary({
            favorites,
            recentlyPlayed,
            playlists,
            autoplay,
            shuffle,
            repeatMode,
            quality,
          }),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (error) {
        console.error('[Melody] Failed to save library to Firestore:', error);
      }
    }, 3000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [user?.uid, favorites, recentlyPlayed, playlists, autoplay, shuffle, repeatMode, quality]);

  return null;
};

export default LibrarySync;
