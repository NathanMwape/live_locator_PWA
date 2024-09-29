

# Application LIVE_LOCATOR (React avec Vite et PWA)

## Description

Cette application est une application React développée avec [Vite](https://vitejs.dev/) et transformée en Progressive Web App (PWA). L'application utilise également la bibliothèque Leaflet pour afficher une carte interactive et suivre la position d'un utilisateur en temps réel. Les positions sont enregistrées et récupérées à partir d'une API back-end.

## Fonctionnalités

- **Suivi de la position en temps réel** : La position de l'utilisateur est tracée et affichée sur une carte Leaflet.
- **Enregistrement des positions** : Les positions sont envoyées et enregistrées dans une base de données via une API.
- **Récupération des positions** : Les positions précédentes sont récupérées depuis le serveur pour être affichées sur la carte.
- **Progressive Web App (PWA)** : L'application est installable sur mobile et peut fonctionner hors ligne.

## Prérequis

- Node.js (>= v14)
- npm ou yarn
- Un serveur back-end capable de gérer les positions des utilisateurs (comme décrit dans les exemples de code fournis dans ce chat)

## Installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/votre-repo/application-react-pwa.git
   cd application-react-pwa
   ```

2. **Installer les dépendances :**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer le plugin PWA :**

   Le plugin PWA est déjà configuré dans le fichier `vite.config.js`, mais vous pouvez ajuster le fichier `manifest` si nécessaire.

4. **Ajouter les icônes PWA :**

   Placez vos fichiers d'icônes (`pwa-192x192.png`, `pwa-512x512.png`, etc.) dans le répertoire `public`.

## Configuration PWA

La configuration PWA se trouve dans le fichier `vite.config.js`. Voici un extrait de la configuration :

```javascript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nom de votre application',
        short_name: 'Nom court',
        description: 'Description de l’application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
```

## Lancer l'application en développement

```bash
npm run dev
# ou
yarn dev
```

## Build et prévisualisation

Pour compiler l'application et tester la version optimisée pour la production :

```bash
npm run build
npm run preview
```

## Suivi de la position avec Leaflet

Cette application utilise la bibliothèque `leaflet` pour afficher une carte interactive avec les positions de l'utilisateur. Le fichier principal de la carte se trouve dans `src/components/MapWithPositions.jsx`.

### Principaux composants :

- **Carte Leaflet** : Affiche la position actuelle de l'utilisateur et trace ses déplacements.
- **Tracking de la position** : Utilise l'API `navigator.geolocation` pour suivre la position de l'utilisateur.
- **API de back-end** : Les positions sont envoyées et récupérées via des requêtes à l'API back-end (comme mentionné plus tôt dans ce chat).

## API Back-end

L'API back-end doit fournir les routes suivantes :

- **POST** `/positions` : Enregistre la position de l'utilisateur.
- **GET** `/position/?utilisateurId=<id>` : Récupère les positions d'un utilisateur spécifique.

Voici un exemple de route en PHP pour récupérer les positions d'un utilisateur :

```php
if ($requestMethod === 'GET' && strpos($requestUri, '/position') !== false) {
    if (isset($_GET['utilisateur_id'])) {
        $utilisateurId = $_GET['utilisateur_id'];
        $stmt = $pdo->prepare("SELECT latitude, longitude FROM positions WHERE utilisateur_id = ? ORDER BY timestamp DESC");
        $stmt->execute([$utilisateurId]);
        $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($positions) {
            echo json_encode($positions);
        } else {
            echo json_encode(["message" => "Aucune position trouvée pour cet utilisateur"]);
        }
    } else {
        echo json_encode(["message" => "ID d'utilisateur manquant"]);
    }
}
```

## Déploiement

Une fois que l'application est prête, vous pouvez la déployer sur n'importe quel service d'hébergement statique (Netlify, Vercel, GitHub Pages, etc.).

1. **Build pour la production** :

   ```bash
   npm run build
   ```

2. **Déployer les fichiers générés** dans le dossier `dist/` sur votre serveur d'hébergement.

## Fonctionnement en tant que PWA

L'application fonctionnera comme une PWA une fois installée sur un navigateur supportant les Progressive Web Apps. Voici quelques fonctionnalités de PWA :

- L'application peut être installée sur l'écran d'accueil de l'utilisateur.
- L'application fonctionne hors ligne grâce à la mise en cache via le service worker.
- Le service worker est généré automatiquement par le plugin `vite-plugin-pwa`.

## Tests et Debugging

Pour tester et inspecter la fonctionnalité PWA :

1. Ouvrez les **Outils de développement** de votre navigateur (F12).
2. Allez dans l'onglet **Application**.
3. Vérifiez l'état de l'installation et du service worker sous la section **Service Workers**.
4. Utilisez l'outil **Lighthouse** pour vérifier que votre application respecte les meilleures pratiques PWA.

## Auteur

- **Votre Nom**
- **Contact** : [Votre adresse email ou profil GitHub]

## Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser et de le modifier comme bon vous semble.

```
