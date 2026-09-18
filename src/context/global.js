import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from "react";
import {
    fetchAniList,
    POPULAR_ANIME_QUERY,
    AIRING_ANIME_QUERY,
    UPCOMING_ANIME_QUERY,
    SEARCH_ANIME_QUERY,
    normalizeAniListMedia
} from "../services/anilist";

const GlobalContext = createContext();

// Action Types
const LOADING = "LOADING";
const SEARCH = "SEARCH";
const CLEAR_SEARCH = "CLEAR_SEARCH";
const GET_POPULAR_ANIME = "GET_POPULAR_ANIME";
const GET_UPCOMING_ANIME = "GET_UPCOMING_ANIME";
const GET_AIRING_ANIME = "GET_AIRING_ANIME";
const GET_PICTURES = "GET_PICTURES";

// Resilient fallback catalog formatted to match the AniList normalized structure
const FALLBACK_POPULAR_ANIME = [
    {
        id: 154587,
        mal_id: 52991,
        title: "Frieren: Beyond Journey's End",
        title_english: "Frieren: Beyond Journey's End",
        title_romaji: "Sousou no Frieren",
        score: 9.3,
        type: "TV",
        episodes: 28,
        status: "Finished Airing",
        year: 2023,
        genres: [{ name: "Fantasy" }, { name: "Adventure" }, { name: "Drama" }],
        images: {
            jpg: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-573TGNQhA1p1.jpg" },
            webp: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-573TGNQhA1p1.jpg" }
        },
        bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-n2btaSMjhUOI.jpg"
    },
    {
        id: 5114,
        mal_id: 5114,
        title: "Fullmetal Alchemist: Brotherhood",
        title_english: "Fullmetal Alchemist: Brotherhood",
        title_romaji: "Hagane no Renkinjutsushi: Fullmetal Alchemist",
        score: 9.1,
        type: "TV",
        episodes: 64,
        status: "Finished Airing",
        year: 2009,
        genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1zYmMWWw9v1q.jpg" },
            webp: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-1zYmMWWw9v1q.jpg" }
        },
        bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/5114-p1e8iZp4yV8U.jpg"
    },
    {
        id: 9253,
        mal_id: 9253,
        title: "Steins;Gate",
        title_english: "Steins;Gate",
        title_romaji: "Steins;Gate",
        score: 9.0,
        type: "TV",
        episodes: 24,
        status: "Finished Airing",
        year: 2011,
        genres: [{ name: "Sci-Fi" }, { name: "Suspense" }, { name: "Drama" }],
        images: {
            jpg: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-e9bg5yZt4j2R.jpg" },
            webp: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-e9bg5yZt4j2R.jpg" }
        },
        bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/9253-eU4vWl3t4y3k.jpg"
    },
    {
        id: 101922,
        mal_id: 38000,
        title: "Demon Slayer: Kimetsu no Yaiba",
        title_english: "Demon Slayer: Kimetsu no Yaiba",
        title_romaji: "Kimetsu no Yaiba",
        score: 8.5,
        type: "TV",
        episodes: 26,
        status: "Finished Airing",
        year: 2019,
        genres: [{ name: "Action" }, { name: "Fantasy" }, { name: "Supernatural" }],
        images: {
            jpg: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTDYeaInitialize.jpg" },
            webp: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTDYeaInitialize.jpg" }
        },
        bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YATy0mFs4p1c.jpg"
    },
    {
        id: 113415,
        mal_id: 40748,
        title: "JUJUTSU KAISEN",
        title_english: "JUJUTSU KAISEN",
        title_romaji: "Jujutsu Kaisen",
        score: 8.6,
        type: "TV",
        episodes: 24,
        status: "Finished Airing",
        year: 2020,
        genres: [{ name: "Action" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pwa30n.jpg" },
            webp: { large_image_url: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pwa30n.jpg" }
        },
        bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQGo780nneInitialize.jpg"
    }
];

// Helper: Query with in-memory / sessionStorage cache
const cachedFetch = async (cacheKey, queryFn) => {
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {}

    try {
        const result = await queryFn();
        if (result && Array.isArray(result) && result.length > 0) {
            try {
                sessionStorage.setItem(cacheKey, JSON.stringify(result));
            } catch {}
            return result;
        }
    } catch (err) {
        console.error(`[AniList Query Error] for ${cacheKey}:`, err);
    }
    return null;
};

// Reducer
const reducer = (state, action) => {
    switch (action.type) {
        case LOADING:
            return { ...state, loading: true };
        case GET_POPULAR_ANIME:
            return {
                ...state,
                popularAnime: action.payload && action.payload.length > 0 ? action.payload : FALLBACK_POPULAR_ANIME,
                loading: false,
                isSearch: false
            };
        case SEARCH:
            return {
                ...state,
                searchResults: action.payload || [],
                isSearch: true,
                loading: false
            };
        case CLEAR_SEARCH:
            return {
                ...state,
                searchResults: [],
                isSearch: false,
                loading: false
            };
        case GET_UPCOMING_ANIME:
            return {
                ...state,
                upcomingAnime: action.payload && action.payload.length > 0 ? action.payload : state.upcomingAnime,
                loading: false,
                isSearch: false
            };
        case GET_AIRING_ANIME:
            return {
                ...state,
                airingAnime: action.payload && action.payload.length > 0 ? action.payload : state.airingAnime,
                loading: false,
                isSearch: false
            };
        case GET_PICTURES:
            return { ...state, pictures: action.payload || [], loading: false };
        default:
            return state;
    }
};

export const GlobalContextProvider = ({ children }) => {
    const initialState = {
        popularAnime: FALLBACK_POPULAR_ANIME,
        upcomingAnime: [],
        airingAnime: [],
        pictures: [],
        isSearch: false,
        searchResults: [],
        loading: false,
    };

    const [state, dispatch] = useReducer(reducer, initialState);
    const [search, setSearch] = useState('');

    // Handle input change
    const handleChange = (e) => {
        setSearch(e.target.value);
        if (e.target.value === '') {
            dispatch({ type: CLEAR_SEARCH });
        }
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (search.trim()) {
            searchAnime(search.trim());
        } else {
            dispatch({ type: CLEAR_SEARCH });
        }
    };

    // Fetch popular anime from AniList
    const getPopularAnime = useCallback(async () => {
        dispatch({ type: LOADING });
        const data = await cachedFetch('anilist_popular_feed', async () => {
            const res = await fetchAniList(POPULAR_ANIME_QUERY, { page: 1, perPage: 24 });
            const mediaList = res?.Page?.media || [];
            return mediaList.map(normalizeAniListMedia);
        });

        dispatch({
            type: GET_POPULAR_ANIME,
            payload: data || FALLBACK_POPULAR_ANIME
        });
    }, []);

    // Fetch upcoming anime from AniList
    const getUpcomingAnime = useCallback(async () => {
        dispatch({ type: LOADING });
        const data = await cachedFetch('anilist_upcoming_feed', async () => {
            const res = await fetchAniList(UPCOMING_ANIME_QUERY, { page: 1, perPage: 24 });
            const mediaList = res?.Page?.media || [];
            return mediaList.map(normalizeAniListMedia);
        });

        dispatch({
            type: GET_UPCOMING_ANIME,
            payload: data || []
        });
    }, []);

    // Fetch airing anime from AniList
    const getAiringAnime = useCallback(async () => {
        dispatch({ type: LOADING });
        const data = await cachedFetch('anilist_airing_feed', async () => {
            const res = await fetchAniList(AIRING_ANIME_QUERY, { page: 1, perPage: 24 });
            const mediaList = res?.Page?.media || [];
            return mediaList.map(normalizeAniListMedia);
        });

        dispatch({
            type: GET_AIRING_ANIME,
            payload: data || []
        });
    }, []);

    // Search anime on AniList
    const searchAnime = useCallback(async (queryStr) => {
        if (!queryStr || !queryStr.trim()) return;
        dispatch({ type: LOADING });
        try {
            const res = await fetchAniList(SEARCH_ANIME_QUERY, { search: queryStr.trim(), page: 1, perPage: 24 });
            const mediaList = res?.Page?.media || [];
            const normalized = mediaList.map(normalizeAniListMedia);
            dispatch({ type: SEARCH, payload: normalized });
        } catch (err) {
            console.error('[AniList Search Error]:', err);
            dispatch({ type: SEARCH, payload: [] });
        }
    }, []);

    // Get pictures compatibility
    const getAnimePictures = useCallback(async (id) => {
        dispatch({ type: LOADING });
        dispatch({ type: GET_PICTURES, payload: [] });
    }, []);

    // Initial render: Fetch popular and airing
    useEffect(() => {
        getPopularAnime();
        const timer = setTimeout(() => {
            getAiringAnime();
        }, 300);
        return () => clearTimeout(timer);
    }, [getPopularAnime, getAiringAnime]);

    return (
        <GlobalContext.Provider value={{
            ...state,
            handleChange,
            handleSubmit,
            searchAnime,
            search,
            getPopularAnime,
            getUpcomingAnime,
            getAiringAnime,
            getAnimePictures,
            dispatch
        }}>
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};