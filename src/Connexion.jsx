import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Utilisation de React Router pour la redirection
import './App.css'; // Pour ajouter du style à la page

const Connexion = () => {
  const [nom, setNom] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [watchId, setWatchId] = useState(null);
  const navigate = useNavigate();

  // Fonction pour envoyer la position au backend
  const sendPositionToBackend = (latitude, longitude) => {
    const utilisateurId = localStorage.getItem('utilisateurId'); // Récupérer l'ID utilisateur

    fetch('http://localhost/api_test/index.php/positions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        utilisateurId,
        latitude,
        longitude,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message !== 'Position enregistrée avec succès') {
          console.error('Erreur lors de l\'enregistrement de la position:', data.message);
        }
      })
      .catch(error => console.error('Erreur:', error));
  };

  // Fonction de gestion de la connexion
  const handleLogin = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;

        // Envoyer la position lors de la connexion
        fetch('http://localhost/api_test/index.php/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nom,
            mot_de_passe: motDePasse, // Assurez-vous que ce champ est correct
            latitude,
            longitude,
          }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Connexion réussie et position enregistrée') {
              const utilisateurId = data.utilisateurId; // Récupérer l'ID utilisateur
              const nomUtilisateur = data.nom; // Récupérer le nom de l'utilisateur

              // Stocker l'ID utilisateur et le nom dans le localStorage
              localStorage.setItem('utilisateurId', utilisateurId);
              localStorage.setItem('nomUtilisateur', nomUtilisateur); // Stocker le nom

              sendPositionToBackend(latitude, longitude);
              
              navigate('/map'); // Rediriger vers la page de la carte

              // Surveiller la position toutes les 5 secondes après la connexion
              const watchId = navigator.geolocation.watchPosition(
                position => {
                  const { latitude, longitude } = position.coords;
                  sendPositionToBackend(latitude, longitude);
                },
                error => console.error("Erreur lors de l'obtention de la position:", error),
                {
                  enableHighAccuracy: true,
                  timeout: 1000,
                  maximumAge: 0,
                }
              );

              setWatchId(watchId); // Stocker l'ID de surveillance
            } else {
              console.error('Erreur lors de la connexion:', data.message);
            }
          })
          .catch(error => console.error('Erreur:', error));
      });
    } else {
      alert('La géolocalisation n\'est pas prise en charge par ce navigateur.');
    }
  };

  useEffect(() => {
    return () => {
      // Arrêter la surveillance de la position si l'utilisateur quitte la page
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <div className="login-form">
        <input
          type="text"
          placeholder="Nom"
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="input-field"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motDePasse}
          onChange={e => setMotDePasse(e.target.value)}
          className="input-field"
        />
        <button onClick={handleLogin} className="login-button">Se connecter</button>
      </div>
    </div>
  );
};

export default Connexion;
