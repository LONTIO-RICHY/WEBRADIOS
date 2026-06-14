# ROADMAP MVP DÉTAILLÉE - LUKO LIVE 💎
**Version** : 1.0 (Finalisation MVP)
**Objectif** : Rendre la plateforme totalement interactive et prête pour le public camerounais.

---

## MODULE 1 : AUTHENTIFICATION & SÉCURITÉ [TERMINÉ]
*   **Backend** : 
    *   [x] Inscription avec hachage de mot de passe.
    *   [x] Connexion avec génération de Token JWT.
    *   [x] Middleware de protection des routes privées.
*   **Frontend** : 
    *   [x] Pages Inscription et Connexion.
    *   [x] Context Auth pour gérer la session utilisateur globalement.

## MODULE 2 : ARCHITECTURE DE STREAMING WEBSOCKET [TERMINÉ]
*   **Backend** : 
    *   [x] Endpoint WebSocket `/ws/stream/{id}`.
    *   [x] ConnectionManager pour le broadcast audio (Float32Array).
*   **Frontend** : 
    *   [x] Capture audio (Microphone) via MediaDevices API.
    *   [x] Envoi des chunks binaires via WebSocket.

## MODULE 3 : GESTION DES CHAÎNES & CRÉATION [TERMINÉ]
*   **Backend** : 
    *   [x] CRUD complet pour les chaînes.
    *   [x] Système de validation par mot d'authentification (Simulation paiement).
*   **Frontend** : 
    *   [x] Formulaire de création de chaîne (Style Camerounais).
    *   [x] Dashboard pour le propriétaire de la chaîne.

## MODULE 4 : STUDIO & BIBLIOTHÈQUE AUDIO [TERMINÉ]
*   **Backend** : 
    *   [x] Upload de fichiers MP3 sécurisé.
    *   [x] Liaison des pistes (Tracks) à l'utilisateur.
*   **Frontend** : 
    *   [x] Interface Studio avec sélection de source (Micro vs MP3).
    *   [x] Gestion de la bibliothèque audio personnelle.

## MODULE 5 : DYNAMISATION DE L'EXPÉRIENCE AUDITEUR [TERMINÉ]

### Étape 5.1 : Moteur de Recherche Global [TERMINÉ]
*   **Backend (`main.py`) [TERMINÉ]** : 
    *   [x] Création de la route `GET /api/search?q=query`.
    *   [x] Logique : Recherche insensible à la casse dans `models.Channel.name` et `models.Emission.title`.
    *   [x] Retour : Un objet JSON `{ channels: [...], emissions: [...] }`.
*   **Frontend (`Corps.jsx`) [TERMINÉ]** : 
    *   [x] Implémenter un `debounced effect` sur l'input de recherche (attendre 400ms).
    *   [x] Affichage d'une liste de résultats dynamique avec redirection (Link).
    *   [x] Indicateur de chargement (Spinner) pendant la recherche.

### Étape 5.2 : Système de Lecture Dynamique (Context Audio) [TERMINÉ]
*   **Frontend (`src/context/AudioContext.jsx`) [TERMINÉ]** : 
    *   [x] Créer un `AudioProvider` pour stocker l'ID de la chaîne active (`currentChannelId`) et l'état de lecture (`isPlaying`).
    *   [x] Créer une fonction `playChannel(id)` accessible partout.
*   **Composant Player (`Player.jsx`) [TERMINÉ]** :
    *   [x] S'abonner au `AudioContext`.
    *   [x] Déclencher la reconnexion WebSocket dès que `currentChannelId` change.
*   **Boutons Action [TERMINÉ]** : [x] Relier tous les boutons "ÉCOUTER" (dans `ChainesDroite`, `CategoriesDroite`, etc.) à la fonction `playChannel(id)`.

---

## MODULE 6 : INTERACTION & FIDÉLISATION [TERMINÉ]

### Étape 6.1 : Système de Favoris Personnel [TERMINÉ]
*   **Backend (`models.py` & `main.py`) [TERMINÉ]** : 
    *   [x] Ajouter la table `Favorite` (id, user_id, channel_id).
    *   [x] Route `POST /api/favorites/{channel_id}` : Toggle (ajoute si absent, retire si présent).
    *   [x] Route `GET /api/favorites/me` : Liste les IDs des chaînes favorites de l'utilisateur connecté.
*   **Frontend [TERMINÉ]** : 
    *   [x] Dynamiser l'icône `Heart`. Remplissage de l'icône si la chaîne est déjà en favori.
    *   [x] Ajout d'une section "Mes Favoris" dans le menu de gauche.

### Étape 6.2 : Badge "LIVE" Synchronisé [TERMINÉ]
*   **Backend [TERMINÉ]** : 
    *   [x] Ajouter un champ `last_broadcast_at` dans le modèle `Channel`.
    *   [x] Logique : Une chaîne est considérée "LIVE" si une émission liée possède `is_live=True`.
*   **Frontend [TERMINÉ]** : [x] Le badge Vert Forêt ne doit s'afficher que si l'API confirme que le WebSocket de cette chaîne est actif.

---

## MODULE 7 : FIABILISATION & FEEDBACK (UX FINALE) [TERMINÉ]

### Étape 7.1 : Notifications Systèmes (Toasts) [TERMINÉ]
*   **Action [TERMINÉ]** : [x] Installation de `react-hot-toast`.
*   **Configuration [TERMINÉ]** : [x] Créer un wrapper global dans `App.jsx`.
*   **Usage [TERMINÉ]** : 
    *   [x] *Succès* (Vert) : "Ajouté aux favoris !".
    *   [x] *Erreur* (Corail) : "Identifiants incorrects", "Connectez-vous pour ajouter des favoris !".

### Étape 7.2 : Gestion des États Vides & Squelettes [TERMINÉ]
*   **UI [TERMINÉ]** : [x] Ajouter des "Skeleton Loaders" (blocs gris animés) pendant le chargement des chaînes pour éviter le saut de contenu.
*   **Empty States [TERMINÉ]** : [x] Créer des illustrations/textes sympas quand une recherche ne donne rien ou qu'un utilisateur n'a pas encore de favoris.

---

## RÉSUMÉ DES NOUVELLES ROUTES API CRÉÉES [TERMINÉ]
1. [x] `GET /api/search` -> Recherche universelle.
2. [x] `POST /api/favorites/{id}` -> Gestion des coups de cœur.
3. [x] `GET /api/favorites/me` -> Récupération des préférences.
4. [x] `GET /api/channels/{id}/status` -> Vérification live ultra-rapide.
