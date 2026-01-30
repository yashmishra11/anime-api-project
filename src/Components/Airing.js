import React from 'react'
import { Link } from 'react-router-dom'
import { useGlobalContext } from '../context/global'
import styled from 'styled-components'
import Sidebar from './Sidebar'

function Airing({rendered}) {
    const { airingAnime, isSearch, searchResults } = useGlobalContext()
    
    const conditionalRender = () => {
        if(!isSearch && rendered === 'airing'){
            return airingAnime?.map((anime) => {
                return <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                    <img src={anime.images.jpg.large_image_url} alt="" />
                </Link>
            })
        } else {
            return searchResults?.map((anime) => {
                return <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                    <img src={anime.images.jpg.large_image_url} alt="" />
                </Link>
            })
        }
    }
    
    return (
        <PopularStyled>
            <div className="airing-anime">
                {conditionalRender()}
            </div>
            <Sidebar />
        </PopularStyled>
    )
}

const PopularStyled = styled.div`
    display: flex;
    gap: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    
    @media screen and (max-width: 1024px) {
        flex-direction: column;
    }
    
    .airing-anime {
        margin-top: 2rem;
        padding: 2rem 5rem 2rem 5rem;
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-top: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px 24px 0 0;
        
        @media screen and (max-width: 1440px) {
            padding: 2rem 3rem;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        }
        
        @media screen and (max-width: 1024px) {
            padding: 2rem 2rem;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 1.25rem;
        }
        
        @media screen and (max-width: 768px) {
            padding: 1.5rem 1rem;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
        }
        
        @media screen and (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
        }
        
        a {
            position: relative;
            height: 420px;
            border-radius: 16px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(0, 0, 0, 0.2);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    to top,
                    rgba(0, 0, 0, 0.7) 0%,
                    rgba(0, 0, 0, 0) 50%
                );
                opacity: 0;
                transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 1;
                pointer-events: none;
            }
            
            &:hover {
                transform: translateY(-8px) scale(1.02);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3),
                           0 0 0 2px rgba(255, 255, 255, 0.1);
                
                &::before {
                    opacity: 1;
                }
                
                img {
                    transform: scale(1.1);
                }
            }
            
            &:active {
                transform: translateY(-4px) scale(1.01);
            }
            
            @media screen and (max-width: 768px) {
                height: 320px;
                
                &:hover {
                    transform: translateY(-4px) scale(1.01);
                }
            }
            
            @media screen and (max-width: 480px) {
                height: 280px;
            }
            
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 14px;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                display: block;
            }
        }
    }
`;

export default Airing