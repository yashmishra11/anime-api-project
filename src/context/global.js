import React, { createContext, useContext, useReducer } from "react";

const GlobalContext = createContext();

const baseUrl = "https://api.jikan.moe/v4";

// Actions
const LOADING = "LOADING";
const SEARCH = "SEARCH";
const CLEAR_SEARCH = "CLEAR_SEARCH";
const GET_POPULAR_ANIME = "GET_POPULAR_ANIME";
const GET_UPCOMING_ANIME = "GET_UPCOMING_ANIME";
const GET_AIRING_ANIME = "GET_AIRING_ANIME";
const GET_PICTURES = "GET_PICTURES";

// High-fidelity fallback catalog so the grid and sidebar are never empty if Jikan rate-limits
const FALLBACK_POPULAR_ANIME = [
    {
        mal_id: 52991,
        title: "Sousou no Frieren",
        title_english: "Frieren: Beyond Journey's End",
        score: 9.26,
        type: "TV",
        episodes: 28,
        status: "Finished Airing",
        year: 2023,
        genres: [{ name: "Fantasy" }, { name: "Adventure" }, { name: "Drama" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1015/138006l.webp" }
        }
    },
    {
        mal_id: 5114,
        title: "Fullmetal Alchemist: Brotherhood",
        title_english: "Fullmetal Alchemist: Brotherhood",
        score: 9.11,
        type: "TV",
        episodes: 64,
        status: "Finished Airing",
        year: 2009,
        genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1208/94745l.webp" }
        }
    },
    {
        mal_id: 9253,
        title: "Steins;Gate",
        title_english: "Steins;Gate",
        score: 9.07,
        type: "TV",
        episodes: 24,
        status: "Finished Airing",
        year: 2011,
        genres: [{ name: "Sci-Fi" }, { name: "Suspense" }, { name: "Drama" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1935/127974l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1935/127974l.webp" }
        }
    },
    {
        mal_id: 28977,
        title: "Gintama°",
        title_english: "Gintama Season 4",
        score: 9.05,
        type: "TV",
        episodes: 51,
        status: "Finished Airing",
        year: 2015,
        genres: [{ name: "Comedy" }, { name: "Action" }, { name: "Sci-Fi" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/3/72078l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/3/72078l.webp" }
        }
    },
    {
        mal_id: 1535,
        title: "Death Note",
        title_english: "Death Note",
        score: 8.62,
        type: "TV",
        episodes: 37,
        status: "Finished Airing",
        year: 2006,
        genres: [{ name: "Suspense" }, { name: "Supernatural" }, { name: "Mystery" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453l.webp" }
        }
    },
    {
        mal_id: 43608,
        title: "Kaguya-sama wa Kokurasetai: Ultra Romantic",
        title_english: "Kaguya-sama: Love is War - Ultra Romantic",
        score: 9.02,
        type: "TV",
        episodes: 13,
        status: "Finished Airing",
        year: 2022,
        genres: [{ name: "Romance" }, { name: "Comedy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1160/122627l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1160/122627l.webp" }
        }
    },
    {
        mal_id: 11061,
        title: "Hunter x Hunter (2011)",
        title_english: "Hunter x Hunter",
        score: 9.03,
        type: "TV",
        episodes: 148,
        status: "Finished Airing",
        year: 2011,
        genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1337/99013l.webp" }
        }
    },
    {
        mal_id: 16498,
        title: "Shingeki no Kyojin",
        title_english: "Attack on Titan",
        score: 8.55,
        type: "TV",
        episodes: 25,
        status: "Finished Airing",
        year: 2013,
        genres: [{ name: "Action" }, { name: "Suspense" }, { name: "Drama" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/10/47347l.webp" }
        }
    },
    {
        mal_id: 40748,
        title: "Jujutsu Kaisen",
        title_english: "Jujutsu Kaisen",
        score: 8.59,
        type: "TV",
        episodes: 24,
        status: "Finished Airing",
        year: 2020,
        genres: [{ name: "Action" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1171/109222l.webp" }
        }
    },
    {
        mal_id: 50265,
        title: "Spy x Family",
        title_english: "Spy x Family",
        score: 8.48,
        type: "TV",
        episodes: 12,
        status: "Finished Airing",
        year: 2022,
        genres: [{ name: "Comedy" }, { name: "Action" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1441/122795l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1441/122795l.webp" }
        }
    },
    {
        mal_id: 41467,
        title: "Bleach: Sennen Kessen-hen",
        title_english: "Bleach: Thousand-Year Blood War",
        score: 8.98,
        type: "TV",
        episodes: 13,
        status: "Finished Airing",
        year: 2022,
        genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1764/126627l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1764/126627l.webp" }
        }
    },
    {
        mal_id: 38000,
        title: "Kimetsu no Yaiba",
        title_english: "Demon Slayer: Kimetsu no Yaiba",
        score: 8.47,
        type: "TV",
        episodes: 26,
        status: "Finished Airing",
        year: 2019,
        genres: [{ name: "Action" }, { name: "Fantasy" }],
        images: {
            jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.jpg" },
            webp: { large_image_url: "https://cdn.myanimelist.net/images/anime/1286/99889l.webp" }
        }
    }
];

// Helper: safe fetch with sessionStorage caching and retry for 429
const safeFetch = async (url, retries = 3, delay = 1000) => {
    try {
        const cached = sessionStorage.getItem(url);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed !== null && parsed !== undefined) return parsed;
        }
    } catch {}

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url);
            if (response.status === 429) {
                console.warn(`[Jikan Throttled] Retrying ${url} in ${delay * attempt}ms...`);
                await new Promise((r) => setTimeout(r, delay * attempt));
                continue;
            }
            if (response.ok) {
                const data = await response.json();
                if (data && data.data !== undefined) {
                    try {
                        sessionStorage.setItem(url, JSON.stringify(data.data));
                    } catch {}
                    return data.data;
                }
            }
        } catch (err) {
            console.error(`Attempt ${attempt} error for ${url}:`, err);
            await new Promise((r) => setTimeout(r, delay * attempt));
        }
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
    const [search, setSearch] = React.useState('');

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

    // Fetch popular anime
    const getPopularAnime = async () => {
        dispatch({ type: LOADING });
        const data = await safeFetch(`${baseUrl}/top/anime?filter=bypopularity`);
        dispatch({
            type: GET_POPULAR_ANIME,
            payload: data || FALLBACK_POPULAR_ANIME
        });
    };

    // Fetch upcoming anime
    const getUpcomingAnime = async () => {
        dispatch({ type: LOADING });
        const data = await safeFetch(`${baseUrl}/top/anime?filter=upcoming`);
        dispatch({
            type: GET_UPCOMING_ANIME,
            payload: data || []
        });
    };

    // Fetch airing anime
    const getAiringAnime = async () => {
        dispatch({ type: LOADING });
        const data = await safeFetch(`${baseUrl}/top/anime?filter=airing`);
        dispatch({
            type: GET_AIRING_ANIME,
            payload: data || []
        });
    };

    // Search anime
    const searchAnime = async (anime) => {
        dispatch({ type: LOADING });
        const data = await safeFetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime)}&order_by=popularity&sort=asc&sfw`);
        dispatch({ type: SEARCH, payload: data || [] });
    };

    // Get character pictures
    const getAnimePictures = React.useCallback(async (id) => {
        dispatch({ type: LOADING });
        const data = await safeFetch(`https://api.jikan.moe/v4/characters/${id}/pictures`);
        dispatch({ type: GET_PICTURES, payload: data || [] });
    }, []);

    // Initial render
    React.useEffect(() => {
        getPopularAnime();
        // Pre-fetch airing anime for the weekly top-rated slider with a 600ms stagger
        const timer = setTimeout(() => {
            getAiringAnime();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

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