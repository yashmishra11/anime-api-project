import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { tokens, cornerScrews } from '../theme/tokens';
import WatchlistButton from './WatchlistButton';
import { useGlobalContext } from '../context/global';

// Curated collection of world-renowned anime landscapes & scenery
const CURATED_LANDSCAPES = [
    {
        id: 21459,
        title: "Your Name",
        titleNative: "君の名は。",
        scene: "Lake Itomori at Twilight — Comet Tiamat",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2016",
        format: "MOVIE",
        score: 8.8,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21459-yeX058iWpwCV.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21459-yeX058iWpwCV.jpg",
        lore: "A cosmic fracture of stardust reflected over the quiet volcanic caldera of Itomori, where twilight blurs the boundary between memory and dreams."
    },
    {
        id: 199,
        title: "Spirited Away",
        titleNative: "千と千尋の神隠し",
        scene: "The Ocean Railway — Swamp Bottom Line",
        studio: "Studio Ghibli",
        director: "Hayao Miyazaki",
        year: "2001",
        format: "MOVIE",
        score: 8.9,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/199-4V6P1e9k.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx199-b1d6x8zW.jpg",
        lore: "Submerged iron tracks gliding through mirror-smooth ocean waters under pastel clouds, where the lone spirit train journeys into the sunset."
    },
    {
        id: 154587,
        title: "Frieren: Beyond Journey's End",
        titleNative: "葬送のフリーレン",
        scene: "The Hilltop Meadow of Blue Sem Flowers",
        studio: "Madhouse",
        director: "Keiichirou Saitou",
        year: "2023",
        format: "TV",
        score: 9.3,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-n2btaSMjhUOI.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-573TGNQhA1p1.jpg",
        lore: "A tranquil cliffside overlooking northern mountain valleys, carpeted in ethereal blue blossoms that sway softly in the cool alpine breeze."
    },
    {
        id: 106286,
        title: "Weathering With You",
        titleNative: "天気の子",
        scene: "Rooftop Shinto Torii over Tokyo",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2019",
        format: "MOVIE",
        score: 8.3,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/106286-sL9jBv4nB9l1.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx106286-621mF3j7s.jpg",
        lore: "Radiant golden shafts of sunlight piercing torrential rainclouds, illuminating glistening rain puddles and Tokyo's boundless skyline."
    },
    {
        id: 21827,
        title: "Violet Evergarden",
        titleNative: "ヴァイオレット・エヴァーガーデン",
        scene: "The Port City of Leiden at Dusk",
        studio: "Kyoto Animation",
        director: "Taichi Ishidate",
        year: "2018",
        format: "TV",
        score: 8.6,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21827-0N2F3pTfI6m6.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-10ffHkuzj.jpg",
        lore: "Cobblestone boulevards and iridescent canal reflections kissed by the evening glow, where handwritten letters carry unsaid emotions across the sea."
    },
    {
        id: 431,
        title: "Howl's Moving Castle",
        titleNative: "ハウルの動く城",
        scene: "The Secret Alpine Lake & Flower Haven",
        studio: "Studio Ghibli",
        director: "Hayao Miyazaki",
        year: "2004",
        format: "MOVIE",
        score: 8.8,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/431-7b9X3e3F.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx431-1e9k.jpg",
        lore: "A pristine high-altitude meadow of wild star blossoms framed by jagged snow-capped summits, untouched by the noise of the outside world."
    },
    {
        id: 142329,
        title: "Suzume",
        titleNative: "すずめの戸締まり",
        scene: "The Abandoned Onsen Gateway to the Ever-After",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2022",
        format: "MOVIE",
        score: 8.4,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/142329-8q2L4h3oP9jX.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142329-3L9J.jpg",
        lore: "A silent moss-covered rotunda standing in shallow springwater, framing a door that opens into a cosmic twilight where all times converge."
    },
    {
        id: 16498,
        title: "Attack on Titan",
        titleNative: "進撃の巨人",
        scene: "The Outer Plains Beyond Wall Maria at Sunrise",
        studio: "WIT Studio",
        director: "Tetsuro Araki",
        year: "2013",
        format: "TV",
        score: 8.5,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8TO00P9zPzNu.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-m5T.jpg",
        lore: "Vast rolling emerald plains stretching toward the distant horizon under the first golden rays of dawn, whispering the promise of freedom."
    },
    {
        id: 101922,
        title: "Demon Slayer: Kimetsu no Yaiba",
        titleNative: "鬼滅の刃",
        scene: "Mount Sagiri — The Wisteria Grove Sanctuary",
        studio: "ufotable",
        director: "Haruo Sotozaki",
        year: "2019",
        format: "TV",
        score: 8.5,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YATy0mFs4p1c.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTDYeaInitialize.jpg",
        lore: "Cascades of luminous violet wisteria blossoms glowing gently under moonlight, forming an ancient protective perimeter against the night."
    },
    {
        id: 9253,
        title: "Steins;Gate",
        titleNative: "シュタインズ・ゲート",
        scene: "Akihabara Station Overpass at Golden Hour",
        studio: "White Fox",
        director: "Hiroshi Hamasaki",
        year: "2011",
        format: "TV",
        score: 9.0,
        image: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/9253-eU4vWl3t4y3k.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-e9bg5yZt4j2R.jpg",
        lore: "Long shadows stretching across the Tokyo pedestrian overpasses as cicadas buzz softly in the sweltering summer air of World Line α."
    }
];

