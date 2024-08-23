import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useGlobalContext } from '../context/global'

function Sidebar() {
    const {popularAnime} = useGlobalContext()

    const sorted = popularAnime?.sort((a,b) =>{
        return b.score - a.score;
    })

  return (
<SidebarStyled>
   <h3>Top 5 Popular</h3>
     <div className='anime'>
        {sorted?.slice(0,5).map((anime) => {
        return <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                   <img src={anime.images.jpg.large_image_url} alt="" />
                    <h5>
                        {anime.title}
                    </h5>
               </Link>
        })}
     </div>
</SidebarStyled>

  )
}

const SidebarStyled = styled.div`
    h3 {
    color:#333333;
    }
    margin-top: 2rem;
    background-color: #708090;
    border-top: 5px solid #333333;
    padding-right: 5rem;
    padding-left: 2rem;
    padding-top: 2rem;
    .anime{
        display: flex;
        flex-direction: column;
        width: 150px;
        img{
            width: 140%;
            border-radius: 5px;
            border: 5px solid #333333;
        }
        a{
            margin-top: 1rem;
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            color: #333333;
            h4{
                font-size: 1.7rem;
            }
        }
    }
`;

export default Sidebar
