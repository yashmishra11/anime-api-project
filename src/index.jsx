import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GlobalStyle from './Components/GlobalStyle';
import { GlobalContextProvider } from './context/global';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <GlobalContextProvider>
       <App />
    </GlobalContextProvider>
  </React.StrictMode>
);

