import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { tokens, cornerScrews, ventSlots } from '../theme/tokens';
import { useGlobalContext } from '../context/global';

// Curated Apex Slides: Week's Top Rated Anime broadcasts (MyAnimeList weekly rankings)
const WEEKLY_TOP_FALLBACK = [
    {
        rank: 1,
        badgeLabel: "WEEK'S TOP #1 // APEX BROADCAST",
        mal_id: 52991,
        title: 'Sousou no Frieren',
        title_english: "Frieren: Beyond Journey's End",
        score: 9.26,
        type: 'TV',
        episodes: 28,
        year: 2023,
        status: 'Currently Airing',
        genres: [{ name: 'Fantasy' }, { name: 'Adventure' }],
        synopsis: 'During their decade-long quest to defeat the Demon King, the hero party forged unforgettable memories. After the victory, the elven mage Frieren embarks on a personal journey to understand humans and the fleeting nature of time.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1015/138006l.jpg'
    },
    {
        rank: 2,
        badgeLabel: "WEEK'S TOP #2 // APEX BROADCAST",
        mal_id: 41457,
        title: 'Bleach: Sennen Kessen-hen',
        title_english: 'Bleach: Thousand-Year Blood War',
        score: 8.98,
        type: 'TV',
        episodes: 13,
        year: 2022,
        status: 'Currently Airing',
        genres: [{ name: 'Action' }, { name: 'Adventure' }, { name: 'Fantasy' }],
        synopsis: 'The peace is suddenly broken when warning sirens blare through the Soul Society. A shadow enemy emerges as the Wandenreich, an empire of Quincies led by Yhwach, declares war against all Soul Reapers.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1764/126627l.jpg'
    },
    {
        rank: 3,
        badgeLabel: "WEEK'S TOP #3 // TOP RATED",
        mal_id: 52701,
        title: 'Dungeon Meshi',
        title_english: 'Delicious in Dungeon',
        score: 8.65,
        type: 'TV',
        episodes: 24,
        year: 2024,
        status: 'Currently Airing',
        genres: [{ name: 'Fantasy' }, { name: 'Comedy' }, { name: 'Adventure' }],
        synopsis: 'After his sister is devoured by a red dragon deep in an uncharted dungeon, knight Laios and his surviving companions venture back underground, sustaining themselves by turning fierce monsters into gourmet meals.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1460/141010l.jpg'
    },
    {
        rank: 4,
        badgeLabel: "WEEK'S TOP #4 // TOP RATED",
        mal_id: 55701,
        title: 'Kimetsu no Yaiba: Hashira Geiko-hen',
        title_english: 'Demon Slayer: Hashira Training Arc',
        score: 8.47,
        type: 'TV',
        episodes: 8,
        year: 2024,
        status: 'Currently Airing',
        genres: [{ name: 'Action' }, { name: 'Fantasy' }],
        synopsis: 'Tanjiro visits the Stone Hashira, Himejima, who intends to prepare him for the looming climactic war against Muzan Kibutsuji. Meanwhile, the Demon Slayer Corps initiates rigorous Hashira-led training camps.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1286/99889l.jpg'
    },
    {
        rank: 5,
        badgeLabel: "WEEK'S TOP #5 // TOP RATED",
        mal_id: 55791,
        title: 'Oshi no Ko Season 2',
        title_english: '【OSHI NO KO】Season 2',
        score: 8.42,
        type: 'TV',
        episodes: 13,
        year: 2024,
        status: 'Currently Airing',
        genres: [{ name: 'Drama' }, { name: 'Suspense' }],
        synopsis: 'The 2.5D stage play adaptation of the hit manga Tokyo Blade commences, putting Aqua Hoshino, Akane Kurokawa, and Kana Arima on stage under intense artistic rivalries and uncovering deeper secrets of the entertainment underworld.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1105/143521l.jpg'
    },
    {
        rank: 6,
        badgeLabel: "WEEK'S TOP #6 // TOP RATED",
        mal_id: 54789,
        title: 'Boku no Hero Academia 7th Season',
        title_english: 'My Hero Academia Season 7',
        score: 8.35,
        type: 'TV',
        episodes: 21,
        year: 2024,
        status: 'Currently Airing',
        genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
        synopsis: 'With society on the brink of collapse, international hero Star and Stripe arrives in Japan to clash with the all-powerful All For One, while Deku and Class 1-A prepare for their final, all-out war.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1418/142168l.jpg'
    },
    {
        rank: 7,
        badgeLabel: "WEEK'S TOP #7 // TOP RATED",
        mal_id: 52588,
        title: 'Kaiju No. 8',
        title_english: 'Kaiju No. 8',
        score: 8.28,
        type: 'TV',
        episodes: 12,
        year: 2024,
        status: 'Currently Airing',
        genres: [{ name: 'Action' }, { name: 'Sci-Fi' }],
        synopsis: 'In a monster-ravaged Japan, 32-year-old cleanup worker Kafka Hibino suddenly gains the uncanny ability to transform into a devastating humanoid kaiju, taking one last shot at enlisting in the defense force.',
        imageUrl: 'https://cdn.myanimelist.net/images/anime/1769/141829l.jpg'
    }
];

