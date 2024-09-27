import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Connexion from './Connexion';
import MapWithPositions from './MapWithPositions';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Connexion />} />
        <Route path="/map" element={<MapWithPositions utilisateurId={1} />} /> {/* Exemple d'utilisateur */}
      </Routes>
    </Router>
  );
};

export default App;