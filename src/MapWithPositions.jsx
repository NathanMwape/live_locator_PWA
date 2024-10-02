import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useNavigate } from 'react-router-dom';

// Définir une icône personnalisée pour Leaflet
const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fonction pour calculer la distance entre deux positions
const haversineDistance = (coords1, coords2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371e3;
  const lat1 = toRad(coords1[0]);
  const lat2 = toRad(coords2[0]);
  const deltaLat = toRad(coords2[0] - coords1[0]);
  const deltaLon = toRad(coords2[1] - coords1[1]);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; 
};

// Composant pour ajuster la vue de la carte en fonction des positions
const MapAutoFit = ({ positions, userPosition, centerOnUser, setCenterOnUser }) => {
  const map = useMap();

  useEffect(() => {
    if (centerOnUser && userPosition) {
      map.setView(userPosition, map.getZoom());
      setCenterOnUser(false);
    } else if (positions.length > 0) {
      map.fitBounds(positions);
    }
  }, [positions, userPosition, centerOnUser, map, setCenterOnUser]);

  return null;
};

const MapWithPositions = () => {
  const [positions, setPositions] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [centerOnUser, setCenterOnUser] = useState(true);
  const [watchId, setWatchId] = useState(null); // Stocker l'ID de surveillance
  const navigate = useNavigate();

  const utilisateurId = localStorage.getItem('utilisateurId'); 
  const nomUtilisateur = localStorage.getItem('nomUtilisateur');

  const fetchPositions = () => {
    fetch(`http://localhost/api_test/index.php/position/?utilisateur_id=${utilisateurId}`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPositions(data.map(pos => [pos.latitude, pos.longitude]));
        } else {
          console.error('La réponse n\'est pas un tableau de positions');
        }
      })
      .catch(error => console.error('Erreur lors de la récupération des positions:', error));
  };

  const trackUserPosition = () => {
    let lastPosition = null;

    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;
          const currentPosition = [latitude, longitude];

          if (!lastPosition || haversineDistance(lastPosition, currentPosition) >= 1) {
            setUserPosition(currentPosition);

            fetch('http://localhost/api_test/index.php/positions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ utilisateurId, latitude, longitude }),
            })
              .then(response => response.json())
              .then(data => {
                if (data.message === 'Position enregistrée avec succès') {
                  setPositions(prevPositions => [...prevPositions, currentPosition]);
                  lastPosition = currentPosition;
                }
              })
              .catch(error => console.error('Erreur lors de l\'envoi de la position:', error));
          }
        },
        error => console.error("Erreur lors de l'obtention de la position:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      setWatchId(id); // Stocker l'ID de surveillance
    } else {
      console.error("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };

  // Fonction pour arrêter la surveillance de la géolocalisation
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null); // Réinitialiser l'ID de surveillance
      localStorage.removeItem('watchId');
      localStorage.removeItem('nomUtilisateur');
      localStorage.removeItem('utilisateurId');
      navigate('/');
      console.log("Surveillance de la géolocalisation arrêtée.");
    }
  };

  useEffect(() => {
    
    fetchPositions(); 
    trackUserPosition(); 
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [utilisateurId]);

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      {nomUtilisateur && <p><strong style={{ textTransform: 'uppercase' }}>{nomUtilisateur}</strong> Connecté </p>}

      <button onClick={fetchPositions} style={{ marginBottom: '10px' }}>
        Rafraîchir les positions
      </button>

      <button onClick={() => setCenterOnUser(true)} style={{ marginBottom: '10px' }}>
        Centrer sur ma position
      </button>

      {/* Bouton pour arrêter la surveillance de la géolocalisation */}
      <button onClick={stopTracking} style={{ marginBottom: '10px', backgroundColor: 'red', color: 'white' }}>
        Arrêter la géolocalisation
      </button>

      <MapContainer center={[0, 0]} zoom={16} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.length > 0 && (
          <>
            <Polyline positions={positions} color="magenta" />
            <Marker position={positions[positions.length - 1]} icon={defaultIcon}>
              <Popup>Dernière position enregistrée</Popup>
            </Marker>
          </>
        )}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={defaultIcon}>
              <Popup>Vous êtes ici</Popup>
            </Marker>

            <MapAutoFit
              positions={positions}
              userPosition={userPosition}
              centerOnUser={centerOnUser}
              setCenterOnUser={setCenterOnUser}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default MapWithPositions;