function GenreSlider() {
    const { airingAnime } = useGlobalContext();
    const [slides, setSlides] = useState(WEEKLY_TOP_FALLBACK);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const autoPlayRef = useRef(null);

    // Supplement slides with live airing anime data from global context
    useEffect(() => {
        if (!airingAnime || airingAnime.length === 0) return;

        // Sort airing anime by score descending
        const sorted = [...airingAnime]
            .filter((item) => item.score && item.images)
            .sort((a, b) => (b.score || 0) - (a.score || 0));

        if (sorted.length > 0) {
            const topSeven = sorted.slice(0, 7).map((item, idx) => ({
                rank: idx + 1,
                badgeLabel:
                    idx === 0
                        ? "WEEK'S TOP #1 // APEX BROADCAST"
                        : idx === 1
                        ? "WEEK'S TOP #2 // APEX BROADCAST"
                        : `WEEK'S TOP #${idx + 1} // TOP RATED`,
                mal_id: item.mal_id,
                title: item.title,
                title_english: item.title_english || item.title,
                score: item.score || 8.5,
                type: item.type || 'TV',
                episodes: item.episodes || null,
                year: item.year || 2024,
                status: item.status || 'Currently Airing',
                genres: item.genres || [],
                synopsis: item.synopsis || 'Access full tactical specification for details.',
                imageUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url
            }));

            setSlides(topSeven);
        }
    }, [airingAnime]);

    // Auto-advance timer (pauses on user hover)
    useEffect(() => {
        if (isPaused) return;

        autoPlayRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 7000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isPaused, slides.length]);

    const handleSelectIndex = (idx) => {
        setCurrentIndex(idx);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const totalSlides = slides.length;
    const trackTranslateX = -(currentIndex * (100 / totalSlides));

    return (
        <SliderConsole
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Top Telemetry Header */}
            <div className="slider-telemetry-bar">
                <div className="telemetry-status">
                    <span className="telemetry-led" />
                    <span className="telemetry-label">
                        // WEEKLY BROADCAST TELEMETRY: THIS WEEK'S TOP RATED ANIME
                    </span>
                </div>

                <div className="telemetry-meta">
                    <span className="slide-counter">
                        0{currentIndex + 1} / 0{totalSlides}
                    </span>
                    <div className="console-vents">
                        <span />
                    </div>
                </div>
            </div>

            {/* Horizontal Sliding Carousel Track Viewport */}
            <div className="slider-viewport">
                <div
                    className="slider-track"
                    style={{
                        width: `${totalSlides * 100}%`,
                        transform: `translateX(${trackTranslateX}%)`
                    }}
                >
                    {slides.map((slide, idx) => {
                        const isActive = idx === currentIndex;
                        const synopsisClean = slide.synopsis
                            ? slide.synopsis.length > 210
                                ? slide.synopsis.substring(0, 210).trim() + '...'
                                : slide.synopsis
                            : 'Access full tactical specification and character archives for details.';

                        const primaryGenres = slide.genres?.slice(0, 2).map((g) => g.name).join(' • ');

                        return (
                            <div
                                key={slide.mal_id || idx}
                                className={`slide-panel ${isActive ? 'active-slide' : ''}`}
                                style={{ width: `${100 / totalSlides}%` }}
                            >
                                <div className="slide-core">
                                    {/* Left: Metadata & Call to Action */}
                                    <div className="slide-details">
                                        <div className="genre-rank-badge">
                                            <span className="pulse-dot" />
                                            <span>{slide.badgeLabel}</span>
                                        </div>

                                        <div className="title-box">
                                            <h2 className="slide-title" title={slide.title}>
                                                {slide.title}
                                            </h2>
                                            <p className="slide-subtitle">
                                                {slide.title_english && slide.title_english !== slide.title
                                                    ? slide.title_english
                                                    : slide.title}
                                            </p>
                                        </div>

                                        {/* Spec badges strip */}
                                        <div className="spec-strip">
                                            <div className="score-pill">
                                                <span className="star">★</span>
                                                <span className="val">{slide.score}</span>
                                                <span className="unit">MAL</span>
                                            </div>

                                            <div className="stat-pill">
                                                <span className="label">WEEKLY RANK</span>
                                                <span className="val">#{slide.rank}</span>
                                            </div>

                                            <div className="stat-pill">
                                                <span className="label">FORMAT</span>
                                                <span className="val">
                                                    {slide.type}
                                                    {slide.episodes ? ` • ${slide.episodes}E` : ''}
                                                </span>
                                            </div>

                                            {primaryGenres && (
                                                <div className="stat-pill genre-pill">
                                                    <span className="val">{primaryGenres.toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description preview */}
                                        <div className="synopsis-box">
                                            <p className="slide-synopsis">{synopsisClean}</p>
                                        </div>

                                        {/* CTA Button */}
                                        <div className="cta-wrapper">
                                            <Link to={`/anime/${slide.mal_id}`} className="checkout-btn">
                                                <span>CHECK OUT SPEC SHEET</span>
                                                <span className="btn-arrow">→</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Right: Ambient Poster Frame */}
                                    <div className="slide-poster-slot">
                                        <div
                                            className="ambient-glow"
                                            style={{ backgroundImage: `url(${slide.imageUrl})` }}
                                        />
                                        <Link to={`/anime/${slide.mal_id}`} className="poster-frame">
                                            <img src={slide.imageUrl} alt={slide.title} />
                                            <div className="poster-glass-rim" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Controls Bar: Weekly Rank Jumps + Mechanical Navigation */}
            <div className="slider-bottom-controls">
                <div className="rank-chips-group">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.mal_id || idx}
                            type="button"
                            className={`rank-chip ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => handleSelectIndex(idx)}
                            title={`Jump to #${idx + 1}: ${slide.title}`}
                        >
                            <span className="chip-indicator" />
                            {idx === 0 ? '#1 APEX' : `#0${idx + 1}`}
                        </button>
                    ))}
                </div>

                <div className="nav-arrows-group">
                    <button
                        type="button"
                        className="arrow-btn"
                        onClick={handlePrev}
                        aria-label="Previous Weekly Top Anime"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="arrow-btn"
                        onClick={handleNext}
                        aria-label="Next Weekly Top Anime"
                    >
                        ›
                    </button>
                </div>
            </div>
        </SliderConsole>
    );
}

const SliderConsole = styled.div`
    width: min(92%, 1280px);
    margin: 1rem auto 1.5rem auto;
    background-color: ${tokens.colors.chassis};
    border-radius: ${tokens.radii.xl};
    box-shadow: ${tokens.shadows.card};
    border: 1px solid rgba(255, 247, 240, 0.85);
    padding: 1.25rem 2rem 1.5rem 2rem;
    ${cornerScrews}
    position: relative;
    overflow: hidden;
    transition: ${tokens.transitions.normal};

    @media screen and (max-width: 1024px) {
        width: 95%;
        padding: 1.25rem 1.25rem;
    }

    @media screen and (max-width: 768px) {
        padding: 1rem 0.85rem;
        margin: 0.75rem auto 1.25rem auto;
        border-radius: ${tokens.radii.lg};
    }

    .slider-telemetry-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid ${tokens.colors.borderShadow};
        box-shadow: 0 1px 0 ${tokens.colors.borderLight};

        .telemetry-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .telemetry-led {
                width: 8px;
                height: 8px;
                border-radius: ${tokens.radii.full};
                background-color: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
                animation: pulse 1.8s infinite ease-in-out;
            }

            .telemetry-label {
                font-family: ${tokens.fonts.technical};
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: ${tokens.colors.textMuted};
                text-shadow: ${tokens.shadows.textEmbossed};
            }
        }

        .telemetry-meta {
            display: flex;
            align-items: center;
            gap: 1rem;

            .slide-counter {
                font-family: ${tokens.fonts.technical};
                font-size: 0.78rem;
                font-weight: 700;
                color: ${tokens.colors.textPrimary};
                background: ${tokens.colors.recessed};
                padding: 2px 8px;
                border-radius: ${tokens.radii.xs};
                box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.15), inset -1px -1px 2px rgba(255, 255, 255, 0.8);
            }

            .console-vents {
                ${ventSlots}
            }
        }
    }

    /* Carousel Horizontal Viewport */
    .slider-viewport {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: ${tokens.radii.md};
    }

    /* Smooth Animated Track */
    .slider-track {
        display: flex;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
    }

    .slide-panel {
        flex-shrink: 0;
        box-sizing: border-box;
        opacity: 0.3;
        transform: scale(0.98);
        transition: opacity 0.5s ease, transform 0.5s ease;

        &.active-slide {
            opacity: 1;
            transform: scale(1);
        }
    }

    .slide-core {
        display: grid;
        grid-template-columns: 1.25fr 0.75fr;
        gap: 2.5rem;
        align-items: center;
        height: 330px;
        box-sizing: border-box;
        padding: 0 0.5rem;

        @media screen and (max-width: 900px) {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 480px;
            gap: 1.5rem;
        }
    }

    .slide-details {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
        padding: 4px 0;
        box-sizing: border-box;

        .genre-rank-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            align-self: flex-start;
            background: rgba(255, 71, 87, 0.12);
            color: ${tokens.colors.accent};
            border: 1px solid rgba(255, 71, 87, 0.4);
            padding: 3px 9px;
            border-radius: ${tokens.radii.sm};
            font-family: ${tokens.fonts.technical};
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            margin-bottom: 0.35rem;

            .pulse-dot {
                width: 6px;
                height: 6px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
            }
        }

        .title-box {
            height: 64px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            margin-bottom: 0.35rem;
        }

        .slide-title {
            font-family: ${tokens.fonts.primary};
            font-size: clamp(1.25rem, 2.5vw, 1.75rem);
            font-weight: 800;
            color: ${tokens.colors.textPrimary};
            line-height: 1.2;
            letter-spacing: -0.02em;
            text-shadow: ${tokens.shadows.textEmbossed};
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 2px;
        }

        .slide-subtitle {
            font-family: ${tokens.fonts.primary};
            font-size: 0.85rem;
            font-weight: 600;
            color: ${tokens.colors.textMuted};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .spec-strip {
            height: 32px;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 0.35rem;
            overflow: hidden;
            flex-wrap: nowrap;

            .score-pill {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                background: rgba(29, 34, 44, 0.9);
                color: #fbbf24;
                font-family: ${tokens.fonts.technical};
                padding: 4px 10px;
                border-radius: ${tokens.radii.sm};
                font-weight: 800;
                font-size: 0.85rem;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);

                .star {
                    font-size: 0.85rem;
                }

                .val {
                    color: #ffffff;
                }

                .unit {
                    color: #94a3b8;
                    font-size: 0.65rem;
                    padding-left: 2px;
                }
            }

            .stat-pill {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                background: ${tokens.colors.recessed};
                padding: 4px 10px;
                border-radius: ${tokens.radii.sm};
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.12), inset -1px -1px 2px rgba(255, 255, 255, 0.8);

                .label {
                    color: ${tokens.colors.textMuted};
                    font-weight: 600;
                    font-size: 0.68rem;
                }

                .val {
                    color: ${tokens.colors.textPrimary};
                    font-weight: 700;
                }

                &.genre-pill {
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    .val {
                        color: ${tokens.colors.accent};
                    }
                }
            }
        }

        .synopsis-box {
            height: 62px;
            overflow: hidden;
            margin-bottom: 0.6rem;
        }

        .slide-synopsis {
            font-family: ${tokens.fonts.primary};
            font-size: 0.88rem;
            color: ${tokens.colors.textMuted};
            line-height: 1.45;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 620px;
        }

        .cta-wrapper {
            margin-top: auto;

            .checkout-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                background-color: ${tokens.colors.accent};
                color: ${tokens.colors.accentForeground};
                font-family: ${tokens.fonts.technical};
                font-size: 0.82rem;
                font-weight: 700;
                letter-spacing: 0.05em;
                padding: 0.65rem 1.4rem;
                border-radius: ${tokens.radii.md};
                text-decoration: none;
                box-shadow: ${tokens.shadows.accentButton};
                transition: ${tokens.transitions.fast};

                .btn-arrow {
                    font-size: 1rem;
                    transition: transform 0.2s ease;
                }

                &:hover {
                    background-color: ${tokens.colors.accentHover};
                    box-shadow: 0 4px 14px rgba(255, 71, 87, 0.6);
                    transform: translateY(-2px);

                    .btn-arrow {
                        transform: translateX(4px);
                    }
                }

                &:active {
                    transform: translateY(0);
                    box-shadow: ${tokens.shadows.accentButtonPressed};
                }
            }
        }
    }

    .slide-poster-slot {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        .ambient-glow {
            position: absolute;
            inset: -10px;
            background-size: cover;
            background-position: center;
            filter: blur(35px) saturate(1.4);
            opacity: 0.35;
            z-index: 1;
            pointer-events: none;
            border-radius: ${tokens.radii.xl};
        }

        .poster-frame {
            position: relative;
            z-index: 2;
            width: 210px;
            height: 290px;
            border-radius: ${tokens.radii.lg};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.floating};
            border: 2px solid rgba(255, 247, 240, 0.9);
            overflow: hidden;
            text-decoration: none;
            display: block;
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
                transition: transform 0.4s ease;
            }

            .poster-glass-rim {
                position: absolute;
                inset: 0;
                box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.35);
                pointer-events: none;
            }

            &:hover {
                transform: translateY(-4px) scale(1.02);

                img {
                    transform: scale(1.05);
                }
            }

            @media screen and (max-width: 900px) {
                width: 180px;
                height: 250px;
            }
        }
    }

    .slider-bottom-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 1.25rem;
        padding-top: 0.75rem;
        border-top: 1px solid ${tokens.colors.borderShadow};
        box-shadow: 0 1px 0 ${tokens.colors.borderLight};
        gap: 0.75rem;
        flex-wrap: wrap;

        .rank-chips-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;

            .rank-chip {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                font-family: ${tokens.fonts.technical};
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.04em;
                color: ${tokens.colors.textMuted};
                background: ${tokens.colors.chassis};
                border: 1px solid rgba(255, 247, 240, 0.8);
                border-radius: ${tokens.radii.sm};
                padding: 5px 11px;
                cursor: pointer;
                box-shadow: 3px 3px 6px ${tokens.colors.borderShadow}, -3px -3px 6px ${tokens.colors.borderLight};
                transition: ${tokens.transitions.fast};

                .chip-indicator {
                    width: 5px;
                    height: 5px;
                    border-radius: ${tokens.radii.full};
                    background: ${tokens.colors.borderDark};
                    transition: ${tokens.transitions.fast};
                }

                &:hover {
                    color: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.buttonHover};
                    transform: translateY(-1px);
                }

                &.active {
                    color: ${tokens.colors.accent};
                    background: ${tokens.colors.recessed};
                    border-color: rgba(255, 71, 87, 0.4);
                    box-shadow: ${tokens.shadows.pressed};

                    .chip-indicator {
                        background: ${tokens.colors.accent};
                        box-shadow: ${tokens.shadows.glowOrange};
                    }
                }

                &:active {
                    transform: translateY(1px);
                }
            }
        }

        .nav-arrows-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .arrow-btn {
                width: 34px;
                height: 34px;
                border-radius: ${tokens.radii.sm};
                border: 1px solid rgba(255, 247, 240, 0.8);
                background: ${tokens.colors.chassis};
                color: ${tokens.colors.textPrimary};
                font-size: 1.25rem;
                font-family: monospace;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 3px 3px 6px ${tokens.colors.borderShadow}, -3px -3px 6px ${tokens.colors.borderLight};
                transition: ${tokens.transitions.fast};

                &:hover {
                    color: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.buttonHover};
                    transform: translateY(-1px);
                }

                &:active {
                    transform: translateY(1px);
                    box-shadow: ${tokens.shadows.pressed};
                }
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
`;

export default GenreSlider;
