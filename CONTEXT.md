# CONTEXTE TECHNIQUE GLOBAL - POC Configurateur 3D Mobilier

Ce document constitue la synthèse technique complète du projet "Configurateur 3D Mobilier" à l'issue de la phase de Prototype (POC).

## 1. Architecture Globale

L'application repose sur un découplage strict entre les couches de présentation et de logique, articulé autour d'une "Single Source of Truth" :

- **Séparation UI/3D :** L’interface utilisateur 2D (React/Tailwind) est gérée comme une surcouche (Overlay), tandis que la scène 3D (Three.js/Fiber) est isolée dans son propre Canvas. Cette séparation permet d'optimiser les performances de rendu indépendamment de la réactivité de l'interface.
- **Gestion d'État Centralisée :** Zustand centralise l’intégralité de la logique métier (positions, rotations, thèmes, inventaire). Cela assure une synchronisation parfaite : tout changement dans le Store (ex: clic sur un bouton de couleur) est immédiatement répercuté par les composants 3D.
- **Réactivité Bidirectionnelle :** Les interactions 3D (ex: drag dans la scène) mettent à jour le Store, ce qui déclenche instantanément la mise à jour des composants 2D (ex: décompte des modules dans le devis).

## 2. Technologies et Bibliothèques 3D

Le projet utilise une suite d'outils performants pour le WebGL et le développement moderne :

- **React & Vite :** Framework et moteur de build pour une expérience de développement et d'exécution fluide.
- **Three.js & React Three Fiber (R3F) :** Le tandem moteur 3D + pont interactif permettant de manipuler les objets 3D comme des composants React.
- **@react-three/drei :** Bibliothèque d'helpers optimisant l'usage des contrôles de caméra (`CameraControls`), de l'environnement HDRI (`Environment`), et des ombres réalistes (`ContactShadows`).
- **Zustand :** Gestion d'état global, choisie pour sa légèreté et sa réactivité, critiques dans un environnement 3D à 60 FPS.
- **Tailwind CSS :** Framework utilitaire pour le styling de l’UI 2D, incluant une gestion native du mode sombre (`dark mode`).

## 3. Portions de Code Clés

- `useStore.ts` : Le "cerveau" de l'application. Gère l'inventaire des modules, leurs transformations (positions, rotations, couleurs des faces) et les paramètres globaux.
- `UI.tsx` : Point d'entrée de l'interface utilisateur. Regroupe le catalogue de modules (Drag & Drop), la palette de couleurs, les contrôles de caméra et la navigation.
- `Experience.tsx` : Chef d'orchestre de la scène 3D. Définit l'éclairage, le ciel, et instancie les différents calques de rendu (stand, modules, feedback visuel).
- `snapping.ts` : Moteur mathématique gérant le magnétisme par sommets (*Vertex Snapping*) et l'empilement automatique (*Surface Drop*).
- `QuoteModal.tsx` : Logique d'exportation. Calcule en temps réel l'inventaire du stand pour générer un devis estimatif imprimable.
- `ModularBlock.tsx` & `PlacedModuleController.tsx` : Gèrent le rendu géométrique détaillé et le cycle de vie interactif des modules placés.

## 4. Dette Technique et Bugs Connus

L'analyse du POC met en évidence des anomalies et axes d'amélioration critiques :

- **Z-fighting :** Problème de clignotement des textures se produisant lorsque les faces de deux modules (ou du sol) se chevauchent exactement sur le même plan.
- **Perte de surbrillance de sélection :** Bug intermittent où le retour visuel (contour bleu) ne s'active pas correctement sur certains modules, gênant la manipulation au clavier (R pour rotation, V pour bascule verticale).
- **Logique mathématique de Snapping :** Le système de magnétisme souffre d'approximations. Des micro-écarts de quelques millimètres peuvent apparaître, empêchant un alignement parfait dans des configurations complexes.
- **Action de Rotation (Touche R) :** L'utilisation de la rotation peut provoquer une disparition ou une éjection du module si le calcul de collision après pivotement échoue à trouver un emplacement valide.
- **Optimisation des Draw Calls :** Avec un grand nombre de modules et de faces interactives, une optimisation via le "instancing" serait nécessaire pour maintenir la fluidité.

## 5. Résolutions Récentes

- **Z-fighting :** Ce problème a été résolu par une séparation spatiale stricte : la grille est à `y=0`, l'ombre (`ContactShadows`) est à `y=-0.2`, et le plan de construction est descendu à `y=-0.5`.
- **Couleur et sélection du Plateau :** Le bug forçant le Plateau à devenir bleu lors de la sélection a été résolu. Le matériau a été hardcodé dans `ModularBlock.tsx` pour ignorer les couleurs dynamiques. De plus, sa couleur a été harmonisée avec l'ossature des autres cubes/rectangles (`#d2b48c`) pour garantir la cohérence esthétique globale de la scène.

## 6. Prochaines Étapes

[À compléter par le Chef de Projet après la validation du POC]
