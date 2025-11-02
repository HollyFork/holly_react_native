# Holly Fork


<p align="center">
  <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop,q=95/YZ9E4p4qOxfKDMoj/starter-hf-20252026-m2Wq6k5rD4t0NorR.png" alt="iOS"> 
</p>

![iOS](https://img.shields.io/badge/iOS-Mobile-blue) ![WatchOS](https://img.shields.io/badge/WatchOS-App-green) ![React Native](https://img.shields.io/badge/React_Native-Legacy-yellow)

Holly Fork est un projet multi-plateforme comprenant :

- **Holly Fork (iOS Mobile)** : package principal de l’application iOS.  
- **Holly Fork Watch OS** : package de l’application pour Apple Watch.  
- **holly_app** : ancienne version de l’application développée en React Native.
- **CORE** : Package iOS contenant la Clean Archi et Screen Ui de l'app principale (Module Shared)
---

## Structure du projet

- `Holly Fork/` : code source de l’app iOS Mobile.  
- `Holly Fork Watch OS/` : code source de l’app WatchOS.  
- `holly_app/` : version historique de l’app en React Native (peut servir pour référence ou migration).
- `holly_app/` :  code source du module CORE, clean archi, Ui, NetWork ....


## Structure du projet

| Dossier                                               | Description                                                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `Package.swift`                                       | Fichier de configuration du package Swift (définit les dépendances, cibles, etc.)                |
| `Sources/Core`                                        | Racine du code source du module `Core`                                                           |
|`Configurations`                                  | Contient les fichiers de configuration (par exemple : build, environnement, constantes globales) |
|  `Data`                                            | Couche **Data** de la Clean Architecture : gère la récupération et la persistance des données    |
|  `DataSources`                                   | Implémentation des sources de données locales et distantes                                       |
| `Local`                                       | Sources de données locales (UserDefaults, fichiers, CoreData, etc.)                              |
|   `Remote`                                      | Sources de données distantes (API, Firebase, etc.)                                               |
|   `Employee`, `Ingredient`, `Login`           | Modules spécifiques de data distantes                                                            |
|   `DTOs`                                      | Data Transfer Objects utilisés pour les échanges réseau                                          |
|   `Models`                                        | Modèles de données utilisés dans la couche Data                                                  |
|  `Enums`                                       | Définitions des énumérations partagées                                                           |
|   `DaySchedule.swift`, `FluxForecastData.swift` | Exemples de modèles de données                                                                   |
|  `Repositories`                                  | Implémentations concrètes des interfaces de Repository (définies dans Domain)                    |
|  `Domain`                                          | Couche **métier** (logique d’application indépendante de la plateforme)                          |
|  `Entities`                                      | Entités du domaine (modèles métier purs)                                                         |
|  `Repositories`                                  | Interfaces des Repositories (contrats de la couche Data)                                         |
|   `UseCases`                                      | Cas d’utilisation métier (logique applicative)                                                   |
|  `Presentation`                                    | Couche **UI / Présentation**                                                                     |
|   `Components`                                    | Composants UI réutilisables                                                                      |
|   `Theme`                                         | Définition du thème visuel (couleurs, typographie, styles)                                       |
|   `ViewModels`                                    | Logique de présentation (liaison entre le domaine et la vue)                                     |
|   `Views`                                         | Écrans et vues de l’application                                                                  |
|  `common`                                    | Vues partagées (login, home, map, splash, tutorial, etc.)                                        |
|   `ipad`                                      | Vues spécifiques à iPad                                                                          |
|   `iphone`                                    | Vues spécifiques à iPhone                                                                        |
| `Service`                                         | Couche des services techniques                                                                   |
|  `Network`                                       | Gestion du réseau et des appels API                                                              |
|   `Storage`                                       | Gestion du stockage local (fichiers, cache, etc.)                                                |
| `Utilities`                                     | Fonctions utilitaires et services transverses                                                    |
|   `Common`                                    | Services communs (Bluetooth, notifications, sons, vibrations, etc.)                              |
|   `Constant`                                  | Définition de constantes globales                                                                |
|   `Extension`                                 | Extensions Swift (types, helpers, etc.)                                                          |
|   `Core.swift`                                      | Point d’entrée principal du module Core                                                          |


   
## Structure du projet

 
Core.  
|--- Package.swift.  
|--- Sources.  
|......|--- Core.  
|............|--- Configurations.  
|............|--- Data.  
|............|......|--- DataSources.  
|............|......|......|--- Local.  
|............|......|......|--- Remote.  
|............|......|......|......|--- Employee.  
|............|......|......|......|......|--- DTOs.  
|............|......|......|......|--- Ingredient.  
|............|......|......|......|......|--- DTOs.  
|............|......|......|......|--- Login.  
|............|......|......|......|......|--- DTOs.  
|............|......|......|......|......|--- LoginRemoteDataSource.swift.  
|............|......|......|......|......|--- LogoutRemoteDataSource.swift.  
|............|......|--- Models.  
|............|......|--- Enums.  
|............|......|--- DaySchedule.swift.  
|............|......|--- FluxForecastData.swift.  
|............|--- Repositories.  
|............|--- Domain.  
|............|......|--- Entities.  
|............|......|--- Repositories.  
|............|......|--- UseCases.  
|............|--- Presentation.  
|............|......|--- Components.  
|............|......|--- Theme.  
|............|......|--- ViewModels.  
|............|......|--- Views.  
|............|............|--- common.  
|............|............|......|--- employeelogin.  
|............|............|......|--- hollyforklogin.  
|............|............|......|--- home.  
|............|............|......|--- map.  
|............|............|......|--- splashscreen.  
|............|............|......|--- tutorial.  
|............|............|--- ipad.  
|............|............|--- iphone.  
|............|--- Service.  
|............|......|--- Network.  
|............|......|--- Storage.  
|............|......|--- Utilities.  
|............|............|--- Common.  
|............|............|......|--- Bluetooth.  
|............|............|......|--- Notifications.  
|............|............|......|--- Sounds.  
|............|............|......|--- Vibrator.  
|............|............|--- Constant.  
|............|............|--- Extension.  
|............|--- Core.swift.  



## Lancement et Test du projet 
### iOS Mobile & iPad

1. Ouvrir le projet dans **Xcode**.  
2. Sélectionner la target souhaitée : **iOS Mobile** ou **iOS Ipad**.  
3. Build & Run sur un simulateur ou un appareil réel et se connecter directement avec Login & Mdp sinon 
4. Dans le dossier :  holly_pi 

```bash
source venv/bin/activate
```
ensuite 

```bash
python manage.py runserver 
```



### Liens rapides

- [Page Holly Fork](https://hollyfork.com/)  

---

## Développement

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
