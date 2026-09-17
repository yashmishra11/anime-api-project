import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { tokens, cornerScrews, ventSlots, crtScanlines } from '../theme/tokens';
import { useGlobalContext } from '../context/global';

function AnimeItem() {
    const {id} = useParams();
    const { popularAnime, upcomingAnime, airingAnime } = useGlobalContext();

    //states
    const [anime, setAnime] = React.useState({});
    const [loadingAnime, setLoadingAnime] = React.useState(true);
    const [relations, setRelations] = React.useState([]);
    const [loadingRelations, setLoadingRelations] = React.useState(true);
    const [relatedDetails, setRelatedDetails] = React.useState({});
    const [characters, setCharacters] = React.useState([]);
    const [loadingChars, setLoadingChars] = React.useState(true);
    const [showAllChars, setShowAllChars] = React.useState(false);
    const [showMore, setShowMore] = React.useState(false);

    //destructure anime
    const {
        title, synopsis, trailer,
        duration, aired, season,
        images, rank, score, scored_by,
        popularity, status, rating, source
    } = anime;

    // Get anime by id with robust multi-tier fallback, caching, and exponential backoff
    const getAnime = React.useCallback(async(animeId) => {
        const cacheKey = `anime_full_${animeId}`;
        
        // 1. Check persistent sessionStorage first
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed && parsed.title) {
                    setAnime(parsed);
                    setLoadingAnime(false);
                    if (Array.isArray(parsed.relations) && parsed.relations.length > 0) {
                        setRelations(parsed.relations);
                        setLoadingRelations(false);
                    }
                    return parsed;
                }
            }
        } catch {}

        // 2. Immediate partial hydration from global context if available
        const globalMatch = [...(popularAnime || []), ...(upcomingAnime || []), ...(airingAnime || [])].find(
            (a) => String(a.mal_id) === String(animeId)
        );
        if (globalMatch && globalMatch.title) {
            setAnime(globalMatch);
        }

        // 3. Fetch from Jikan API with retries & fallback to standard endpoint
        const endpoints = [
            `https://api.jikan.moe/v4/anime/${animeId}/full`,
            `https://api.jikan.moe/v4/anime/${animeId}`
        ];

        for (const endpoint of endpoints) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const response = await fetch(endpoint);
                    if (response.status === 429) {
                        console.warn(`[Jikan Throttled] Spec retrieval for ${animeId} attempt ${attempt}, waiting ${1000 * attempt}ms...`);
                        await new Promise(r => setTimeout(r, 1000 * attempt));
                        continue;
                    }
                    if (response.ok) {
                        const json = await response.json();
                        const data = json?.data;
                        if (data && data.title) {
                            setAnime(data);
                            setLoadingAnime(false);
                            try {
                                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                            } catch {}

                            if (Array.isArray(data.relations) && data.relations.length > 0) {
                                setRelations(data.relations);
                                setLoadingRelations(false);
                                try {
                                    sessionStorage.setItem(`anime_relations_${animeId}`, JSON.stringify(data.relations));
                                } catch {}
                            }
                            return data;
                        }
                    }
                } catch (err) {
                    console.error(`Error fetching from ${endpoint}:`, err);
                }
            }
        }

        // 4. Final safety fallback: If API failed completely and we have a global match
        if (globalMatch) {
            setAnime(globalMatch);
        }
        setLoadingAnime(false);
        return null;
    }, [popularAnime, upcomingAnime, airingAnime]);

    // get relations fallback with cache and retry
    const getRelations = React.useCallback(async(animeId, attempt = 1) => {
        try {
            const cacheKey = `anime_relations_${animeId}`;
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setRelations(parsed);
                        setLoadingRelations(false);
                        return;
                    }
                }
            } catch {}

            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/relations`);
            if (response.status === 429 && attempt <= 3) {
                await new Promise(r => setTimeout(r, 1200 * attempt));
                return getRelations(animeId, attempt + 1);
            }

            if (!response.ok) {
                setLoadingRelations(false);
                return;
            }

            const data = await response.json();
            if (data?.data && Array.isArray(data.data)) {
                setRelations(data.data);
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(data.data));
                } catch {}
            }
        } catch (err) {
            console.error("Error fetching relations:", err);
        } finally {
            setLoadingRelations(false);
        }
    }, []);
    
    // get characters with rate-limit retry and cache
    const getCharacters = React.useCallback(async(animeId, attempt = 1) => {
        try {
            setLoadingChars(true);
            const cacheKey = `anime_chars_${animeId}`;
            try {
                const cached = sessionStorage.getItem(cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setCharacters(parsed);
                        setLoadingChars(false);
                        return;
                    }
                }
            } catch {}

            const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
            if (response.status === 429 && attempt <= 3) {
                console.warn(`[Jikan Rate Limit] Retrying character specs for ${animeId} in 1200ms...`);
                await new Promise(r => setTimeout(r, 1200 * attempt));
                return getCharacters(animeId, attempt + 1);
            }

            if (!response.ok) {
                setLoadingChars(false);
                return;
            }

            const data = await response.json();
            if (data?.data && Array.isArray(data.data)) {
                const sorted = [...data.data].sort((a, b) => {
                    if (a.role === 'Main' && b.role !== 'Main') return -1;
                    if (a.role !== 'Main' && b.role === 'Main') return 1;
                    return 0;
                });
                setCharacters(sorted);
                try {
                    sessionStorage.setItem(cacheKey, JSON.stringify(sorted));
                } catch {}
            }
        } catch (err) {
            console.error("Error fetching characters:", err);
        } finally {
            setLoadingChars(false);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        setAnime({});
        setLoadingAnime(true);
        setRelations([]);
        setLoadingRelations(true);
        setCharacters([]);
        setLoadingChars(true);
        setShowAllChars(false);
        setShowMore(false);

        let isCancelled = false;

        const loadAnimeSpecs = async () => {
            const data = await getAnime(id);
            if (isCancelled) return;

            // If /full did not provide relations, fetch them separately
            const hasRelations = Array.isArray(data?.relations) && data.relations.length > 0;
            if (!hasRelations) {
                setTimeout(() => {
                    if (!isCancelled) getRelations(id);
                }, 400);
            }

            // Stagger characters request so it doesn't collide with getAnime
            setTimeout(() => {
                if (!isCancelled) getCharacters(id);
            }, 800);
        };

        loadAnimeSpecs();

        return () => {
            isCancelled = true;
        };
    }, [id, getAnime, getCharacters, getRelations]);

    useEffect(() => {
        if (title) {
            document.title = `${title} // Tactical Spec Sheet - AniLog`;
        } else {
            document.title = `Loading Spec Sheet... // AniLog`;
        }
    }, [title]);

    // Flatten related anime entries
    const relatedAnimeList = React.useMemo(() => {
        if (!relations || !Array.isArray(relations)) return [];
        const list = [];
        relations.forEach((relGroup) => {
            const relationType = relGroup?.relation || 'Related';
            const entries = Array.isArray(relGroup?.entry) ? relGroup.entry : [];
            entries.forEach((entry) => {
                if (entry && entry.type === 'anime') {
                    list.push({
                        relation: relationType,
                        mal_id: entry.mal_id,
                        name: entry.name,
                        url: entry.url,
                        type: entry.type
                    });
                }
            });
        });

        const priority = {
            'Sequel': 1,
            'Prequel': 2,
            'Parent story': 3,
            'Full story': 4,
            'Side story': 5,
            'Spin-off': 6,
            'Alternative version': 7,
            'Alternative setting': 8,
            'Summary': 9,
            'Character': 10,
            'Other': 11
        };

        return list.sort((a, b) => {
            const prioA = priority[a.relation] || 99;
            const prioB = priority[b.relation] || 99;
            return prioA - prioB;
        });
    }, [relations]);

    // Relation badge color & indicator helper
    const getRelationBadgeInfo = (relation) => {
        const lower = (relation || '').toLowerCase();
        if (lower.includes('sequel')) {
            return {
                shortLabel: 'SEQUEL',
                label: 'SEQUEL // NEXT CHRONOLOGY',
                color: tokens.colors.accent,
                bg: 'rgba(255, 94, 40, 0.12)',
                border: 'rgba(255, 94, 40, 0.35)',
                dot: tokens.colors.accent
            };
        }
        if (lower.includes('prequel')) {
            return {
                shortLabel: 'PREQUEL',
                label: 'PREQUEL // ORIGIN TRANSMISSION',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.12)',
                border: 'rgba(245, 158, 11, 0.35)',
                dot: '#f59e0b'
            };
        }
        if (lower.includes('side story')) {
            return {
                shortLabel: 'SIDE STORY',
                label: 'SIDE STORY // UNIVERSE EXPANSION',
                color: '#0ea5e9',
                bg: 'rgba(14, 165, 233, 0.12)',
                border: 'rgba(14, 165, 233, 0.35)',
                dot: '#0ea5e9'
            };
        }
        if (lower.includes('spin-off')) {
            return {
                shortLabel: 'SPIN-OFF',
                label: 'SPIN-OFF // ALTERNATIVE NARRATIVE',
                color: '#a855f7',
                bg: 'rgba(168, 85, 247, 0.12)',
                border: 'rgba(168, 85, 247, 0.35)',
                dot: '#a855f7'
            };
        }
        if (lower.includes('parent') || lower.includes('full story')) {
            return {
                shortLabel: 'PARENT',
                label: 'PARENT TRANSMISSION',
                color: '#10b981',
                bg: 'rgba(16, 185, 129, 0.12)',
                border: 'rgba(16, 185, 129, 0.35)',
                dot: '#10b981'
            };
        }
        if (lower.includes('alternative')) {
            return {
                shortLabel: 'ALT TIMELINE',
                label: 'ALTERNATIVE TIMELINE',
                color: '#ec4899',
                bg: 'rgba(236, 72, 153, 0.12)',
                border: 'rgba(236, 72, 153, 0.35)',
                dot: '#ec4899'
            };
        }
        return {
            shortLabel: (relation || 'RELATED').toUpperCase(),
            label: (relation || 'RELATED').toUpperCase(),
            color: tokens.colors.textMuted,
            bg: tokens.colors.recessed,
            border: 'rgba(186, 190, 204, 0.4)',
            dot: tokens.colors.accent
        };
    };

    // Safe fetch for related anime visual posters with cache
    useEffect(() => {
        if (!relatedAnimeList || relatedAnimeList.length === 0) return;

        let isMounted = true;
        const initialDetails = {};
        const missingIds = [];

        // Check global context and sessionStorage first for immediate display
        relatedAnimeList.forEach((item) => {
            const idStr = String(item.mal_id);
            const cached = sessionStorage.getItem(`anime_thumb_${idStr}`) || sessionStorage.getItem(`anime_full_${idStr}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    const img = parsed.image || parsed.images?.webp?.large_image_url || parsed.images?.jpg?.large_image_url || parsed.images?.jpg?.image_url;
                    if (img) {
                        initialDetails[idStr] = {
                            image: img,
                            score: parsed.score,
                            year: parsed.year || parsed.aired?.prop?.from?.year,
                            type: parsed.type,
                            episodes: parsed.episodes
                        };
                        return;
                    }
                } catch {}
            }

            const fromGlobal = [...(popularAnime || []), ...(upcomingAnime || []), ...(airingAnime || [])].find(
                (a) => String(a.mal_id) === idStr
            );
            if (fromGlobal) {
                const detail = {
                    image: fromGlobal.images?.webp?.large_image_url || fromGlobal.images?.jpg?.large_image_url || fromGlobal.images?.jpg?.image_url,
                    score: fromGlobal.score,
                    year: fromGlobal.year || fromGlobal.aired?.prop?.from?.year,
                    type: fromGlobal.type,
                    episodes: fromGlobal.episodes
                };
                initialDetails[idStr] = detail;
                try {
                    sessionStorage.setItem(`anime_thumb_${idStr}`, JSON.stringify(detail));
                } catch {}
                return;
            }

            missingIds.push(item.mal_id);
        });

        if (Object.keys(initialDetails).length > 0) {
            setRelatedDetails((prev) => ({ ...prev, ...initialDetails }));
        }

        if (missingIds.length === 0) return;

        // Fetch at most 3 missing primary items after 1.5s delay to prioritize main page
        const timer = setTimeout(async () => {
            if (!isMounted) return;
            const queueToFetch = missingIds.slice(0, 3);
            for (let i = 0; i < queueToFetch.length; i++) {
                if (!isMounted) break;
                const targetId = queueToFetch[i];

                try {
                    const response = await fetch(`https://api.jikan.moe/v4/anime/${targetId}`);
                    if (response.status === 429) {
                        console.warn(`[Jikan Throttled] Halting background thumbnail queue.`);
                        break;
                    }
                    if (response.ok) {
                        const json = await response.json();
                        const data = json?.data;
                        if (data && isMounted) {
                            const detail = {
                                image: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || data.images?.jpg?.image_url,
                                score: data.score,
                                year: data.year || data.aired?.prop?.from?.year,
                                type: data.type,
                                episodes: data.episodes
                            };
                            try {
                                sessionStorage.setItem(`anime_thumb_${targetId}`, JSON.stringify(detail));
                            } catch {}
                            setRelatedDetails((prev) => ({ ...prev, [targetId]: detail }));
                        }
                    }
                } catch (err) {
                    console.warn(`[Jikan] Error fetching visual for ${targetId}:`, err);
                    break;
                }

                await new Promise((r) => setTimeout(r, 800));
            }
        }, 1500);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [relatedAnimeList, popularAnime, upcomingAnime, airingAnime]);

    return (
        <AnimeItemStyled>
            <div className="nav-header">
                <Link to="/" className="back-link">
                    <span className="arrow">←</span>
                    <span>DIRECTORY</span>
                </Link>
                <div className="nav-telemetry">
                    <span className="dot" />
                    <span>SPEC SHEET // ID: {id}</span>
                </div>
            </div>

            {loadingAnime && !title ? (
                <div className="spec-sheet-loading">
                    <div className="loading-radar">
                        <span className="pulse-blip" />
                        <span className="radar-label">// DECRYPTING SPECIMEN TELEMETRY ARCHIVE [ID: #{id}]...</span>
                    </div>
                </div>
            ) : (
                <>
                    <h1>{title || `Specimen #${id}`}</h1>

                    <div className='details'>
                        <div className='detail'>
                            <div className='image'>
                                <div className="image-well">
                                    {images?.jpg?.large_image_url || images?.jpg?.image_url ? (
                                        <img src={images?.jpg?.large_image_url || images?.jpg?.image_url} alt={title || "Anime Poster"} />
                                    ) : (
                                        <div className="no-specimen-img">// NO VISUAL TRANSMISSION</div>
                                    )}
                                </div>
                            </div>
                            <div className='anime-details'>
                                <p><span>AIRED:</span><span>{aired?.string || 'N/A'}</span></p>
                                <p><span>RATING:</span><span>{rating || 'N/A'}</span></p>
                                <p><span>RANK:</span><span className="highlight-tag">#{rank || 'N/A'}</span></p>
                                <p><span>SCORE:</span><span className="highlight-score">{score || 'N/A'}</span></p>
                                <p><span>SCORED BY:</span><span>{scored_by?.toLocaleString() || 'N/A'}</span></p>
                                <p><span>POPULARITY:</span><span>#{popularity || 'N/A'}</span></p>
                                <p><span>STATUS:</span><span>{status || 'N/A'}</span></p>
                                <p><span>SOURCE:</span><span>{source || 'N/A'}</span></p>
                                <p><span>SEASON:</span><span>{season || 'N/A'}</span></p>
                                <p><span>DURATION:</span><span>{duration || 'N/A'}</span></p>
                            </div>
                        </div>

                        <div className='description-container'>
                            <span className='section-label'>// SYNOPSIS SPECIFICATION</span>
                            <p className='description'>
                                {showMore ? synopsis : (synopsis ? synopsis.substring(0, 450) + (synopsis.length > 450 ? '...' : '') : 'No synopsis provided.')}
                                {synopsis && synopsis.length > 450 && (
                                    <button onClick={() => setShowMore(!showMore)}>
                                        {showMore ? 'SHOW LESS' : 'READ MORE'}
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>
                </>
            )}

            {trailer?.embed_url && (
                <>
                    <h3 className='title'>Trailer Monitor</h3>
                    <div className='trailer-con'>
                        <div className="monitor-frame">
                            <div className="monitor-bezel-top">
                                <div className="monitor-indicator">
                                    <span className="monitor-led" />
                                    <span className="monitor-brand">CRT-DISPLAY // NTSC 60Hz</span>
                                </div>
                                <div className="monitor-vents">
                                    <span />
                                </div>
                            </div>
                            <div className="screen-container">
                                <iframe
                                    src={`${trailer.embed_url}?autoplay=0`}
                                    title="Trailer Monitor"
                                    width="800"
                                    height="450"
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                    allowFullScreen>
                                </iframe>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Connected Universe & Franchise Chronology Section */}
            <div className="section-header-row">
                <h3 className='title'>Connected Universe & Franchise Chronology</h3>
                {relatedAnimeList && relatedAnimeList.length > 0 && (
                    <span className="specimen-count">
                        // {relatedAnimeList.length} SATELLITE TRANSMISSIONS
                    </span>
                )}
            </div>

            {loadingRelations && relatedAnimeList.length === 0 ? (
                <div className="relations-loading">
                    <div className="loading-radar">
                        <span className="pulse-blip" />
                        <span className="radar-label">// SCANNING SATELLITE NETWORK FOR UNIVERSE CHRONOLOGY...</span>
                    </div>
                </div>
            ) : relatedAnimeList && relatedAnimeList.length > 0 ? (
                <div className="relations-grid">
                    {relatedAnimeList.map((relItem, idx) => {
                        const badgeInfo = getRelationBadgeInfo(relItem.relation);
                        const detail = relatedDetails[String(relItem.mal_id)];
                        const imageUrl = detail?.image;
                        const relScore = detail?.score;
                        const relYear = detail?.year;
                        const relType = detail?.type || relItem.type;
                        const relEpisodes = detail?.episodes;

                        return (
                            <Link
                                to={`/anime/${relItem.mal_id}`}
                                key={`${relItem.mal_id}-${idx}`}
                                className="relation-card"
                            >
                                <div className="card-chassis">
                                    {/* Visual Frame */}
                                    <div className="media-viewport">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={relItem.name}
                                                loading="lazy"
                                                className="relation-poster"
                                            />
                                        ) : (
                                            <div className="visual-scanner-placeholder">
                                                <div className="scanner-radar">
                                                    <span className="pulse-blip" />
                                                </div>
                                                <span className="scanner-label">// SCANNING VISUAL...</span>
                                                <span className="scanner-id">ID #{relItem.mal_id}</span>
                                            </div>
                                        )}

                                        {/* Top HUD Badges */}
                                        <div className="top-hud">
                                            <div
                                                className="relation-badge"
                                                style={{
                                                    color: badgeInfo.color,
                                                    backgroundColor: badgeInfo.bg,
                                                    borderColor: badgeInfo.border
                                                }}
                                            >
                                                <span
                                                    className="badge-dot"
                                                    style={{ backgroundColor: badgeInfo.dot }}
                                                />
                                                <span>{badgeInfo.shortLabel || badgeInfo.label}</span>
                                            </div>

                                            {relScore ? (
                                                <div className="score-badge">
                                                    <span className="star">★</span>
                                                    <span className="score-val">{relScore.toFixed(1)}</span>
                                                </div>
                                            ) : relType ? (
                                                <div className="type-badge">
                                                    <span>{relType.toUpperCase()}</span>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Viewport Bottom Overlay */}
                                        <div className="viewport-overlay-spec">
                                            <span className="id-tag">#{relItem.mal_id}</span>
                                            {relEpisodes ? (
                                                <span className="ep-tag">{relEpisodes}E</span>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Meta Console */}
                                    <div className="meta-console">
                                        <h4 className="anime-title" title={relItem.name}>
                                            {relItem.name}
                                        </h4>

                                        <div className="spec-row">
                                            <span className="genre-pill">{relItem.relation.toUpperCase()}</span>
                                            {relYear && <span className="year-label">{relYear}</span>}
                                        </div>

                                        <div className="relation-footer">
                                            <span className="nav-trigger">
                                                <span>LOAD SPEC SHEET</span>
                                                <span className="arrow">→</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="relations-empty">
                    <span className="empty-dot" />
                    <p>// STANDALONE TRANSMISSION — NO RECORDED PREQUELS, SEQUELS, OR SATELLITE CHRONOLOGY ARCHIVED</p>
                </div>
            )}

            <div className="section-header-row">
                <h3 className='title'>Character Specimen Bank</h3>
                {characters && characters.length > 0 && (
                    <span className="specimen-count">
                        // {characters.length} ARCHIVED SPECIMENS
                    </span>
                )}
            </div>

            {loadingChars ? (
                <div className="characters-loading">
                    <div className="loading-radar">
                        <span className="pulse-blip" />
                        <span className="radar-label">// SCANNING CHARACTER ARCHIVES...</span>
                    </div>
                </div>
            ) : characters && characters.length > 0 ? (
                <>
                    <div className="characters">
                        {(showAllChars ? characters : characters.slice(0, 20)).map((item, index) => {
                            const role = item?.role || 'Support';
                            const charObj = item?.character || {};
                            const charImages = charObj.images;
                            const charName = charObj.name || 'Unknown';
                            const charId = charObj.mal_id;
                            const imgUrl = charImages?.webp?.image_url || charImages?.jpg?.image_url;

                            return (
                                <Link 
                                    to={`/character/${charId}`} 
                                    state={{
                                        character: charObj,
                                        role: role,
                                        animeId: id,
                                        animeTitle: title
                                    }}
                                    key={charId || index}
                                >
                                    <div className="character">
                                        <div className="char-img-well">
                                            {imgUrl ? (
                                                <img src={imgUrl} alt={charName} loading="lazy" />
                                            ) : (
                                                <div className="no-char-img">NO DATA</div>
                                            )}
                                        </div>
                                        <h4>{charName}</h4>
                                        <p className="role-tag">{role}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    {characters.length > 20 && (
                        <div className="show-more-chars">
                            <button type="button" onClick={() => setShowAllChars(!showAllChars)}>
                                {showAllChars ? '▲ SHOW FEWER SPECIMENS' : `▼ VIEW ALL SPECIMENS (${characters.length})`}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="characters-empty">
                    <span className="empty-dot" />
                    <p>// NO CHARACTER SPECIMENS ARCHIVED FOR THIS TRANSMISSION</p>
                </div>
            )}
        </AnimeItemStyled>
    );
}

const AnimeItemStyled = styled.div`
    padding: 2.5rem 10rem 4rem 10rem;
    background-color: ${tokens.colors.chassis};
    min-height: 100vh;
    
    @media screen and (max-width: 1600px) {
        padding: 2.5rem 6rem 4rem 6rem;
    }
    
    @media screen and (max-width: 1200px) {
        padding: 2rem 3rem 3rem 3rem;
    }
    
    @media screen and (max-width: 768px) {
        padding: 1.5rem 1.25rem 2.5rem 1.25rem;
    }
    
    .nav-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.6rem 1.25rem;
            border-radius: ${tokens.radii.md};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            font-family: ${tokens.fonts.technical};
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: ${tokens.colors.textMuted};
            text-decoration: none;
            transition: ${tokens.transitions.fast};

            .arrow {
                font-size: 1.1rem;
                transition: transform 0.2s ease;
            }

            &:hover {
                color: ${tokens.colors.textPrimary};
                box-shadow: ${tokens.shadows.buttonHover};
                transform: translateX(-2px);

                .arrow {
                    transform: translateX(-3px);
                }
            }

            &:active {
                box-shadow: ${tokens.shadows.pressed};
                transform: translateX(0);
            }
        }

        .nav-telemetry {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: ${tokens.fonts.technical};
            font-size: 0.75rem;
            font-weight: 700;
            color: ${tokens.colors.textMuted};
            letter-spacing: 0.08em;

            .dot {
                width: 7px;
                height: 7px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
            }
        }
    }
    
    h1 {
        display: block;
        font-family: ${tokens.fonts.primary};
        font-size: clamp(2rem, 4.5vw, 3.25rem);
        margin-bottom: 2rem;
        color: ${tokens.colors.textPrimary};
        font-weight: 800;
        letter-spacing: -0.03em;
        text-shadow: ${tokens.shadows.textEmbossed};
        line-height: 1.2;
    }
    
    .title {
        display: inline-block;
        margin: 3.5rem 0 1.5rem 0;
        font-family: ${tokens.fonts.technical};
        font-size: clamp(1.25rem, 2.5vw, 1.6rem);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: ${tokens.colors.textPrimary};
        text-shadow: ${tokens.shadows.textEmbossed};
        border-bottom: 2px solid ${tokens.colors.accent};
        padding-bottom: 0.4rem;
    }

    .spec-sheet-loading {
        background: ${tokens.colors.chassis};
        padding: 4.5rem 2rem;
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1.25rem;
        font-family: ${tokens.fonts.technical};
        color: ${tokens.colors.textMuted};
        margin-bottom: 2.5rem;

        .loading-radar {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .pulse-blip {
            width: 12px;
            height: 12px;
            border-radius: ${tokens.radii.full};
            background-color: ${tokens.colors.accent};
            box-shadow: ${tokens.shadows.glowOrange};
            animation: pulse 1.5s infinite ease-in-out;
        }

        .radar-label {
            font-size: 0.88rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: ${tokens.colors.accent};
        }
    }

    .no-specimen-img {
        width: 100%;
        aspect-ratio: 2/3;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${tokens.colors.recessed};
        color: ${tokens.colors.textMuted};
        font-family: ${tokens.fonts.technical};
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        border-radius: ${tokens.radii.md};
    }

    .details {
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl};
        padding: 2.5rem;
        box-shadow: ${tokens.shadows.card};
        border: 1px solid rgba(255, 247, 240, 0.85);
        ${cornerScrews}
        
        @media screen and (max-width: 768px) {
            padding: 1.5rem 1.25rem;
            border-radius: ${tokens.radii.lg};
        }
        
        .detail {
            display: grid;
            grid-template-columns: 360px 1fr;
            gap: 2.5rem;
            align-items: start;
            
            @media screen and (max-width: 1024px) {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .image {
                .image-well {
                    padding: 12px;
                    border-radius: ${tokens.radii.lg};
                    background: ${tokens.colors.chassis};
                    box-shadow: ${tokens.shadows.recessed};
                    border: 1px solid rgba(186, 190, 204, 0.5);

                    img {
                        width: 100%;
                        border-radius: ${tokens.radii.md};
                        display: block;
                        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.15);
                    }
                }
            }
        }
        
        .anime-details {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            background: ${tokens.colors.chassis};
            padding: 1.5rem;
            border-radius: ${tokens.radii.lg};
            box-shadow: ${tokens.shadows.recessed};
            border: 1px solid rgba(186, 190, 204, 0.4);
            
            p {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                padding: 0.6rem 0.5rem;
                border-bottom: 1px solid ${tokens.colors.borderShadow};
                box-shadow: 0 1px 0 ${tokens.colors.borderLight};
                font-family: ${tokens.fonts.technical};
                font-size: 0.875rem;
                
                &:last-child {
                    border-bottom: none;
                    box-shadow: none;
                }
                
                span:first-child {
                    font-weight: 700;
                    color: ${tokens.colors.textMuted};
                    letter-spacing: 0.06em;
                    min-width: 120px;
                }
                
                span:last-child {
                    font-weight: 600;
                    color: ${tokens.colors.textPrimary};
                    text-align: right;
                }

                .highlight-score {
                    color: ${tokens.colors.accent} !important;
                    font-weight: 700 !important;
                }

                .highlight-tag {
                    color: ${tokens.colors.textPrimary} !important;
                    font-weight: 700 !important;
                }
            }
        }

        .description-container {
            margin-top: 2rem;
            padding: 1.75rem;
            border-radius: ${tokens.radii.lg};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.recessed};
            border: 1px solid rgba(186, 190, 204, 0.4);

            .section-label {
                display: block;
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                font-weight: 700;
                color: ${tokens.colors.textMuted};
                letter-spacing: 0.08em;
                margin-bottom: 0.75rem;
            }

            .description {
                line-height: 1.8;
                color: ${tokens.colors.textPrimary};
                font-size: 0.975rem;
                
                button {
                    display: inline-flex;
                    align-items: center;
                    margin-left: 0.75rem;
                    padding: 0.35rem 0.85rem;
                    border-radius: ${tokens.radii.sm};
                    background: ${tokens.colors.chassis};
                    box-shadow: ${tokens.shadows.card};
                    border: 1px solid rgba(255, 247, 240, 0.85);
                    color: ${tokens.colors.accent};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    transition: ${tokens.transitions.fast};
                    
                    &:hover {
                        transform: translateY(-1px);
                        box-shadow: ${tokens.shadows.buttonHover};
                    }
                    
                    &:active {
                        transform: translateY(1px);
                        box-shadow: ${tokens.shadows.pressed};
                    }
                }
            }
        }
    }

    .trailer-con {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1.5rem 0 3rem 0;

        .monitor-frame {
            width: 100%;
            max-width: 880px;
            background: #2d3436;
            border-radius: ${tokens.radii.xl};
            padding: 1.5rem;
            box-shadow: ${tokens.shadows.card}, 0 20px 40px rgba(0, 0, 0, 0.25);
            border: 4px solid #3f494c;

            .monitor-bezel-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid #4a5568;

                .monitor-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;

                    .monitor-led {
                        width: 8px;
                        height: 8px;
                        border-radius: ${tokens.radii.full};
                        background: ${tokens.colors.ledGreen};
                        box-shadow: ${tokens.shadows.glowGreen};
                        animation: pulse 2s infinite ease-in-out;
                    }

                    .monitor-brand {
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.75rem;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        color: #a0aec0;
                    }
                }

                .monitor-vents {
                    ${ventSlots}
                }
            }

            .screen-container {
                position: relative;
                width: 100%;
                border-radius: ${tokens.radii.md};
                overflow: hidden;
                box-shadow: inset 0 0 24px rgba(0, 0, 0, 0.85);
                ${crtScanlines}
                
                iframe {
                    display: block;
                    width: 100%;
                    border: none;
                    aspect-ratio: 16/9;
                    background: #000;
                }
            }
        }
    }

    .characters {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 1.75rem;
        background: ${tokens.colors.chassis};
        padding: 2.5rem;
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.75);
        
        @media screen and (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            padding: 1.5rem 1rem;
            gap: 1.25rem;
        }
        
        @media screen and (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
        }
        
        a {
            text-decoration: none;
            display: block;
            
            .character {
                padding: 1rem;
                border-radius: ${tokens.radii.lg};
                background: ${tokens.colors.chassis};
                box-shadow: ${tokens.shadows.card};
                border: 1px solid rgba(255, 247, 240, 0.85);
                transition: ${tokens.transitions.normal};
                height: 100%;
                display: flex;
                flex-direction: column;
                ${cornerScrews}
                
                .char-img-well {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 2/3;
                    border-radius: ${tokens.radii.md};
                    overflow: hidden;
                    margin-bottom: 0.75rem;
                    box-shadow: ${tokens.shadows.recessed};
                    background: ${tokens.colors.recessed};
                    border: 1px solid rgba(186, 190, 204, 0.5);

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        border-radius: inherit;
                        transition: transform 0.3s ease, filter 0.3s ease;
                        filter: grayscale(25%) contrast(0.96);
                        display: block;
                    }
                }
                
                h4 {
                    font-family: ${tokens.fonts.primary};
                    color: ${tokens.colors.textPrimary};
                    font-size: 0.95rem;
                    font-weight: 700;
                    line-height: 1.35;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 0.35rem;
                }
                
                .role-tag {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: ${tokens.colors.accent};
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-top: auto;
                }
                
                &:hover {
                    transform: translateY(-6px);
                    box-shadow: ${tokens.shadows.floating};
                    border-color: rgba(255, 247, 240, 1);
                    
                    .char-img-well img {
                        transform: scale(1.05);
                        filter: grayscale(0%) contrast(1.05);
                    }

                    h4 {
                        color: ${tokens.colors.accent};
                    }
                }
                
                &:active {
                    transform: translateY(-2px);
                    box-shadow: ${tokens.shadows.card};
                }
            }
        }
    }

    .section-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 3rem 0 1.5rem 0;
        flex-wrap: wrap;
        gap: 0.75rem;

        h3.title {
            margin: 0;
        }

        .specimen-count {
            font-family: ${tokens.fonts.technical};
            font-size: 0.78rem;
            font-weight: 700;
            color: ${tokens.colors.textMuted};
            letter-spacing: 0.08em;
            background: ${tokens.colors.recessed};
            padding: 3px 10px;
            border-radius: ${tokens.radii.xs};
            box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 247, 240, 0.7);
        }
    }

    /* Connected Universe Relations Deck */
    .relations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
        gap: 1.5rem;
        background: ${tokens.colors.chassis};
        padding: 2rem 2.25rem;
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.8);
        margin-bottom: 2rem;

        @media screen and (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            padding: 1.25rem 1rem;
            gap: 1rem;
        }

        .relation-card {
            display: block;
            text-decoration: none;
            height: 100%;
            border-radius: ${tokens.radii.lg};
            background-color: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            padding: 10px;
            ${cornerScrews}
            transition: ${tokens.transitions.normal};
            transform: translateZ(0);
            backface-visibility: hidden;

            &:hover {
                transform: translateY(-6px);
                box-shadow: ${tokens.shadows.floating};
                border-color: rgba(255, 247, 240, 1);

                .media-viewport img {
                    transform: scale(1.05);
                    filter: contrast(1.04);
                }

                .media-viewport {
                    border-color: ${tokens.colors.accent};
                }

                .anime-title {
                    color: ${tokens.colors.accent};
                }

                .nav-trigger {
                    color: ${tokens.colors.accent};
                    .arrow {
                        transform: translateX(4px);
                    }
                }
            }

            &:active {
                transform: translateY(-2px);
                box-shadow: ${tokens.shadows.card};
            }

            .card-chassis {
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .media-viewport {
                position: relative;
                width: 100%;
                height: 300px;
                border-radius: ${tokens.radii.md};
                overflow: hidden;
                background: ${tokens.colors.recessed};
                box-shadow: ${tokens.shadows.recessed};
                border: 1px solid rgba(186, 190, 204, 0.6);
                transition: border-color 0.25s ease;

                @media screen and (max-width: 768px) {
                    height: 220px;
                }

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease;
                    filter: contrast(0.96);
                }

                &::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, transparent 28%, transparent 65%, rgba(0, 0, 0, 0.5) 100%);
                    pointer-events: none;
                }

                .visual-scanner-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    background: radial-gradient(circle at center, #262c38 0%, #151820 100%);
                    color: ${tokens.colors.textMuted};
                    font-family: ${tokens.fonts.technical};
                    padding: 1rem;
                    text-align: center;

                    .scanner-radar {
                        width: 44px;
                        height: 44px;
                        border-radius: ${tokens.radii.full};
                        border: 1px dashed rgba(255, 94, 40, 0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        animation: radarRotate 4s linear infinite;

                        .pulse-blip {
                            width: 10px;
                            height: 10px;
                            border-radius: ${tokens.radii.full};
                            background-color: ${tokens.colors.accent};
                            box-shadow: ${tokens.shadows.glowOrange};
                            animation: pulse 1.5s infinite ease-in-out;
                        }
                    }

                    .scanner-label {
                        font-size: 0.7rem;
                        font-weight: 700;
                        letter-spacing: 0.08em;
                        color: #ff8052;
                    }

                    .scanner-id {
                        font-size: 0.65rem;
                        color: #94a3b8;
                    }
                }
            }

            .top-hud {
                position: absolute;
                top: 8px;
                left: 8px;
                right: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                z-index: 2;
                pointer-events: none;

                .relation-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.06em;
                    padding: 3px 8px;
                    border-radius: ${tokens.radii.sm};
                    border: 1px solid;
                    backdrop-filter: blur(6px);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

                    .badge-dot {
                        width: 6px;
                        height: 6px;
                        border-radius: ${tokens.radii.full};
                        box-shadow: 0 0 6px currentColor;
                    }
                }

                .score-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    background: rgba(29, 34, 44, 0.88);
                    backdrop-filter: blur(4px);
                    color: #fbbf24;
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 3px 7px;
                    border-radius: ${tokens.radii.sm};
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

                    .star {
                        font-size: 0.72rem;
                    }

                    .score-val {
                        color: #ffffff;
                    }
                }

                .type-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: rgba(29, 34, 44, 0.85);
                    backdrop-filter: blur(4px);
                    color: ${tokens.colors.textLight};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    padding: 3px 7px;
                    border-radius: ${tokens.radii.sm};
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                }
            }

            .viewport-overlay-spec {
                position: absolute;
                bottom: 8px;
                left: 8px;
                right: 8px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                z-index: 2;
                pointer-events: none;

                .id-tag,
                .ep-tag {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.04em;
                    color: #ffffff;
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(4px);
                    padding: 2px 6px;
                    border-radius: ${tokens.radii.xs};
                    border: 1px solid rgba(255, 255, 255, 0.15);
                }
            }

            .meta-console {
                padding: 10px 4px 2px 4px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                flex-grow: 1;

                .anime-title {
                    font-family: ${tokens.fonts.primary};
                    font-size: 0.92rem;
                    font-weight: 700;
                    color: ${tokens.colors.textPrimary};
                    line-height: 1.35;
                    letter-spacing: -0.01em;
                    margin-bottom: 6px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    min-height: 2.5rem;
                    transition: color 0.2s ease;
                }

                .spec-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 5px;
                    border-top: 1px solid rgba(186, 190, 204, 0.35);
                    margin-bottom: 6px;

                    .genre-pill {
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.68rem;
                        font-weight: 700;
                        color: ${tokens.colors.textMuted};
                        background: ${tokens.colors.recessed};
                        padding: 2px 8px;
                        border-radius: ${tokens.radii.xs};
                        letter-spacing: 0.04em;
                        border: 1px solid rgba(186, 190, 204, 0.4);
                    }

                    .year-label {
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.72rem;
                        font-weight: 700;
                        color: ${tokens.colors.textSecondary};
                    }
                }

                .relation-footer {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    padding-top: 4px;

                    .nav-trigger {
                        display: inline-flex;
                        align-items: center;
                        gap: 5px;
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.72rem;
                        font-weight: 700;
                        letter-spacing: 0.05em;
                        color: ${tokens.colors.accent};
                        transition: color 0.2s ease;

                        .arrow {
                            font-size: 0.85rem;
                            transition: transform 0.2s ease;
                        }
                    }
                }
            }
        }
    }

    .relations-loading,
    .relations-empty {
        background: ${tokens.colors.chassis};
        padding: 3rem 2rem;
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1rem;
        font-family: ${tokens.fonts.technical};
        color: ${tokens.colors.textMuted};
        margin-bottom: 2rem;

        .pulse-blip,
        .empty-dot {
            width: 10px;
            height: 10px;
            border-radius: ${tokens.radii.full};
            background-color: ${tokens.colors.accent};
            box-shadow: ${tokens.shadows.glowOrange};
            animation: pulse 1.5s infinite ease-in-out;
        }

        .radar-label,
        p {
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.08em;
        }
    }

    .characters-loading,
    .characters-empty {
        background: ${tokens.colors.chassis};
        padding: 3.5rem 2rem;
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.75);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 1rem;
        font-family: ${tokens.fonts.technical};
        color: ${tokens.colors.textMuted};

        .pulse-blip,
        .empty-dot {
            width: 10px;
            height: 10px;
            border-radius: ${tokens.radii.full};
            background-color: ${tokens.colors.accent};
            box-shadow: ${tokens.shadows.glowOrange};
            animation: pulse 1.5s infinite ease-in-out;
        }

        .radar-label,
        p {
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.08em;
        }
    }

    .no-char-img {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${tokens.colors.recessed};
        color: ${tokens.colors.textMuted};
        font-family: ${tokens.fonts.technical};
        font-size: 0.75rem;
        font-weight: 700;
    }

    .show-more-chars {
        display: flex;
        justify-content: center;
        margin-top: 2rem;

        button {
            padding: 0.8rem 2rem;
            border-radius: ${tokens.radii.md};
            font-family: ${tokens.fonts.technical};
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: ${tokens.colors.textPrimary};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            cursor: pointer;
            transition: ${tokens.transitions.fast};

            &:hover {
                color: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.buttonHover};
                transform: translateY(-2px);
            }

            &:active {
                box-shadow: ${tokens.shadows.pressed};
                transform: translateY(1px);
            }
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
    }

    @keyframes radarRotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;

export default AnimeItem;
