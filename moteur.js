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
    { id: "lait_coco", nom: "Lait de coco", categorie: "epicerie", conservation: 365, usages: 1, mots: ["LAIT COCO", "LAIT DE COCO", "CREME DE COCO", "CREME COCO"] },
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
    // Ajouts (novembre 2026)
    { id: "dinde", nom: "Dinde", categorie: "viande", conservation: 3, usages: 1, mots: ["DINDE", "DINDONNEAU"] },
    { id: "chorizo", nom: "Chorizo", categorie: "viande", conservation: 21, usages: 3, mots: ["CHORIZO"] },
    { id: "saumon_fume", nom: "Saumon fumé", categorie: "poisson", conservation: 7, usages: 1, mots: ["SAUMON FUME"] },
    { id: "ricotta", nom: "Ricotta", categorie: "cremerie", conservation: 7, usages: 1, mots: ["RICOTTA"] },
    { id: "gnocchis", nom: "Gnocchis", categorie: "epicerie", conservation: 30, usages: 1, mots: ["GNOCCHI"] },
    { id: "nouilles", nom: "Nouilles", categorie: "epicerie", conservation: 365, usages: 2, mots: ["NOUILLE", "VERMICELLE", "UDON", "RAMEN"] },
    { id: "pain_de_mie", nom: "Pain de mie", categorie: "boulangerie", conservation: 10, usages: 3, mots: ["PAIN DE MIE", "PAIN MIE"] },
    { id: "petits_pois", nom: "Petits pois", categorie: "epicerie", conservation: 365, usages: 2, mots: ["PETITS POIS", "PETIT POIS"] },
    { id: "haricots_rouges", nom: "Haricots rouges", categorie: "epicerie", conservation: 365, usages: 2, mots: ["HARICOTS ROUGES", "HARICOT ROUGE", "HAR ROUGE"] },
    { id: "courge", nom: "Courge / potiron", categorie: "legume", conservation: 30, usages: 2, mots: ["COURGE", "BUTTERNUT", "POTIRON", "POTIMARRON", "CITROUILLE"] },
    { id: "patate_douce", nom: "Patate douce", categorie: "legume", conservation: 21, usages: 2, mots: ["PATATE DOUCE", "PATATES DOUCES"] },
    { id: "chou_fleur", nom: "Chou-fleur", categorie: "legume", conservation: 5, usages: 1, mots: ["CHOU FLEUR", "CHOU-FLEUR", "CHOUFLEUR"] },
    { id: "chou", nom: "Chou", categorie: "legume", conservation: 14, usages: 2, mots: ["CHOU", "CHOUX"] },
    { id: "betterave", nom: "Betterave", categorie: "legume", conservation: 7, usages: 2, mots: ["BETTERAVE"] },
    { id: "radis", nom: "Radis", categorie: "legume", conservation: 5, usages: 1, mots: ["RADIS"] },
    { id: "fenouil", nom: "Fenouil", categorie: "legume", conservation: 7, usages: 1, mots: ["FENOUIL"] },
    { id: "celeri", nom: "Céleri", categorie: "legume", conservation: 14, usages: 2, mots: ["CELERI"] },
    { id: "navets", nom: "Navets", categorie: "legume", conservation: 14, usages: 2, mots: ["NAVET"] },
    { id: "endives", nom: "Endives", categorie: "legume", conservation: 7, usages: 2, mots: ["ENDIVE", "CHICON"] },
    { id: "echalotes", nom: "Échalotes", categorie: "legume", conservation: 30, usages: 4, mots: ["ECHALOTE"] },
    { id: "gingembre", nom: "Gingembre", categorie: "legume", conservation: 21, usages: 4, mots: ["GINGEMBRE"] },
    { id: "herbes", nom: "Herbes fraîches", categorie: "legume", conservation: 5, usages: 2, mots: ["PERSIL", "CORIANDRE", "BASILIC", "CIBOULETTE", "MENTHE", "ANETH"] },
    { id: "huile", nom: "Huile", categorie: "epicerie", conservation: 365, usages: 20, mots: ["HUILE", "HUILE OLIVE", "HUILE D OLIVE"] },
    { id: "olives", nom: "Olives", categorie: "epicerie", conservation: 60, usages: 3, mots: ["OLIVE"] },
    { id: "noix", nom: "Noix", categorie: "epicerie", conservation: 180, usages: 3, mots: ["NOIX", "CERNEAUX"] },
    { id: "miel", nom: "Miel", categorie: "epicerie", conservation: 365, usages: 6, mots: ["MIEL"] },
    { id: "bouillon", nom: "Bouillon", categorie: "epicerie", conservation: 365, usages: 6, mots: ["BOUILLON", "KUB"] },
    { id: "moutarde", nom: "Moutarde", categorie: "epicerie", conservation: 180, usages: 8, mots: ["MOUTARDE"] },
    { id: "mayonnaise", nom: "Mayonnaise", categorie: "epicerie", conservation: 60, usages: 4, mots: ["MAYONNAISE", "MAYO"] },
    { id: "cornichons", nom: "Cornichons", categorie: "epicerie", conservation: 180, usages: 4, mots: ["CORNICHON"] },
    { id: "boulgour", nom: "Boulgour", categorie: "epicerie", conservation: 365, usages: 3, mots: ["BOULGOUR", "BOULGHOUR"] },
    { id: "polenta", nom: "Polenta", categorie: "epicerie", conservation: 365, usages: 3, mots: ["POLENTA"] },
    { id: "avoine", nom: "Flocons d'avoine", categorie: "epicerie", conservation: 365, usages: 6, mots: ["AVOINE", "FLOCONS AVOINE", "FLOCONS D AVOINE"] },
    { id: "compote", nom: "Compote", categorie: "epicerie", conservation: 30, usages: 2, mots: ["COMPOTE"] },
    { id: "fruits_rouges", nom: "Fruits rouges", categorie: "fruit", conservation: 3, usages: 1, mots: ["FRUITS ROUGES", "FRAMBOISE", "MYRTILLE", "FRAISE"] },
    { id: "poires", nom: "Poires", categorie: "fruit", conservation: 7, usages: 2, mots: ["POIRE"] },
    { id: "oranges", nom: "Oranges / clémentines", categorie: "fruit", conservation: 14, usages: 3, mots: ["ORANGE", "CLEMENTINE", "MANDARINE"] },
    { id: "kiwis", nom: "Kiwis", categorie: "fruit", conservation: 14, usages: 3, mots: ["KIWI"] },
    { id: "abricots", nom: "Abricots", categorie: "fruit", conservation: 4, usages: 2, mots: ["ABRICOT"] },
  ];

  // --------------------------------------------------------------------- Recettes
  // ingredients : indispensables (manquants → liste de courses). options : utilisés s'ils sont là.
  // temps : minutes, préparation et cuisson. etapes : marche à suivre courte.
  const RECETTES = [
    // ---- Les recettes d'origine (ids inchangés)
    { id: "carbonara", nom: "Pâtes carbonara", temps: 20, ingredients: ["pates", "lardons", "oeufs"], options: ["parmesan"],
      etapes: ["Faites cuire les pâtes dans l'eau salée.", "Faites dorer les lardons à la poêle, sans matière grasse.", "Battez les œufs avec le parmesan et du poivre.", "Mélangez hors du feu les pâtes égouttées, les lardons et les œufs."] },
    { id: "bolognaise", nom: "Spaghetti bolognaise", temps: 40, ingredients: ["pates", "boeuf_hache", "sauce_tomate", "oignons"], options: ["carottes", "parmesan"],
      etapes: ["Faites revenir l'oignon et la carotte hachés.", "Ajoutez la viande et faites-la dorer.", "Versez la sauce tomate et laissez mijoter 20 minutes.", "Servez sur les spaghetti cuits, avec le parmesan."] },
    { id: "curry_poulet", nom: "Poulet au curry et riz", temps: 35, ingredients: ["poulet", "riz", "lait_coco", "curry"], options: ["oignons"],
      etapes: ["Coupez le poulet en morceaux et faites-le dorer avec l'oignon.", "Ajoutez le curry, puis le lait de coco.", "Laissez mijoter 15 minutes à feu doux.", "Servez avec le riz cuit."] },
    { id: "omelette_champignons", nom: "Omelette aux champignons, salade verte", temps: 15, ingredients: ["oeufs", "champignons", "salade"], options: ["emmental"],
      etapes: ["Émincez les champignons et faites-les revenir.", "Battez les œufs et versez-les sur les champignons.", "Ajoutez le fromage et pliez l'omelette.", "Servez avec la salade assaisonnée."] },
    { id: "quiche_lorraine", nom: "Quiche lorraine", temps: 50, ingredients: ["pate_brisee", "lardons", "oeufs", "creme"], options: ["emmental", "salade"],
      etapes: ["Préchauffez le four à 200 °C.", "Étalez la pâte dans un moule et répartissez les lardons.", "Battez les œufs avec la crème et versez sur la pâte.", "Faites cuire 35 minutes."] },
    { id: "gratin_dauphinois", nom: "Gratin dauphinois", temps: 75, ingredients: ["pommes_de_terre", "creme", "lait", "ail"], options: ["fromage_rape", "salade"],
      etapes: ["Préchauffez le four à 180 °C.", "Coupez les pommes de terre en fines rondelles.", "Frottez le plat avec l'ail et disposez les pommes de terre.", "Couvrez de lait et de crème, puis enfournez 1 heure."] },
    { id: "saumon_riz", nom: "Saumon, riz et haricots verts", temps: 25, ingredients: ["saumon", "riz", "haricots_verts"], options: ["citron"],
      etapes: ["Faites cuire le riz.", "Faites cuire les haricots verts à l'eau ou à la vapeur.", "Saisissez le saumon à la poêle 4 minutes de chaque côté.", "Servez avec un filet de citron."] },
    { id: "croque_monsieur", nom: "Croque-monsieur et salade", temps: 20, ingredients: ["pain", "jambon", "emmental", "salade"], options: ["beurre"],
      etapes: ["Beurrez les tranches de pain.", "Garnissez de jambon et de fromage.", "Faites dorer au four ou à la poêle.", "Servez avec la salade."] },
    { id: "ratatouille", nom: "Ratatouille et semoule", temps: 60, ingredients: ["courgettes", "aubergine", "poivrons", "tomates", "oignons"], options: ["semoule", "ail"],
      etapes: ["Coupez tous les légumes en dés.", "Faites revenir l'oignon, puis l'aubergine et les poivrons.", "Ajoutez les courgettes et les tomates.", "Laissez mijoter 40 minutes et servez avec la semoule."] },
    { id: "dahl", nom: "Dahl de lentilles corail", temps: 35, ingredients: ["lentilles", "lait_coco", "oignons", "curry"], options: ["riz", "tomates"],
      etapes: ["Faites revenir l'oignon avec le curry.", "Ajoutez les lentilles rincées et couvrez d'eau.", "Laissez cuire 20 minutes, puis ajoutez le lait de coco.", "Servez avec le riz."] },
    { id: "couscous_legumes", nom: "Couscous aux légumes", temps: 50, ingredients: ["semoule", "pois_chiches", "carottes", "courgettes"], options: ["oignons", "tomates"],
      etapes: ["Coupez les légumes en gros morceaux.", "Faites-les mijoter 35 minutes dans de l'eau épicée.", "Ajoutez les pois chiches 10 minutes avant la fin.", "Préparez la semoule et servez avec le bouillon."] },
    { id: "pizza", nom: "Pizza maison", temps: 30, ingredients: ["pate_pizza", "sauce_tomate", "mozzarella"], options: ["jambon", "champignons", "poivrons"],
      etapes: ["Préchauffez le four à 240 °C.", "Étalez la pâte et couvrez de sauce tomate.", "Ajoutez la mozzarella et la garniture.", "Faites cuire 12 à 15 minutes."] },
    { id: "fajitas", nom: "Fajitas au poulet", temps: 30, ingredients: ["tortillas", "poulet", "poivrons", "oignons"], options: ["avocat", "fromage_rape"],
      etapes: ["Coupez le poulet, les poivrons et l'oignon en lanières.", "Faites-les sauter à feu vif avec des épices.", "Réchauffez les tortillas.", "Garnissez et roulez."] },
    { id: "hachis", nom: "Hachis parmentier", temps: 60, ingredients: ["pommes_de_terre", "boeuf_hache", "lait", "beurre"], options: ["fromage_rape", "oignons"],
      etapes: ["Préchauffez le four à 200 °C.", "Faites une purée avec les pommes de terre, le lait et le beurre.", "Faites revenir la viande avec l'oignon et mettez-la dans un plat.", "Couvrez de purée et de fromage, puis enfournez 20 minutes."] },
    { id: "soupe", nom: "Soupe poireaux, pommes de terre, carottes", temps: 40, ingredients: ["poireaux", "pommes_de_terre", "carottes"], options: ["creme", "pain"],
      etapes: ["Épluchez et coupez les légumes.", "Couvrez-les d'eau salée et faites cuire 25 minutes.", "Mixez et ajoutez un peu de crème.", "Servez avec du pain."] },
    { id: "chevre_chaud", nom: "Salade de chèvre chaud", temps: 15, ingredients: ["salade", "chevre", "pain"], options: ["pommes"],
      etapes: ["Coupez le pain en tranches et posez un morceau de chèvre sur chacune.", "Passez-les sous le gril du four 5 minutes.", "Assaisonnez la salade.", "Posez les toasts chauds sur la salade."] },
    { id: "risotto", nom: "Risotto aux champignons", temps: 35, ingredients: ["riz", "champignons", "oignons", "parmesan"], options: ["creme", "beurre"],
      etapes: ["Faites revenir l'oignon et les champignons.", "Ajoutez le riz et remuez 2 minutes.", "Versez l'eau chaude petit à petit en remuant, pendant 18 minutes.", "Ajoutez le parmesan et servez aussitôt."] },
    { id: "papillote", nom: "Poisson en papillote et pommes de terre", temps: 35, ingredients: ["poisson", "pommes_de_terre", "citron"], options: ["courgettes"],
      etapes: ["Préchauffez le four à 200 °C et faites cuire les pommes de terre à l'eau.", "Posez le poisson sur du papier cuisson avec des rondelles de citron.", "Fermez la papillote et enfournez 15 minutes.", "Servez avec les pommes de terre."] },
    { id: "saucisses_lentilles", nom: "Saucisses aux lentilles", temps: 45, ingredients: ["saucisse", "lentilles", "carottes", "oignons"], options: [],
      etapes: ["Faites dorer les saucisses dans une cocotte.", "Ajoutez l'oignon et les carottes en rondelles.", "Versez les lentilles et couvrez d'eau.", "Laissez mijoter 30 minutes."] },
    { id: "pates_pesto", nom: "Pâtes au pesto", temps: 15, ingredients: ["pates", "pesto"], options: ["parmesan", "tomates"],
      etapes: ["Faites cuire les pâtes.", "Gardez un peu d'eau de cuisson.", "Mélangez les pâtes avec le pesto et un peu d'eau.", "Servez avec du parmesan."] },
    { id: "salade_grecque", nom: "Salade grecque", temps: 15, ingredients: ["tomates", "concombre", "feta"], options: ["oignons", "pain", "olives"],
      etapes: ["Coupez les tomates et le concombre en morceaux.", "Ajoutez l'oignon émincé.", "Émiettez la feta par-dessus.", "Arrosez d'huile d'olive."] },
    { id: "steak_haricots", nom: "Steak haché et haricots verts", temps: 20, ingredients: ["boeuf_hache", "haricots_verts"], options: ["pommes_de_terre", "beurre"],
      etapes: ["Faites cuire les haricots verts à l'eau.", "Faites-les revenir au beurre.", "Saisissez les steaks hachés à la poêle.", "Servez aussitôt."] },
    { id: "crevettes_ail", nom: "Crevettes à l'ail et riz", temps: 25, ingredients: ["crevettes", "riz", "ail"], options: ["citron", "courgettes"],
      etapes: ["Faites cuire le riz.", "Faites revenir l'ail haché dans l'huile.", "Ajoutez les crevettes et faites-les sauter 4 minutes.", "Servez avec le riz et un filet de citron."] },
    { id: "gratin_pates", nom: "Gratin de pâtes au jambon", temps: 35, ingredients: ["pates", "jambon", "creme", "fromage_rape"], options: [],
      etapes: ["Préchauffez le four à 200 °C.", "Faites cuire les pâtes et égouttez-les.", "Mélangez-les avec le jambon et la crème dans un plat.", "Couvrez de fromage et enfournez 15 minutes."] },
    { id: "tarte_poireaux", nom: "Tarte aux poireaux", temps: 55, ingredients: ["pate_brisee", "poireaux", "creme", "oeufs"], options: ["fromage_rape", "salade"],
      etapes: ["Préchauffez le four à 200 °C.", "Faites fondre les poireaux émincés 15 minutes.", "Battez les œufs avec la crème et ajoutez les poireaux.", "Versez sur la pâte et faites cuire 30 minutes."] },
    { id: "wok_tofu", nom: "Wok de tofu aux légumes", temps: 25, ingredients: ["tofu", "riz", "carottes", "poivrons", "sauce_soja"], options: ["oignons", "gingembre"],
      etapes: ["Faites cuire le riz.", "Coupez le tofu en dés et faites-le dorer.", "Ajoutez les légumes en lanières et faites sauter 5 minutes.", "Arrosez de sauce soja et servez."] },
    { id: "salade_thon", nom: "Salade de riz au thon", temps: 25, ingredients: ["thon", "riz", "tomates", "mais"], options: ["oeufs"],
      etapes: ["Faites cuire le riz et laissez-le refroidir.", "Coupez les tomates en dés.", "Mélangez le riz, le thon, les tomates et le maïs.", "Assaisonnez avec une vinaigrette."] },
    { id: "crepes", nom: "Crêpes jambon-fromage", temps: 40, ingredients: ["farine", "oeufs", "lait", "jambon", "emmental"], options: ["beurre", "salade"],
      etapes: ["Mélangez la farine, les œufs et le lait pour faire une pâte lisse.", "Laissez reposer 15 minutes.", "Faites cuire les crêpes dans une poêle chaude.", "Garnissez de jambon et de fromage, puis repliez."] },
    { id: "porc_poelee", nom: "Côtes de porc et poêlée de pommes de terre", temps: 35, ingredients: ["porc", "pommes_de_terre", "oignons"], options: ["champignons"],
      etapes: ["Coupez les pommes de terre en cubes.", "Faites-les dorer à la poêle 20 minutes avec l'oignon.", "Faites cuire les côtes de porc 5 minutes de chaque côté.", "Servez ensemble."] },
    { id: "gratin_brocoli", nom: "Gratin de brocoli", temps: 35, ingredients: ["brocoli", "creme", "fromage_rape"], options: ["pommes_de_terre", "jambon"],
      etapes: ["Préchauffez le four à 200 °C.", "Faites cuire le brocoli 5 minutes à l'eau.", "Mettez-le dans un plat avec la crème.", "Couvrez de fromage et enfournez 20 minutes."] },
    { id: "oeufs_epinards", nom: "Œufs cocotte aux épinards", temps: 20, ingredients: ["oeufs", "epinards", "creme"], options: ["pain"],
      etapes: ["Préchauffez le four à 180 °C.", "Faites tomber les épinards à la poêle.", "Répartissez-les dans des ramequins avec la crème et cassez un œuf dessus.", "Faites cuire 10 minutes au bain-marie."] },
    { id: "boeuf_carottes", nom: "Bœuf-carottes", temps: 150, ingredients: ["boeuf", "carottes", "oignons", "pommes_de_terre"], options: ["bouillon"],
      etapes: ["Faites dorer la viande en morceaux dans une cocotte.", "Ajoutez l'oignon et les carottes en rondelles.", "Couvrez d'eau ou de bouillon et laissez mijoter 2 heures.", "Ajoutez les pommes de terre 30 minutes avant la fin."] },
    { id: "bol_quinoa", nom: "Bol de quinoa, avocat et tomates", temps: 20, ingredients: ["quinoa", "avocat", "tomates"], options: ["feta", "citron"],
      etapes: ["Faites cuire le quinoa et laissez-le tiédir.", "Coupez l'avocat et les tomates.", "Disposez le tout dans un bol.", "Arrosez de citron et d'huile."] },
    { id: "veloute_courgettes", nom: "Velouté de courgettes au chèvre", temps: 30, ingredients: ["courgettes", "oignons", "chevre"], options: ["pain"],
      etapes: ["Faites revenir l'oignon.", "Ajoutez les courgettes en morceaux et couvrez d'eau.", "Faites cuire 20 minutes.", "Mixez avec le chèvre."] },
    { id: "tortilla_espagnole", nom: "Tortilla espagnole", temps: 40, ingredients: ["oeufs", "pommes_de_terre", "oignons"], options: ["salade"],
      etapes: ["Coupez les pommes de terre en fines tranches.", "Faites-les cuire doucement 20 minutes avec l'oignon.", "Ajoutez les œufs battus.", "Faites cuire à feu doux, puis retournez la tortilla."] },

    // ---- Viandes
    { id: "poulet_roti_legumes", nom: "Poulet rôti et légumes au four", temps: 60, ingredients: ["poulet", "pommes_de_terre", "carottes", "oignons"], options: ["ail", "herbes"],
      etapes: ["Préchauffez le four à 200 °C.", "Coupez les légumes en morceaux et mettez-les dans un plat.", "Posez le poulet dessus avec un filet d'huile.", "Enfournez 45 minutes en arrosant de temps en temps."] },
    { id: "poulet_basquaise", nom: "Poulet basquaise", temps: 50, ingredients: ["poulet", "poivrons", "tomates", "oignons"], options: ["riz", "chorizo", "ail"],
      etapes: ["Faites dorer le poulet dans une cocotte.", "Ajoutez l'oignon et les poivrons en lanières.", "Ajoutez les tomates et laissez mijoter 30 minutes.", "Servez avec du riz."] },
    { id: "poulet_moutarde", nom: "Poulet à la moutarde", temps: 30, ingredients: ["poulet", "moutarde", "creme"], options: ["pates", "echalotes"],
      etapes: ["Faites dorer le poulet en morceaux.", "Ajoutez l'échalote hachée.", "Mélangez la crème et la moutarde, puis versez sur le poulet.", "Laissez mijoter 10 minutes et servez avec des pâtes."] },
    { id: "escalope_dinde_champignons", nom: "Escalopes de dinde à la crème et champignons", temps: 25, ingredients: ["dinde", "creme", "champignons"], options: ["riz", "echalotes"],
      etapes: ["Faites dorer les escalopes et réservez-les.", "Faites revenir les champignons dans la même poêle.", "Ajoutez la crème et remettez la dinde 5 minutes.", "Servez avec du riz."] },
    { id: "blanquette_dinde", nom: "Blanquette de dinde", temps: 50, ingredients: ["dinde", "carottes", "champignons", "creme", "bouillon"], options: ["riz", "oignons"],
      etapes: ["Coupez la dinde en cubes et faites-la revenir sans la colorer.", "Ajoutez les carottes, couvrez de bouillon et laissez cuire 30 minutes.", "Ajoutez les champignons 10 minutes avant la fin.", "Liez avec la crème et servez avec du riz."] },
    { id: "chili_con_carne", nom: "Chili con carne", temps: 45, ingredients: ["boeuf_hache", "haricots_rouges", "sauce_tomate", "oignons"], options: ["riz", "poivrons", "mais"],
      etapes: ["Faites revenir l'oignon et la viande.", "Ajoutez la sauce tomate et des épices.", "Ajoutez les haricots rouges égouttés.", "Laissez mijoter 25 minutes et servez avec du riz."] },
    { id: "lasagnes", nom: "Lasagnes à la bolognaise", temps: 75, ingredients: ["pates", "boeuf_hache", "sauce_tomate", "lait", "fromage_rape"], options: ["oignons", "beurre", "farine"],
      etapes: ["Préparez une bolognaise avec la viande, l'oignon et la sauce tomate.", "Préparez une béchamel avec le beurre, la farine et le lait.", "Alternez pâtes, bolognaise et béchamel dans un plat.", "Couvrez de fromage et enfournez 35 minutes à 180 °C."] },
    { id: "boulettes_semoule", nom: "Boulettes de bœuf à la tomate et semoule", temps: 40, ingredients: ["boeuf_hache", "sauce_tomate", "semoule", "oignons"], options: ["herbes", "oeufs"],
      etapes: ["Formez des boulettes avec la viande et des herbes.", "Faites-les dorer à la poêle.", "Ajoutez l'oignon et la sauce tomate, laissez mijoter 15 minutes.", "Servez avec la semoule."] },
    { id: "burger_maison", nom: "Burger maison", temps: 25, ingredients: ["boeuf_hache", "pain", "salade", "tomates"], options: ["emmental", "oignons", "cornichons"],
      etapes: ["Formez les steaks et faites-les cuire à la poêle.", "Posez le fromage dessus en fin de cuisson.", "Faites toaster les pains.", "Montez les burgers avec la salade et la tomate."] },
    { id: "saucisses_puree", nom: "Saucisses et purée maison", temps: 35, ingredients: ["saucisse", "pommes_de_terre", "lait", "beurre"], options: ["salade"],
      etapes: ["Faites cuire les pommes de terre à l'eau 20 minutes.", "Faites dorer les saucisses à la poêle.", "Écrasez les pommes de terre avec le lait et le beurre.", "Servez bien chaud."] },
    { id: "endives_jambon", nom: "Endives au jambon", temps: 50, ingredients: ["endives", "jambon", "lait", "beurre", "fromage_rape"], options: ["farine"],
      etapes: ["Faites cuire les endives 15 minutes à la poêle et égouttez-les.", "Enroulez chaque endive dans une tranche de jambon.", "Couvrez d'une béchamel faite avec le beurre, la farine et le lait.", "Ajoutez le fromage et enfournez 20 minutes à 200 °C."] },
    { id: "porc_caramel", nom: "Porc au caramel et riz", temps: 40, ingredients: ["porc", "sauce_soja", "riz", "oignons"], options: ["gingembre", "miel"],
      etapes: ["Faites cuire le riz.", "Faites dorer le porc en dés avec l'oignon.", "Ajoutez la sauce soja et le miel, puis laissez caraméliser 15 minutes.", "Servez avec le riz."] },
    { id: "pates_chorizo", nom: "Pâtes au chorizo et poivrons", temps: 25, ingredients: ["pates", "chorizo", "poivrons", "sauce_tomate"], options: ["oignons"],
      etapes: ["Faites cuire les pâtes.", "Faites revenir le chorizo en rondelles et les poivrons.", "Ajoutez la sauce tomate et laissez réduire 5 minutes.", "Mélangez avec les pâtes."] },
    { id: "riz_paella", nom: "Riz façon paella", temps: 50, ingredients: ["riz", "poulet", "chorizo", "poivrons", "petits_pois"], options: ["crevettes", "oignons"],
      etapes: ["Faites dorer le poulet et le chorizo dans une grande poêle.", "Ajoutez l'oignon, les poivrons et le riz.", "Couvrez d'eau chaude et laissez cuire 20 minutes sans remuer.", "Ajoutez les petits pois et les crevettes 5 minutes avant la fin."] },
    { id: "pot_au_feu", nom: "Pot-au-feu", temps: 180, ingredients: ["boeuf", "carottes", "poireaux", "navets", "pommes_de_terre"], options: ["oignons", "moutarde"],
      etapes: ["Mettez la viande dans une grande marmite d'eau froide et portez à ébullition.", "Écumez et laissez cuire 1 heure 30.", "Ajoutez les légumes et poursuivez 1 heure.", "Servez la viande et les légumes avec de la moutarde."] },
    { id: "riz_cantonais", nom: "Riz cantonais", temps: 25, ingredients: ["riz", "oeufs", "jambon", "petits_pois"], options: ["oignons", "sauce_soja"],
      etapes: ["Faites cuire le riz, idéalement la veille.", "Faites une omelette fine et coupez-la en lanières.", "Faites sauter le riz avec le jambon en dés et les petits pois.", "Ajoutez l'omelette et un peu de sauce soja."] },
    { id: "nouilles_poulet", nom: "Nouilles sautées au poulet", temps: 25, ingredients: ["nouilles", "poulet", "carottes", "sauce_soja"], options: ["poivrons", "gingembre", "oignons"],
      etapes: ["Faites cuire les nouilles et égouttez-les.", "Faites sauter le poulet en lanières à feu vif.", "Ajoutez les légumes en julienne et faites sauter 3 minutes.", "Ajoutez les nouilles et la sauce soja."] },
    { id: "salade_cesar", nom: "Salade César", temps: 25, ingredients: ["salade", "poulet", "parmesan", "pain"], options: ["oeufs", "citron", "mayonnaise"],
      etapes: ["Faites dorer le poulet et coupez-le en lamelles.", "Faites griller le pain en croûtons.", "Préparez une sauce avec la mayonnaise, le citron et le parmesan.", "Mélangez la salade, le poulet, les croûtons et la sauce."] },
    { id: "club_sandwich", nom: "Club sandwich au poulet", temps: 20, ingredients: ["pain_de_mie", "poulet", "salade", "tomates", "mayonnaise"], options: ["oeufs"],
      etapes: ["Faites cuire le poulet et coupez-le en tranches.", "Faites griller le pain de mie.", "Montez les étages : mayonnaise, salade, tomate, poulet.", "Coupez en triangles."] },
    { id: "wraps_poulet", nom: "Wraps au poulet et crudités", temps: 20, ingredients: ["tortillas", "poulet", "salade", "carottes"], options: ["mayonnaise", "avocat"],
      etapes: ["Faites cuire le poulet en lanières.", "Râpez les carottes.", "Garnissez les tortillas de salade, de carottes et de poulet.", "Roulez bien serré."] },

    // ---- Poissons
    { id: "saumon_poireaux", nom: "Saumon et fondue de poireaux", temps: 30, ingredients: ["saumon", "poireaux", "creme"], options: ["riz", "citron"],
      etapes: ["Faites fondre les poireaux émincés 15 minutes.", "Ajoutez la crème.", "Faites cuire le saumon à la poêle.", "Servez le saumon sur les poireaux."] },
    { id: "pates_saumon", nom: "Tagliatelles au saumon", temps: 20, ingredients: ["pates", "saumon", "creme"], options: ["citron", "herbes"],
      etapes: ["Faites cuire les pâtes.", "Coupez le saumon en dés et faites-le cuire 3 minutes.", "Ajoutez la crème et le citron.", "Mélangez avec les pâtes."] },
    { id: "poisson_patate_douce", nom: "Poisson et purée de patate douce", temps: 35, ingredients: ["poisson", "patate_douce", "beurre"], options: ["citron", "herbes"],
      etapes: ["Faites cuire les patates douces à l'eau 20 minutes.", "Écrasez-les avec le beurre.", "Faites cuire le poisson à la poêle.", "Servez avec un filet de citron."] },
    { id: "pates_thon", nom: "Pâtes au thon et à la tomate", temps: 20, ingredients: ["pates", "thon", "sauce_tomate"], options: ["oignons", "olives"],
      etapes: ["Faites cuire les pâtes.", "Faites revenir l'oignon.", "Ajoutez la sauce tomate et le thon émietté.", "Mélangez avec les pâtes."] },
    { id: "salade_nicoise", nom: "Salade niçoise", temps: 25, ingredients: ["salade", "thon", "oeufs", "tomates", "haricots_verts"], options: ["olives", "pommes_de_terre"],
      etapes: ["Faites durcir les œufs 10 minutes.", "Faites cuire les haricots verts et laissez-les refroidir.", "Disposez la salade, les tomates, le thon et les haricots.", "Ajoutez les œufs en quartiers et la vinaigrette."] },
    { id: "tarte_saumon_epinards", nom: "Tarte saumon et épinards", temps: 50, ingredients: ["pate_brisee", "saumon", "epinards", "oeufs", "creme"], options: [],
      etapes: ["Préchauffez le four à 200 °C.", "Faites tomber les épinards à la poêle.", "Répartissez épinards et saumon en dés sur la pâte.", "Couvrez d'œufs battus avec la crème et faites cuire 30 minutes."] },
    { id: "saumon_fume_blinis", nom: "Assiette de saumon fumé, pommes de terre et salade", temps: 25, ingredients: ["saumon_fume", "pommes_de_terre", "salade"], options: ["citron", "creme", "herbes"],
      etapes: ["Faites cuire les pommes de terre à l'eau.", "Mélangez la crème avec le citron et les herbes.", "Disposez le saumon fumé, les pommes de terre et la salade.", "Servez avec la sauce."] },

    // ---- Végétarien
    { id: "gnocchis_tomate", nom: "Gnocchis à la tomate et mozzarella", temps: 25, ingredients: ["gnocchis", "sauce_tomate", "mozzarella"], options: ["herbes"],
      etapes: ["Préchauffez le four à 200 °C.", "Faites cuire les gnocchis à l'eau 2 minutes.", "Mélangez-les avec la sauce tomate dans un plat et ajoutez la mozzarella.", "Faites gratiner 10 minutes."] },
    { id: "veloute_potiron", nom: "Velouté de potiron", temps: 40, ingredients: ["courge", "oignons", "bouillon"], options: ["creme", "pain"],
      etapes: ["Épluchez la courge et coupez-la en cubes.", "Faites revenir l'oignon, ajoutez la courge et couvrez de bouillon.", "Faites cuire 25 minutes.", "Mixez avec un peu de crème."] },
    { id: "soupe_lentilles", nom: "Soupe de lentilles corail et carottes", temps: 35, ingredients: ["lentilles", "carottes", "oignons"], options: ["lait_coco", "curry"],
      etapes: ["Faites revenir l'oignon et les carottes en rondelles.", "Ajoutez les lentilles et couvrez d'eau.", "Faites cuire 20 minutes.", "Mixez avec le lait de coco."] },
    { id: "chili_sin_carne", nom: "Chili sin carne", temps: 40, ingredients: ["haricots_rouges", "mais", "sauce_tomate", "poivrons"], options: ["riz", "oignons", "avocat"],
      etapes: ["Faites revenir l'oignon et les poivrons en dés.", "Ajoutez la sauce tomate et des épices.", "Ajoutez les haricots rouges et le maïs.", "Laissez mijoter 20 minutes et servez avec du riz."] },
    { id: "curry_pois_chiches", nom: "Curry de pois chiches et épinards", temps: 30, ingredients: ["pois_chiches", "epinards", "lait_coco", "curry"], options: ["riz", "oignons"],
      etapes: ["Faites revenir l'oignon avec le curry.", "Ajoutez les pois chiches et le lait de coco.", "Laissez mijoter 15 minutes.", "Ajoutez les épinards et servez avec du riz."] },
    { id: "shakshuka", nom: "Shakshuka (œufs à la tomate et aux poivrons)", temps: 30, ingredients: ["oeufs", "tomates", "poivrons", "oignons"], options: ["pain", "herbes", "feta"],
      etapes: ["Faites revenir l'oignon et les poivrons.", "Ajoutez les tomates et laissez compoter 15 minutes.", "Creusez des puits et cassez-y les œufs.", "Couvrez et faites cuire 6 minutes."] },
    { id: "lasagnes_legumes", nom: "Lasagnes aux légumes", temps: 70, ingredients: ["pates", "courgettes", "sauce_tomate", "ricotta"], options: ["mozzarella", "epinards"],
      etapes: ["Préchauffez le four à 180 °C.", "Faites revenir les courgettes en dés.", "Alternez pâtes, sauce tomate, légumes et ricotta dans un plat.", "Enfournez 40 minutes."] },
    { id: "patate_douce_feta", nom: "Patates douces rôties, feta et salade", temps: 40, ingredients: ["patate_douce", "feta", "salade"], options: ["pois_chiches", "citron"],
      etapes: ["Préchauffez le four à 200 °C.", "Coupez les patates douces en cubes et enfournez-les 30 minutes avec de l'huile.", "Assaisonnez la salade.", "Servez les patates douces avec la feta émiettée."] },
    { id: "taboule", nom: "Taboulé libanais", temps: 25, ingredients: ["boulgour", "tomates", "concombre", "herbes", "citron"], options: ["oignons"],
      etapes: ["Faites gonfler le boulgour dans l'eau chaude 10 minutes.", "Coupez les tomates et le concombre en petits dés.", "Hachez les herbes finement.", "Mélangez le tout avec le citron et l'huile d'olive."] },
    { id: "polenta_champignons", nom: "Polenta crémeuse aux champignons", temps: 30, ingredients: ["polenta", "champignons", "parmesan"], options: ["creme", "ail"],
      etapes: ["Faites cuire la polenta dans l'eau en remuant.", "Ajoutez le parmesan.", "Faites revenir les champignons avec l'ail.", "Servez les champignons sur la polenta."] },
    { id: "salade_lentilles", nom: "Salade de lentilles, betterave et chèvre", temps: 30, ingredients: ["lentilles", "betterave", "chevre"], options: ["echalotes", "noix"],
      etapes: ["Faites cuire les lentilles 20 minutes et laissez-les tiédir.", "Coupez la betterave en dés.", "Mélangez avec une vinaigrette à la moutarde.", "Ajoutez le chèvre émietté."] },
    { id: "risotto_courge", nom: "Risotto à la courge", temps: 45, ingredients: ["riz", "courge", "oignons", "parmesan"], options: ["bouillon", "beurre"],
      etapes: ["Faites revenir l'oignon et la courge en petits dés.", "Ajoutez le riz et remuez 2 minutes.", "Versez le bouillon chaud petit à petit pendant 20 minutes.", "Ajoutez le parmesan."] },
    { id: "tarte_tomate", nom: "Tarte à la tomate et à la moutarde", temps: 45, ingredients: ["pate_brisee", "tomates", "moutarde", "emmental"], options: ["herbes"],
      etapes: ["Préchauffez le four à 200 °C.", "Étalez la pâte et badigeonnez-la de moutarde.", "Ajoutez le fromage puis les tomates en rondelles.", "Faites cuire 30 minutes."] },
    { id: "gratin_courgettes", nom: "Gratin de courgettes", temps: 40, ingredients: ["courgettes", "oeufs", "creme", "fromage_rape"], options: ["ail"],
      etapes: ["Préchauffez le four à 200 °C.", "Faites revenir les courgettes en rondelles 10 minutes.", "Mettez-les dans un plat et couvrez d'œufs battus avec la crème.", "Ajoutez le fromage et enfournez 20 minutes."] },
    { id: "salade_pates", nom: "Salade de pâtes à la méditerranéenne", temps: 20, ingredients: ["pates", "tomates", "mozzarella", "olives"], options: ["pesto", "herbes"],
      etapes: ["Faites cuire les pâtes et rincez-les à l'eau froide.", "Coupez les tomates et la mozzarella en dés.", "Mélangez avec les olives.", "Assaisonnez avec le pesto ou de l'huile d'olive."] },
    { id: "minestrone", nom: "Minestrone", temps: 45, ingredients: ["carottes", "courgettes", "haricots_rouges", "sauce_tomate"], options: ["pates", "parmesan", "oignons"],
      etapes: ["Coupez les légumes en petits dés.", "Faites-les revenir, puis ajoutez la sauce tomate et de l'eau.", "Laissez cuire 25 minutes.", "Ajoutez les haricots et des petites pâtes 10 minutes avant la fin."] },
    { id: "bol_boulgour", nom: "Bol de boulgour, pois chiches et avocat", temps: 25, ingredients: ["boulgour", "pois_chiches", "avocat", "carottes"], options: ["feta", "citron"],
      etapes: ["Faites cuire le boulgour.", "Râpez les carottes et coupez l'avocat.", "Faites dorer les pois chiches à la poêle avec des épices.", "Disposez le tout dans un bol."] },
    { id: "gratin_poireaux", nom: "Gratin de pommes de terre et poireaux", temps: 55, ingredients: ["pommes_de_terre", "poireaux", "creme", "fromage_rape"], options: [],
      etapes: ["Préchauffez le four à 200 °C.", "Faites cuire les pommes de terre en rondelles 10 minutes à l'eau.", "Faites fondre les poireaux émincés.", "Alternez dans un plat, ajoutez la crème et le fromage, enfournez 30 minutes."] },
    { id: "nouilles_legumes", nom: "Nouilles sautées aux légumes", temps: 20, ingredients: ["nouilles", "carottes", "poivrons", "sauce_soja"], options: ["tofu", "gingembre", "oeufs"],
      etapes: ["Faites cuire les nouilles.", "Faites sauter les légumes en lanières à feu vif.", "Ajoutez les nouilles et la sauce soja.", "Servez aussitôt."] },
    { id: "chou_fleur_curry", nom: "Chou-fleur rôti au curry et riz", temps: 40, ingredients: ["chou_fleur", "curry", "riz"], options: ["lait_coco", "oignons"],
      etapes: ["Préchauffez le four à 210 °C.", "Mélangez les fleurettes avec l'huile et le curry.", "Faites rôtir 25 minutes.", "Servez avec le riz."] },
    { id: "gratin_chou_fleur", nom: "Gratin de chou-fleur", temps: 45, ingredients: ["chou_fleur", "lait", "fromage_rape", "beurre"], options: ["farine"],
      etapes: ["Faites cuire le chou-fleur 10 minutes à l'eau.", "Préparez une béchamel avec le beurre, la farine et le lait.", "Mettez le chou-fleur dans un plat et couvrez de béchamel.", "Ajoutez le fromage et enfournez 20 minutes à 200 °C."] },
    { id: "salade_chou", nom: "Salade de chou, carottes et œufs", temps: 20, ingredients: ["chou", "carottes", "oeufs"], options: ["mayonnaise", "moutarde"],
      etapes: ["Faites cuire les œufs 9 minutes.", "Émincez finement le chou et râpez les carottes.", "Préparez une sauce à la moutarde ou à la mayonnaise.", "Mélangez et ajoutez les œufs en quartiers."] },
    { id: "veloute_celeri", nom: "Velouté de céleri", temps: 40, ingredients: ["celeri", "pommes_de_terre", "oignons"], options: ["creme", "noix"],
      etapes: ["Épluchez et coupez les légumes en morceaux.", "Faites revenir l'oignon, ajoutez les légumes et couvrez d'eau.", "Faites cuire 25 minutes.", "Mixez avec un peu de crème."] },
    { id: "salade_endives", nom: "Salade d'endives, noix et chèvre", temps: 15, ingredients: ["endives", "noix", "chevre"], options: ["pommes", "miel"],
      etapes: ["Coupez les endives en rondelles.", "Ajoutez la pomme en dés et les noix.", "Émiettez le chèvre.", "Assaisonnez avec une vinaigrette au miel."] },
    { id: "fenouil_polenta", nom: "Fenouil braisé et polenta", temps: 40, ingredients: ["fenouil", "polenta", "parmesan"], options: ["citron", "olives"],
      etapes: ["Coupez le fenouil en quartiers.", "Faites-le braiser à couvert 25 minutes avec un fond d'eau.", "Faites cuire la polenta et ajoutez le parmesan.", "Servez le fenouil sur la polenta."] },
    { id: "omelette_fromage", nom: "Omelette au fromage et salade", temps: 15, ingredients: ["oeufs", "emmental", "salade"], options: ["herbes", "tomates"],
      etapes: ["Battez les œufs avec les herbes.", "Versez dans une poêle chaude.", "Ajoutez le fromage et pliez l'omelette.", "Servez avec la salade."] },
    { id: "pates_ricotta_epinards", nom: "Pâtes ricotta et épinards", temps: 20, ingredients: ["pates", "ricotta", "epinards"], options: ["parmesan", "ail"],
      etapes: ["Faites cuire les pâtes.", "Faites tomber les épinards avec l'ail.", "Ajoutez la ricotta et un peu d'eau de cuisson.", "Mélangez avec les pâtes."] },
    { id: "galettes_legumes", nom: "Galettes de légumes et salade", temps: 30, ingredients: ["courgettes", "carottes", "oeufs", "farine"], options: ["salade", "fromage_rape"],
      etapes: ["Râpez les courgettes et les carottes, puis pressez-les.", "Mélangez avec les œufs et la farine.", "Faites cuire des petites galettes à la poêle.", "Servez avec la salade."] },
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

  function noter(recette, stock, jour, dejaPris, proteinePrecedente, parId, favoris = new Set()) {
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
    if (favoris.has(recette.id)) score += 6; // les plats préférés passent devant
    const p = proteine(recette, parId);
    if (p !== "vegetal" && p === proteinePrecedente) score -= 3;
    return score;
  }

  /**
   * Propose un repas par créneau (jour × repas), en utilisant d'abord ce qui a été acheté
   * et les produits qui se gardent le moins. Rend { menus, courses, restes }.
   * Un ingrédient manquant part en courses (acheté au plus tard le jour du repas) ;
   * l'article acheté entre dans le stock et sert aux repas suivants.
   * options : { jours: 7, repas: ["midi", "soir"], vegetarien: false, exclues: [ids], favoris: [ids] }
   */
  function proposerMenus(articles, options = {}, recettes = RECETTES, dictionnaire = INGREDIENTS) {
    const jours = options.jours ?? 7;
    const repas = options.repas ?? ["midi", "soir"];
    const exclues = new Set(options.exclues || []);
    const favoris = new Set(options.favoris || []);
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
          const score = noter(recette, stock, jour, dejaPris, precedente, parId, favoris);
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

  const RECETTE_PAR_ID = Object.fromEntries(RECETTES.map((r) => [r.id, r]));
  /** La recette qui porte cet identifiant, ou null. */
  function recette(id) {
    return RECETTE_PAR_ID[id] || null;
  }

  return {
    recette, INGREDIENTS, RECETTES, normaliser, reconnaitre, analyserTicket, construireStock,
    estVegetarienne, proposerMenus,
  };
});
