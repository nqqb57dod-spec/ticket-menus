# Semaine en cuisine

Photographiez un ticket de caisse : l'app liste les ingrédients achetés, propose les repas de la semaine
et prépare la liste de ce qu'il manque.

Pas de compte, pas de serveur, pas de publicité. Tout se passe sur le téléphone : la photo n'est envoyée nulle part,
et les ingrédients et menus restent dans le navigateur de chacun.

## L'installer sur son téléphone

Ouvrir le lien de l'app, puis :

- **iPhone / iPad** : dans **Safari**, touchez **Partager** (carré avec une flèche) → **Sur l'écran d'accueil** → **Ajouter**.
- **Android** : dans **Chrome**, menu **⋮** → **Installer l'application**.
- **Windows / Mac** : dans **Edge** ou **Chrome**, icône **Installer** à droite de la barre d'adresse.

Après la première ouverture, l'app marche sans réseau.

## Comment s'en servir

Au premier lancement, l'app demande **Qui cuisine ?** : chaque personne a son profil, avec son placard,
ses menus, sa liste de courses, ses favoris et ses réglages. Le bouton avec le prénom, en haut, permet de changer
de profil, d'en ajouter, de renommer ou de supprimer. Les profils restent sur l'appareil : rien n'est envoyé ailleurs.

Quatre onglets en bas :

- **Semaine** : les repas jour par jour. Toucher un plat ouvre sa recette (temps, ingrédients déjà là / à acheter,
  étapes). **Autre idée** change le plat ; **♥** le met en favori (il revient plus souvent). Réglages : nombre de jours,
  midi/soir, végétarien.
- **Ingrédients** : le placard. **Scanner un ticket** ajoute ses articles ; on peut aussi taper un ingrédient.
- **Idées** : plus de 500 recettes (cuisine française, végétarienne, du monde, rapide), celles qu'on peut faire avec son placard d'abord. Filtres : possible maintenant,
  rapide, végétarien, cuisine du monde, favoris. Un plat peut être écarté pour toujours, et remis plus tard.
- **Courses** : ce qui manque, rangé par rayon. **Envoyer la liste** (WhatsApp, SMS…). Cocher en magasin, puis
  **J'ai fait les courses** range les articles dans le placard et met les menus à jour.

Les menus utilisent d'abord ce qui se garde le moins (viande, poisson, salade…). Sel, poivre, huile et épices
courantes sont supposés au placard. **Voir un exemple** montre une semaine FICTIVE ; **Repartir de zéro** l'efface.

## Mettre en ligne (GitHub Pages)

Settings → Pages → Source : **Deploy from a branch**, branche `main`, dossier `/ (root)`.
L'adresse devient `https://<utilisateur>.github.io/ticket-menus/`.

À chaque mise à jour, changer `VERSION` dans `sw.js` pour que les téléphones récupèrent la nouvelle version.

## Développement

| Fichier | Rôle |
|---|---|
| `index.html` | Interface |
| `moteur.js` | Ingrédients, recettes, lecture du ticket, planning (sans dépendance, navigateur et Node) |
| `sw.js`, `manifest.webmanifest`, `icones/` | Installation et fonctionnement hors ligne |
| `vendor/`, `lang/` | Lecture du ticket : Tesseract.js 5.1.1 et modèle français (licence Apache 2.0) |
| `polices/` | Bricolage Grotesque et Atkinson Hyperlegible (licence SIL OFL 1.1) |
| `tests/` | Tests du moteur : `node --test` (le ticket d'exemple est FICTIF) |

Essai en local : `python -m http.server 8000`, puis http://localhost:8000.

Pour enrichir les ingrédients ou les recettes : ajouter des lignes dans `INGREDIENTS` et `RECETTES` (`moteur.js`), puis lancer les tests.
