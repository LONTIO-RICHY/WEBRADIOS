# ROADMAP MVP DÉTAILLÉE - LUKO LIVE 💎
**Version** : 1.0 (Finalisation MVP)
**Objectif** : Rendre la plateforme totalement interactive et prête pour le public camerounais.

---

## MODULE 5 : DYNAMISATION DE L'EXPÉRIENCE AUDITEUR

### Étape 5.1 : Moteur de Recherche Global [TERMINÉ]
*   **Backend (`main.py`) [TERMINÉ]** : 
    *   [x] Création de la route `GET /api/search?q=query`.
    *   [x] Logique : Recherche insensible à la casse dans `models.Channel.name` et `models.Emission.title`.
    *   [x] Retour : Un objet JSON `{ channels: [...], emissions: [...] }`.
*   **Frontend (`Corps.jsx`) [TERMINÉ]** : 
    *   [x] Implémenter un `debounced effect` sur l'input de recherche (attendre 400ms).
    *   [x] Affichage d'une liste de résultats dynamique avec redirection (Link).
    *   [x] Indicateur de chargement (Spinner) pendant la recherche.

### Étape 5.2 : Système de Lecture Dynamique (Context Audio)
*   **Frontend (`src/context/AudioContext.jsx`)** : 
    *   Créer un `AudioProvider` pour stocker l'ID de la chaîne active (`currentChannelId`) et l'état de lecture (`isPlaying`).
    *   Créer une fonction `playChannel(id)` accessible partout.
*   **Composant Player (`Player.jsx`)** :
    *   S'abonner au `AudioContext`.
    *   Déclencher la reconnexion WebSocket dès que `currentChannelId` change.
*   **Boutons Action** : Relier tous les boutons "ÉCOUTER" (dans `ChainesDroite`, `CategoriesDroite`, etc.) à la fonction `playChannel(id)`.

---



## MODULE 6 : INTERACTION & FIDÉLISATION

### Étape 6.1 : Système de Favoris Personnel
*   **Backend (`models.py` & `main.py`)** : 
    *   Ajouter la table `Favorite` (id, user_id, channel_id).
    *   Route `POST /api/favorites/{channel_id}` : Toggle (ajoute si absent, retire si présent).
    *   Route `GET /api/favorites/me` : Liste les IDs des chaînes favorites de l'utilisateur connecté.
*   **Frontend** : 
    *   Dynamiser l'icône `Heart`. Remplissage de l'icône si la chaîne est déjà en favori.
    *   Ajout d'une section "Mes Favoris" dans le menu de gauche.

### Étape 6.2 : Badge "LIVE" Synchronisé
*   **Backend** : Ajouter un champ `last_broadcast_at` dans le modèle `Channel`.
*   **Logique** : Une chaîne est considérée "LIVE" si une émission liée possède `is_live=True`.
*   **Frontend** : Le badge Vert Forêt ne doit s'afficher que si l'API confirme que le WebSocket de cette chaîne est actif.

---

## MODULE 7 : FIABILISATION & FEEDBACK (UX FINALE)

### Étape 7.1 : Notifications Systèmes (Toasts)
*   **Action** : Installation de `react-hot-toast`.
*   **Configuration** : Créer un wrapper global dans `App.jsx`.
*   **Usage** : 
    *   *Succès* (Vert) : "Chaîne créée !", "Paramètres sauvegardés !", "Compte créé !".
    *   *Erreur* (Corail) : "Identifiants incorrects", "Fichier trop lourd", "Erreur réseau".

### Étape 7.2 : Gestion des États Vides & Squelettes
*   **UI** : Ajouter des "Skeleton Loaders" (blocs gris animés) pendant le chargement des chaînes pour éviter le saut de contenu.
*   **Empty States** : Créer des illustrations/textes sympas quand une recherche ne donne rien ou qu'un utilisateur n'a pas encore de favoris.

---

## RÉSUMÉ DES NOUVELLES ROUTES API À CRÉER
1. `GET /api/search` -> Recherche universelle.
2. `POST /api/favorites/{id}` -> Gestion des coups de cœur.
3. `GET /api/favorites/me` -> Récupération des préférences.
4. `GET /api/channels/{id}/status` -> Vérification live ultra-rapide.
