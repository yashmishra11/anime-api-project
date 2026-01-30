import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useGlobalContext } from '../context/global'

function Sidebar() {
    const {popularAnime} = useGlobalContext()
    const sorted = popularAnime?.sort((a, b) => {
        return b.score - a.score;
    })
    
    return (
        <SidebarStyled>
            <h3>Top 5 Popular</h3>
            <div className='anime'>
                {sorted?.slice(0, 5).map((anime) => {
                    return <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                        <img src={anime.images.jpg.large_image_url} alt="" />
                        <h5>{anime.title}</h5>
                    </Link>
                })}
            </div>
        </SidebarStyled>
    )
}

const SidebarStyled = styled.div`
    margin-top: 2rem;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border-top: 2px solid rgba(255, 255, 255, 0.15);
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px 0 0 0;
    padding: 2rem 3rem 2rem 2rem;
    min-width: 280px;
    max-width: 320px;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
    
    @media screen and (max-width: 1440px) {
        min-width: 240px;
        max-width: 280px;
        padding: 2rem 2rem 2rem 1.5rem;
    }
    
    @media screen and (max-width: 1024px) {
        max-width: 100%;
        min-width: 100%;
        border-left: none;
        border-top: 2px solid rgba(255, 255, 255, 0.15);
        border-radius: 0;
        padding: 2rem;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        
        .anime {
            flex-direction: row !important;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1.5rem !important;
            
            a {
                width: 160px !important;
            }
        }
    }
    
    @media screen and (max-width: 768px) {
        padding: 1.5rem;
        
        .anime {
            gap: 1rem !important;
            
            a {
                width: 140px !important;
            }
        }
    }
    
    h3 {
        color: #ffffff;
        font-size: clamp(1.25rem, 2vw, 1.5rem);
        font-weight: 700;
        margin-bottom: 1.5rem;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        letter-spacing: 0.5px;
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
            color: #ffffff;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            padding: 0.5rem;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.03);
            
            &:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateX(-4px);
                
                img {
                    transform: scale(1.05);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3),
                               0 0 0 2px rgba(255, 255, 255, 0.2);
                }
                
                h5 {
                    color: #ffffff;
                }
            }
            
            &:active {
                transform: translateX(-2px);
            }
            
            img {
                width: 100%;
                aspect-ratio: 2/3;
                object-fit: cover;
                border-radius: 8px;
                border: 2px solid rgba(255, 255, 255, 0.15);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            h5 {
                font-size: 0.9rem;
                font-weight: 600;
                line-height: 1.3;
                color: rgba(255, 255, 255, 0.9);
                transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                margin: 0;
            }
        }
    }
`;

export default Sidebar