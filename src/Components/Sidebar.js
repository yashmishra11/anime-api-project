import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useGlobalContext } from '../context/global';
import { tokens, ventSlots } from '../theme/tokens';

function Sidebar() {
    const { popularAnime } = useGlobalContext();
    const sorted = popularAnime ? [...popularAnime].sort((a, b) => b.score - a.score) : [];
    
    return (
        <SidebarStyled>
            <div className="sidebar-header">
                <div className="telemetry-tag">
                    <span className="dot" />
                    <span>TELEMETRY</span>
                </div>
                <div className="rack-vents">
                    <span />
                </div>
            </div>
            <h3>Top 5 Popular</h3>
            <div className='anime'>
                {sorted.slice(0, 5).map((anime, index) => {
                    const targetId = anime.id || anime.mal_id;
                    const posterUrl = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.images?.webp?.large_image_url || anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
                    return (
                        <Link to={`/anime/${targetId}`} key={targetId}>
                            <div className="img-slot">
                                <img src={posterUrl} alt={anime.title || "Anime"} />
                                <span className="rank-badge">0{index + 1}</span>
                            </div>
                            <div className="anime-meta">
                                <h5>{anime.title}</h5>
                                {anime.score && (
                                    <span className="score-label">SCORE: {anime.score}</span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </SidebarStyled>
    );
}

const SidebarStyled = styled.aside`
    margin-top: 1.5rem;
    background: ${tokens.colors.chassis};
    border-radius: ${tokens.radii.xl} 0 0 0;
    padding: 2rem 2.25rem 2rem 2rem;
    min-width: 300px;
    max-width: 340px;
    box-shadow: ${tokens.shadows.card};
    border: 1px solid rgba(255, 247, 240, 0.85);
    border-right: none;
    transition: ${tokens.transitions.normal};
    
    @media screen and (max-width: 1440px) {
        min-width: 260px;
        max-width: 300px;
        padding: 1.75rem 1.75rem 1.75rem 1.5rem;
    }
    
    @media screen and (max-width: 1024px) {
        max-width: 100%;
        min-width: 100%;
        border-radius: ${tokens.radii.lg};
        border-right: 1px solid rgba(255, 247, 240, 0.85);
        padding: 2rem;
        
        .anime {
            flex-direction: row !important;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem !important;
            
            a {
                width: 170px !important;
            }
        }
    }
    
    @media screen and (max-width: 768px) {
        padding: 1.5rem 1rem;
        
        .anime {
            gap: 1rem !important;
            
            a {
                width: 145px !important;
            }
        }
    }

    .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;

        .telemetry-tag {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-family: ${tokens.fonts.technical};
            font-size: 0.7rem;
            font-weight: 700;
            color: ${tokens.colors.textMuted};
            letter-spacing: 0.08em;

            .dot {
                width: 6px;
                height: 6px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
            }
        }

        .rack-vents {
            ${ventSlots}
        }
    }
    
    h3 {
        color: ${tokens.colors.textPrimary};
        font-family: ${tokens.fonts.technical};
        font-size: 1.15rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 1.5rem;
        text-shadow: ${tokens.shadows.textEmbossed};
        border-bottom: 1px solid ${tokens.colors.borderShadow};
        padding-bottom: 0.5rem;
        box-shadow: 0 1px 0 ${tokens.colors.borderLight};
    }
    
    .anime {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        
        a {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            color: ${tokens.colors.textPrimary};
            text-decoration: none;
            padding: 0.75rem;
            border-radius: ${tokens.radii.md};
            background: ${tokens.colors.chassis};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            transition: ${tokens.transitions.fast};
            
            .img-slot {
                position: relative;
                width: 100%;
                aspect-ratio: 2/3;
                border-radius: ${tokens.radii.sm};
                overflow: hidden;
                box-shadow: ${tokens.shadows.recessed};
                background: ${tokens.colors.recessed};
                border: 1px solid rgba(186, 190, 204, 0.5);

                img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: inherit;
                    image-rendering: -webkit-optimize-contrast;
                    transition: transform 0.3s ease, filter 0.3s ease;
                }

                .rank-badge {
                    position: absolute;
                    top: 6px;
                    left: 6px;
                    background: ${tokens.colors.accent};
                    color: ${tokens.colors.accentForeground};
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: ${tokens.radii.xs};
                    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.3);
                    letter-spacing: 0.05em;
                }
            }

            .anime-meta {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;

                h5 {
                    font-family: ${tokens.fonts.primary};
                    font-size: 0.875rem;
                    font-weight: 700;
                    line-height: 1.35;
                    color: ${tokens.colors.textPrimary};
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0;
                    transition: color 0.2s ease;
                }

                .score-label {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: ${tokens.colors.textMuted};
                    letter-spacing: 0.04em;
                }
            }
            
            &:hover {
                transform: translateX(-4px);
                box-shadow: ${tokens.shadows.floating};
                border-color: rgba(255, 247, 240, 1);
                
                .img-slot img {
                    transform: scale(1.05);
                    filter: contrast(1.06);
                }
                
                .anime-meta h5 {
                    color: ${tokens.colors.accent};
                }
            }
            
            &:active {
                transform: translateX(-1px);
                box-shadow: ${tokens.shadows.pressed};
            }
        }
    }
`;

export default Sidebar;