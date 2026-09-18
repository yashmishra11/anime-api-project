import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { tokens, cornerScrews } from '../theme/tokens';

import WatchlistButton from './WatchlistButton';

function AnimeCard({ anime }) {
    if (!anime) return null;

    const {
        id,
        mal_id,
        title,
        images,
        coverImage,
        score,
        type,
        episodes,
        genres,
        status,
        year,
        aired
    } = anime;

    const targetId = id || mal_id;
    const imageUrl = coverImage?.extraLarge || images?.webp?.large_image_url || images?.jpg?.large_image_url || coverImage?.large || images?.jpg?.image_url;
    const primaryGenre = genres && genres.length > 0 ? (genres[0].name || genres[0]) : 'ANIME';
    const isAiring = status === 'Currently Airing' || status === 'RELEASING';
    const releaseYear = year || aired?.prop?.from?.year || null;

    return (
        <CardStyled to={`/anime/${targetId}`}>
            <div className="card-chassis">
                {/* Visual Frame */}
                <div className="media-viewport">
                    <img src={imageUrl} alt={title || 'Anime Poster'} loading="lazy" />
                    
                    {/* Top Badges: Clean, spaced, non-overcrowded */}
                    <div className="top-hud">
                        <div className="type-badge">
                            {isAiring && <span className="status-dot" title="Currently Airing" />}
                            <span>{type || 'TV'}</span>
                            {episodes && <span className="ep-count">{episodes}E</span>}
                        </div>

                        {score ? (
                            <div className="score-badge">
                                <span className="star">★</span>
                                <span className="score-val">{score.toFixed(1)}</span>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Bottom Spec Label Panel */}
                <div className="meta-console">
                    <h4 className="anime-title" title={title}>
                        {title}
                    </h4>

                    <div className="spec-row">
                        <span className="genre-pill">{primaryGenre}</span>
                        <div className="card-action-slot" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <WatchlistButton anime={anime} variant="compact" />
                        </div>
                    </div>
                </div>
            </div>
        </CardStyled>
    );
}

const CardStyled = styled(Link)`
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
            transform: scale(1.04);
            filter: contrast(1.04);
        }

        .media-viewport {
            border-color: ${tokens.colors.accent};
        }

        .anime-title {
            color: ${tokens.colors.accent};
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
        height: 310px;
        border-radius: ${tokens.radii.md};
        overflow: hidden;
        background: ${tokens.colors.recessed};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(186, 190, 204, 0.6);
        transition: border-color 0.25s ease;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            image-rendering: -webkit-optimize-contrast;
            transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease;
        }

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, transparent 28%, transparent 70%, rgba(0, 0, 0, 0.25) 100%);
            pointer-events: none;
        }

        @media screen and (max-width: 768px) {
            height: 240px;
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
        z-index: 2;
        pointer-events: none;
    }

    .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: rgba(29, 34, 44, 0.85);
        backdrop-filter: blur(4px);
        color: ${tokens.colors.textLight};
        font-family: ${tokens.fonts.technical};
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        padding: 3px 8px;
        border-radius: ${tokens.radii.sm};
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

        .status-dot {
            width: 6px;
            height: 6px;
            border-radius: ${tokens.radii.full};
            background-color: ${tokens.colors.ledGreen};
            box-shadow: ${tokens.shadows.glowGreen};
            animation: pulse 2s infinite ease-in-out;
        }

        .ep-count {
            color: #94a3b8;
            font-size: 0.65rem;
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            padding-left: 5px;
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
        font-size: 0.72rem;
        font-weight: 800;
        padding: 3px 7px;
        border-radius: ${tokens.radii.sm};
        border: 1px solid rgba(251, 191, 36, 0.3);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

        .star {
            font-size: 0.75rem;
        }

        .score-val {
            color: #ffffff;
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
            padding-top: 4px;
            border-top: 1px solid rgba(186, 190, 204, 0.35);

            .genre-pill {
                font-family: ${tokens.fonts.technical};
                font-size: 0.68rem;
                font-weight: 700;
                color: ${tokens.colors.textMuted};
                background: ${tokens.colors.recessed};
                padding: 2px 8px;
                border-radius: ${tokens.radii.xs};
                box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 247, 240, 0.7);
                letter-spacing: 0.05em;
                text-transform: uppercase;
            }

            .year-label {
                font-family: ${tokens.fonts.technical};
                font-size: 0.7rem;
                font-weight: 600;
                color: ${tokens.colors.textMuted};
                letter-spacing: 0.03em;
            }
        }
    }
`;

export default AnimeCard;
