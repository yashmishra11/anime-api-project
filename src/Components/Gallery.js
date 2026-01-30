import React, { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components'
import { useGlobalContext } from '../context/global';

function Gallery() {
    const {getAnimePictures, pictures} = useGlobalContext()
    const {id} = useParams();
    //state
    const [index, setIndex] = React.useState(0);
    
    const handleImageClick = (i) => {
        setIndex(i)
    }
    
    const fetchAnimePictures = useCallback(() => {
        getAnimePictures(id)
    }, [id, getAnimePictures])
    
    React.useEffect(() => {
        fetchAnimePictures()
    }, [fetchAnimePictures])
    
    return (
        <GalleryStyled>
            <div className="back">
                <Link to="/">
                    <i className="fas fa-arrow-left"></i>
                    Back to Home
                </Link>
            </div>
            <div className="big-image">
                <img src={pictures[index]?.jpg.image_url} alt="" />
            </div>
            <div className="small-images">
                {pictures?.map((picture, i) => {
                    return <div className="image-con" onClick={() => {
                        handleImageClick(i)
                    }} key={i}>
                        <img 
                            src={picture?.jpg.image_url}
                            style={{
                                border: i === index ? "3px solid rgba(255, 255, 255, 0.8)" : "3px solid rgba(255, 255, 255, 0.2)",
                                filter: i === index ? 'grayscale(0) brightness(1.1)' : 'grayscale(40%) brightness(0.8)',
                                transform: i === index ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: i === index ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.2)'
                            }}
                            alt="" 
                        />
                    </div>
                })}
            </div>
        </GalleryStyled>
    )
}

const GalleryStyled = styled.div`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    position: relative;
    
    @media screen and (max-width: 768px) {
        padding: 1.5rem 1rem;
    }
    
    .back {
        position: absolute;
        top: 2rem;
        left: 2rem;
        z-index: 10;
        
        @media screen and (max-width: 768px) {
            top: 1rem;
            left: 1rem;
        }
        
        a {
            font-weight: 600;
            text-decoration: none;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            font-size: 1rem;
            
            i {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            &:hover {
                background: rgba(255, 255, 255, 0.25);
                border-color: rgba(255, 255, 255, 0.4);
                transform: translateX(-4px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                
                i {
                    transform: translateX(-4px);
                }
            }
            
            &:active {
                transform: translateX(-2px);
            }
            
            @media screen and (max-width: 768px) {
                padding: 0.6rem 1rem;
                font-size: 0.9rem;
                gap: 0.5rem;
            }
        }
    }
    
    .big-image {
        display: inline-block;
        padding: 2rem;
        margin: 6rem 0 2rem 0;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(12px);
        border-radius: 16px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        position: relative;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        @media screen and (max-width: 768px) {
            padding: 1.5rem;
            margin: 5rem 0 2rem 0;
        }
        
        @media screen and (max-width: 480px) {
            padding: 1rem;
            margin: 4rem 0 1.5rem 0;
        }
        
        &:hover {
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
            transform: scale(1.02);
        }
        
        img {
            width: 350px;
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            display: block;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            
            @media screen and (max-width: 480px) {
                width: 100%;
            }
        }
    }
    
    .small-images {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        width: 90%;
        max-width: 1200px;
        padding: 2rem;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        border: 2px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        justify-content: center;
        
        @media screen and (max-width: 768px) {
            width: 95%;
            padding: 1.5rem;
            gap: 0.75rem;
        }
        
        @media screen and (max-width: 480px) {
            padding: 1rem;
            gap: 0.5rem;
        }
        
        .image-con {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            
            &:hover {
                transform: translateY(-4px);
            }
            
            img {
                width: 6rem;
                height: 6rem;
                object-fit: cover;
                cursor: pointer;
                border-radius: 8px;
                border: 3px solid rgba(255, 255, 255, 0.2);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                
                @media screen and (max-width: 768px) {
                    width: 5rem;
                    height: 5rem;
                }
                
                @media screen and (max-width: 480px) {
                    width: 4rem;
                    height: 4rem;
                }
                
                &:hover {
                    filter: grayscale(0) brightness(1.1) !important;
                    transform: scale(1.1) !important;
                }
            }
        }
    }
`;

export default Gallery