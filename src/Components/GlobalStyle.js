import {createGlobalStyle} from 'styled-components';

const GlobalStyle = createGlobalStyle`
@font-face{
        font-family:naru;
        src: url('naruto.ttf');
        }
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        list-style: none;
        text-decoration: none;
        font-family: 'naru', sans-serif;
    }

    body {
        font-family: 'naru', sans-serif;
        background-color: #6c7983;
        font-size:1.2rem;
        &::-webkit-background{
        width:7px;
        }
        &::-webkit-scrollbar-thumb{
        background-color:#6c7983;
        border-radius: 10px;
        }
        &::-webkit-scrollbar-track{
        background-color:#fff;
        }
    }
`;

export default GlobalStyle;