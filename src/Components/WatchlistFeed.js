import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';
import AnimeCard from './AnimeCard';
import { tokens } from '../theme/tokens';

const STATUS_FILTERS = [
    { key: 'ALL', label: 'All Transmissions' },
    { key: 'CURRENT', label: 'Watching' },
    { key: 'PLANNING', label: 'Plan to Watch' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'PAUSED', label: 'On Hold' },
    { key: 'DROPPED', label: 'Dropped' }
];

export default function WatchlistFeed() {
    const {
        user,
        watchlistList,
        loadingWatchlist,
        login,
        refreshWatchlist,
        clientId,
        setIsConfigModalOpen
    } = useAuth();

    const [activeFilter, setActiveFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('DEFAULT');

    // Filter and Sort watchlist entries
    const processedEntries = useMemo(() => {
        // 1. Filter by status and search query
        const filtered = watchlistList.filter((entry) => {
            const matchesStatus = activeFilter === 'ALL' || entry.status === activeFilter;
            const matchesSearch =
                !searchTerm.trim() ||
                (entry.media?.title && entry.media.title.toLowerCase().includes(searchTerm.toLowerCase()));
            return matchesStatus && matchesSearch;
        });

        // 2. Sort within current filtered status
        return [...filtered].sort((a, b) => {
            const titleA = (a.media?.title || '').toLowerCase();
            const titleB = (b.media?.title || '').toLowerCase();

            // Resolve effective episodes for an entry
            const getEffectiveEpisodes = (entry) => {
                // 1. Explicit episodes count from media
                if (typeof entry.media?.episodes === 'number' && entry.media.episodes > 0) {
                    return entry.media.episodes;
                }
                // 2. If ongoing, check nextAiringEpisode from raw
                const nextEp = entry.media?.raw?.nextAiringEpisode?.episode;
                if (typeof nextEp === 'number' && nextEp > 1) {
                    return nextEp - 1;
                }
                // 3. Fallback to user logged progress if positive
                if (typeof entry.progress === 'number' && entry.progress > 0) {
                    return entry.progress;
                }
                return null;
            };

            const epA = getEffectiveEpisodes(a);
            const epB = getEffectiveEpisodes(b);

            const scoreA = Number(a.score > 0 ? a.score : (a.media?.score || 0));
            const scoreB = Number(b.score > 0 ? b.score : (b.media?.score || 0));

            switch (sortBy) {
                case 'NAME_ASC':
                    return titleA.localeCompare(titleB);
                case 'NAME_DESC':
                    return titleB.localeCompare(titleA);
                case 'EPISODES_DESC': {
                    const valA = epA ?? 0;
                    const valB = epB ?? 0;
                    if (valB !== valA) return valB - valA;
                    return titleA.localeCompare(titleB);
                }
                case 'EPISODES_ASC': {
                    // Least episodes first (1-ep movies, 2-ep specials, 12-ep seasons, etc.).
                    // Anime with completely unknown/null episode count evaluate to Infinity so they don't jump ahead of 1-episode anime.
                    const valA = epA ?? Infinity;
                    const valB = epB ?? Infinity;
                    if (valA !== valB) return valA - valB;
                    return titleA.localeCompare(titleB);
                }
                case 'SCORE_DESC': {
                    if (scoreB !== scoreA) return scoreB - scoreA;
                    return titleA.localeCompare(titleB);
                }
                case 'SCORE_ASC': {
                    // Lowest rated first; unrated (score <= 0) pushed to the bottom so they don't pollute lowest score
                    const valA = scoreA > 0 ? scoreA : Infinity;
                    const valB = scoreB > 0 ? scoreB : Infinity;
                    if (valA !== valB) return valA - valB;
                    return titleA.localeCompare(titleB);
                }
                case 'DEFAULT':
                default:
                    return (b.updatedAt || 0) - (a.updatedAt || 0);
            }
        });
    }, [watchlistList, activeFilter, searchTerm, sortBy]);

    // Count by status
    const statusCounts = useMemo(() => {
        const counts = { ALL: watchlistList.length };
        for (const entry of watchlistList) {
            counts[entry.status] = (counts[entry.status] || 0) + 1;
        }
        return counts;
    }, [watchlistList]);

    if (!user) {
        return (
            <WatchlistStyled>
                <div className="watchlist-content">
                    <div className="auth-gate-banner">
                        <div className="gate-telemetry">
                            <span className="dot-pulse" />
                            <span>ANILIST STATION AUTHENTICATION REQUIRED</span>
                        </div>
                        <h2>Connect Your AniList Account</h2>
                        <p>
                            Sync, organize, and manage your anime watchlists directly from this terminal in real-time.
                            Powered by AniList's free official GraphQL network.
                        </p>
                        <div className="gate-actions">
                            <button
                                type="button"
                                className="login-gate-btn"
                                onClick={() => {
                                    if (!clientId) setIsConfigModalOpen(true);
                                    else login();
                                }}
                            >
                                <span className="led" />
                                <span>AUTHENTICATE VIA ANILIST</span>
                            </button>
                        </div>
                    </div>
                </div>
            </WatchlistStyled>
        );
    }

    return (
        <WatchlistStyled>
            <div className="watchlist-content">
                {/* User Header Dossier */}
                <div className="operator-header">
                    <div className="operator-profile">
                        <img
                            src={user.avatar?.large || user.avatar?.medium}
                            alt={user.name}
                            className="operator-avatar"
                        />
                        <div className="operator-details">
                            <span className="operator-tag">STATION OPERATOR ARCHIVE</span>
                            <h2>{user.name}&apos;s Watchlist</h2>
                            <p>
                                <strong>{watchlistList.length}</strong> total records synced from AniList
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={refreshWatchlist}
                        disabled={loadingWatchlist}
                        title="Sync latest records from AniList"
                    >
                        <span className={`sync-icon ${loadingWatchlist ? 'is-spinning' : ''}`}>⟳</span>
                        <span>{loadingWatchlist ? 'SYNCING...' : 'SYNC FEED'}</span>
                    </button>
                </div>

                {/* Sub-Filters & In-list Search */}
                <div className="watchlist-controls">
                    <div className="filter-pill-strip">
                        {STATUS_FILTERS.map((f) => {
                            const count = statusCounts[f.key] || 0;
                            const isActive = activeFilter === f.key;
                            return (
                                <button
                                    key={f.key}
                                    type="button"
                                    className={`filter-pill ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(f.key)}
                                >
                                    <span>{f.label}</span>
                                    <span className="count-tag">{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="controls-right-group">
                        <div className="sort-selector-slot">
                            <span className="sort-icon">⇅</span>
                            <span className="sort-label">SORT:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-dropdown"
                                title="Sort transmissions in this section"
                            >
                                <option value="DEFAULT">Recently Updated</option>
                                <option value="NAME_ASC">Name (A → Z)</option>
                                <option value="NAME_DESC">Name (Z → A)</option>
                                <option value="EPISODES_DESC">Most Episodes</option>
                                <option value="EPISODES_ASC">Least Episodes</option>
                                <option value="SCORE_DESC">Highest Rating</option>
                                <option value="SCORE_ASC">Lowest Rating</option>
                            </select>
                        </div>

                        <div className="inlist-search">
                            <input
                                type="text"
                                placeholder="FILTER SAVED TITLES..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button type="button" className="clear-btn" onClick={() => setSearchTerm('')}>
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid of User Anime */}
                <div className="entries-grid">
                    {processedEntries && processedEntries.length > 0 ? (
                        processedEntries.map((entry, index) => {
                            const animeData = entry.media;
                            if (!animeData) return null;
                            const cardKey = entry.id || entry.mediaId || animeData.id || `entry-${index}`;
                            return (
                                <AnimeCard
                                    anime={animeData}
                                    key={cardKey}
                                />
                            );
                        })
                    ) : (
                        <div className="empty-state-terminal">
                            <span className="dot-blink" />
                            <h4>{"// NO RECORDS FOUND FOR ["}{activeFilter}{"]"}</h4>
                            <p>
                                {searchTerm
                                    ? `No titles match "${searchTerm}".`
                                    : 'You have not added any anime to this status category yet.'}
                            </p>
                            {searchTerm && (
                                <button
                                    type="button"
                                    className="reset-search-btn"
                                    onClick={() => setSearchTerm('')}
                                >
                                    CLEAR SEARCH FILTER
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </WatchlistStyled>
    );
}

const WatchlistStyled = styled.div`
    width: min(94%, 1380px);
    margin: 1.5rem auto 3rem auto;

    .watchlist-content {
        width: 100%;
    }

    /* Auth Gate Banner */
    .auth-gate-banner {
        background: ${tokens.colors.chassis};
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.card};
        padding: 3.5rem 2rem;
        text-align: center;
        max-width: 680px;
        margin: 2rem auto;

        .gate-telemetry {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-family: ${tokens.fonts.technical};
            font-size: 0.7rem;
            font-weight: 700;
            color: ${tokens.colors.accent};
            letter-spacing: 0.08em;
            margin-bottom: 1rem;

            .dot-pulse {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
                animation: pulse 1.5s infinite;
            }
        }

        h2 {
            font-size: 1.8rem;
            font-weight: 800;
            color: ${tokens.colors.textPrimary};
            margin: 0 0 0.75rem 0;
        }

        p {
            font-size: 0.95rem;
            color: ${tokens.colors.textMuted};
            line-height: 1.6;
            margin: 0 auto 2rem auto;
            max-width: 500px;
        }

        .login-gate-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.85rem 1.85rem;
            background: ${tokens.colors.accent};
            border: 1px solid ${tokens.colors.accent};
            border-radius: ${tokens.radii.md};
            font-family: ${tokens.fonts.technical};
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: #ffffff;
            cursor: pointer;
            box-shadow: ${tokens.shadows.accentButton};
            transition: ${tokens.transitions.fast};

            .led {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ffffff;
            }

            &:hover {
                background: ${tokens.colors.accentHover};
                transform: translateY(-2px);
            }
        }
    }

    /* Operator Header */
    .operator-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${tokens.colors.chassis};
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.lg};
        padding: 1.25rem 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: ${tokens.shadows.sharp};

        .operator-profile {
            display: flex;
            align-items: center;
            gap: 1rem;

            .operator-avatar {
                width: 54px;
                height: 54px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid ${tokens.colors.accent};
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .operator-details {
                .operator-tag {
                    display: block;
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.62rem;
                    font-weight: 700;
                    color: ${tokens.colors.accent};
                    letter-spacing: 0.08em;
                }

                h2 {
                    margin: 0.15rem 0 0.25rem 0;
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: ${tokens.colors.textPrimary};
                }

                p {
                    margin: 0;
                    font-size: 0.82rem;
                    color: ${tokens.colors.textMuted};

                    strong {
                        color: ${tokens.colors.accent};
                    }
                }
            }
        }

        .refresh-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.5rem 0.9rem;
            background: #ffffff;
            border: 1px solid ${tokens.colors.borderDark};
            border-radius: ${tokens.radii.sm};
            font-family: ${tokens.fonts.technical};
            font-size: 0.72rem;
            font-weight: 700;
            color: ${tokens.colors.textPrimary};
            cursor: pointer;
            box-shadow: ${tokens.shadows.sharp};
            transition: ${tokens.transitions.fast};

            &:hover:not(:disabled) {
                border-color: ${tokens.colors.accent};
                color: ${tokens.colors.accent};
            }

            .sync-icon.is-spinning {
                display: inline-block;
                animation: spin 0.75s linear infinite;
            }
        }
    }

    /* Controls Bar */
    .watchlist-controls {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.5rem;

        .filter-pill-strip {
            display: flex;
            flex-wrap: wrap;
            gap: 0.45rem;

            .filter-pill {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                padding: 0.4rem 0.75rem;
                background: ${tokens.colors.chassis};
                border: 1px solid ${tokens.colors.borderDark};
                border-radius: ${tokens.radii.full};
                font-family: ${tokens.fonts.technical};
                font-size: 0.72rem;
                font-weight: 600;
                color: ${tokens.colors.textPrimary};
                cursor: pointer;
                transition: ${tokens.transitions.fast};

                .count-tag {
                    display: inline-block;
                    padding: 0.1rem 0.35rem;
                    background: ${tokens.colors.recessed};
                    border-radius: ${tokens.radii.full};
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: ${tokens.colors.textMuted};
                }

                &:hover {
                    border-color: ${tokens.colors.accent};
                    color: ${tokens.colors.accent};
                }

                &.active {
                    background: ${tokens.colors.accent};
                    border-color: ${tokens.colors.accent};
                    color: #ffffff;
                    box-shadow: ${tokens.shadows.accentButton};

                    .count-tag {
                        background: rgba(255, 255, 255, 0.25);
                        color: #ffffff;
                    }
                }
            }
        }

        .controls-right-group {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;

            .sort-selector-slot {
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                background: #ffffff;
                border: 1px solid ${tokens.colors.borderDark};
                border-radius: ${tokens.radii.md};
                padding: 0.35rem 0.65rem;
                box-shadow: ${tokens.shadows.sharp};
                transition: ${tokens.transitions.fast};

                .sort-icon {
                    font-size: 0.85rem;
                    color: ${tokens.colors.accent};
                    font-weight: 800;
                }

                .sort-label {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: ${tokens.colors.textMuted};
                    letter-spacing: 0.06em;
                }

                .sort-dropdown {
                    background: transparent;
                    border: none;
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.76rem;
                    font-weight: 700;
                    color: ${tokens.colors.textPrimary};
                    outline: none;
                    cursor: pointer;

                    option {
                        background: #ffffff;
                        color: ${tokens.colors.textPrimary};
                        font-weight: 500;
                    }
                }

                &:focus-within {
                    border-color: ${tokens.colors.accent};
                    box-shadow: 0 0 0 2px rgba(255, 94, 40, 0.15);
                }
            }
        }

        .inlist-search {
            position: relative;
            min-width: 220px;

            input {
                width: 100%;
                box-sizing: border-box;
                padding: 0.45rem 2rem 0.45rem 0.75rem;
                background: #ffffff;
                border: 1px solid ${tokens.colors.borderDark};
                border-radius: ${tokens.radii.md};
                font-family: ${tokens.fonts.technical};
                font-size: 0.76rem;
                color: ${tokens.colors.textPrimary};
                outline: none;
                transition: ${tokens.transitions.fast};

                &:focus {
                    border-color: ${tokens.colors.accent};
                    box-shadow: 0 0 0 2px rgba(255, 94, 40, 0.15);
                }
            }

            .clear-btn {
                position: absolute;
                right: 0.5rem;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                font-size: 0.75rem;
                color: ${tokens.colors.textMuted};
                cursor: pointer;

                &:hover {
                    color: ${tokens.colors.accent};
                }
            }
        }
    }

    /* Grid */
    .entries-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 1.15rem;
        padding: 1.75rem 1.75rem;
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl};
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.7);

        @media screen and (max-width: 1480px) {
            padding: 1.5rem 1.25rem;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 1rem;
        }

        @media screen and (max-width: 1150px) {
            padding: 1.25rem 1rem;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
        }

        @media screen and (max-width: 820px) {
            padding: 1.25rem 0.85rem;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.85rem;
        }

        @media screen and (max-width: 460px) {
            padding: 1rem 0.5rem;
            grid-template-columns: repeat(1, minmax(0, 1fr));
            gap: 0.85rem;
        }
    }

    .empty-state-terminal {
        grid-column: 1 / -1;
        background: ${tokens.colors.chassis};
        border: 1px dashed ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.lg};
        padding: 3rem 1.5rem;
        text-align: center;

        .dot-blink {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${tokens.colors.accent};
            margin-bottom: 0.75rem;
            animation: pulse 1.5s infinite;
        }

        h4 {
            font-family: ${tokens.fonts.technical};
            font-size: 0.95rem;
            font-weight: 700;
            color: ${tokens.colors.textPrimary};
            margin: 0 0 0.5rem 0;
            letter-spacing: 0.05em;
        }

        p {
            font-size: 0.85rem;
            color: ${tokens.colors.textMuted};
            margin: 0 0 1.25rem 0;
        }

        .reset-search-btn {
            padding: 0.45rem 1rem;
            background: #ffffff;
            border: 1px solid ${tokens.colors.borderDark};
            border-radius: ${tokens.radii.sm};
            font-family: ${tokens.fonts.technical};
            font-size: 0.72rem;
            font-weight: 700;
            color: ${tokens.colors.accent};
            cursor: pointer;

            &:hover {
                background: ${tokens.colors.accent};
                color: #ffffff;
            }
        }
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.5; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.1); }
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }


`;
