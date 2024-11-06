import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import FrontPage from './components/front-page/FrontPage';
import GameUI from './components/game-ui/GameUI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/front-page" element={<FrontPage />} />
        <Route path="/game-ui" element={<GameUI />} />
      </Routes>
    </Router>
  );
}

export default App;
