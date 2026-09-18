import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';
import { tokens } from '../theme/tokens';

const STATUS_CONFIG = {
    CURRENT: {
        label: 'Watching',
        shortLabel: 'WATCHING',
        color: '#22c55e', // Green
        badgeBg: 'rgba(34, 197, 94, 0.12)',
        borderColor: '#22c55e'
    },
    PLANNING: {
        label: 'Plan to Watch',
        shortLabel: 'PLANNING',
        color: '#ff5e28', // Accent Orange
        badgeBg: 'rgba(255, 94, 40, 0.12)',
        borderColor: '#ff5e28'
    },
    COMPLETED: {
        label: 'Completed',
        shortLabel: 'COMPLETED',
        color: '#3b82f6', // Blue
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        borderColor: '#3b82f6'
    },
    PAUSED: {
        label: 'On Hold',
        shortLabel: 'PAUSED',
        color: '#f59e0b', // Amber
        badgeBg: 'rgba(245, 158, 11, 0.12)',
        borderColor: '#f59e0b'
    },
    DROPPED: {
        label: 'Dropped',
        shortLabel: 'DROPPED',
        color: '#ef4444', // Red
        badgeBg: 'rgba(239, 68, 68, 0.12)',
        borderColor: '#ef4444'
    }
};

export default function WatchlistButton({ anime, variant = 'compact' }) {
    const {
        user,
        login,
        getMediaStatus,
        updateEntry,
        removeEntry,
        clientId,
        setIsConfigModalOpen
    } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [isMutating, setIsMutating] = useState(false);
    const dropdownRef = useRef(null);

    const mediaId = anime?.id || anime?.mal_id;
    const currentStatus = getMediaStatus(mediaId);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleButtonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            if (!clientId) {
                setIsConfigModalOpen(true);
            } else {
                login();
            }
            return;
        }

        setIsOpen(!isOpen);
    };

    const handleStatusSelect = async (statusKey, e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);

        if (!user) {
            login();
            return;
        }

        setIsMutating(true);
        try {
            await updateEntry(mediaId, statusKey, null, null, anime);
        } catch (err) {
            console.error('Failed to update watchlist status:', err);
        } finally {
            setIsMutating(false);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);

        setIsMutating(true);
        try {
            await removeEntry(mediaId);
        } catch (err) {
            console.error('Failed to remove from watchlist:', err);
        } finally {
            setIsMutating(false);
        }
    };

    const statusDetails = currentStatus ? STATUS_CONFIG[currentStatus] : null;

    return (
        <ButtonWrapperStyled ref={dropdownRef} className={`variant-${variant}`}>
            <button
                type="button"
                className={`watchlist-trigger-btn ${currentStatus ? 'is-active' : 'is-idle'} ${isMutating ? 'is-loading' : ''}`}
                onClick={handleButtonClick}
                title={user ? (currentStatus ? `Status: ${statusDetails?.label} (Click to change)` : 'Add to your AniList watchlist') : 'Sign in to add to your AniList watchlist'}
                style={
                    statusDetails
                        ? {
                              '--active-color': statusDetails.color,
                              '--active-bg': statusDetails.badgeBg,
                              '--active-border': statusDetails.borderColor
                          }
                        : {}
                }
            >
                {isMutating ? (
                    <span className="spinner" />
                ) : currentStatus ? (
                    <>
                        <span className="status-indicator-dot" />
                        <span className="status-text">{variant === 'compact' ? statusDetails?.shortLabel : statusDetails?.label}</span>
                        <span className="caret">▾</span>
                    </>
                ) : (
                    <>
                        <span className="plus-icon">+</span>
                        <span className="add-label">{variant === 'compact' ? 'TRACK' : '+ ADD TO WATCHLIST'}</span>
                    </>
                )}
            </button>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="status-dropdown-panel" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <div className="dropdown-title-row">
                        <span className="dot" />
                        <span>UPDATE TRANSMISSION STATUS</span>
                    </div>

                    <div className="status-options-list">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const isSelected = currentStatus === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`status-option-item ${isSelected ? 'selected' : ''}`}
                                    onClick={(e) => handleStatusSelect(key, e)}
                                    style={{ '--opt-color': cfg.color }}
                                >
                                    <span className="opt-bullet" />
                                    <span className="opt-name">{cfg.label}</span>
                                    {isSelected && <span className="check-mark">✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {currentStatus && (
                        <>
                            <div className="dropdown-divider" />
                            <button
                                type="button"
                                className="remove-entry-btn"
                                onClick={handleRemove}
                            >
                                <span className="trash-icon">✕</span>
                                <span>Remove From Watchlist</span>
                            </button>
                        </>
                    )}
                </div>
            )}
        </ButtonWrapperStyled>
    );
}

