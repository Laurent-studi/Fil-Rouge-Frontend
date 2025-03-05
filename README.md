# Le Quai Antique - Restaurant Gastronomique

## Description
Le Quai Antique est le site web du troisième restaurant du Chef Arnaud Michant, situé au cœur de Chambéry. Ce projet frontend met en valeur une expérience gastronomique authentique basée sur les produits de la Savoie.

## Fonctionnalités

### Côté Client
- **Navigation fluide** avec un menu responsive
- **Présentation du restaurant** et de sa philosophie
- **Carte et Menus** dynamiques
- **Galerie photos** des plats signatures
- **Système de réservation** en ligne
- **Gestion des comptes clients** :
  - Inscription/Connexion
  - Mémorisation des préférences (nombre de couverts, allergies)

### Côté Administration
- **Interface d'administration** sécurisée
- **Gestion des horaires** d'ouverture
- **Gestion de la carte** :
  - Catégories de plats
  - Plats (titre, description, prix)
  - Menus composés
- **Gestion de la galerie** photos
- **Gestion des réservations** :
  - Vue d'ensemble des réservations
  - Confirmation/Annulation
  - Filtrage par date

## Technologies Utilisées
- HTML5
- CSS3 (avec variables CSS pour la personnalisation)
- JavaScript (Vanilla)
- LocalStorage pour la persistance des données

## Structure du Projet
```
frf/
├── index.html          # Page principale du site
├── admin.html         # Interface d'administration
├── login.html         # Page de connexion admin
├── assets/
│   ├── css/
│   │   ├── style.css    # Styles principaux
│   │   └── admin.css    # Styles de l'interface admin
│   └── js/
│       ├── main.js      # Logique principale
│       ├── admin.js     # Logique d'administration
│       └── login.js     # Gestion de l'authentification
└── img/               # Images du site
```

## Installation
1. Cloner le repository
2. Ouvrir `index.html` dans un navigateur web

## Accès Administration
- Email : admin@lequaiantique.fr
- Mot de passe : Admin123!

## Fonctionnalités Principales

### Réservation
- Sélection de la date et de l'heure
- Choix du nombre de couverts
- Indication des allergies
- Vérification de la disponibilité en temps réel

### Gestion des Menus
- Création/modification des catégories
- Ajout/suppression de plats
- Composition de menus personnalisés
- Mise à jour des prix

### Horaires d'Ouverture
- Configuration des horaires par jour
- Gestion des périodes de fermeture
- Créneaux de réservation personnalisables

## Responsive Design
Le site est entièrement responsive et s'adapte à tous les appareils :
- Ordinateurs de bureau
- Tablettes
- Smartphones

## Sécurité
- Authentification sécurisée
- Protection des routes d'administration
- Validation des données côté client et serveur
- Gestion des sessions utilisateurs

## Auteur
Laurent PRADO

## Licence
Tous droits réservés - Le Quai Antique © 2025"# Fil-Rouge-Frontend" 
