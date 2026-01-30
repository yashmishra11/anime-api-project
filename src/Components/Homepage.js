import React from 'react'
import Popular from './Popular'
import { useGlobalContext } from '../context/global'
import styled from 'styled-components'
import Upcoming from './Upcoming'
import Airing from './Airing'

function Homepage() {
    const {
        handleSubmit, 
        search,
        handleChange,
        getUpcomingAnime,
        getAiringAnime,
    } = useGlobalContext()

    const [rendered, setRendered] = React.useState('popular')

    const switchComponent = () => {
        switch(rendered){
            case 'popular':
                return <Popular rendered={rendered} />
            case 'airing':
                return <Airing rendered={rendered} />
            case 'upcoming':
                return <Upcoming rendered={rendered} />
            default:
                return <Popular rendered={rendered}/>
        }
    }

    return (
        <HomepageStyled>
            <header>
                <div className='logo'>
                    <h1>
                        {rendered === 'popular' ? 'Popular Anime' :
                        rendered === 'airing' ? 'Airing Anime' : 'Upcoming Anime'}
                    </h1> 
                </div>
                <div className='search-container'>
                    <div className='filter-btn-popular-filter'>
                        <button onClick={() => setRendered('popular')}>
                            Popular
                        </button>
                    </div>
                    <form action='' className='search-form' onSubmit={handleSubmit}>
                        <div className='input-ctrl'>
                            <input 
                                type="text" 
                                placeholder="Search Anime" 
                                value={search} 
                                onChange={handleChange} 
                            />
                            <button type="submit">Search</button>
                        </div>
                    </form>
                    <div className='filter-btn-airing-filter'>
                        <button onClick={() => {
                            setRendered('airing')
                            getAiringAnime()
                        }}>
                            Airing
                        </button>
                    </div>
                    <div className='filter-btn-upcoming-filter'>
                        <button onClick={() => { 
                            setRendered('upcoming')
                            getUpcomingAnime()
                        }}>
                            Upcoming
                        </button>
                    </div>
                </div>
            </header>
            {switchComponent()}
        </HomepageStyled>
    )
}

const HomepageStyled = styled.div`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    
    h1 { 
        color: #ffffff;
        font-weight: 700;
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    }
    
    header {
        padding: 2rem 5rem;
        width: min(90%, 1200px);
        margin: 0 auto;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        @media screen and (max-width: 1530px) {
            width: 95%;
            padding: 2rem 2rem;
        }
        
        @media screen and (max-width: 768px) {
            padding: 1.5rem 1rem;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
        }
        
        .search-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            
            @media screen and (max-width: 768px) {
                gap: 0.5rem;
            }
            
            button {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1.5rem;
                outline: none;
                border-radius: 12px;
                font-size: 1rem;
                font-weight: 600;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-family: inherit;
                border: 2px solid rgba(255, 255, 255, 0.2);
                color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                
                &:hover {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                }
                
                &:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                @media screen and (max-width: 768px) {
                    padding: 0.6rem 1rem;
                    font-size: 0.9rem;
                }
            }
            
            form {
                position: relative;
                flex: 1;
                min-width: 200px;
                max-width: 400px;
                
                @media screen and (max-width: 768px) {
                    width: 100%;
                    max-width: 100%;
                    order: -1;
                }
                
                .input-control {
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .input-ctrl {
                    position: relative;
                    
                    input {
                        width: 100%;
                        padding: 0.75rem 7rem 0.75rem 1.25rem;
                        border: none;
                        outline: none;
                        border-radius: 12px;
                        font-size: 1rem;
                        background: rgba(255, 255, 255, 0.95);
                        border: 2px solid transparent;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        color: #333;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        
                        &::placeholder {
                            color: #999;
                        }
                        
                        &:focus {
                            background: #ffffff;
                            border-color: rgba(255, 255, 255, 0.6);
                            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15),
                                       0 0 0 3px rgba(255, 255, 255, 0.1);
                        }
                        
                        @media screen and (max-width: 768px) {
                            font-size: 0.9rem;
                            padding: 0.6rem 6rem 0.6rem 1rem;
                        }
                    }
                    
                    button {
                        position: absolute;
                        right: 4px;
                        top: 50%;
                        transform: translateY(-50%);
                        padding: 0.5rem 1.25rem;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        
                        &:hover {
                            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                            transform: translateY(-50%) scale(1.02);
                        }
                        
                        &:active {
                            transform: translateY(-50%) scale(0.98);
                        }
                        
                        @media screen and (max-width: 768px) {
                            padding: 0.4rem 1rem;
                            font-size: 0.85rem;
                        }
                    }
                }
            }
        }
    }
`

export default Homepage