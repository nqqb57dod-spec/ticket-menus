/*
 * Moteur de l'application « Ticket → menus ».
 * Sans dépendance : fonctionne dans le navigateur (objet global `Courses`) et sous Node (require).
 * Trois étapes : lire le texte d'un ticket, reconnaître les ingrédients, proposer les menus.
 * Tout est déterministe : mêmes entrées, mêmes menus.
 */
(function (racine, fabrique) {
  const moteur = fabrique();
  if (typeof module === "object" && module.exports) module.exports = moteur;
  else racine.Courses = moteur;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------------------------------------------------------------- Ingrédients
  // conservation : jours d'utilisation après l'achat. usages : nombre de recettes par article acheté.
  const INGREDIENTS = [
    // Viandes et poissons
    { id: "poulet", nom: "Poulet", categorie: "viande", conservation: 2, usages: 1, mots: ["POULET", "BLC POULET", "AIGUILLETTE"] },
    { id: "boeuf_hache", nom: "Bœuf haché", categorie: "viande", conservation: 2, usages: 1, mots: ["STEAK HACHE", "STK HACHE", "BOEUF HACHE", "VIANDE HACHEE", "HACHE"] },
    { id: "boeuf", nom: "Bœuf", categorie: "viande", conservation: 3, usages: 1, mots: ["BOEUF", "BAVETTE", "ENTRECOTE", "RUMSTECK", "PALERON"] },
    { id: "porc", nom: "Porc", categorie: "viande", conservation: 3, usages: 1, mots: ["PORC", "ECHINE", "FILET MIGNON"] },
    { id: "lardons", nom: "Lardons", categorie: "viande", conservation: 10, usages: 2, mots: ["LARDON"] },
    { id: "jambon", nom: "Jambon", categorie: "viande", conservation: 5, usages: 2, mots: ["JAMBON", "JBN"] },
    { id: "saucisse", nom: "Saucisses", categorie: "viande", conservation: 3, usages: 1, mots: ["SAUCISSE", "CHIPO", "MERGUEZ"] },
    { id: "saumon", nom: "Saumon", categorie: "poisson", conservation: 2, usages: 1, mots: ["SAUMON"] },
    { id: "poisson", nom: "Poisson blanc", categorie: "poisson", conservation: 2, usages: 1, mots: ["CABILLAUD", "COLIN", "LIEU", "MERLU", "POISSON"] },
    { id: "thon", nom: "Thon", categorie: "poisson", conservation: 365, usages: 1, mots: ["THON"] },
    { id: "crevettes", nom: "Crevettes", categorie: "poisson", conservation: 2, usages: 1, mots: ["CREVETTE"] },
    // Crèmerie
    { id: "oeufs", nom: "Œufs", categorie: "cremerie", conservation: 21, usages: 3, mots: ["OEUF", "OEUFS"] },
    { id: "lait", nom: "Lait", categorie: "cremerie", conservation: 7, usages: 3, mots: ["LAIT"] },
    { id: "creme", nom: "Crème fraîche", categorie: "cremerie", conservation: 10, usages: 2, mots: ["CREME", "CR FRAICHE", "CREME FRAICHE"] },
    { id: "beurre", nom: "Beurre", categorie: "cremerie", conservation: 30, usages: 4, mots: ["BEURRE"] },
    { id: "fromage_rape", nom: "Fromage râpé", categorie: "cremerie", conservation: 21, usages: 3, mots: ["RAPE", "FROMAGE RAPE", "EMMENTAL RAPE", "GRUYERE RAPE"] },
    { id: "emmental", nom: "Emmental / comté", categorie: "cremerie", conservation: 21, usages: 3, mots: ["EMMENT", "GRUYERE", "COMTE"] },
    { id: "mozzarella", nom: "Mozzarella", categorie: "cremerie", conservation: 7, usages: 1, mots: ["MOZZA"] },
    { id: "chevre", nom: "Chèvre", categorie: "cremerie", conservation: 14, usages: 2, mots: ["CHEVRE"] },
    { id: "feta", nom: "Feta", categorie: "cremerie", conservation: 14, usages: 2, mots: ["FETA"] },
    { id: "parmesan", nom: "Parmesan", categorie: "cremerie", conservation: 30, usages: 4, mots: ["PARMESAN", "PARMIGIANO", "GRANA"] },
    { id: "yaourt", nom: "Yaourts", categorie: "cremerie", conservation: 21, usages: 4, mots: ["YAOURT", "YOG"] },
    // Féculents et épicerie
    { id: "pates", nom: "Pâtes", categorie: "epicerie", conservation: 365, usages: 2, mots: ["PATES", "SPAGHETTI", "PENNE", "TAGLIATELLE", "COQUILLETTE", "FUSILLI", "MACARONI", "TORTI"] },
    { id: "riz", nom: "Riz", categorie: "epicerie", conservation: 365, usages: 3, mots: ["RIZ"] },
    { id: "semoule", nom: "Semoule", categorie: "epicerie", conservation: 365, usages: 3, mots: ["SEMOULE"] },
    { id: "quinoa", nom: "Quinoa", categorie: "epicerie", conservation: 365, usages: 2, mots: ["QUINOA"] },
    { id: "lentilles", nom: "Lentilles", categorie: "epicerie", conservation: 365, usages: 2, mots: ["LENTILLE"] },
    { id: "pois_chiches", nom: "Pois chiches", categorie: "epicerie", conservation: 365, usages: 2, mots: ["POIS CHICHE"] },
    { id: "pain", nom: "Pain", categorie: "boulangerie", conservation: 2, usages: 2, mots: ["PAIN", "BAGUETTE"] },
    { id: "pate_brisee", nom: "Pâte à tarte", categorie: "epicerie", conservation: 10, usages: 1, mots: ["PATE BRISEE", "PATE FEUILL", "PATE A TARTE", "PATE BRIS"] },
    { id: "pate_pizza", nom: "Pâte à pizza", categorie: "epicerie", conservation: 7, usages: 1, mots: ["PATE PIZZA", "PATE A PIZZA"] },
    { id: "tortillas", nom: "Tortillas", categorie: "epicerie", conservation: 30, usages: 2, mots: ["TORTILLA", "WRAP"] },
    { id: "sauce_tomate", nom: "Sauce tomate", categorie: "epicerie", conservation: 365, usages: 2, mots: ["SAUCE TOMATE", "COULIS", "PULPE", "TOMATE CONCASSEE", "TOMATES CONCASSEES", "PASSATA"] },
    { id: "lait_coco", nom: "Lait de coco", categorie: "epicerie", conservation: 365, usages: 1, mots: ["LAIT COCO", "LAIT DE COCO"] },
    { id: "curry", nom: "Curry", categorie: "epicerie", conservation: 365, usages: 5, mots: ["CURRY"] },
    { id: "pesto", nom: "Pesto", categorie: "epicerie", conservation: 30, usages: 2, mots: ["PESTO"] },
    { id: "sauce_soja", nom: "Sauce soja", categorie: "epicerie", conservation: 365, usages: 5, mots: ["SAUCE SOJA", "SOJA SALE"] },
    { id: "mais", nom: "Maïs", categorie: "epicerie", conservation: 365, usages: 2, mots: ["MAIS"] },
    { id: "farine", nom: "Farine", categorie: "epicerie", conservation: 365, usages: 4, mots: ["FARINE"] },
    { id: "tofu", nom: "Tofu", categorie: "epicerie", conservation: 10, usages: 2, mots: ["TOFU"] },
    // Fruits et légumes
    { id: "tomates", nom: "Tomates", categorie: "legume", conservation: 6, usages: 2, mots: ["TOMATE"] },
    { id: "oignons", nom: "Oignons", categorie: "legume", conservation: 30, usages: 4, mots: ["OIGNON"] },
    { id: "ail", nom: "Ail", categorie: "legume", conservation: 60, usages: 6, mots: ["AIL"] },
    { id: "pommes_de_terre", nom: "Pommes de terre", categorie: "legume", conservation: 30, usages: 3, mots: ["POMME DE TERRE", "POMMES DE TERRE", "PDT", "PATATE"] },
    { id: "carottes", nom: "Carottes", categorie: "legume", conservation: 21, usages: 3, mots: ["CAROTTE"] },
    { id: "courgettes", nom: "Courgettes", categorie: "legume", conservation: 7, usages: 2, mots: ["COURGETTE"] },
    { id: "poivrons", nom: "Poivrons", categorie: "legume", conservation: 7, usages: 2, mots: ["POIVRON"] },
    { id: "aubergine", nom: "Aubergine", categorie: "legume", conservation: 7, usages: 1, mots: ["AUBERGINE"] },
    { id: "champignons", nom: "Champignons", categorie: "legume", conservation: 5, usages: 2, mots: ["CHAMPIGNON", "CHAMP PARIS"] },
    { id: "salade", nom: "Salade", categorie: "legume", conservation: 4, usages: 2, mots: ["SALADE", "LAITUE", "BATAVIA", "MACHE", "ROQUETTE", "MESCLUN"] },
    { id: "epinards", nom: "Épinards", categorie: "legume", conservation: 4, usages: 1, mots: ["EPINARD"] },
    { id: "brocoli", nom: "Brocoli", categorie: "legume", conservation: 5, usages: 1, mots: ["BROCOLI"] },
    { id: "haricots_verts", nom: "Haricots verts", categorie: "legume", conservation: 5, usages: 1, mots: ["HARICOT VERT", "HARICOTS VERTS", "HAR VERT"] },
    { id: "poireaux", nom: "Poireaux", categorie: "legume", conservation: 10, usages: 2, mots: ["POIREAU"] },
    { id: "concombre", nom: "Concombre", categorie: "legume", conservation: 7, usages: 1, mots: ["CONCOMBRE"] },
    { id: "avocat", nom: "Avocat", categorie: "legume", conservation: 4, usages: 1, mots: ["AVOCAT"] },
    { id: "citron", nom: "Citron", categorie: "fruit", conservation: 21, usages: 2, mots: ["CITRON"] },
    { id: "pommes", nom: "Pommes", categorie: "fruit", conservation: 21, usages: 3, mots: ["POMME"] },
    { id: "bananes", nom: "Bananes", categorie: "fruit", conservation: 5, usages: 2, mots: ["BANANE"] },
    { id: "chocolat", nom: "Chocolat", categorie: "epicerie", conservation: 180, usages: 3, mots: ["CHOCOLAT", "CHOCO"] },
  ];

  // --------------------------------------------------------------------- Recettes
  // ingredients : indispensables (manquants → liste de courses). options : utilisés s'ils sont là.
  const RECETTES = [
    { id: "carbonara", nom: "Pâtes carbonara", ingredients: ["pates", "lardons", "oeufs"], options: ["parmesan"] },
    { id: "bolognaise", nom: "Spaghetti bolognaise", ingredients: ["pates", "boeuf_hache", "sauce_tomate", "oignons"], options: ["carottes", "parmesan"] },
    { id: "curry_poulet", nom: "Poulet au curry et riz", ingredients: ["poulet", "riz", "lait_coco", "curry"], options: ["oignons"] },
    { id: "omelette_champignons", nom: "Omelette aux champignons, salade verte", ingredients: ["oeufs", "champignons", "salade"], options: ["emmental"] },
    { id: "quiche_lorraine", nom: "Quiche lorraine", ingredients: ["pate_brisee", "lardons", "oeufs", "creme"], options: ["emmental", "salade"] },
    { id: "gratin_dauphinois", nom: "Gratin dauphinois", ingredients: ["pommes_de_terre", "creme", "lait", "ail"], options: ["fromage_rape", "salade"] },
    { id: "saumon_riz", nom: "Saumon, riz et haricots verts", ingredients: ["saumon", "riz", "haricots_verts"], options: ["citron"] },
    { id: "croque_monsieur", nom: "Croque-monsieur et salade", ingredients: ["pain", "jambon", "emmental", "salade"], options: ["beurre"] },
    { id: "ratatouille", nom: "Ratatouille et semoule", ingredients: ["courgettes", "aubergine", "poivrons", "tomates", "oignons"], options: ["semoule", "ail"] },
    { id: "dahl", nom: "Dahl de lentilles corail", ingredients: ["lentilles", "lait_coco", "oignons", "curry"], options: ["riz", "tomates"] },
    { id: "couscous_legumes", nom: "Couscous aux légumes", ingredients: ["semoule", "pois_chiches", "carottes", "courgettes"], options: ["oignons", "tomates"] },
    { id: "pizza", nom: "Pizza maison", ingredients: ["pate_pizza", "sauce_tomate", "mozzarella"], options: ["jambon", "champignons", "poivrons"] },
    { id: "fajitas", nom: "Fajitas au poulet", ingredients: ["tortillas", "poulet", "poivrons", "oignons"], options: ["avocat", "fromage_rape"] },
    { id: "hachis", nom: "Hachis parmentier", ingredients: ["pommes_de_terre", "boeuf_hache", "lait", "beurre"], options: ["fromage_rape", "oignons"] },
    { id: "soupe", nom: "Soupe poireaux, pommes de terre, carottes", ingredients: ["poireaux", "pommes_de_terre", "carottes"], options: ["creme", "pain"] },
    { id: "chevre_chaud", nom: "Salade de chèvre chaud", ingredients: ["salade", "chevre", "pain"], options: ["pommes"] },
    { id: "risotto", nom: "Risotto aux champignons", ingredients: ["riz", "champignons", "oignons", "parmesan"], options: ["creme", "beurre"] },
    { id: "papillote", nom: "Poisson en papillote et pommes de terre", ingredients: ["poisson", "pommes_de_terre", "citron"], options: ["courgettes"] },
    { id: "saucisses_lentilles", nom: "Saucisses aux lentilles", ingredients: ["saucisse", "lentilles", "carottes", "oignons"], options: [] },
    { id: "pates_pesto", nom: "Pâtes au pesto", ingredients: ["pates", "pesto"], options: ["parmesan", "tomates"] },
    { id: "salade_grecque", nom: "Salade grecque", ingredients: ["tomates", "concombre", "feta"], options: ["oignons", "pain"] },
    { id: "steak_haricots", nom: "Steak haché et haricots verts", ingredients: ["boeuf_hache", "haricots_verts"], options: ["pommes_de_terre", "beurre"] },
    { id: "crevettes_ail", nom: "Crevettes à l'ail et riz", ingredients: ["crevettes", "riz", "ail"], options: ["citron", "courgettes"] },
    { id: "gratin_pates", nom: "Gratin de pâtes au jambon", ingredients: ["pates", "jambon", "creme", "fromage_rape"], options: [] },
    { id: "tarte_poireaux", nom: "Tarte aux poireaux", ingredients: ["pate_brisee", "poireaux", "creme", "oeufs"], options: ["fromage_rape", "salade"] },
    { id: "wok_tofu", nom: "Wok de tofu aux légumes", ingredients: ["tofu", "riz", "carottes", "poivrons", "sauce_soja"], options: ["oignons"] },
    { id: "salade_thon", nom: "Salade de riz au thon", ingredients: ["thon", "riz", "tomates", "mais"], options: ["oeufs"] },
    { id: "crepes", nom: "Crêpes jambon-fromage", ingredients: ["farine", "oeufs", "lait", "jambon", "emmental"], options: ["beurre", "salade"] },
    { id: "porc_poelee", nom: "Côtes de porc et poêlée de pommes de terre", ingredients: ["porc", "pommes_de_terre", "oignons"], options: ["champignons"] },
    { id: "gratin_brocoli", nom: "Gratin de brocoli", ingredients: ["brocoli", "creme", "fromage_rape"], options: ["pommes_de_terre", "jambon"] },
    { id: "oeufs_epinards", nom: "Œufs cocotte aux épinards", ingredients: ["oeufs", "epinards", "creme"], options: ["pain"] },
    { id: "boeuf_carottes", nom: "Bœuf-carottes", ingredients: ["boeuf", "carottes", "oignons", "pommes_de_terre"], options: [] },
    { id: "bol_quinoa", nom: "Bol de quinoa, avocat et tomates", ingredients: ["quinoa", "avocat", "tomates"], options: ["feta", "citron"] },
    { id: "veloute_courgettes", nom: "Velouté de courgettes au chèvre", ingredients: ["courgettes", "oignons", "chevre"], options: ["pain"] },
    { id: "tortilla_espagnole", nom: "Tortilla espagnole", ingredients: ["oeufs", "pommes_de_terre", "oignons"], options: ["salade"] },
  ];

  const PAR_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
  const CARNES = new Set(["viande", "poisson"]);

  // ------------------------------------------------------------ Lecture du ticket
  const MOTS_IGNORES = [
    "TOTAL", "SOUS TOTAL", "TVA", "CB", "CARTE", "ESPECES", "RENDU", "MONNAIE", "MERCI", "A PAYER",
    "REMISE", "FIDELITE", "POINTS", "ARTICLE", "ARTICLES", "TICKET", "CAISSE", "CAISSIER", "SIRET",
    "TEL", "HT", "TTC", "PAIEMENT", "VISA", "MASTERCARD", "SANS CONTACT", "BON D ACHAT", "AVOIR",
    "MONTANT", "TRANSACTION", "AUTORISATION", "ECONOMIE", "ECONOMIES", "DONT", "SOLDE", "CLIENT",
    "BIENVENUE", "MAGASIN", "HORAIRES", "WWW", "COM", "EUROS",
  ];
  const RE_IGNORES = new RegExp("(^|[^A-Z])(" + MOTS_IGNORES.map((m) => m.replace(/ /g, "\\s+")).join("|") + ")([^A-Z]|$)");
  const RE_PRIX = /\s(-?\d{1,4}[.,]\d{2})\s*(?:€|EUR|E)?(?:\s+[A-D0-9])?\s*$/;
  const RE_DATE = /\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|\d{1,2}[:H]\d{2}/;
  const RE_QTE_SEULE = /^(\d{1,2})\s*[X*]\s*\d{1,4}[.,]\d{2}/; // ligne « 2 X 1,25  2,50 »
  const RE_QTE_TETE = /^(\d{1,2})\s*[X*]\s+(?=[A-Z])/; // « 2 X YAOURT NATURE »
  const RE_POIDS = /^\d+[.,]\d{1,3}\s*KG\b/; // « 0,456 KG X 2,99 €/KG »

  /** Met en majuscules sans accents, garde lettres, chiffres et séparateurs utiles. */
  function normaliser(texte) {
    return String(texte)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/Œ/g, "OE").replace(/œ/g, "oe")
      .toUpperCase()
      .replace(/[^A-Z0-9.,€*/\-\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Ingrédient du dictionnaire reconnu dans un libellé (mot-clé le plus long), ou null. */
  function reconnaitre(libelle, dictionnaire = INGREDIENTS) {
    const texte = " " + normaliser(libelle) + " ";
    let meilleur = null;
    let longueur = 0;
    for (const ingredient of dictionnaire) {
      for (const mot of ingredient.mots) {
        if (mot.length > longueur && new RegExp("[^A-Z]" + mot).test(texte)) {
          meilleur = ingredient.id;
          longueur = mot.length;
        }
      }
    }
    return meilleur;
  }

  function versNombre(texte) {
    return Number(texte.replace(",", "."));
  }

  /**
   * Lit le texte brut d'un ticket (sortie de l'OCR ou saisie).
   * Rend { articles: [{ligne, libelle, prix, quantite, ingredient}], ignorees: [lignes] }.
   */
  function analyserTicket(texte, dictionnaire = INGREDIENTS) {
    const articles = [];
    const ignorees = [];
    for (const brute of String(texte).split(/\r?\n/)) {
      let ligne = normaliser(brute);
      if (!ligne) continue;
      const precedent = articles[articles.length - 1];
      const qteSeule = ligne.match(RE_QTE_SEULE);
      if (qteSeule && precedent) {
        // « 2 X 1,05  2,10 » : le dernier prix est le total ; sans total, quantité × prix unitaire.
        precedent.quantite = Number(qteSeule[1]);
        const prix = ligne.match(/\d{1,4}[.,]\d{2}/g);
        const unitaire = versNombre(prix[0]);
        precedent.prix = prix.length > 1 ? versNombre(prix[prix.length - 1]) : Math.round(unitaire * precedent.quantite * 100) / 100;
        continue;
      }
      if (RE_POIDS.test(ligne) && precedent) {
        const prix = ligne.match(RE_PRIX);
        if (prix) precedent.prix = versNombre(prix[1]);
        continue;
      }
      if (RE_IGNORES.test(ligne) || RE_DATE.test(ligne)) {
        ignorees.push(brute.trim());
        continue;
      }
      let prix = null;
      const trouve = ligne.match(RE_PRIX);
      if (trouve) {
        prix = versNombre(trouve[1]);
        ligne = ligne.slice(0, trouve.index).trim();
      }
      if (prix !== null && prix < 0) {
        ignorees.push(brute.trim()); // remise
        continue;
      }
      let quantite = 1;
      const tete = ligne.match(RE_QTE_TETE);
      if (tete) {
        quantite = Number(tete[1]);
        ligne = ligne.slice(tete[0].length).trim();
      }
      if ((ligne.match(/[A-Z]/g) || []).length < 3) {
        ignorees.push(brute.trim());
        continue;
      }
      const ingredient = reconnaitre(ligne, dictionnaire);
      if (prix === null && ingredient === null) {
        ignorees.push(brute.trim()); // en-tête, adresse, slogan
        continue;
      }
      articles.push({ ligne: brute.trim(), libelle: ligne, prix, quantite, ingredient });
    }
    return { articles, ignorees };
  }

  // ------------------------------------------------------------------- Planning
  /** Stock disponible : id → { usages restants, conservation }. Les articles non reconnus sont écartés. */
  function construireStock(articles, dictionnaire = INGREDIENTS) {
    const parId = Object.fromEntries(dictionnaire.map((i) => [i.id, i]));
    const stock = {};
    for (const article of articles) {
      const ingredient = parId[article.ingredient];
      if (!ingredient) continue;
      const quantite = Math.max(1, Math.round(Number(article.quantite) || 1));
      const ligne = stock[ingredient.id] || { usages: 0, conservation: ingredient.conservation };
      ligne.usages += quantite * ingredient.usages;
      stock[ingredient.id] = ligne;
    }
    return stock;
  }

  function estVegetarienne(recette, parId = PAR_ID) {
    return recette.ingredients.concat(recette.options).every((id) => !CARNES.has((parId[id] || {}).categorie));
  }

  function proteine(recette, parId = PAR_ID) {
    const carne = recette.ingredients.find((id) => CARNES.has((parId[id] || {}).categorie));
    return carne || "vegetal";
  }

  function disponible(stock, id, jour) {
    const ligne = stock[id];
    return Boolean(ligne && ligne.usages > 0 && jour < ligne.conservation);
  }

  function noter(recette, stock, jour, dejaPris, proteinePrecedente, parId) {
    let score = 0;
    for (const id of recette.ingredients) {
      if (disponible(stock, id, jour)) {
        const joursRestants = stock[id].conservation - jour;
        score += 10 + Math.max(0, 8 - joursRestants) * 3; // ce qui va se perdre passe d'abord
        if (joursRestants <= 1) score += 30; // dernier jour : maintenant ou jamais
      } else {
        score -= 3;
      }
    }
    for (const id of recette.options) if (disponible(stock, id, jour)) score += 2;
    if (dejaPris.has(recette.id)) score -= 100;
    const p = proteine(recette, parId);
    if (p !== "vegetal" && p === proteinePrecedente) score -= 3;
    return score;
  }

  /**
   * Propose un repas par créneau (jour × repas), en utilisant d'abord ce qui a été acheté
   * et les produits qui se gardent le moins. Rend { menus, courses, restes }.
   * Un ingrédient manquant part en courses (acheté au plus tard le jour du repas) ;
   * l'article acheté entre dans le stock et sert aux repas suivants.
   * options : { jours: 7, repas: ["midi", "soir"], vegetarien: false, exclues: [ids] }
   */
  function proposerMenus(articles, options = {}, recettes = RECETTES, dictionnaire = INGREDIENTS) {
    const jours = options.jours ?? 7;
    const repas = options.repas ?? ["midi", "soir"];
    const exclues = new Set(options.exclues || []);
    const parId = Object.fromEntries(dictionnaire.map((i) => [i.id, i]));
    const candidates = recettes.filter((r) => !exclues.has(r.id) && (!options.vegetarien || estVegetarienne(r, parId)));
    const stock = construireStock(articles, dictionnaire);
    const menus = [];
    const manques = {};
    const dejaPris = new Set();
    let precedente = null;
    if (!candidates.length) return { menus, courses: [], restes: restesDe(stock, parId) };

    for (let jour = 0; jour < jours; jour++) {
      for (const moment of repas) {
        let choisie = candidates[0];
        let meilleur = -Infinity;
        for (const recette of candidates) {
          const score = noter(recette, stock, jour, dejaPris, precedente, parId);
          if (score > meilleur) {
            meilleur = score;
            choisie = recette;
          }
        }
        const utilises = [];
        const manquants = [];
        for (const id of choisie.ingredients) {
          if (disponible(stock, id, jour)) utilises.push(id);
          else manquants.push(id);
        }
        for (const id of choisie.options) if (disponible(stock, id, jour)) utilises.push(id);
        for (const id of utilises) stock[id].usages -= 1;
        for (const id of manquants) {
          const ingredient = parId[id];
          const ligne = manques[id] || { id, nom: ingredient.nom, articles: 0, jour, pour: [] };
          ligne.articles += 1;
          ligne.pour.push(choisie.nom);
          manques[id] = ligne;
          stock[id] = { usages: ingredient.usages - 1, conservation: jour + ingredient.conservation, achete: true };
        }
        dejaPris.add(choisie.id);
        precedente = proteine(choisie, parId);
        menus.push({ jour, repas: moment, recette: choisie.id, nom: choisie.nom, utilises, manquants });
      }
    }
    const courses = Object.values(manques).sort((a, b) => a.jour - b.jour || a.nom.localeCompare(b.nom, "fr"));
    return { menus, courses, restes: restesDe(stock, parId) };
  }

  function restesDe(stock, parId) {
    return Object.entries(stock)
      .filter(([, ligne]) => ligne.usages > 0 && !ligne.achete)
      .map(([id, ligne]) => ({ id, nom: parId[id].nom, usages: ligne.usages }));
  }

  return {
    INGREDIENTS, RECETTES, normaliser, reconnaitre, analyserTicket, construireStock,
    estVegetarienne, proposerMenus,
  };
});
