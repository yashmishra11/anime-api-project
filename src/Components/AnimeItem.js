import React, { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components';

function AnimeItem() {

    const {id} = useParams()
    //states
    const [anime, setAnime] = React.useState({});
    const [characters, setCharacters] = React.useState([]);
    const [showMore, setShowMore] = React.useState(false);

    //destructure anime
    const {
        title, synopsis, trailer,
        duration, aired, season,
        images, rank, score, scored_by,
        popularity, status, rating, source
    } = anime

    //get anime by id
    const getAnime = async(anime) => {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${anime}`);
        const data = await response.json();
        setAnime(data.data);
    }
    
    //get characters
    const getCharacters = async(anime) => {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${anime}/characters`);
        const data = await response.json();
        setCharacters(data.data);
    }

    useEffect(() => {
        getAnime(id);
        getCharacters(id);
    }, [id])

    return (
        <AnimeItemStyled>
            <h1>{title}</h1>
            <div className='details'>
                <div className='detail'>
                    <div className='image'>
                        <img src={images?.jpg.large_image_url} alt="" />
                    </div>
                    <div className='anime-details'>
                        <p><span>Aired:</span><span>{aired?.string}</span></p>
                        <p><span>Rating:</span><span>{rating}</span></p>
                        <p><span>Rank:</span><span>{rank}</span></p>
                        <p><span>Score:</span><span>{score}</span></p>
                        <p><span>Scored By:</span><span>{scored_by}</span></p>
                        <p><span>Popularity:</span><span>{popularity}</span></p>
                        <p><span>Status:</span><span>{status}</span></p>
                        <p><span>Source:</span><span>{source}</span></p>
                        <p><span>Season:</span><span>{season}</span></p>
                        <p><span>Duration:</span><span>{duration}</span></p>
                    </div>
                </div>
                <p className='description'>
                    {showMore ? synopsis : synopsis?.substring(0, 450) + '...'}
                    <button onClick={() => {
                        setShowMore(!showMore)
                    }}>{showMore ? 'Show Less' : 'Read More'}</button>
                </p>
            </div>
            <h3 className='title'>Trailer</h3>
            <div className='trailer-con'>
                {trailer?.embed_url &&
                    <iframe
                        src={trailer?.embed_url}
                        title="Inline Frame Example"
                        width="800"
                        height="450"
                        allow='accelerometer;autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        allowFullScreen>
                    </iframe>
                }
            </div>
            <h3 className='title'>Characters</h3>
            <div className="characters">
                {characters?.map((character, index) => {
                    const {role} = character
                    const {images, name, mal_id} = character.character
                    return <Link to={`/character/${mal_id}`} key={index}>
                        <div className="character">
                            <img src={images?.jpg.image_url} alt="" />
                            <h4>{name}</h4>
                            <p>{role}</p>
                        </div>
                    </Link>
                })}
            </div>
        </AnimeItemStyled>
    )
}

const AnimeItemStyled = styled.div`
    padding: 3rem 18rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    
    @media screen and (max-width: 1600px) {
        padding: 3rem 10rem;
    }
    
    @media screen and (max-width: 1200px) {
        padding: 2.5rem 5rem;
    }
    
    @media screen and (max-width: 768px) {
        padding: 2rem 1.5rem;
    }
    
    @media screen and (max-width: 480px) {
        padding: 1.5rem 1rem;
    }
    
    h1 {
        display: inline-block;
        font-size: clamp(2rem, 5vw, 3.5rem);
        margin-bottom: 2rem;
        cursor: pointer;
        background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 800;
        letter-spacing: -0.5px;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        
        &:hover {
            transform: skew(-2deg) translateX(4px);
            filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
        }
    }
    
    .title {
        display: inline-block;
        margin: 3rem 0 2rem 0;
        font-size: clamp(1.5rem, 3vw, 2rem);
        cursor: pointer;
        background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .description {
        margin-top: 2rem;
        line-height: 1.8;
        color: rgba(255, 255, 255, 0.95);
        font-size: 1.05rem;
        
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            outline: none;
            cursor: pointer;
            font-size: 1rem;
            color: #ffffff;
            font-weight: 600;
            padding: 0.5rem 1.25rem;
            border-radius: 8px;
            margin-left: 0.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            
            &:hover {
                background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
                border-color: rgba(255, 255, 255, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            &:active {
                transform: translateY(0);
            }
        }
    }

    .trailer-con {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 2rem 0;
        
        iframe {
            outline: none;
            border: 2px solid rgba(255, 255, 255, 0.2);
            padding: 1.5rem;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            max-width: 100%;
            
            @media screen and (max-width: 900px) {
                width: 100%;
                height: auto;
                aspect-ratio: 16/9;
                padding: 1rem;
            }
        }
    }

    .details {
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        border-radius: 20px;
        padding: 2rem;
        border: 2px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        
        @media screen and (max-width: 768px) {
            padding: 1.5rem;
        }
        
        .detail {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            
            @media screen and (max-width: 900px) {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }
            
            .image {
                img {
                    width: 100%;
                    border-radius: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    
                    &:hover {
                        transform: scale(1.02);
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
                    }
                }
            }
        }
        
        .anime-details {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 0.75rem;
            
            p {
                display: flex;
                gap: 1rem;
                color: rgba(255, 255, 255, 0.9);
                font-size: 1rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                
                &:last-child {
                    border-bottom: none;
                }
                
                span:first-child {
                    font-weight: 700;
                    color: #ffffff;
                    min-width: 120px;
                }
                
                span:last-child {
                    color: rgba(255, 255, 255, 0.85);
                }
            }
        }
    }

    .characters {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        padding: 2rem;
        border-radius: 20px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        
        @media screen and (max-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            padding: 1.5rem;
            gap: 1rem;
        }
        
        @media screen and (max-width: 480px) {
            grid-template-columns: repeat(2, 1fr);
        }
        
        a {
            text-decoration: none;
            
            .character {
                padding: 1rem;
                border-radius: 12px;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(8px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                border: 2px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                height: 100%;
                display: flex;
                flex-direction: column;
                
                img {
                    width: 100%;
                    aspect-ratio: 2/3;
                    object-fit: cover;
                    border-radius: 8px;
                    margin-bottom: 0.75rem;
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                h4 {
                    padding: 0.5rem 0;
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                p {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                    margin-top: auto;
                }
                
                &:hover {
                    transform: translateY(-8px);
                    background: rgba(0, 0, 0, 0.4);
                    border-color: rgba(255, 255, 255, 0.3);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
                    
                    img {
                        transform: scale(1.05);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    }
                }
                
                &:active {
                    transform: translateY(-4px);
                }
            }
        }
    }
`;

export default AnimeItem