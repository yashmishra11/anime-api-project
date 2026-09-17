import React from 'react';
import Popular from './Popular';
import { useGlobalContext } from '../context/global';
import styled from 'styled-components';
import Upcoming from './Upcoming';
import Airing from './Airing';
import GenreSlider from './GenreSlider';
import { tokens, cornerScrews, ventSlots } from '../theme/tokens';

function Homepage() {
    const {
        handleSubmit, 
        search,
        handleChange,
        getUpcomingAnime,
        getAiringAnime,
        isSearch,
    } = useGlobalContext();

    const [rendered, setRendered] = React.useState('popular');
    const [selectedGenre, setSelectedGenre] = React.useState('Overall');

    // Dynamic browser page title synchronization
    React.useEffect(() => {
        if (isSearch && search) {
            document.title = `Search: "${search}" // AniLog Archive`;
        } else if (rendered === 'popular') {
            document.title = 'AniLog // Popular Anime Archive & Telemetry';
        } else if (rendered === 'airing') {
            document.title = 'AniLog // Live Airing Transmissions';
        } else if (rendered === 'upcoming') {
            document.title = 'AniLog // Upcoming Release Queue';
        }
    }, [rendered, isSearch, search]);

    const switchComponent = () => {
        switch(rendered){
            case 'popular':
                return <Popular selectedGenre={selectedGenre} onResetGenre={() => setSelectedGenre('Overall')} />;
            case 'airing':
                return <Airing selectedGenre={selectedGenre} onResetGenre={() => setSelectedGenre('Overall')} />;
            case 'upcoming':
                return <Upcoming selectedGenre={selectedGenre} onResetGenre={() => setSelectedGenre('Overall')} />;
            default:
                return <Popular selectedGenre={selectedGenre} onResetGenre={() => setSelectedGenre('Overall')} />;
        }
    };

    return (
        <HomepageStyled>
            <header>
                <div className='console-header-bar'>
                    <div className='brand-slot'>
                        <span className='brand-icon'>❖</span>
                        <h1 className='main-brand'>ANILOG</h1>
                        <span className='brand-sep'>//</span>
                        <span className='feed-indicator'>
                            {isSearch && search
                                ? `SEARCH: "${search.toUpperCase()}"`
                                : rendered === 'popular'
                                ? 'POPULAR SPECIMENS'
                                : rendered === 'airing'
                                ? 'LIVE AIRING FEED'
                                : 'UPCOMING PIPELINE'}
                        </span>
                    </div>

                    <div className='telemetry-meta'>
                        <span className='telemetry-led' />
                        <span className='status-pill'>STATION MK-IV</span>
                        <div className='console-vents'>
                            <span />
                        </div>
                    </div>
                </div>

                <div className='search-container'>
                    <div className='filter-btn-popular-filter'>
                        <button 
                            className={rendered === 'popular' ? 'active-key' : ''}
                            onClick={() => setRendered('popular')}
                        >
                            <span className="key-indicator" />
                            Popular
                        </button>
                    </div>

                    <form action='' className='search-form' onSubmit={handleSubmit}>
                        <div className='input-ctrl'>
                            <input 
                                type="text" 
                                placeholder="ENTER ANIME TITLE..." 
                                value={search} 
                                onChange={handleChange} 
                            />
                            <button type="submit">SEARCH</button>
                        </div>
                    </form>

                    <div className='filter-btn-airing-filter'>
                        <button 
                            className={rendered === 'airing' ? 'active-key' : ''}
                            onClick={() => {
                                setRendered('airing');
                                getAiringAnime();
                            }}
                        >
                            <span className="key-indicator" />
                            Airing
                        </button>
                    </div>

                    <div className='filter-btn-upcoming-filter'>
                        <button 
                            className={rendered === 'upcoming' ? 'active-key' : ''}
                            onClick={() => { 
                                setRendered('upcoming');
                                getUpcomingAnime();
                            }}
                        >
                            <span className="key-indicator" />
                            Upcoming
                        </button>
                    </div>
                </div>
            </header>
            {!isSearch && (
                <>
                    <GenreSlider />
                    <CategoryDeckStyled>
                        <div className="category-deck-inner">
                            <div className="deck-label">
                                <span className="deck-led" />
                                <span className="deck-text">FILTER CATALOG BY GENRE:</span>
                            </div>
                            <div className="deck-buttons">
                                {['Overall', 'Action', 'Sci-Fi', 'Fantasy', 'Comedy', 'Suspense', 'Romance'].map((genre) => {
                                    const isActive = selectedGenre.toLowerCase() === genre.toLowerCase();
                                    return (
                                        <button
                                            key={genre}
                                            type="button"
                                            className={`deck-btn ${isActive ? 'active-deck-btn' : ''}`}
                                            onClick={() => setSelectedGenre(genre)}
                                        >
                                            <span className="deck-pip" />
                                            {genre === 'Overall' ? 'ALL TRANSMISSIONS' : genre.toUpperCase()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </CategoryDeckStyled>
                </>
            )}
            {switchComponent()}
        </HomepageStyled>
    );
}

const HomepageStyled = styled.div`
    background-color: ${tokens.colors.chassis};
    min-height: 100vh;
    padding-bottom: 3rem;
    
    header {
        position: relative;
        padding: 0.85rem 1.75rem 0.95rem 1.75rem;
        width: min(92%, 1280px);
        margin: 1rem auto 0.75rem auto;
        background-color: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.lg};
        box-shadow: ${tokens.shadows.card};
        border: 1px solid rgba(255, 247, 240, 0.8);
        ${cornerScrews}
        transition: ${tokens.transitions.normal};
        
        @media screen and (max-width: 1024px) {
            width: 95%;
            padding: 0.75rem 1.25rem 0.85rem 1.25rem;
            margin: 0.75rem auto 0.5rem auto;
        }
        
        @media screen and (max-width: 768px) {
            padding: 0.75rem 0.85rem 0.85rem 0.85rem;
        }

        .console-header-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.95rem;
            padding-bottom: 0.65rem;
            border-bottom: 1px solid ${tokens.colors.borderShadow};
            box-shadow: 0 1px 0 ${tokens.colors.borderLight};
            flex-wrap: wrap;
            gap: 0.75rem;

            .brand-slot {
                display: flex;
                align-items: center;
                gap: 0.6rem;

                .brand-icon {
                    color: ${tokens.colors.accent};
                    font-size: 1.05rem;
                    line-height: 1;
                    filter: drop-shadow(0 0 5px rgba(255, 71, 87, 0.7));
                }

                .main-brand {
                    font-family: ${tokens.fonts.technical};
                    color: ${tokens.colors.textPrimary};
                    font-weight: 800;
                    font-size: clamp(1.05rem, 2vw, 1.25rem);
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                    text-shadow: ${tokens.shadows.textEmbossed};
                    margin: 0;
                }

                .brand-sep {
                    color: ${tokens.colors.borderDark};
                    font-family: ${tokens.fonts.technical};
                    font-weight: 700;
                    font-size: 0.85rem;
                }

                .feed-indicator {
                    font-family: ${tokens.fonts.technical};
                    color: ${tokens.colors.accent};
                    font-weight: 700;
                    font-size: clamp(0.75rem, 1.5vw, 0.88rem);
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    text-shadow: 0 1px 0 rgba(255, 255, 255, 0.9);
                }
            }

            .telemetry-meta {
                display: flex;
                align-items: center;
                gap: 0.75rem;

                .telemetry-led {
                    width: 7px;
                    height: 7px;
                    border-radius: ${tokens.radii.full};
                    background-color: ${tokens.colors.accent};
                    box-shadow: ${tokens.shadows.glowOrange};
                    animation: pulse 1.8s infinite ease-in-out;
                }

                .status-pill {
                    font-family: ${tokens.fonts.technical};
                    font-size: 0.72rem;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    color: ${tokens.colors.textPrimary};
                    background: ${tokens.colors.recessed};
                    padding: 3px 9px;
                    border-radius: ${tokens.radii.xs};
                    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.15), inset -1px -1px 2px rgba(255, 247, 240, 0.8);
                }

                .console-vents {
                    ${ventSlots}
                }
            }
        }
        
        .search-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
            flex-wrap: wrap;
            
            @media screen and (max-width: 768px) {
                gap: 0.5rem;
            }
            
            /* Physical mechanical switch buttons */
            .filter-btn-popular-filter button,
            .filter-btn-airing-filter button,
            .filter-btn-upcoming-filter button {
                position: relative;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.45rem 1.1rem;
                border-radius: ${tokens.radii.sm};
                font-family: ${tokens.fonts.technical};
                font-size: 0.78rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: ${tokens.colors.textMuted};
                background: ${tokens.colors.chassis};
                box-shadow: ${tokens.shadows.card};
                border: 1px solid rgba(255, 247, 240, 0.7);
                cursor: pointer;
                transition: ${tokens.transitions.fast};
                min-height: 38px;
                
                .key-indicator {
                    width: 5px;
                    height: 5px;
                    border-radius: ${tokens.radii.full};
                    background-color: ${tokens.colors.borderShadow};
                    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.3);
                    transition: ${tokens.transitions.fast};
                }
                
                &:hover {
                    color: ${tokens.colors.textPrimary};
                    box-shadow: ${tokens.shadows.buttonHover};
                    transform: translateY(-2px);
                }
                
                &:active {
                    transform: translateY(2px);
                    box-shadow: ${tokens.shadows.pressed};
                }
                
                /* Depressed state when active */
                &.active-key {
                    color: ${tokens.colors.accent};
                    background: ${tokens.colors.chassis};
                    box-shadow: ${tokens.shadows.pressed};
                    transform: translateY(1px);
                    border-color: rgba(0, 0, 0, 0.05);
                    
                    .key-indicator {
                        background-color: ${tokens.colors.accent};
                        box-shadow: ${tokens.shadows.glowOrange};
                    }
                }
                
                @media screen and (max-width: 768px) {
                    padding: 0.4rem 0.8rem;
                    font-size: 0.72rem;
                    min-height: 34px;
                }
            }
            
            form.search-form {
                position: relative;
                flex: 1;
                min-width: 240px;
                max-width: 400px;
                
                @media screen and (max-width: 768px) {
                    width: 100%;
                    max-width: 100%;
                    order: -1;
                }
                
                .input-ctrl {
                    position: relative;
                    display: flex;
                    align-items: center;
                    
                    /* Recessed Data Well */
                    input {
                        width: 100%;
                        height: 38px;
                        padding: 0.4rem 5.8rem 0.4rem 0.9rem;
                        outline: none;
                        border-radius: ${tokens.radii.sm};
                        font-family: ${tokens.fonts.technical};
                        font-size: 0.78rem;
                        background: ${tokens.colors.chassis};
                        border: 1px solid rgba(186, 190, 204, 0.4);
                        box-shadow: ${tokens.shadows.recessed};
                        color: ${tokens.colors.textPrimary};
                        transition: ${tokens.transitions.normal};
                        
                        &::placeholder {
                            color: ${tokens.colors.textMuted};
                            opacity: 0.65;
                            font-size: 0.75rem;
                            letter-spacing: 0.04em;
                        }
                        
                        &:focus {
                            border-color: ${tokens.colors.accent};
                            box-shadow: ${tokens.shadows.recessed}, 0 0 0 2px rgba(255, 71, 87, 0.25);
                        }
                        
                        @media screen and (max-width: 768px) {
                            height: 36px;
                            font-size: 0.75rem;
                            padding: 0.4rem 5.2rem 0.4rem 0.75rem;
                        }
                    }
                    
                    /* Safety Orange Trigger Button */
                    button {
                        position: absolute;
                        right: 4px;
                        height: 30px;
                        padding: 0 0.85rem;
                        border: none;
                        outline: none;
                        border-radius: calc(${tokens.radii.sm} - 1px);
                        background-color: ${tokens.colors.accent};
                        color: ${tokens.colors.accentForeground};
                        font-family: ${tokens.fonts.technical};
                        font-weight: 700;
                        font-size: 0.72rem;
                        letter-spacing: 0.05em;
                        cursor: pointer;
                        box-shadow: ${tokens.shadows.accentButton};
                        transition: ${tokens.transitions.fast};
                        
                        &:hover {
                            background-color: ${tokens.colors.accentHover};
                            box-shadow: 0 0 10px rgba(255, 71, 87, 0.6);
                        }
                        
                        &:active {
                            box-shadow: ${tokens.shadows.accentButtonPressed};
                            transform: scale(0.98);
                        }
                    }
                }
            }
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.5;
            transform: scale(0.9);
        }
    }
`;

const CategoryDeckStyled = styled.div`
    width: min(92%, 1280px);
    margin: 0 auto 1.5rem auto;

    @media screen and (max-width: 1024px) {
        width: 95%;
    }

    .category-deck-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
        padding: 0.75rem 1.5rem;
        background: ${tokens.colors.chassis};
        border-radius: ${tokens.radii.lg};
        box-shadow: ${tokens.shadows.card};
        border: 1px solid rgba(255, 247, 240, 0.85);

        @media screen and (max-width: 768px) {
            padding: 0.65rem 0.85rem;
            gap: 0.65rem;
        }

        .deck-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .deck-led {
                width: 6px;
                height: 6px;
                border-radius: ${tokens.radii.full};
                background: ${tokens.colors.accent};
                box-shadow: ${tokens.shadows.glowOrange};
            }

            .deck-text {
                font-family: ${tokens.fonts.technical};
                font-size: 0.72rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                color: ${tokens.colors.textMuted};
                text-shadow: ${tokens.shadows.textEmbossed};
            }
        }

        .deck-buttons {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            flex-wrap: wrap;

            .deck-btn {
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
                padding: 4px 10px;
                cursor: pointer;
                box-shadow: 2px 2px 5px ${tokens.colors.borderShadow}, -2px -2px 5px ${tokens.colors.borderLight};
                transition: ${tokens.transitions.fast};

                .deck-pip {
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

                &.active-deck-btn {
                    color: ${tokens.colors.accent};
                    background: ${tokens.colors.recessed};
                    border-color: rgba(255, 71, 87, 0.4);
                    box-shadow: ${tokens.shadows.pressed};

                    .deck-pip {
                        background: ${tokens.colors.accent};
                        box-shadow: ${tokens.shadows.glowOrange};
                    }
                }
            }
        }
    }
`;

export default Homepage;