const SLIDE_DURATION_MS = 5000; // Exact 5 seconds as requested

export default function Cinemation() {
    const { popularAnime } = useGlobalContext();
    const [useLiveBanners, setUseLiveBanners] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAudioActive, setIsAudioActive] = useState(false);

    const containerRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioNodesRef = useRef([]);
    const hoverTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const lastTickTimeRef = useRef(Date.now());

    // Build the active slide list: curated landscapes or live banners from global context
    const slideList = useMemo(() => {
        if (!useLiveBanners) return CURATED_LANDSCAPES;
        const liveWithBanners = (popularAnime || [])
            .filter(a => a.bannerImage)
            .map(a => ({
                id: a.id || a.mal_id,
                title: a.title,
                titleNative: a.title_japanese || a.title_romaji || '',
                scene: `${a.title} Cinematic Panorama`,
                studio: a.studios?.[0]?.name || a.studio || 'Studio Archive',
                director: 'Director Telemetry',
                year: a.year ? String(a.year) : '2024',
                format: a.type || 'TV',
                score: a.score || 8.5,
                image: a.bannerImage,
                poster: a.images?.jpg?.large_image_url || a.coverImage?.large || '',
                lore: a.synopsis ? a.synopsis.substring(0, 160) + '...' : 'A captivating moment frozen in high resolution from the official transmission archives.'
            }));
        return liveWithBanners.length > 0 ? liveWithBanners : CURATED_LANDSCAPES;
    }, [useLiveBanners, popularAnime]);

    const currentSlide = slideList[currentIndex] || slideList[0];

    // Whether the anime info dossier is visible (hovered either on button or on card)
    const showOriginCard = isButtonHovered || isCardHovered;

    // Advance slide
    const nextSlide = useCallback(() => {
        setCurrentIndex(prev => (prev + 1) % slideList.length);
        setProgressPercent(0);
        lastTickTimeRef.current = Date.now();
    }, [slideList.length]);

    // Go to previous slide
    const prevSlide = useCallback(() => {
        setCurrentIndex(prev => (prev - 1 + slideList.length) % slideList.length);
        setProgressPercent(0);
        lastTickTimeRef.current = Date.now();
    }, [slideList.length]);

    // Smooth 5-second countdown timer
    useEffect(() => {
        if (!isPlaying || showOriginCard || isHoveringCard) {
            return;
        }

        lastTickTimeRef.current = Date.now();
        const updateInterval = 50; // update progress every 50ms

        progressIntervalRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastTickTimeRef.current;
            lastTickTimeRef.current = now;

            setProgressPercent(prev => {
                const next = prev + (elapsed / SLIDE_DURATION_MS) * 100;
                if (next >= 100) {
                    nextSlide();
                    return 0;
                }
                return next;
            });
        }, updateInterval);

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isPlaying, showOriginCard, isHoveringCard, nextSlide]);

    // Reset progress when index changes manually
    useEffect(() => {
        setProgressPercent(0);
        lastTickTimeRef.current = Date.now();
    }, [currentIndex]);

    // Keyboard navigation (Left/Right arrows, Spacebar)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                setIsPlaying(p => !p);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Fullscreen toggle handler
    const toggleFullscreen = async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Ambient Lofi Audio Synthesizer (Pure Web Audio API — 0 external files)
    const toggleAmbientAudio = () => {
        if (isAudioActive) {
            // Stop sound
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
                audioContextRef.current = null;
            }
            audioNodesRef.current = [];
            setIsAudioActive(false);
        } else {
            // Start gentle warm chord & soft rain generator
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const ctx = new AudioCtx();
                audioContextRef.current = ctx;

                const masterGain = ctx.createGain();
                masterGain.gain.setValueAtTime(0.12, ctx.currentTime);
                masterGain.connect(ctx.destination);

                // Warm ambient pentatonic chord (Cmaj9 / Fmaj9 gentle frequencies)
                const freqs = [130.81, 164.81, 196.00, 246.94, 293.66]; // C3, E3, G3, B3, D4
                freqs.forEach(f => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const filter = ctx.createBiquadFilter();

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(f, ctx.currentTime);

                    // Low-pass filter for cozy muffled warm tone
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(380, ctx.currentTime);

                    // Subtle LFO vibrato
                    const lfo = ctx.createOscillator();
                    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
                    const lfoGain = ctx.createGain();
                    lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
                    lfo.connect(osc.frequency);
                    lfo.start();

                    gain.gain.setValueAtTime(0.06, ctx.currentTime);
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(masterGain);
                    osc.start();

                    audioNodesRef.current.push(osc, lfo);
                });

                // Gentle pink-noise soft rain bed
                const bufferSize = ctx.sampleRate * 2;
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                let b0 = 0, b1 = 0, b2 = 0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.04;
                }

                const noise = ctx.createBufferSource();
                noise.buffer = noiseBuffer;
                noise.loop = true;

                const noiseFilter = ctx.createBiquadFilter();
                noiseFilter.type = 'bandpass';
                noiseFilter.frequency.setValueAtTime(1200, ctx.currentTime);
                noiseFilter.Q.setValueAtTime(0.8, ctx.currentTime);

                const noiseGain = ctx.createGain();
                noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);

                noise.connect(noiseFilter);
                noiseFilter.connect(noiseGain);
                noiseGain.connect(masterGain);
                noise.start();

                audioNodesRef.current.push(noise);
                setIsAudioActive(true);
            } catch (e) {
                console.error('Audio synthesizer error:', e);
            }
        }
    };

    // Cleanup audio on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, []);

    // Handlers for graceful hover transition
    const handleButtonMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsButtonHovered(true);
    };

    const handleButtonMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsButtonHovered(false);
        }, 220);
    };

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsCardHovered(true);
    };

    const handleCardMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsCardHovered(false);
        }, 220);
    };

    return (
        <CinemationStyled ref={containerRef} className={isFullscreen ? 'is-fullscreen' : ''}>
            {/* Ambient Title & Control Ribbon */}
            <div className="cinemation-ribbon">
                <div className="ribbon-brand">
                    <span className="ambient-orb" />
                    <div className="title-group">
                        <span className="telemetry-pill">❖ CINEMATION // CHILL AMBIENCE & LANDSCAPES</span>
                        <h2>Atmospheric Landscape Archive</h2>
                    </div>
                </div>

                <div className="ribbon-controls">
                    {/* Switch between Curated vs Live Banners */}
                    <button
                        type="button"
                        className={`mode-btn ${useLiveBanners ? 'active' : ''}`}
                        onClick={() => {
                            setUseLiveBanners(!useLiveBanners);
                            setCurrentIndex(0);
                        }}
                        title="Toggle between Curated Masterpieces and Live AniList Banners"
                    >
                        <span className="pip" />
                        <span>{useLiveBanners ? 'SOURCE: LIVE ANILIST' : 'SOURCE: CURATED 4K'}</span>
                    </button>

                    {/* Ambient Lofi Sound Synthesizer */}
                    <button
                        type="button"
                        className={`sound-btn ${isAudioActive ? 'active' : ''}`}
                        onClick={toggleAmbientAudio}
                        title="Toggle calming rain & lofi chords ambient sound"
                    >
                        <span className="sound-icon">{isAudioActive ? '🔊' : '🔈'}</span>
                        <span>{isAudioActive ? 'LOFI CHORDS: ON' : 'CHILL AUDIO'}</span>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        className="fs-btn"
                        onClick={toggleFullscreen}
                        title="Toggle full-screen cinema view"
                    >
                        <span>{isFullscreen ? '⤓ EXIT FULLSCREEN' : '⤢ FULLSCREEN'}</span>
                    </button>
                </div>
            </div>

            {/* Main Cinema Theater Viewport */}
            <div
                className="cinema-theater"
                onMouseEnter={() => setIsHoveringCard(true)}
                onMouseLeave={() => setIsHoveringCard(false)}
            >
                {/* 5-Second Real-Time Animated Progress Bar */}
                <div className="slideshow-progress-track">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${progressPercent}%`,
                            transition: isPlaying && !showOriginCard ? 'width 60ms linear' : 'none'
                        }}
                    />
                </div>

                {/* Landscape Canvas Slides */}
                <div className="viewport-screen">
                    {slideList.map((item, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className={`cinema-slide ${isActive ? 'active' : ''}`}
                                style={{
                                    backgroundImage: `url(${item.image})`,
                                    zIndex: isActive ? 2 : 1
                                }}
                            >
                                <div className="cinema-vignette" />
                                <div className="cinema-light-leak" />
                            </div>
                        );
                    })}

                    {/* Quick Previous & Next Chevron Controls */}
                    <button
                        type="button"
                        className="nav-chevron chevron-prev"
                        onClick={prevSlide}
                        aria-label="Previous Landscape"
                        title="Previous Landscape (Left Arrow)"
                    >
                        ‹
                    </button>

                    <button
                        type="button"
                        className="nav-chevron chevron-next"
                        onClick={nextSlide}
                        aria-label="Next Landscape"
                        title="Next Landscape (Right Arrow)"
                    >
                        ›
                    </button>

                    {/* Bottom HUD Bar: Scenery title, Origin Button, and Play/Pause */}
                    <div className="cinema-hud-bottom">
                        <div className="hud-scene-info">
                            <div className="scene-label">
                                <span className="scene-dot" />
                                <span>LOCATION ARCHIVE // SCENIC TRANSMISSION</span>
                            </div>
                            <h3 className="scene-name">{currentSlide.scene}</h3>
                        </div>

                        {/* Interactive Play/Pause & Counter */}
                        <div className="hud-playback-actions">
                            <div className="slide-counter-chip">
                                <strong>{String(currentIndex + 1).padStart(2, '0')}</strong>
                                <span>/</span>
                                <span>{String(slideList.length).padStart(2, '0')}</span>
                            </div>

                            <button
                                type="button"
                                className="hud-play-toggle"
                                onClick={() => setIsPlaying(!isPlaying)}
                                title={isPlaying ? "Pause 5-second slideshow (Spacebar)" : "Resume 5-second slideshow (Spacebar)"}
                            >
                                <span>{isPlaying ? '⏸ PAUSE' : '▶ PLAY'}</span>
                            </button>

                            {/* THE SPECIMEN ORIGIN BUTTON (Hover to reveal anime) */}
                            <div className="origin-button-slot">
                                <button
                                    type="button"
                                    className={`identify-anime-btn ${showOriginCard ? 'is-active' : ''}`}
                                    onMouseEnter={handleButtonMouseEnter}
                                    onMouseLeave={handleButtonMouseLeave}
                                    onClick={() => setIsButtonHovered(!isButtonHovered)}
                                    title="Hover to identify which anime this scenery is from"
                                >
                                    <span className="radar-pulse" />
                                    <span className="btn-icon">❖</span>
                                    <span className="btn-text">IDENTIFY ANIME</span>
                                    <span className="hover-cue">👁 HOVER</span>
                                </button>

                                {/* HOVER-TO-REVEAL ANIME ORIGIN DOSSIER CARD */}
                                <div
                                    className={`origin-dossier-popover ${showOriginCard ? 'revealed' : ''}`}
                                    onMouseEnter={handleCardMouseEnter}
                                    onMouseLeave={handleCardMouseLeave}
                                >
                                    <div className="dossier-header-strip">
                                        <div className="dossier-badge">
                                            <span className="led-amber" />
                                            <span>SPECIMEN TELEMETRY VERIFIED</span>
                                        </div>
                                        <span className="format-tag">{currentSlide.format}</span>
                                    </div>

                                    <div className="dossier-body">
                                        {/* Anime Poster Miniature */}
                                        <div className="dossier-poster-slot">
                                            <img
                                                src={currentSlide.poster || currentSlide.image}
                                                alt={currentSlide.title}
                                                loading="lazy"
                                            />
                                            {currentSlide.score && (
                                                <div className="poster-score">
                                                    <span>★</span>
                                                    <span>{currentSlide.score.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Anime Metadata */}
                                        <div className="dossier-meta">
                                            <h4 className="anime-title">{currentSlide.title}</h4>
                                            {currentSlide.titleNative && (
                                                <span className="anime-native-title">{currentSlide.titleNative}</span>
                                            )}

                                            <div className="meta-spec-grid">
                                                <div className="spec-item">
                                                    <span className="spec-label">STUDIO:</span>
                                                    <span className="spec-value">{currentSlide.studio}</span>
                                                </div>
                                                <div className="spec-item">
                                                    <span className="spec-label">YEAR:</span>
                                                    <span className="spec-value">{currentSlide.year}</span>
                                                </div>
                                                {currentSlide.director && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">DIRECTION:</span>
                                                        <span className="spec-value">{currentSlide.director}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="scenery-lore">
                                                &ldquo;{currentSlide.lore}&rdquo;
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Navigate to Anime & Quick Watchlist */}
                                    <div className="dossier-actions">
                                        <Link
                                            to={`/anime/${currentSlide.id}`}
                                            className="explore-anime-link"
                                        >
                                            <span>EXPLORE FULL SPEC SHEET</span>
                                            <span className="arrow">→</span>
                                        </Link>

                                        <div className="quick-watchlist-slot">
                                            <WatchlistButton
                                                anime={{
                                                    id: currentSlide.id,
                                                    mal_id: currentSlide.id,
                                                    title: currentSlide.title,
                                                    type: currentSlide.format,
                                                    score: currentSlide.score,
                                                    images: {
                                                        jpg: { large_image_url: currentSlide.poster }
                                                    },
                                                    coverImage: {
                                                        large: currentSlide.poster,
                                                        extraLarge: currentSlide.poster
                                                    }
                                                }}
                                                variant="compact"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Landscape Carousel Thumbnails */}
            <div className="landscape-thumbnail-strip">
                <div className="strip-header">
                    <span className="strip-label">// SCENERY REEL SELECTOR ({slideList.length} TRANSMISSIONS)</span>
                    <span className="strip-hint">CLICK ANY SLIDE TO SWITCH • 5S AUTO-CYCLE</span>
                </div>
                <div className="thumbnails-track">
                    {slideList.map((item, idx) => {
                        const isSelected = idx === currentIndex;
                        return (
                            <button
                                key={`thumb-${item.id}-${idx}`}
                                type="button"
                                className={`thumb-card ${isSelected ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setProgressPercent(0);
                                }}
                                title={`${item.title} — ${item.scene}`}
                            >
                                <img src={item.image} alt={item.scene} loading="lazy" />
                                <div className="thumb-info">
                                    <span className="thumb-index">#{String(idx + 1).padStart(2, '0')}</span>
                                    <span className="thumb-title">{item.title}</span>
                                </div>
                                {isSelected && <div className="thumb-active-glow" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </CinemationStyled>
    );
}