const ButtonWrapperStyled = styled.div`
    position: relative;
    display: inline-block;
    z-index: 10;

    .watchlist-trigger-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        font-family: ${tokens.fonts.technical};
        font-weight: 700;
        border-radius: ${tokens.radii.sm};
        transition: ${tokens.transitions.fast};
        outline: none;
        user-select: none;

        &.is-idle {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid ${tokens.colors.borderDark};
            color: ${tokens.colors.textPrimary};
            box-shadow: ${tokens.shadows.sharp};

            &:hover {
                background: #ffffff;
                border-color: ${tokens.colors.accent};
                color: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.floating};
            }
        }

        &.is-active {
            background: var(--active-bg, rgba(255, 94, 40, 0.12));
            border: 1px solid var(--active-border, ${tokens.colors.accent});
            color: var(--active-color, ${tokens.colors.accent});
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

            &:hover {
                filter: brightness(1.08);
                box-shadow: ${tokens.shadows.buttonHover};
            }

            .status-indicator-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: var(--active-color, ${tokens.colors.accent});
                box-shadow: 0 0 6px var(--active-color, ${tokens.colors.accent});
            }
        }

        .caret {
            font-size: 0.65rem;
            opacity: 0.75;
        }

        .spinner {
            width: 12px;
            height: 12px;
            border: 2px solid ${tokens.colors.accent};
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
    }

    /* Variant: Compact (For Cards) */
    &.variant-compact {
        .watchlist-trigger-btn {
            padding: 0.28rem 0.55rem;
            font-size: 0.64rem;
            letter-spacing: 0.04em;

            .plus-icon {
                font-size: 0.8rem;
                line-height: 1;
                color: ${tokens.colors.accent};
                font-weight: 800;
            }
        }
    }

    /* Variant: Full (For Detail Header / Dock) */
    &.variant-full {
        .watchlist-trigger-btn {
            padding: 0.6rem 1.25rem;
            font-size: 0.78rem;
            letter-spacing: 0.06em;
            border-radius: ${tokens.radii.md};

            .plus-icon {
                font-size: 0.95rem;
                color: ${tokens.colors.accent};
            }
        }
    }

    /* Dropdown Popover */
    .status-dropdown-panel {
        position: absolute;
        top: calc(100% + 0.4rem);
        left: 0;
        width: 220px;
        background: #ffffff;
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.md};
        box-shadow: ${tokens.shadows.floating};
        padding: 0.65rem;
        z-index: 1000;
        animation: dropDown 0.15s ease-out;

        .dropdown-title-row {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-family: ${tokens.fonts.technical};
            font-size: 0.58rem;
            font-weight: 700;
            color: ${tokens.colors.textMuted};
            letter-spacing: 0.06em;
            margin-bottom: 0.45rem;
            padding-bottom: 0.35rem;
            border-bottom: 1px solid ${tokens.colors.recessed};

            .dot {
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background: ${tokens.colors.accent};
            }
        }

        .status-options-list {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;

            .status-option-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                width: 100%;
                padding: 0.4rem 0.55rem;
                background: transparent;
                border: none;
                border-radius: ${tokens.radii.xs};
                cursor: pointer;
                font-size: 0.78rem;
                font-weight: 600;
                color: ${tokens.colors.textPrimary};
                text-align: left;
                transition: ${tokens.transitions.fast};

                .opt-bullet {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: var(--opt-color, ${tokens.colors.textMuted});
                }

                .opt-name {
                    flex: 1;
                }

                .check-mark {
                    color: var(--opt-color, ${tokens.colors.accent});
                    font-weight: 800;
                    font-size: 0.75rem;
                }

                &:hover {
                    background: ${tokens.colors.recessed};
                    color: var(--opt-color, ${tokens.colors.accent});
                }

                &.selected {
                    background: rgba(255, 94, 40, 0.08);
                    color: var(--opt-color, ${tokens.colors.accent});
                }
            }
        }

        .dropdown-divider {
            height: 1px;
            background: ${tokens.colors.recessed};
            margin: 0.4rem 0;
        }

        .remove-entry-btn {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            width: 100%;
            padding: 0.4rem 0.55rem;
            background: transparent;
            border: 1px dashed rgba(239, 68, 68, 0.35);
            border-radius: ${tokens.radii.xs};
            font-size: 0.72rem;
            font-weight: 600;
            color: #ef4444;
            cursor: pointer;
            transition: ${tokens.transitions.fast};

            &:hover {
                background: rgba(239, 68, 68, 0.1);
                border-color: #ef4444;
            }
        }
    }

    @keyframes dropDown {
        from { opacity: 0; transform: translateY(-3px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
