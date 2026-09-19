import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { tokens, cornerScrews } from '../theme/tokens';
import WatchlistButton from './WatchlistButton';
import { useGlobalContext } from '../context/global';
import { fetchAniList } from '../services/anilist';

// Curated collection of world-renowned anime landscapes & scenery in true 4K UHD & High Resolution
const CURATED_LANDSCAPES = [
    {
        id: 21519,
        title: "Your Name.",
        titleNative: "君の名は。",
        scene: "Lake Itomori at Twilight — Comet Tiamat",
        resolution: "3840 × 2160",
        qualityBadge: "4K UHD",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2016",
        format: "MOVIE",
        score: 8.8,
        lore: "A cosmic fracture of stardust reflected over the quiet volcanic caldera of Itomori, where twilight blurs the boundary between memory and dreams.",
        image: "/landscapes/your-name.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/itomori-lake-your-name-4k-mxm3d7g0576dfm11.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21519-SUo3ZQuCbYhJ.png"
    },
    {
        id: 199,
        title: "Spirited Away",
        titleNative: "千と千尋の神隠し",
        scene: "The Ocean Railway — Swamp Bottom Line",
        resolution: "1920 × 1040 (FHD Widescreen)",
        qualityBadge: "FHD 1080P",
        studio: "Studio Ghibli",
        director: "Hayao Miyazaki",
        year: "2001",
        format: "MOVIE",
        score: 8.9,
        lore: "Submerged iron tracks gliding through mirror-smooth ocean waters under pastel clouds, where the lone spirit train journeys into the sunset.",
        image: "/landscapes/spirited-away.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/spirited-away-train-in-water-v3dsw820z6y890o9.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx199-sWefXJvXkDOb.jpg"
    },
    {
        id: 154587,
        title: "Frieren: Beyond Journey's End",
        titleNative: "葬送のフリーレン",
        scene: "The Sanctuary of Blue-Moon Weed",
        resolution: "1920 × 1080",
        qualityBadge: "FHD 1080P",
        studio: "Madhouse",
        director: "Keiichirou Saitou",
        year: "2023",
        format: "TV",
        score: 9.3,
        lore: "Frieren standing atop the ancient watchtower sanctuary where Himmel's beloved blue-moon weed flowers bloom amidst golden autumn foliage.",
        image: "/landscapes/frieren.jpg",
        fallbackImage: "https://static.wikia.nocookie.net/frieren/images/c/c2/Frieren_discovers_the_blue-moon_weed_field_EP2.png/revision/latest",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg"
    },
    {
        id: 106286,
        title: "Weathering With You",
        titleNative: "天気の子",
        scene: "Floating High Above Tokyo — Boundless Sky",
        resolution: "3508 × 2173 (3.5K UHD)",
        qualityBadge: "3.5K UHD",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2019",
        format: "MOVIE",
        score: 8.3,
        lore: "Radiant golden shafts of sunlight piercing torrential rainclouds, illuminating glistening rain puddles and Tokyo's boundless skyline.",
        image: "/landscapes/weathering-with-you.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/weathering-with-you-japanese-anime-8zksk5gi52zhmhig.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx106286-5COcpd0J9VbL.png"
    },
    {
        id: 21827,
        title: "Violet Evergarden",
        titleNative: "ヴァイオレット・エヴァーガーデン",
        scene: "The Postal Library of Memories — Leiden",
        resolution: "1920 × 1080",
        qualityBadge: "FHD 1080P",
        studio: "Kyoto Animation",
        director: "Taichi Ishidate",
        year: "2018",
        format: "TV",
        score: 8.6,
        lore: "Sunlight pouring across wooden book corridors and airborne manuscripts, where handwritten letters carry unsaid emotions across the sea.",
        image: "/landscapes/violet-evergarden.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/violet-evergarden-in-library-with-flying-letters-8brrjypfv4a06tnk.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21827-ubzq619ZA2E9.png"
    },
    {
        id: 431,
        title: "Howl's Moving Castle",
        titleNative: "ハウルの動く城",
        scene: "The Secret Alpine Lake & Flower Haven",
        resolution: "1920 × 1080",
        qualityBadge: "FHD 1080P",
        studio: "Studio Ghibli",
        director: "Hayao Miyazaki",
        year: "2004",
        format: "MOVIE",
        score: 8.8,
        lore: "A pristine high-altitude meadow of wild star blossoms framed by jagged snow-capped summits, untouched by the noise of the outside world.",
        image: "/landscapes/howls-moving-castle.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/exquisite-howl-s-moving-castle-scene-1fenuve9evr0fkp4.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx431-o8Lj3XkjHm2k.jpg"
    },
    {
        id: 142770,
        title: "Suzume",
        titleNative: "すずめの戸締まり",
        scene: "The Abandoned Onsen Gateway to the Ever-After",
        resolution: "6000 × 4500",
        qualityBadge: "6K UHD",
        studio: "CoMix Wave Films",
        director: "Makoto Shinkai",
        year: "2022",
        format: "MOVIE",
        score: 8.4,
        lore: "A silent moss-covered rotunda standing in shallow springwater, framing a door that opens into a cosmic twilight where all times converge.",
        image: "/landscapes/suzume.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/suzume-no-tojimari-character-by-door-hzxonr3bn7srpfek.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx142770-dDaDIRnsv5jN.jpg"
    },
    {
        id: 16498,
        title: "Attack on Titan",
        titleNative: "進撃の巨人",
        scene: "Dawn Over Wall Maria & Shiganshina",
        resolution: "3840 × 2160",
        qualityBadge: "4K UHD",
        studio: "WIT Studio",
        director: "Tetsuro Araki",
        year: "2013",
        format: "TV",
        score: 8.5,
        lore: "Vast rolling emerald plains stretching toward the distant horizon under the first golden rays of dawn, whispering the promise of freedom.",
        image: "/landscapes/attack-on-titan.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/attack-on-titan-4k-fiery-eren-538agyczt24avmdt.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-buvcRTBx4NSm.jpg"
    },
    {
        id: 101922,
        title: "Demon Slayer: Kimetsu no Yaiba",
        titleNative: "鬼滅の刃",
        scene: "Mount Sagiri — The Ancient Scenery Sanctuary",
        resolution: "2400 × 1283",
        qualityBadge: "2.4K QHD",
        studio: "ufotable",
        director: "Haruo Sotozaki",
        year: "2019",
        format: "TV",
        score: 8.5,
        lore: "Cascades of luminous mountain flora glowing gently under moonlight, forming an ancient protective perimeter against the night.",
        image: "/landscapes/demon-slayer.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/demon-slayer-scenery-7apbizlnvtyyez0c.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-WBsBl0ClmgYL.jpg"
    },
    {
        id: 9253,
        title: "Steins;Gate",
        titleNative: "シュタインズ・ゲート",
        scene: "Akihabara Radio Kaikan at Golden Hour",
        resolution: "4800 × 2700",
        qualityBadge: "4.8K UHD",
        studio: "White Fox",
        director: "Hiroshi Hamasaki",
        year: "2011",
        format: "TV",
        score: 9.0,
        lore: "Long shadows stretching across Tokyo as cicadas buzz softly in the sweltering summer air of World Line α.",
        image: "/landscapes/steins-gate.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/fan-art-steins-gate-characters-5bfff84vs4f4bxlb.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-tIUXF2gfU8Sg.jpg"
    },
    {
        id: 20954,
        title: "A Silent Voice",
        titleNative: "聲の形",
        scene: "The Ogaki Water Promenade at Twilight",
        resolution: "3229 × 2018",
        qualityBadge: "3.2K UHD",
        studio: "Kyoto Animation",
        director: "Naoko Yamada",
        year: "2016",
        format: "MOVIE",
        score: 8.8,
        lore: "Cherry blossoms drifting quietly across the canal ripples under streetlamps, carrying the silent harmony of reconciliation and renewal.",
        image: "/landscapes/a-silent-voice.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/a-silent-voice-cherry-blossoms-couple-la8mtaelurut4og2.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx20954-sYRfE5jQRtSB.jpg"
    },
    {
        id: 164,
        title: "Princess Mononoke",
        titleNative: "もののけ姫",
        scene: "The Ancient Forest of the Great Forest Spirit",
        resolution: "1920 × 1080",
        qualityBadge: "FHD 1080P",
        studio: "Studio Ghibli",
        director: "Hayao Miyazaki",
        year: "1997",
        format: "MOVIE",
        score: 8.7,
        lore: "Ancient emerald moss-draped cedar glades where Kodama click gently in the shadows, guardians of a sacred primordial sanctuary.",
        image: "/landscapes/princess-mononoke.jpg",
        fallbackImage: "https://wallpapers.com/images/hd/princess-mononoke-kodama-tree-spirits-eua4v7sybgce80lq.jpg",
        poster: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx164-ySuGzCWVw2cL.jpg"
    }
];

