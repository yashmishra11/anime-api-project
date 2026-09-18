import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import GlobalStyle from './Components/GlobalStyle';
import { GlobalContextProvider } from './context/global';
import { AuthProvider } from './context/authContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalStyle />
    <AuthProvider>
      <GlobalContextProvider>
        <App />
      </GlobalContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
