import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/authContext';
import { tokens } from '../theme/tokens';

export default function AuthButton({ onOpenWatchlist }) {
    const {
        user,
        token,
        login,
        logout,
        clientId,
        setClientId,
        isConfigModalOpen,
        setIsConfigModalOpen
    } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [tempClientId, setTempClientId] = useState(clientId || '');
    const [copied, setCopied] = useState(false);
    const menuRef = useRef(null);

    // Keep tempClientId in sync
    useEffect(() => {
        setTempClientId(clientId || '');
    }, [clientId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveClientId = (e) => {
        e.preventDefault();
        setClientId(tempClientId);
        setIsConfigModalOpen(false);
        if (tempClientId.trim() && !token) {
            // Initiate login immediately after saving
            setTimeout(() => login(), 150);
        }
    };

    const handleCopyRedirectUri = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.origin);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AuthWidgetStyled ref={menuRef}>
            {user ? (
                <div className="user-station-pill" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <div className="avatar-slot">
                        <img
                            src={user.avatar?.medium || user.avatar?.large}
                            alt={user.name}
                            onError={(e) => {
                                e.target.src = 'https://s4.anilist.co/file/anilistcdn/user/avatar/medium/default.png';
                            }}
                        />
                        <span className="online-indicator" />
                    </div>
                    <div className="user-info">
                        <span className="telemetry-label">OPERATOR</span>
                        <span className="user-handle">{user.name}</span>
                    </div>
                    <span className="chevron">{isMenuOpen ? '▲' : '▼'}</span>
                </div>
            ) : (
                <div className="auth-action-group">
                    <button
                        type="button"
                        className="connect-btn"
                        onClick={login}
                        title="Sign in with your AniList account to sync your watchlist"
                    >
                        <span className="auth-led" />
                        <span className="btn-label">CONNECT ANILIST</span>
                    </button>
                    <button
                        type="button"
                        className="gear-btn"
                        onClick={() => setIsConfigModalOpen(true)}
                        title="Configure AniList API Client ID"
                    >
                        ⚙
                    </button>
                </div>
            )}

            {/* Dropdown Menu when Logged In */}
            {isMenuOpen && user && (
                <div className="user-dropdown-panel">
                    <div className="dropdown-header">
                        <span className="status-badge">ONLINE // AUTHENTICATED</span>
                        <p className="welcome-text">Logged in as <strong>{user.name}</strong></p>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-actions">
                        {onOpenWatchlist && (
                            <button
                                type="button"
                                className="action-row"
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onOpenWatchlist();
                                }}
                            >
                                <span className="action-icon">📋</span>
                                <span>My Watchlist Feed</span>
                            </button>
                        )}

                        <a
                            href={`https://anilist.co/user/${encodeURIComponent(user.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="action-row"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <span className="action-icon">↗</span>
                            <span>AniList Profile</span>
                        </a>

                        <button
                            type="button"
                            className="action-row"
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsConfigModalOpen(true);
                            }}
                        >
                            <span className="action-icon">⚙</span>
                            <span>Client ID Config</span>
                        </button>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                        type="button"
                        className="logout-row"
                        onClick={() => {
                            setIsMenuOpen(false);
                            logout();
                        }}
                    >
                        <span>DISCONNECT STATION</span>
                    </button>
                </div>
            )}

            {/* Client ID Configuration Modal */}
            {isConfigModalOpen && (
                <div className="config-modal-backdrop" onClick={() => setIsConfigModalOpen(false)}>
                    <div className="config-modal-window" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-topbar">
                            <div className="telemetry-badge">
                                <span className="dot" />
                                <span>OAUTH CONFIGURATION // ANILIST.CO</span>
                            </div>
                            <button
                                type="button"
                                className="close-btn"
                                onClick={() => setIsConfigModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-content">
                            <h3>Connect Your Free AniList Client</h3>
                            <p className="description">
                                AniList uses free OAuth2 implicit authentication. To sign in and manage your watchlists:
                            </p>

                            <ol className="setup-steps">
                                <li>
                                    Open{' '}
                                    <a
                                        href="https://anilist.co/settings/developer"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-link"
                                    >
                                        anilist.co/settings/developer ↗
                                    </a>
                                    {' '}and click <strong>Create New Client</strong>.
                                </li>
                                <li>
                                    Name it <code>AniLog</code> (or anything you prefer).
                                </li>
                                <li>
                                    Set the <strong>Redirect URL</strong> to:
                                    <div className="redirect-box">
                                        <code>{window.location.origin}</code>
                                        <button
                                            type="button"
                                            className="copy-btn"
                                            onClick={handleCopyRedirectUri}
                                        >
                                            {copied ? '✓ COPIED' : 'COPY'}
                                        </button>
                                    </div>
                                </li>
                                <li>
                                    Save on AniList, then copy the <strong>Client ID</strong> and paste it below:
                                </li>
                            </ol>

                            <form onSubmit={handleSaveClientId} className="client-id-form">
                                <label htmlFor="client-id-input">ANILIST CLIENT ID:</label>
                                <input
                                    id="client-id-input"
                                    type="text"
                                    placeholder="e.g. 21482"
                                    value={tempClientId}
                                    onChange={(e) => setTempClientId(e.target.value)}
                                    autoFocus
                                />

                                <div className="form-buttons">
                                    <button
                                        type="button"
                                        className="btn-cancel"
                                        onClick={() => setIsConfigModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save">
                                        Save & Connect
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthWidgetStyled>
    );
}

const AuthWidgetStyled = styled.div`
    position: relative;
    font-family: ${tokens.fonts.primary};

    /* Connected User Pill */
    .user-station-pill {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding: 0.35rem 0.75rem 0.35rem 0.4rem;
        background: ${tokens.colors.recessed};
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.full};
        cursor: pointer;
        box-shadow: ${tokens.shadows.sharp};
        transition: ${tokens.transitions.fast};

        &:hover {
            border-color: ${tokens.colors.accent};
            background: #ffffff;
            box-shadow: ${tokens.shadows.buttonHover};
        }

        .avatar-slot {
            position: relative;
            width: 32px;
            height: 32px;

            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
                border: 1.5px solid ${tokens.colors.accent};
            }

            .online-indicator {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 9px;
                height: 9px;
                background: ${tokens.colors.ledGreen};
                border-radius: 50%;
                border: 1.5px solid #ffffff;
                box-shadow: ${tokens.shadows.glowGreen};
            }
        }

        .user-info {
            display: flex;
            flex-direction: column;
            text-align: left;

            .telemetry-label {
                font-family: ${tokens.fonts.technical};
                font-size: 0.6rem;
                letter-spacing: 0.08em;
                color: ${tokens.colors.textMuted};
                line-height: 1;
            }

            .user-handle {
                font-size: 0.82rem;
                font-weight: 700;
                color: ${tokens.colors.textPrimary};
                line-height: 1.2;
                max-width: 110px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .chevron {
            font-size: 0.6rem;
            color: ${tokens.colors.textMuted};
            margin-left: 0.15rem;
        }
    }

    /* Logged-out Connect Action */
    .auth-action-group {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        .connect-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 0.9rem;
            background: ${tokens.colors.chassis};
            border: 1px solid ${tokens.colors.borderDark};
            border-radius: ${tokens.radii.md};
            font-family: ${tokens.fonts.technical};
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: ${tokens.colors.textPrimary};
            cursor: pointer;
            box-shadow: ${tokens.shadows.sharp};
            transition: ${tokens.transitions.fast};

            .auth-led {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
                animation: ledPulse 2s infinite ease-in-out;
            }

            &:hover {
                background: #ffffff;
                border-color: ${tokens.colors.accent};
                color: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.floating};
            }
        }

        .gear-btn {
            padding: 0.45rem 0.55rem;
            background: ${tokens.colors.chassis};
            border: 1px solid ${tokens.colors.borderDark};
            border-radius: ${tokens.radii.md};
            font-size: 0.85rem;
            color: ${tokens.colors.textMuted};
            cursor: pointer;
            transition: ${tokens.transitions.fast};

            &:hover {
                background: #ffffff;
                color: ${tokens.colors.accent};
                border-color: ${tokens.colors.accent};
            }
        }
    }

    @keyframes ledPulse {
        0%, 100% { opacity: 0.6; transform: scale(0.95); }
        50% { opacity: 1; transform: scale(1.1); }
    }

    /* Dropdown Console Menu */
    .user-dropdown-panel {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        width: 240px;
        background: #ffffff;
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.lg};
        box-shadow: ${tokens.shadows.floating};
        padding: 0.85rem;
        z-index: 1000;
        animation: fadeIn 0.15s ease-out;

        .dropdown-header {
            .status-badge {
                display: inline-block;
                font-family: ${tokens.fonts.technical};
                font-size: 0.6rem;
                font-weight: 700;
                color: ${tokens.colors.ledGreen};
                letter-spacing: 0.05em;
                margin-bottom: 0.25rem;
            }

            .welcome-text {
                font-size: 0.8rem;
                color: ${tokens.colors.textPrimary};
                margin: 0;
            }
        }

        .dropdown-divider {
            height: 1px;
            background: ${tokens.colors.recessed};
            margin: 0.6rem 0;
        }

        .dropdown-actions {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;

            .action-row {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                width: 100%;
                padding: 0.5rem 0.6rem;
                background: transparent;
                border: none;
                border-radius: ${tokens.radii.sm};
                text-decoration: none;
                font-size: 0.8rem;
                font-weight: 500;
                color: ${tokens.colors.textPrimary};
                cursor: pointer;
                text-align: left;
                transition: ${tokens.transitions.fast};

                .action-icon {
                    font-size: 0.95rem;
                }

                &:hover {
                    background: ${tokens.colors.recessed};
                    color: ${tokens.colors.accent};
                }
            }
        }

        .logout-row {
            width: 100%;
            padding: 0.5rem;
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.25);
            border-radius: ${tokens.radii.sm};
            font-family: ${tokens.fonts.technical};
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            color: #ef4444;
            cursor: pointer;
            transition: ${tokens.transitions.fast};

            &:hover {
                background: #ef4444;
                color: #ffffff;
            }
        }
    }

    /* Modal Backdrop and Window */
    .config-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1rem;
    }

    .config-modal-window {
        background: #ffffff;
        border: 1px solid ${tokens.colors.borderDark};
        border-radius: ${tokens.radii.xl};
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        width: 100%;
        max-width: 520px;
        overflow: hidden;
        animation: scaleIn 0.2s ease-out;

        .modal-topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: ${tokens.colors.chassis};
            padding: 0.75rem 1.25rem;
            border-bottom: 1px solid ${tokens.colors.borderDark};

            .telemetry-badge {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-family: ${tokens.fonts.technical};
                font-size: 0.68rem;
                font-weight: 700;
                color: ${tokens.colors.textMuted};
                letter-spacing: 0.08em;

                .dot {
                    width: 7px;
                    height: 7px;
                    background: ${tokens.colors.accent};
                    border-radius: 50%;
                }
            }

            .close-btn {
                background: transparent;
                border: none;
                font-size: 1rem;
                color: ${tokens.colors.textMuted};
                cursor: pointer;

                &:hover {
                    color: ${tokens.colors.accent};
                }
            }
        }

        .modal-content {
            padding: 1.5rem;

            h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.15rem;
                font-weight: 700;
                color: ${tokens.colors.textPrimary};
            }

            .description {
                font-size: 0.85rem;
                color: ${tokens.colors.textMuted};
                line-height: 1.45;
                margin-bottom: 1rem;
            }

            .setup-steps {
                padding-left: 1.25rem;
                font-size: 0.85rem;
                color: ${tokens.colors.textPrimary};
                line-height: 1.6;
                margin-bottom: 1.25rem;

                li {
                    margin-bottom: 0.5rem;
                }

                .inline-link {
                    color: ${tokens.colors.accent};
                    font-weight: 600;
                    text-decoration: underline;
                }

                .redirect-box {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: ${tokens.colors.recessed};
                    border: 1px solid ${tokens.colors.borderDark};
                    border-radius: ${tokens.radii.sm};
                    padding: 0.4rem 0.6rem;
                    margin-top: 0.35rem;

                    code {
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.78rem;
                        color: ${tokens.colors.textPrimary};
                    }

                    .copy-btn {
                        background: #ffffff;
                        border: 1px solid ${tokens.colors.borderDark};
                        border-radius: ${tokens.radii.xs};
                        padding: 0.2rem 0.5rem;
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.68rem;
                        font-weight: 700;
                        color: ${tokens.colors.accent};
                        cursor: pointer;

                        &:hover {
                            background: ${tokens.colors.accent};
                            color: #ffffff;
                        }
                    }
                }
            }

            .client-id-form {
                label {
                    display: block;
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: ${tokens.colors.textMuted};
                    letter-spacing: 0.06em;
                    margin-bottom: 0.35rem;
                }

                input {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0.65rem 0.85rem;
                    background: ${tokens.colors.recessed};
                    border: 1px solid ${tokens.colors.borderDark};
                    border-radius: ${tokens.radii.md};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.9rem;
                    color: ${tokens.colors.textPrimary};
                    outline: none;
                    transition: ${tokens.transitions.fast};

                    &:focus {
                        border-color: ${tokens.colors.accent};
                        background: #ffffff;
                        box-shadow: 0 0 0 3px rgba(255, 94, 40, 0.15);
                    }
                }

                .form-buttons {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 1.25rem;

                    .btn-cancel {
                        padding: 0.6rem 1rem;
                        background: transparent;
                        border: 1px solid ${tokens.colors.borderDark};
                        border-radius: ${tokens.radii.md};
                        font-size: 0.85rem;
                        font-weight: 600;
                        color: ${tokens.colors.textMuted};
                        cursor: pointer;

                        &:hover {
                            background: ${tokens.colors.recessed};
                        }
                    }

                    .btn-save {
                        padding: 0.6rem 1.25rem;
                        background: ${tokens.colors.accent};
                        border: 1px solid ${tokens.colors.accent};
                        border-radius: ${tokens.radii.md};
                        font-size: 0.85rem;
                        font-weight: 700;
                        color: #ffffff;
                        cursor: pointer;
                        box-shadow: ${tokens.shadows.accentButton};
                        transition: ${tokens.transitions.fast};

                        &:hover {
                            background: ${tokens.colors.accentHover};
                            transform: translateY(-1px);
                        }
                    }
                }
            }
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
    }
`;