const SLIDE_DURATION_MS = 5000; // Exact 5 seconds as requested

export default function Cinemation() {
    const { popularAnime } = useGlobalContext();
    const [useLiveBanners, setUseLiveBanners] = useState(false);
    const [curatedList, setCuratedList] = useState(CURATED_LANDSCAPES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const [isButtonHovered, setIsButtonHovered] = useState(false);
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [vignetteEnabled, setVignetteEnabled] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const containerRef = useRef(null);
    const audioContextRef = useRef(null);
    const audioNodesRef = useRef([]);
    const hoverTimeoutRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const lastTickTimeRef = useRef(Date.now());
    const controlsTimeoutRef = useRef(null);

    // Fetch live poster URLs from AniList for curated landscapes without overwriting 4K backgrounds
    useEffect(() => {
        let isMounted = true;
        const fetchCuratedBanners = async () => {
            try {
                const ids = CURATED_LANDSCAPES.map(c => c.id);
                const query = `
                    query($ids: [Int]) {
                        Page(page: 1, perPage: 25) {
                            media(id_in: $ids, type: ANIME) {
                                id
                                coverImage { extraLarge large }
                            }
                        }
                    }
                `;
                const res = await fetchAniList(query, { ids });
                const mediaList = res?.Page?.media || [];
                if (mediaList.length > 0 && isMounted) {
                    const posterMap = new Map();
                    mediaList.forEach(m => {
                        const poster = m.coverImage?.extraLarge || m.coverImage?.large;
                        if (poster) {
                            posterMap.set(m.id, poster);
                        }
                    });

                    setCuratedList(prev => prev.map(item => {
                        const livePoster = posterMap.get(item.id);
                        if (!livePoster) return item;
                        return {
                            ...item,
                            poster: livePoster || item.poster
                        };
                    }));
                }
            } catch (err) {
                console.warn('[Cinemation] Using verified static curated landscapes fallback:', err);
            }
        };

        fetchCuratedBanners();
        return () => { isMounted = false; };
    }, []);

    // Build the active slide list: live banners from global context or curated landscapes
    const slideList = useMemo(() => {
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
                poster: a.coverImage?.large || a.images?.jpg?.large_image_url || '',
                resolution: "1920 × 400 (AniList Banner)",
                qualityBadge: "LIVE BANNER",
                lore: a.synopsis ? a.synopsis.substring(0, 160) + '...' : 'A captivating moment frozen in high resolution from the official transmission archives.'
            }));

        if (useLiveBanners) {
            return liveWithBanners.length > 0 ? liveWithBanners : curatedList;
        }
        return curatedList;
    }, [useLiveBanners, popularAnime, curatedList]);

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

    // Fullscreen toggle handler
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;
        try {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                } else if (containerRef.current.webkitRequestFullscreen) {
                    await containerRef.current.webkitRequestFullscreen();
                }
                setIsFullscreen(true);
                setShowControls(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
                setIsFullscreen(false);
                setShowControls(true);
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
            setIsFullscreen(prev => !prev);
            setShowControls(true);
        }
    }, []);

    // Synchronize fullscreen state from document changes
    useEffect(() => {
        const handleFsChange = () => {
            const fsActive = !!(document.fullscreenElement || document.webkitFullscreenElement);
            setIsFullscreen(fsActive);
            setShowControls(true);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        };
    }, []);

    // Auto-hide controls during mouse inactivity in fullscreen
    const handleContainerMouseMove = useCallback(() => {
        if (!isFullscreen) return;
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (!isButtonHovered && !isCardHovered) {
                setShowControls(false);
            }
        }, 2800);
    }, [isFullscreen, isButtonHovered, isCardHovered]);

    // Keyboard navigation (Left/Right arrows, Spacebar, F for Fullscreen, Esc)
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
            } else if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.key === 'Escape' && isFullscreen) {
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextSlide, prevSlide, toggleFullscreen, isFullscreen]);

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
        }, 120);
    };

    const handleCardMouseEnter = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setIsCardHovered(true);
    };

    const handleCardMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsCardHovered(false);
        }, 120);
    };

    return (
        <CinemationStyled 
            ref={containerRef} 
            className={`${isFullscreen ? 'is-fullscreen' : ''} ${isFullscreen && !showControls ? 'controls-hidden' : ''}`}
            onMouseMove={handleContainerMouseMove}
        >
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
                        title="Toggle between Curated 4K Masterpieces and Live AniList Banners"
                    >
                        <span className="pip" />
                        <span>{useLiveBanners ? 'SOURCE: LIVE ANILIST' : 'SOURCE: CURATED 4K UHD'}</span>
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

                    {/* Vignette Toggle (Disabled in Fullscreen & Default OFF) */}
                    <button
                        type="button"
                        className={`vignette-btn ${vignetteEnabled ? 'active' : ''}`}
                        onClick={() => setVignetteEnabled(v => !v)}
                        title={vignetteEnabled ? "Vignette enabled (click to disable)" : "Vignette disabled (click to enable)"}
                    >
                        <span className="vignette-icon">◐</span>
                        <span>{vignetteEnabled ? 'VIGNETTE: ON' : 'VIGNETTE: OFF'}</span>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        type="button"
                        className="fs-btn"
                        onClick={toggleFullscreen}
                        title="Toggle full-screen cinema view (F key or double-click)"
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
                onDoubleClick={toggleFullscreen}
                title={isFullscreen ? "Double-click to exit fullscreen" : "Double-click for fullscreen"}
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
                        const bgUrls = [
                            item.image ? `url(${item.image})` : null,
                            item.fallbackImage ? `url(${item.fallbackImage})` : null,
                            item.poster ? `url(${item.poster})` : null
                        ].filter(Boolean).join(', ');

                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className={`cinema-slide ${isActive ? 'active' : ''}`}
                                style={{
                                    backgroundImage: bgUrls,
                                    zIndex: isActive ? 2 : 1
                                }}
                            >
                                {vignetteEnabled && !isFullscreen && <div className="cinema-vignette" />}
                                {!isFullscreen && <div className="cinema-light-leak" />}
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
                                {currentSlide.qualityBadge && (
                                    <span className="res-pill">{currentSlide.qualityBadge}</span>
                                )}
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
                            <div
                                className="origin-button-slot"
                                onMouseEnter={handleButtonMouseEnter}
                                onMouseLeave={handleButtonMouseLeave}
                            >
                                <button
                                    type="button"
                                    className={`identify-anime-btn ${showOriginCard ? 'is-active' : ''}`}
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
                                                {currentSlide.resolution && (
                                                    <div className="spec-item">
                                                        <span className="spec-label">RESOLUTION:</span>
                                                        <span className="spec-value" style={{ color: '#ff8a4c', fontWeight: 800 }}>{currentSlide.resolution}</span>
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
            {!isFullscreen && (
                <div className="landscape-thumbnail-strip">
                    <div className="strip-header">
                        <span className="strip-label">{"// SCENERY REEL SELECTOR ("}{slideList.length}{" TRANSMISSIONS)"}</span>
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
                                    <img 
                                        src={item.image} 
                                        alt={item.scene} 
                                        loading="lazy"
                                        onError={(e) => {
                                            if (item.fallbackImage && e.target.src !== item.fallbackImage) {
                                                e.target.src = item.fallbackImage;
                                            } else if (item.poster && e.target.src !== item.poster) {
                                                e.target.src = item.poster;
                                            }
                                        }}
                                    />
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
            )}
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
        max-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #000000 !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 9999999 !important;
        overflow: hidden !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;

        &.controls-hidden {
            cursor: none !important;

            .cinemation-ribbon,
            .cinema-hud-bottom,
            .nav-chevron,
            .slideshow-progress-track {
                opacity: 0 !important;
                pointer-events: none !important;
                transform: translateY(0);
            }
        }

        .landscape-thumbnail-strip {
            display: none !important;
        }

        .cinema-theater {
            position: absolute !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;

            &::before,
            &::after {
                display: none !important;
            }
        }

        .cinemation-ribbon {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            margin: 0;
            padding: 1.25rem 2.5rem;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 65%, transparent 100%);
            transition: opacity 350ms ease, transform 350ms ease;

            .ribbon-brand {
                .title-group {
                    .telemetry-pill {
                        color: ${tokens.colors.accent};
                        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
                    }
                    h2 {
                        color: #ffffff;
                        font-size: 1.35rem;
                        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
                    }
                }
            }

            .ribbon-controls button {
                background: rgba(15, 17, 23, 0.85);
                backdrop-filter: blur(12px);
                border-color: rgba(255, 255, 255, 0.22);
                color: #f1f5f9;

                &:hover {
                    background: ${tokens.colors.accent};
                    color: #ffffff;
                    border-color: ${tokens.colors.accent};
                    transform: translateY(-1px);
                }

                &.fs-btn {
                    background: ${tokens.colors.accent};
                    color: #ffffff;
                    border-color: ${tokens.colors.accent};
                    font-weight: 800;
                    box-shadow: 0 0 16px rgba(255, 94, 40, 0.6);

                    &:hover {
                        background: ${tokens.colors.accentHover};
                    }
                }
            }
        }

        .cinema-hud-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 100;
            padding: 2rem 2.5rem 2.25rem 2.5rem;
            background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.2) 65%, transparent 100%);
            transition: opacity 350ms ease, transform 350ms ease;
        }

        .nav-chevron {
            z-index: 100;
            transition: opacity 350ms ease, transform 150ms ease;
        }

        .slideshow-progress-track {
            z-index: 110;
            transition: opacity 350ms ease;
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
            background-repeat: no-repeat;
            image-rendering: -webkit-optimize-contrast;
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
                pointer-events: none;
                background: radial-gradient(
                    circle at center,
                    transparent 60%,
                    rgba(0, 0, 0, 0.25) 85%,
                    rgba(0, 0, 0, 0.55) 100%
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
            background: rgba(15, 17, 23, 0.78);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-size: 2rem;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 60;
            opacity: 0.8;
            transition: ${tokens.transitions.fast};
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);

            &:hover {
                background: ${tokens.colors.accent};
                color: #ffffff;
                border-color: ${tokens.colors.accent};
                transform: translateY(-50%) scale(1.08);
                box-shadow: 0 0 22px rgba(255, 94, 40, 0.7);
                opacity: 1;
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

                .res-pill {
                    margin-left: 0.5rem;
                    padding: 0.12rem 0.5rem;
                    border-radius: ${tokens.radii.xs};
                    font-size: 0.65rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    background: rgba(255, 94, 40, 0.2);
                    border: 1px solid rgba(255, 94, 40, 0.6);
                    color: #ffffff;
                    text-shadow: 0 0 8px rgba(255, 94, 40, 0.8);
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

        &:hover .origin-dossier-popover,
        &:focus-within .origin-dossier-popover {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }

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

        /* FLOATING DOSSIER POPOVER - Shifted left (4.75rem) so it NEVER blocks the next chevron */
        .origin-dossier-popover {
            position: absolute;
            bottom: calc(100% + 14px);
            right: 4.75rem;
            width: 420px;
            border-radius: ${tokens.radii.lg};
            background: rgba(14, 16, 24, 0.96);
            backdrop-filter: blur(24px);
            border: 1.5px solid rgba(255, 94, 40, 0.6);
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.75), 0 0 25px rgba(255, 94, 40, 0.2);
            padding: 1.25rem;
            z-index: 50;
            opacity: 0;
            transform: translateY(12px) scale(0.96);
            pointer-events: none;
            transition: opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1);

            &.revealed {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }

            @media (max-width: 680px) {
                right: 0;
                width: calc(100vw - 3rem);
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
