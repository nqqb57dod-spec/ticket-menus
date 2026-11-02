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

Au premier lancement, la page est vierge : chacun remplit son propre profil, qui reste sur son téléphone.
**Voir un exemple** montre une semaine FICTIVE ; **Repartir de zéro** l'efface.

1. **Scanner un ticket** (bouton en bas à droite) : photo du ticket à plat et bien éclairé, puis **Lire le ticket**.
   Le texte lu peut être corrigé ; on peut aussi le coller à la main.
2. **Utiliser ces ingrédients** : la semaine se remplit. Touchez un jour pour voir ses repas.
   Pastille verte : déjà acheté. Pastille safran : à acheter. **Autre idée** change un plat.
3. **Placard** : corriger les ingrédients, les quantités, régler le nombre de jours, midi/soir, végétarien.
4. **Courses** : ce qui manque, rangé par rayon, à cocher ou à copier.

Les menus utilisent d'abord ce qui se garde le moins (viande, poisson, salade…). Sel, poivre, huile et épices
courantes sont supposés au placard.

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
