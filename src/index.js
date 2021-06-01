import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';

// Render onze App component (die in App.js staat)
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,

    document.getElementById('root')
);