// ==================== STYLES ====================

const kenBurnsDrift = keyframes`
    0% {
        transform: scale(1.0) translate(0, 0);
    }
    50% {
        transform: scale(1.05) translate(-1%, -0.8%);
    }
    100% {
        transform: scale(1.08) translate(1%, 0.6%);
    }
`;

const pulseRadar = keyframes`
    0% {
        transform: scale(0.9);
        opacity: 0.9;
    }
    50% {
        transform: scale(1.4);
        opacity: 0.3;
    }
    100% {
        transform: scale(0.9);
        opacity: 0.9;
    }
`;

const CinemationStyled = styled.div`
    width: min(95%, 1380px);
    margin: 1rem auto 3rem auto;
    font-family: ${tokens.fonts.technical};

    &.is-fullscreen {
        width: 100vw !important;
        max-width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 1.5rem !important;
        background: #0d0e12 !important;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 999999;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;

        .cinema-theater {
            flex: 1;
            height: calc(100vh - 160px) !important;
            max-height: calc(100vh - 160px) !important;
        }
    }

    /* Ambient Ribbon Header */
    .cinemation-ribbon {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;

        .ribbon-brand {
            display: flex;
            align-items: center;
            gap: 0.85rem;

            .ambient-orb {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: ${tokens.colors.accent};
                box-shadow: 0 0 12px ${tokens.colors.accent}, 0 0 24px rgba(255, 94, 40, 0.4);
                animation: ${pulseRadar} 2.2s infinite ease-in-out;
            }

            .title-group {
                .telemetry-pill {
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    color: ${tokens.colors.accent};
                    display: block;
                    text-transform: uppercase;
                }

                h2 {
                    font-family: ${tokens.fonts.display};
                    font-size: 1.6rem;
                    color: ${tokens.colors.textPrimary};
                    letter-spacing: -0.01em;
                    margin: 0;
                }
            }
        }

        .ribbon-controls {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            flex-wrap: wrap;

            button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.45rem 1rem;
                border-radius: ${tokens.radii.sm};
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.05em;
                color: ${tokens.colors.textMuted};
                background: ${tokens.colors.chassis};
                border: 1px solid rgba(255, 247, 240, 0.7);
                box-shadow: ${tokens.shadows.card};
                cursor: pointer;
                transition: ${tokens.transitions.fast};

                &:hover {
                    color: ${tokens.colors.textPrimary};
                    border-color: ${tokens.colors.borderDark};
                    transform: translateY(-1px);
                    box-shadow: ${tokens.shadows.buttonHover};
                }

                &.active {
                    color: ${tokens.colors.accent};
                    border-color: ${tokens.colors.accent};
                    background: rgba(255, 94, 40, 0.08);
                    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .pip {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: ${tokens.colors.accent};
                    box-shadow: 0 0 6px ${tokens.colors.accent};
                }
            }
        }
    }

    /* Main Cinema Theater Frame */
    .cinema-theater {
        position: relative;
        width: 100%;
        height: 620px;
        border-radius: ${tokens.radii.xl};
        background: #090a0f;
        border: 2px solid ${tokens.colors.borderDark};
        box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.5), inset 0 0 40px rgba(0, 0, 0, 0.8);
        overflow: hidden;
        ${cornerScrews}

        @media (max-width: 1024px) {
            height: 520px;
        }

        @media (max-width: 768px) {
            height: 440px;
        }
    }

    /* 5-Second Real-Time Countdown Track */
    .slideshow-progress-track {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(255, 255, 255, 0.12);
        z-index: 20;

        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff5e28, #ff8a4c, #ffd166);
            box-shadow: 0 0 8px rgba(255, 94, 40, 0.8);
        }
    }

    /* Viewport Screen with smooth crossfade */
    .viewport-screen {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .cinema-slide {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            opacity: 0;
            transition: opacity 1000ms cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            transform: scale(1.0);

            &.active {
                opacity: 1;
                pointer-events: auto;
                animation: ${kenBurnsDrift} 18s infinite alternate ease-in-out;
            }

            .cinema-vignette {
                position: absolute;
                inset: 0;
                background: radial-gradient(
                    circle at center,
                    transparent 45%,
                    rgba(0, 0, 0, 0.45) 80%,
                    rgba(0, 0, 0, 0.85) 100%
                ), linear-gradient(
                    to top,
                    rgba(9, 10, 15, 0.92) 0%,
                    rgba(9, 10, 15, 0.4) 25%,
                    transparent 55%
                );
            }

            .cinema-light-leak {
                position: absolute;
                inset: 0;
                pointer-events: none;
                background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 60%);
            }
        }

        /* Next/Prev Navigation Chevrons */
        .nav-chevron {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 46px;
            height: 56px;
            border-radius: ${tokens.radii.sm};
            background: rgba(15, 17, 23, 0.65);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 2rem;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 15;
            transition: ${tokens.transitions.fast};
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

            &:hover {
                background: ${tokens.colors.accent};
                color: #ffffff;
                border-color: ${tokens.colors.accent};
                transform: translateY(-50%) scale(1.06);
                box-shadow: 0 0 20px rgba(255, 94, 40, 0.6);
            }

            &.chevron-prev {
                left: 1.25rem;
            }

            &.chevron-next {
                right: 1.25rem;
            }

            @media (max-width: 600px) {
                width: 36px;
                height: 46px;
                font-size: 1.6rem;
            }
        }
    }

    /* Bottom HUD Bar */
    .cinema-hud-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem 2rem 1.8rem 2rem;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1.5rem;
        z-index: 15;
        flex-wrap: wrap;

        @media (max-width: 768px) {
            padding: 1rem 1.25rem 1.25rem 1.25rem;
        }

        .hud-scene-info {
            max-width: 580px;

            .scene-label {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: ${tokens.colors.accent};
                margin-bottom: 0.35rem;

                .scene-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: ${tokens.colors.accent};
                    box-shadow: 0 0 6px ${tokens.colors.accent};
                }
            }

            .scene-name {
                font-family: ${tokens.fonts.display};
                font-size: clamp(1.2rem, 2.2vw, 1.85rem);
                color: #ffffff;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
                margin: 0;
                line-height: 1.25;
            }
        }

        .hud-playback-actions {
            display: flex;
            align-items: center;
            gap: 0.85rem;
            flex-wrap: wrap;

            .slide-counter-chip {
                display: flex;
                align-items: baseline;
                gap: 0.25rem;
                padding: 0.4rem 0.8rem;
                border-radius: ${tokens.radii.sm};
                background: rgba(15, 17, 23, 0.75);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #e2e8f0;
                font-size: 0.85rem;

                strong {
                    color: ${tokens.colors.accent};
                    font-size: 1rem;
                }
            }

            .hud-play-toggle {
                padding: 0.45rem 0.95rem;
                border-radius: ${tokens.radii.sm};
                background: rgba(15, 17, 23, 0.75);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #ffffff;
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                cursor: pointer;
                transition: ${tokens.transitions.fast};

                &:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: rgba(255, 255, 255, 0.35);
                }
            }
        }
    }

    /* THE IDENTIFY ANIME BUTTON (Hover Target) */
    .origin-button-slot {
        position: relative;

        .identify-anime-btn {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.55rem;
            padding: 0.55rem 1.15rem;
            border-radius: ${tokens.radii.md};
            background: rgba(255, 94, 40, 0.92);
            color: #ffffff;
            font-family: ${tokens.fonts.technical};
            font-size: 0.82rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 20px rgba(255, 94, 40, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: ${tokens.transitions.fast};

            .radar-pulse {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 0 8px #ffffff;
                animation: ${pulseRadar} 1.4s infinite ease-in-out;
            }

            .btn-icon {
                font-size: 0.9rem;
            }

            .hover-cue {
                font-size: 0.68rem;
                padding: 2px 6px;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.3);
                color: #ffe8db;
                letter-spacing: 0.05em;
            }

            &:hover,
            &.is-active {
                background: #ff4500;
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(255, 94, 40, 0.7);
            }
        }

        /* FLOATING DOSSIER POPOVER */
        .origin-dossier-popover {
            position: absolute;
            bottom: calc(100% + 14px);
            right: 0;
            width: 430px;
            border-radius: ${tokens.radii.lg};
            background: rgba(14, 16, 24, 0.94);
            backdrop-filter: blur(24px);
            border: 1.5px solid rgba(255, 94, 40, 0.6);
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(255, 94, 40, 0.2);
            padding: 1.25rem;
            z-index: 50;
            opacity: 0;
            transform: translateY(12px) scale(0.96);
            pointer-events: none;
            transition: opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1);

            &.revealed {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            @media (max-width: 540px) {
                width: calc(100vw - 3rem);
                right: -10px;
            }

            .dossier-header-strip {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 0.75rem;
                margin-bottom: 0.85rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);

                .dossier-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.68rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: #ffd166;

                    .led-amber {
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background: #ffd166;
                        box-shadow: 0 0 6px #ffd166;
                    }
                }

                .format-tag {
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }
            }

            .dossier-body {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;

                .dossier-poster-slot {
                    position: relative;
                    width: 90px;
                    flex-shrink: 0;
                    border-radius: ${tokens.radii.sm};
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);

                    img {
                        width: 100%;
                        height: 125px;
                        object-fit: cover;
                        display: block;
                    }

                    .poster-score {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        background: rgba(15, 17, 23, 0.85);
                        backdrop-filter: blur(4px);
                        color: #ffd166;
                        font-size: 0.72rem;
                        font-weight: 700;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 2px;
                        padding: 2px 0;
                    }
                }

                .dossier-meta {
                    flex: 1;

                    .anime-title {
                        font-family: ${tokens.fonts.display};
                        font-size: 1.18rem;
                        color: #ffffff;
                        line-height: 1.25;
                        margin: 0 0 0.15rem 0;
                    }

                    .anime-native-title {
                        font-size: 0.75rem;
                        color: ${tokens.colors.accent};
                        display: block;
                        margin-bottom: 0.6rem;
                    }

                    .meta-spec-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 0.35rem 0.5rem;
                        margin-bottom: 0.6rem;

                        .spec-item {
                            font-size: 0.72rem;
                            display: flex;
                            align-items: center;
                            gap: 0.35rem;

                            .spec-label {
                                color: #94a3b8;
                                font-weight: 600;
                            }

                            .spec-value {
                                color: #f1f5f9;
                                font-weight: 700;
                                white-space: nowrap;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                        }
                    }

                    .scenery-lore {
                        font-size: 0.76rem;
                        line-height: 1.45;
                        color: #cbd5e1;
                        font-style: italic;
                        margin: 0;
                        border-left: 2px solid ${tokens.colors.accent};
                        padding-left: 0.55rem;
                    }
                }
            }

            .dossier-actions {
                display: flex;
                align-items: center;
                gap: 0.65rem;
                padding-top: 0.75rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);

                .explore-anime-link {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.45rem;
                    padding: 0.55rem 0.85rem;
                    border-radius: ${tokens.radii.sm};
                    background: rgba(255, 255, 255, 0.08);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    transition: ${tokens.transitions.fast};

                    &:hover {
                        background: ${tokens.colors.accent};
                        border-color: ${tokens.colors.accent};
                        transform: translateY(-1px);

                        .arrow {
                            transform: translateX(3px);
                        }
                    }

                    .arrow {
                        transition: transform 150ms ease;
                    }
                }

                .quick-watchlist-slot {
                    flex-shrink: 0;
                }
            }
        }
    }

    /* Bottom Scenery Thumbnails Strip */
    .landscape-thumbnail-strip {
        margin-top: 1.25rem;
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.lg};
        border: 1px solid rgba(255, 247, 240, 0.85);
        box-shadow: ${tokens.shadows.card};
        padding: 1rem 1.25rem;

        .strip-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.85rem;
            font-size: 0.72rem;
            color: ${tokens.colors.textMuted};
            flex-wrap: wrap;
            gap: 0.5rem;

            .strip-label {
                font-weight: 700;
                color: ${tokens.colors.accent};
                letter-spacing: 0.06em;
            }

            .strip-hint {
                letter-spacing: 0.04em;
            }
        }

        .thumbnails-track {
            display: flex;
            gap: 0.75rem;
            overflow-x: auto;
            padding-bottom: 0.4rem;
            scrollbar-width: thin;
            scrollbar-color: ${tokens.colors.accent} ${tokens.colors.recessed};

            &::-webkit-scrollbar {
                height: 5px;
            }

            &::-webkit-scrollbar-track {
                background: ${tokens.colors.recessed};
                border-radius: 10px;
            }

            &::-webkit-scrollbar-thumb {
                background: ${tokens.colors.accent};
                border-radius: 10px;
            }

            .thumb-card {
                position: relative;
                flex: 0 0 160px;
                height: 95px;
                border-radius: ${tokens.radii.md};
                overflow: hidden;
                border: 2px solid rgba(0, 0, 0, 0.08);
                cursor: pointer;
                background: #090a0f;
                padding: 0;
                transition: ${tokens.transitions.fast};

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                    filter: brightness(0.85);
                    transition: transform 300ms ease, filter 300ms ease;
                }

                .thumb-info {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%);
                    padding: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    text-align: left;

                    .thumb-index {
                        font-size: 0.65rem;
                        color: ${tokens.colors.accent};
                        font-weight: 700;
                    }

                    .thumb-title {
                        font-size: 0.74rem;
                        font-weight: 700;
                        color: #ffffff;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }

                &:hover {
                    transform: translateY(-3px);
                    border-color: ${tokens.colors.accent};
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);

                    img {
                        transform: scale(1.08);
                        filter: brightness(1);
                    }
                }

                &.active {
                    border-color: ${tokens.colors.accent};
                    box-shadow: 0 0 14px rgba(255, 94, 40, 0.6);

                    img {
                        filter: brightness(1.05);
                    }

                    .thumb-active-glow {
                        position: absolute;
                        top: 4px;
                        right: 4px;
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: ${tokens.colors.accent};
                        box-shadow: 0 0 8px ${tokens.colors.accent};
                    }
                }
            }
        }
    }
`;
