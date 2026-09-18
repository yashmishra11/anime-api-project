import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { tokens, cornerScrews, ventSlots } from '../theme/tokens';
import { fetchAniList, CHARACTER_DOSSIER_QUERY } from '../services/anilist';

function Gallery() {
    const { id } = useParams();
    const location = useLocation();

    // Context passed from AnimeItem route
    const passedChar = location.state?.character;
    const passedRole = location.state?.role;
    const passedAnimeId = location.state?.animeId;
    const passedAnimeTitle = location.state?.animeTitle;

    // Initial portrait from router state if available
    const initialPortrait = passedChar?.images?.jpg?.image_url || passedChar?.images?.webp?.image_url;

    const [character, setCharacter] = useState(passedChar || null);
    const [pictures, setPictures] = useState(
        initialPortrait ? [{ jpg: { image_url: initialPortrait } }] : []
    );
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(!initialPortrait);
    const [showFullBio, setShowFullBio] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSpecimenData = async () => {
            setLoading(true);

            // 1. Check persistent sessionStorage
            const cacheKeyInfo = `character_dossier_${id}`;
            try {
                const cached = sessionStorage.getItem(cacheKeyInfo);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.name) {
                        setCharacter(parsed);
                        if (parsed.images?.jpg?.image_url) {
                            setPictures([{ jpg: { image_url: parsed.images.jpg.image_url } }]);
                        }
                        setLoading(false);
                        return;
                    }
                }
            } catch {}

            try {
                const data = await fetchAniList(CHARACTER_DOSSIER_QUERY, { id: Number(id) });
                const char = data?.Character;
                if (char && isMounted) {
                    const imgUrl = char.image?.large || char.image?.medium || initialPortrait;
                    const cleanBio = char.description
                        ? char.description.replace(/<[^>]*>?/gm, '').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
                        : 'No telemetry dossier recorded for this specimen.';

                    const normalizedChar = {
                        id: char.id,
                        name: char.name?.full || char.name?.native || passedChar?.name || 'Unknown Specimen',
                        name_kanji: char.name?.native || null,
                        about: cleanBio,
                        images: {
                            jpg: { image_url: imgUrl },
                            webp: { image_url: imgUrl }
                        },
                        role: passedRole,
                        gender: char.gender || null,
                        age: char.age || null,
                        media: char.media?.nodes || []
                    };

                    setCharacter(normalizedChar);
                    if (imgUrl) {
                        setPictures([{ jpg: { image_url: imgUrl } }]);
                    }
                    document.title = `${normalizedChar.name} // Character Dossier - AniLog`;

                    try {
                        sessionStorage.setItem(cacheKeyInfo, JSON.stringify(normalizedChar));
                    } catch {}
                }
            } catch (e) {
                console.warn('[AniList] Could not fetch character dossier:', e);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadSpecimenData();

        return () => {
            isMounted = false;
        };
    }, [id, passedChar, initialPortrait, passedRole]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (pictures.length <= 1) return;
            if (e.key === 'ArrowLeft') {
                setIndex((prev) => (prev - 1 + pictures.length) % pictures.length);
            } else if (e.key === 'ArrowRight') {
                setIndex((prev) => (prev + 1) % pictures.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pictures.length]);

    const handlePrev = () => {
        if (pictures.length <= 1) return;
        setIndex((prev) => (prev - 1 + pictures.length) % pictures.length);
    };

    const handleNext = () => {
        if (pictures.length <= 1) return;
        setIndex((prev) => (prev + 1) % pictures.length);
    };

    const currentImg = pictures[index]?.jpg?.image_url || initialPortrait;
    const charName = character?.name || passedChar?.name || `Specimen #${id}`;
    const charKanji = character?.name_kanji;
    const charRole = passedRole || (character?.role ? character.role : null);
    const favorites = character?.favorites;
    const aboutText = character?.about;

    return (
        <GalleryStyled>
            {/* Top Navigation & Status Bar */}
            <div className="gallery-nav-bar">
                <div className="back-link-slot">
                    {passedAnimeId ? (
                        <Link to={`/anime/${passedAnimeId}`} className="nav-btn">
                            <span className="arrow">←</span>
                            <span>RETURN TO {passedAnimeTitle ? passedAnimeTitle.toUpperCase() : 'SPEC SHEET'}</span>
                        </Link>
                    ) : (
                        <Link to="/" className="nav-btn">
                            <span className="arrow">←</span>
                            <span>DIRECTORY TERMINAL</span>
                        </Link>
                    )}
                </div>

                <div className="nav-telemetry">
                    <span className="led-status" />
                    <span className="telemetry-label">
                        SPECIMEN ARCHIVE // ID: {id} // {pictures.length} FRAMES
                    </span>
                </div>
            </div>

            {/* Character Dossier Hero Header */}
            <div className="character-dossier-card">
                <div className="dossier-header-bar">
                    <div className="dossier-status">
                        <span className="pulse-led" />
                        <span className="dossier-label">// CLASSIFIED SPECIMEN DOSSIER</span>
                    </div>
                    <div className="dossier-vents">
                        <span />
                    </div>
                </div>

                <div className="dossier-content">
                    <div className="dossier-identity">
                        <h1 className="specimen-name">{charName}</h1>
                        {charKanji && <span className="specimen-kanji">{charKanji}</span>}
                    </div>

                    <div className="dossier-badges">
                        {charRole && (
                            <div className="spec-pill role-pill">
                                <span className="label">ROLE:</span>
                                <span className="val">{charRole.toUpperCase()}</span>
                            </div>
                        )}
                        {favorites !== undefined && (
                            <div className="spec-pill fav-pill">
                                <span className="star">★</span>
                                <span className="val">{favorites.toLocaleString()}</span>
                                <span className="unit">FAVORITES</span>
                            </div>
                        )}
                        {passedAnimeTitle && (
                            <div className="spec-pill source-pill">
                                <span className="label">SOURCE:</span>
                                <span className="val">{passedAnimeTitle}</span>
                            </div>
                        )}
                    </div>

                    {aboutText && (
                        <div className="dossier-about-box">
                            <p className={`dossier-text ${showFullBio ? 'expanded' : ''}`}>
                                {aboutText}
                            </p>
                            {aboutText.length > 280 && (
                                <button
                                    type="button"
                                    className="expand-bio-btn"
                                    onClick={() => setShowFullBio(!showFullBio)}
                                >
                                    {showFullBio ? '▲ COLLAPSE DOSSIER' : '▼ READ FULL SPECIMEN DOSSIER'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Big Main Image Viewport Console */}
            <div className="big-image">
                <div className="viewport-header">
                    <div className="telemetry-info">
                        <span className={`led-indicator ${loading ? 'loading' : ''}`} />
                        <span className="specimen-label">
                            {loading && pictures.length === 0
                                ? 'SCANNING SPECIMEN CARTRIDGES...'
                                : `SPECIMEN VIEW // FRAME [0${pictures.length > 0 ? index + 1 : 0} / 0${pictures.length}]`}
                        </span>
                    </div>
                    <div className="viewport-vents">
                        <span />
                    </div>
                </div>

                <div className="viewport-well">
                    {currentImg ? (
                        <div className="image-wrapper">
                            <img
                                src={currentImg}
                                alt={`${charName} frame ${index + 1}`}
                                key={currentImg}
                            />
                            {pictures.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className="viewport-arrow prev"
                                        onClick={handlePrev}
                                        aria-label="Previous Specimen Frame"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className="viewport-arrow next"
                                        onClick={handleNext}
                                        aria-label="Next Specimen Frame"
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="empty-viewport">
                            <span className="empty-led" />
                            <p className="empty-title">// NO SPECIMEN FRAMES ARCHIVED</p>
                            <p className="empty-sub">Telemetry archives for this specimen could not be retrieved from satellite network.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Cartridge Selector Bank */}
            {pictures.length > 1 && (
                <div className="small-images-panel">
                    <div className="panel-label-bar">
                        <span className="tray-title">
                            // CARTRIDGE SELECTOR BANK [{pictures.length} FRAMES LOADED]
                        </span>
                        <span className="status-readout">STATUS: ONLINE</span>
                    </div>

                    <div className="small-images">
                        {pictures.map((picture, i) => {
                            const isSelected = i === index;
                            const thumbUrl = picture?.jpg?.image_url;
                            return (
                                <div
                                    className={`image-con ${isSelected ? 'active-cartridge' : ''}`}
                                    onClick={() => setIndex(i)}
                                    key={thumbUrl || i}
                                    title={`Select Frame 0${i + 1}`}
                                >
                                    <div className="thumbnail-frame">
                                        <img
                                            src={thumbUrl}
                                            alt={`${charName} thumbnail ${i + 1}`}
                                            loading="lazy"
                                        />
                                        <span className="index-pip">{i < 9 ? `0${i + 1}` : i + 1}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </GalleryStyled>
    );
}

const GalleryStyled = styled.div`
    background-color: ${tokens.colors.chassis};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem 2rem 4rem 2rem;
    position: relative;

    @media screen and (max-width: 768px) {
        padding: 1rem 1rem 3rem 1rem;
    }

    .gallery-nav-bar {
        width: min(92%, 1100px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
        gap: 0.75rem;

        .nav-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.6rem 1.25rem;
            border-radius: ${tokens.radii.md};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            font-family: ${tokens.fonts.technical};
            font-size: 0.78rem;
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
                color: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.buttonHover};
                transform: translateX(-3px);

                .arrow {
                    transform: translateX(-4px);
                }
            }

            &:active {
                transform: translateX(0);
                box-shadow: ${tokens.shadows.pressed};
            }
        }

        .nav-telemetry {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .led-status {
                width: 7px;
                height: 7px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.ledGreen};
                box-shadow: ${tokens.shadows.glowGreen};
                animation: pulse 2s infinite ease-in-out;
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
    }

    /* Character Dossier Hero Card */
    .character-dossier-card {
        width: min(92%, 1100px);
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.card};
        border: 1px solid rgba(255, 247, 240, 0.85);
        padding: 1.25rem 2rem 1.5rem 2rem;
        margin-bottom: 1.5rem;
        ${cornerScrews}
        position: relative;

        @media screen and (max-width: 768px) {
            padding: 1rem 1.25rem;
        }

        .dossier-header-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid ${tokens.colors.borderShadow};
            box-shadow: 0 1px 0 ${tokens.colors.borderLight};

            .dossier-status {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .pulse-led {
                    width: 7px;
                    height: 7px;
                    border-radius: ${tokens.radii.full};
                    background: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.glowOrange};
                    animation: pulse 1.8s infinite ease-in-out;
                }

                .dossier-label {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: ${tokens.colors.textMuted};
                }
            }

            .dossier-vents {
                ${ventSlots}
            }
        }

        .dossier-content {
            .dossier-identity {
                display: flex;
                align-items: baseline;
                gap: 1rem;
                flex-wrap: wrap;
                margin-bottom: 0.75rem;

                .specimen-name {
                    font-family: ${tokens.fonts.primary};
                    font-size: clamp(1.4rem, 3vw, 2rem);
                    font-weight: 800;
                    color: ${tokens.colors.textPrimary};
                    letter-spacing: -0.02em;
                    text-shadow: ${tokens.shadows.textEmbossed};
                    margin: 0;
                }

                .specimen-kanji {
                    font-family: ${tokens.fonts.technical};
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: ${tokens.colors.textMuted};
                }
            }

            .dossier-badges {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                flex-wrap: wrap;
                margin-bottom: 1rem;

                .spec-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border-radius: ${tokens.radii.sm};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    background: ${tokens.colors.recessed};
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
                }

                .role-pill {
                    border: 1px solid rgba(255, 71, 87, 0.3);
                    .val {
                        color: ${tokens.colors.accent};
                    }
                }

                .fav-pill {
                    background: rgba(29, 34, 44, 0.9);
                    color: #fbbf24;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
                    .val {
                        color: #ffffff;
                    }
                    .unit {
                        color: #94a3b8;
                        font-size: 0.65rem;
                    }
                }
            }

            .dossier-about-box {
                background: ${tokens.colors.recessed};
                border-radius: ${tokens.radii.md};
                padding: 1rem 1.25rem;
                box-shadow: ${tokens.shadows.recessed};
                border: 1px solid rgba(255, 255, 255, 0.5);

                .dossier-text {
                    font-family: ${tokens.fonts.primary};
                    font-size: 0.88rem;
                    line-height: 1.6;
                    color: ${tokens.colors.textPrimary};
                    white-space: pre-line;
                    margin: 0;

                    &:not(.expanded) {
                        display: -webkit-box;
                        -webkit-line-clamp: 4;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                }

                .expand-bio-btn {
                    margin-top: 0.75rem;
                    background: transparent;
                    border: none;
                    color: ${tokens.colors.accent};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    padding: 0;
                    transition: ${tokens.transitions.fast};

                    &:hover {
                        color: ${tokens.colors.accentHover};
                        text-decoration: underline;
                    }
                }
            }
        }
    }

    /* Big Image Viewport Console */
    .big-image {
        display: block;
        padding: 1.75rem;
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl};
        border: 1px solid rgba(255, 247, 240, 0.85);
        box-shadow: ${tokens.shadows.card};
        position: relative;
        ${cornerScrews}
        max-width: 540px;
        width: 100%;
        margin-bottom: 2rem;
        transition: ${tokens.transitions.normal};

        @media screen and (max-width: 768px) {
            padding: 1.25rem;
            border-radius: ${tokens.radii.lg};
        }

        .viewport-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid ${tokens.colors.borderShadow};
            box-shadow: 0 1px 0 ${tokens.colors.borderLight};

            .telemetry-info {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .led-indicator {
                    width: 7px;
                    height: 7px;
                    border-radius: ${tokens.radii.full};
                    background: ${tokens.colors.ledGreen};
                    box-shadow: ${tokens.shadows.glowGreen};
                    animation: pulse 2s infinite ease-in-out;

                    &.loading {
                        background: ${tokens.colors.ledAmber};
                        box-shadow: ${tokens.shadows.glowAmber};
                    }
                }

                .specimen-label {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    color: ${tokens.colors.textMuted};
                }
            }

            .viewport-vents {
                ${ventSlots}
            }
        }

        .viewport-well {
            position: relative;
            padding: 12px;
            background: ${tokens.colors.chassis};
            border-radius: ${tokens.radii.lg};
            box-shadow: ${tokens.shadows.recessed};
            border: 1px solid rgba(186, 190, 204, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 380px;

            .image-wrapper {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                    width: 100%;
                    height: auto;
                    max-height: 520px;
                    object-fit: contain;
                    border-radius: ${tokens.radii.md};
                    display: block;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.25);
                    transition: opacity 0.3s ease;
                }

                .viewport-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 38px;
                    height: 38px;
                    border-radius: ${tokens.radii.full};
                    background: rgba(224, 229, 236, 0.85);
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: ${tokens.shadows.card};
                    color: ${tokens.colors.textPrimary};
                    font-size: 1.4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: ${tokens.transitions.fast};
                    z-index: 5;

                    &:hover {
                        color: ${tokens.colors.accent};
                        box-shadow: ${tokens.shadows.floating};
                        transform: translateY(-50%) scale(1.1);
                    }

                    &:active {
                        transform: translateY(-50%) scale(0.95);
                        box-shadow: ${tokens.shadows.pressed};
                    }

                    &.prev {
                        left: 8px;
                    }

                    &.next {
                        right: 8px;
                    }
                }
            }

            .empty-viewport {
                padding: 3rem 1.5rem;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;

                .empty-led {
                    width: 10px;
                    height: 10px;
                    border-radius: ${tokens.radii.full};
                    background: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.glowOrange};
                    margin-bottom: 0.5rem;
                }

                .empty-title {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: ${tokens.colors.accent};
                    letter-spacing: 0.08em;
                    margin: 0;
                }

                .empty-sub {
                    font-family: ${tokens.fonts.primary};
                    font-size: 0.8rem;
                    color: ${tokens.colors.textMuted};
                    max-width: 320px;
                    margin: 0;
                }
            }
        }
    }

    /* Small Images Cartridge Selector Bank */
    .small-images-panel {
        width: min(92%, 1100px);
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.card};
        border: 1px solid rgba(255, 247, 240, 0.85);
        padding: 1.75rem 2rem 2.25rem 2rem;
        ${cornerScrews}

        @media screen and (max-width: 768px) {
            width: 100%;
            padding: 1.25rem 1rem 1.75rem 1rem;
            border-radius: ${tokens.radii.lg};
        }

        .panel-label-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid ${tokens.colors.borderShadow};
            box-shadow: 0 1px 0 ${tokens.colors.borderLight};

            .tray-title {
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: ${tokens.colors.textMuted};
            }

            .status-readout {
                font-family: ${tokens.fonts.technical};
                font-size: 0.7rem;
                font-weight: 700;
                color: ${tokens.colors.accent};
                letter-spacing: 0.08em;
            }
        }

        .small-images {
            display: flex;
            flex-wrap: wrap;
            gap: 1.25rem;
            justify-content: center;

            @media screen and (max-width: 768px) {
                gap: 0.75rem;
            }

            .image-con {
                cursor: pointer;
                transition: ${tokens.transitions.fast};

                .thumbnail-frame {
                    position: relative;
                    padding: 6px;
                    border-radius: ${tokens.radii.md};
                    background: ${tokens.colors.chassis};
                    box-shadow: ${tokens.shadows.card};
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    transition: ${tokens.transitions.fast};

                    img {
                        width: 5.25rem;
                        height: 5.25rem;
                        object-fit: cover;
                        border-radius: ${tokens.radii.sm};
                        display: block;
                        filter: grayscale(35%) contrast(0.95);
                        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
                        transition: ${tokens.transitions.fast};

                        @media screen and (max-width: 768px) {
                            width: 4rem;
                            height: 4rem;
                        }
                    }

                    .index-pip {
                        position: absolute;
                        bottom: 8px;
                        right: 8px;
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.6rem;
                        font-weight: 700;
                        padding: 1px 4px;
                        background: rgba(45, 52, 54, 0.8);
                        color: #ffffff;
                        border-radius: 2px;
                    }
                }

                &:hover {
                    transform: translateY(-3px);

                    .thumbnail-frame {
                        box-shadow: ${tokens.shadows.floating};
                        border-color: rgba(255, 247, 240, 1);

                        img {
                            filter: grayscale(0%) contrast(1.05);
                        }
                    }
                }

                &.active-cartridge {
                    .thumbnail-frame {
                        border: 2px solid ${tokens.colors.accent};
                        box-shadow: ${tokens.shadows.glowOrange}, ${tokens.shadows.card};
                        transform: scale(1.06);

                        img {
                            filter: grayscale(0%) contrast(1.1);
                        }

                        .index-pip {
                            background: ${tokens.colors.accent};
                            color: ${tokens.colors.accentForeground};
                        }
                    }
                }

                &:active {
                    transform: translateY(1px);
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

export default Gallery;