import React from 'react';
import { useGlobalContext } from '../context/global';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import AnimeCard from './AnimeCard';
import { tokens } from '../theme/tokens';

function Popular({ selectedGenre = 'Overall', onResetGenre }) {
    const { popularAnime, isSearch, searchResults } = useGlobalContext();

    const baseList = isSearch ? searchResults : (popularAnime || []);

    // Filter by selected genre if not 'Overall' and not in search mode
    const displayList = (!isSearch && selectedGenre && selectedGenre !== 'Overall')
        ? baseList.filter((anime) =>
            anime.genres?.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase())
          )
        : baseList;

    return (
        <PopularStyled>
            <div className="popular-anime">
                {/* Active Category Filter Tag Header if a genre is selected */}
                {!isSearch && selectedGenre && selectedGenre !== 'Overall' && (
                    <div className="filter-status-banner">
                        <div className="filter-status-tag">
                            <span className="dot" />
                            <span>CATEGORY FILTER ACTIVE: [ {selectedGenre.toUpperCase()} ]</span>
                            <span className="count">({displayList.length} TRANSMISSIONS)</span>
                        </div>
                        {onResetGenre && (
                            <button type="button" className="reset-filter-btn" onClick={onResetGenre}>
                                ✕ SHOW ALL CATEGORIES
                            </button>
                        )}
                    </div>
                )}

                {displayList && displayList.length > 0 ? (
                    displayList.map((anime) => (
                        <AnimeCard anime={anime} key={anime.mal_id} />
                    ))
                ) : (
                    <div className="empty-terminal">
                        <span className="dot-blink" />
                        <p>{"// NO MATCHING SPECIMENS LOCATED FOR ["}{selectedGenre.toUpperCase()}{"]"}</p>
                        {onResetGenre && (
                            <button type="button" className="reset-btn" onClick={onResetGenre}>
                                RETURN TO ALL SPECIMENS
                            </button>
                        )}
                    </div>
                )}
            </div>
            <Sidebar />
        </PopularStyled>
    );
}

const PopularStyled = styled.div`
    display: flex;
    gap: 2rem;
    background-color: ${tokens.colors.chassis};
    min-height: 100vh;
    padding: 0 2rem;
    
    @media screen and (max-width: 1024px) {
        flex-direction: column;
        padding: 0 1rem;
    }
    
    .popular-anime {
        margin-top: 1.5rem;
        padding: 2rem 2.5rem;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.75rem;
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.xl} ${tokens.radii.xl} 0 0;
        box-shadow: ${tokens.shadows.recessed};
        border: 1px solid rgba(255, 247, 240, 0.7);
        align-content: start;
        
        @media screen and (max-width: 1440px) {
            padding: 1.75rem 2rem;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.5rem;
        }
        
        @media screen and (max-width: 1024px) {
            padding: 1.5rem 1.25rem;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1.25rem;
        }
        
        @media screen and (max-width: 640px) {
            padding: 1.25rem 0.75rem;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
        }

        .filter-status-banner {
            grid-column: 1 / -1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: ${tokens.colors.chassis};
            padding: 0.75rem 1.25rem;
            border-radius: ${tokens.radii.md};
            box-shadow: ${tokens.shadows.card};
            border: 1px solid rgba(255, 247, 240, 0.85);
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
            gap: 0.75rem;

            .filter-status-tag {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-family: ${tokens.fonts.technical};
                font-size: 0.78rem;
                font-weight: 700;
                color: ${tokens.colors.textPrimary};

                .dot {
                    width: 7px;
                    height: 7px;
                    border-radius: ${tokens.radii.full};
                    background: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.glowOrange};
                    animation: pulse 1.5s infinite ease-in-out;
                }

                .count {
                    color: ${tokens.colors.textMuted};
                    font-size: 0.72rem;
                }
            }

            .reset-filter-btn {
                background: ${tokens.colors.recessed};
                border: 1px solid rgba(186, 190, 204, 0.5);
                font-family: ${tokens.fonts.technical};
                font-size: 0.72rem;
                font-weight: 700;
                color: ${tokens.colors.textMuted};
                padding: 4px 10px;
                border-radius: ${tokens.radii.sm};
                cursor: pointer;
                box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.1), inset -1px -1px 2px rgba(255, 247, 240, 0.8);
                transition: ${tokens.transitions.fast};

                &:hover {
                    color: ${tokens.colors.accent};
                    border-color: ${tokens.colors.accent};
                }
            }
        }

        .empty-terminal {
            grid-column: 1 / -1;
            padding: 4rem 2rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.25rem;
            font-family: ${tokens.fonts.technical};
            color: ${tokens.colors.textMuted};

            .dot-blink {
                width: 12px;
                height: 12px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
                animation: pulse 1.5s infinite ease-in-out;
            }

            p {
                font-size: 0.9rem;
                letter-spacing: 0.08em;
                font-weight: 700;
            }

            .reset-btn {
                padding: 0.6rem 1.4rem;
                border-radius: ${tokens.radii.sm};
                font-family: ${tokens.fonts.technical};
                font-size: 0.75rem;
                font-weight: 700;
                color: ${tokens.colors.textLight};
                background: ${tokens.colors.accent};
                border: none;
                cursor: pointer;
                box-shadow: ${tokens.shadows.accentButton};
                transition: ${tokens.transitions.fast};

                &:hover {
                    background: ${tokens.colors.accentHover};
                }
            }
        }
    }
`;

export default Popular;