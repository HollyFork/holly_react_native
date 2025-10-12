# Holly Fork


<p align="center">
  <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop,q=95/YZ9E4p4qOxfKDMoj/starter-hf-20252026-m2Wq6k5rD4t0NorR.png" alt="iOS"> 
</p>

![iOS](https://img.shields.io/badge/iOS-Mobile-blue) ![WatchOS](https://img.shields.io/badge/WatchOS-App-green) ![React Native](https://img.shields.io/badge/React_Native-Legacy-yellow)

Holly Fork est un projet multi-plateforme comprenant :

- **Holly Fork (iOS Mobile)** : package principal de l’application iOS.  
- **Holly Fork Watch OS** : package de l’application pour Apple Watch.  
- **holly_app** : ancienne version de l’application développée en React Native.

---

## Structure du projet

- `Holly Fork/` : code source de l’app iOS Mobile.  
- `Holly Fork Watch OS/` : code source de l’app WatchOS.  
- `holly_app/` : version historique de l’app en React Native (peut servir pour référence ou migration).

### Liens rapides

- [Page Holly Fork](https://hollyfork.com/)  

---

## Développement

### iOS Mobile & WatchOS

1. Ouvrir le projet dans **Xcode**.  
2. Sélectionner la target souhaitée : **iOS Mobile** ou **WatchOS**.  
3. Build & Run sur un simulateur ou un appareil réel.


## Git Workflow & Best Practices

Pour garantir une collaboration efficace et un code de qualité, voici les pratiques recommandées pour ce projet multi-plateforme.

### Branches

- **main** : branche stable, prête pour la production.
- **develop** : branche de développement principale.
- **feature/<nom-de-la-feature>** : pour développer une nouvelle fonctionnalité.
- **fix/<nom-du-fix>** : pour corriger un bug sur `develop`.
- **hotfix/<nom-du-hotfix>** : pour corriger rapidement un bug sur `main`.
- **transverse/<nom-du-sujet>** : pour des modifications transverses affectant plusieurs packages.

### Commits

Utiliser un format conventionnel pour les messages de commit :

- `feat: <nom-de-la-feature>` → nouvelle fonctionnalité
- `fix: <nom-du-fix>` → correction de bug
- `transverse: <sujet>` → modifications transverses
- `hotfix: <description>` → correction urgente sur `main`

### Workflow recommandé

1. Toujours créer une branche à partir de `develop` (sauf pour les hotfix sur `main`).
2. Effectuer des commits atomiques et clairs.
3. Ouvrir une Pull Request (PR) vers `develop` ou `main` selon le type de branche.
4. Ajouter des reviewers pour validation.
5. Supprimer les branches locales et distantes une fois la PR mergée.

### Bonnes pratiques

- Pull régulièrement depuis `develop` pour rester à jour.
- Ne pas pousser de code non testé.
- Écrire des messages de commit clairs et descriptifs.
- Documenter les changements majeurs dans le README ou CHANGELOG si nécessaire.

