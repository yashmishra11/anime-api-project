import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
    fetchAniList,
    VIEWER_QUERY,
    USER_WATCHLIST_QUERY,
    SAVE_MEDIA_LIST_ENTRY_MUTATION,
    DELETE_MEDIA_LIST_ENTRY_MUTATION,
    normalizeAniListMedia
} from '../services/anilist';

const AuthContext = createContext();

const STORAGE_TOKEN_KEY = 'anilist_access_token';
const STORAGE_CLIENT_ID_KEY = 'anilist_client_id';

export const AuthProvider = ({ children }) => {
    // 1. Client ID resolution (from .env or localStorage override)
    const [clientId, setClientIdState] = useState(() => {
        return process.env.REACT_APP_ANILIST_CLIENT_ID || localStorage.getItem(STORAGE_CLIENT_ID_KEY) || '';
    });

    const setClientId = (id) => {
        const cleanId = id ? String(id).trim() : '';
        setClientIdState(cleanId);
        if (cleanId) {
            localStorage.setItem(STORAGE_CLIENT_ID_KEY, cleanId);
        } else {
            localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
        }
    };

    // 2. Token extraction (from URL hash on OAuth redirect, or localStorage)
    const [token, setToken] = useState(() => {
        // Check hash first
        if (typeof window !== 'undefined' && window.location.hash) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const hashToken = params.get('access_token');
            if (hashToken) {
                localStorage.setItem(STORAGE_TOKEN_KEY, hashToken);
                // Clean hash from URL without page reload
                window.history.replaceState(null, null, window.location.pathname + window.location.search);
                return hashToken;
            }
        }
        return localStorage.getItem(STORAGE_TOKEN_KEY) || null;
    });

    const [user, setUser] = useState(null);
    const [userWatchlist, setUserWatchlist] = useState({}); // Map: mediaId -> entry
    const [watchlistList, setWatchlistList] = useState([]); // Array of normalized entries
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingWatchlist, setLoadingWatchlist] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // 3. User & Watchlist Fetcher
    const loadUserData = useCallback(async (authToken) => {
        if (!authToken) {
            setUser(null);
            setUserWatchlist({});
            setWatchlistList([]);
            return;
        }

        setLoadingUser(true);
        try {
            // Fetch Viewer Profile
            const viewerData = await fetchAniList(VIEWER_QUERY, {}, authToken);
            if (viewerData?.Viewer) {
                setUser(viewerData.Viewer);

                // Fetch User Watchlist
                setLoadingWatchlist(true);
                try {
                    const listData = await fetchAniList(
                        USER_WATCHLIST_QUERY,
                        { userId: viewerData.Viewer.id },
                        authToken
                    );

                    const map = {};
                    const array = [];

                    if (listData?.MediaListCollection?.lists) {
                        for (const list of listData.MediaListCollection.lists) {
                            if (Array.isArray(list.entries)) {
                                for (const entry of list.entries) {
                                    const normMedia = normalizeAniListMedia(entry.media);
                                    const formattedEntry = {
                                        id: entry.id,
                                        mediaId: entry.mediaId,
                                        status: entry.status,
                                        score: entry.score,
                                        progress: entry.progress,
                                        updatedAt: entry.updatedAt,
                                        media: normMedia
                                    };
                                    map[entry.mediaId] = formattedEntry;
                                    array.push(formattedEntry);
                                }
                            }
                        }
                    }

                    setUserWatchlist(map);
                    setWatchlistList(array);
                } catch (listErr) {
                    console.error('[AniList] Error fetching user watchlist:', listErr);
                } finally {
                    setLoadingWatchlist(false);
                }
            }
        } catch (err) {
            console.error('[AniList] Error fetching viewer profile:', err);
            // If token expired or unauthorized, logout
            if (err.message && (err.message.includes('401') || err.message.includes('Invalid token') || err.message.includes('expired'))) {
                logout();
            }
        } finally {
            setLoadingUser(false);
        }
    }, []);

    // Run on initial mount or token change
    useEffect(() => {
        if (token) {
            loadUserData(token);
        }
    }, [token, loadUserData]);

    // 4. OAuth Login action
    const login = () => {
        if (!clientId) {
            setIsConfigModalOpen(true);
            return;
        }

        // Implicit grant redirect: AniList redirects back to current origin with #access_token=...
        const redirectUri = window.location.origin;
        const authUrl = `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
        window.location.href = authUrl;
    };

    // 5. Logout action
    const logout = () => {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        setToken(null);
        setUser(null);
        setUserWatchlist({});
        setWatchlistList([]);
    };

    // 6. Add or Update Entry in Watchlist
    const updateEntry = async (mediaId, status, progress = null, score = null, mediaInfo = null) => {
        if (!token) {
            login();
            return false;
        }

        const idNum = Number(mediaId);
        const prevEntry = userWatchlist[idNum];

        // Optimistic update
        const optimisticEntry = {
            id: prevEntry?.id || Date.now(),
            mediaId: idNum,
            status,
            progress: progress !== null ? progress : prevEntry?.progress || 0,
            score: score !== null ? score : prevEntry?.score || 0,
            media: mediaInfo ? (mediaInfo.raw ? mediaInfo : normalizeAniListMedia(mediaInfo)) : prevEntry?.media || null
        };

        setUserWatchlist((prev) => ({
            ...prev,
            [idNum]: optimisticEntry
        }));

        setWatchlistList((prev) => {
            const exists = prev.some((e) => Number(e.mediaId) === idNum);
            if (exists) {
                return prev.map((e) => (Number(e.mediaId) === idNum ? optimisticEntry : e));
            }
            return [optimisticEntry, ...prev];
        });

        try {
            const data = await fetchAniList(
                SAVE_MEDIA_LIST_ENTRY_MUTATION,
                {
                    mediaId: idNum,
                    status,
                    ...(score !== null ? { score } : {}),
                    ...(progress !== null ? { progress } : {})
                },
                token
            );

            const saved = data?.SaveMediaListEntry;
            if (saved) {
                const confirmedEntry = {
                    ...optimisticEntry,
                    id: saved.id,
                    status: saved.status,
                    score: saved.score,
                    progress: saved.progress,
                    updatedAt: saved.updatedAt
                };

                setUserWatchlist((prev) => ({
                    ...prev,
                    [idNum]: confirmedEntry
                }));

                setWatchlistList((prev) =>
                    prev.map((e) => (Number(e.mediaId) === idNum ? confirmedEntry : e))
                );
            }
            return true;
        } catch (err) {
            console.error('[AniList] Error saving watchlist entry:', err);
            // Revert on error
            if (prevEntry) {
                setUserWatchlist((prev) => ({ ...prev, [idNum]: prevEntry }));
                setWatchlistList((prev) => prev.map((e) => (Number(e.mediaId) === idNum ? prevEntry : e)));
            } else {
                setUserWatchlist((prev) => {
                    const copy = { ...prev };
                    delete copy[idNum];
                    return copy;
                });
                setWatchlistList((prev) => prev.filter((e) => Number(e.mediaId) !== idNum));
            }
            throw err;
        }
    };

    // 7. Remove Entry from Watchlist
    const removeEntry = async (mediaId) => {
        if (!token) return false;

        const idNum = Number(mediaId);
        const existingEntry = userWatchlist[idNum];
        if (!existingEntry || !existingEntry.id) return false;

        // Optimistic removal
        setUserWatchlist((prev) => {
            const copy = { ...prev };
            delete copy[idNum];
            return copy;
        });
        setWatchlistList((prev) => prev.filter((e) => Number(e.mediaId) !== idNum));

        try {
            await fetchAniList(
                DELETE_MEDIA_LIST_ENTRY_MUTATION,
                { id: existingEntry.id },
                token
            );
            return true;
        } catch (err) {
            console.error('[AniList] Error deleting watchlist entry:', err);
            // Revert
            setUserWatchlist((prev) => ({ ...prev, [idNum]: existingEntry }));
            setWatchlistList((prev) => [existingEntry, ...prev]);
            throw err;
        }
    };

    // Helper to get status of a media item
    const getMediaStatus = (mediaId) => {
        if (!mediaId) return null;
        const entry = userWatchlist[Number(mediaId)];
        return entry ? entry.status : null;
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                clientId,
                setClientId,
                login,
                logout,
                userWatchlist,
                watchlistList,
                loadingUser,
                loadingWatchlist,
                updateEntry,
                removeEntry,
                getMediaStatus,
                isConfigModalOpen,
                setIsConfigModalOpen,
                refreshWatchlist: () => loadUserData(token)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
