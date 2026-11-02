// Tests du moteur (node --test). Le ticket d'exemple est FICTIF.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../moteur.js");

const TICKET = fs.readFileSync(path.join(__dirname, "ticket_fictif.txt"), "utf8");

test("normaliser retire accents et ponctuation", () => {
  assert.equal(C.normaliser("Crème  fraîche, Œufs!"), "CREME FRAICHE, OEUFS");
});

test("le mot-clé le plus long l'emporte", () => {
  assert.equal(C.reconnaitre("LAITUE ICEBERG"), "salade");
  assert.equal(C.reconnaitre("LAIT DEMI ECREME 1L"), "lait");
  assert.equal(C.reconnaitre("LAIT DE COCO 40CL"), "lait_coco");
  assert.equal(C.reconnaitre("POMMES DE TERRE 2,5KG"), "pommes_de_terre");
  assert.equal(C.reconnaitre("POMMES GOLDEN"), "pommes");
  assert.equal(C.reconnaitre("PATE BRISEE"), "pate_brisee");
  assert.equal(C.reconnaitre("PATES PENNE"), "pates");
  assert.equal(C.reconnaitre("EMMENTAL RAPE"), "fromage_rape");
  assert.equal(C.reconnaitre("PAPIER TOILETTE"), null);
});

test("le ticket : articles, prix, quantités, lignes ignorées", () => {
  const { articles, ignorees } = C.analyserTicket(TICKET);
  const ids = articles.map((a) => a.ingredient);
  assert.deepEqual(ids, [
    "poulet", "pates", "lardons", "oeufs", "yaourt", "courgettes", "tomates",
    "champignons", "salade", "creme", "salade", null,
  ]);
  const oeufs = articles.find((a) => a.ingredient === "oeufs");
  assert.equal(oeufs.quantite, 2); // ligne « 2 X 1,05 »
  assert.equal(oeufs.prix, 2.1);
  const courgettes = articles.find((a) => a.ingredient === "courgettes");
  assert.equal(courgettes.prix, 2.13); // prix porté par la ligne de poids
  assert.equal(articles[0].prix, 5.49);
  for (const mot of ["TOTAL", "CB", "REMISE", "MERCI", "TEL", "02/11/2026"]) {
    assert.ok(ignorees.some((l) => l.includes(mot)), mot);
  }
});

test("quantité en tête de ligne", () => {
  const { articles } = C.analyserTicket("3 X BANANES 1,80");
  assert.equal(articles[0].quantite, 3);
  assert.equal(articles[0].ingredient, "bananes");
  assert.equal(articles[0].prix, 1.8);
});

test("tout ingrédient et toute recette sont cohérents", () => {
  const ids = new Set(C.INGREDIENTS.map((i) => i.id));
  assert.equal(ids.size, C.INGREDIENTS.length);
  const recettes = new Set();
  for (const r of C.RECETTES) {
    assert.ok(!recettes.has(r.id), r.id);
    recettes.add(r.id);
    for (const id of r.ingredients.concat(r.options)) assert.ok(ids.has(id), `${r.id} → ${id}`);
  }
  for (const i of C.INGREDIENTS) for (const mot of i.mots) assert.equal(C.normaliser(mot), mot, mot);
});

test("menus : 14 créneaux, sans répétition, produits du ticket utilisés", () => {
  const { articles } = C.analyserTicket(TICKET);
  const { menus, courses } = C.proposerMenus(articles);
  assert.equal(menus.length, 14);
  assert.equal(new Set(menus.map((m) => m.recette)).size, 14);
  const utilises = new Set(menus.flatMap((m) => m.utilises));
  for (const id of ["poulet", "lardons", "pates", "oeufs", "champignons", "salade"]) assert.ok(utilises.has(id), id);
  for (const ligne of courses) assert.equal(ligne.pour.length >= ligne.articles, true);
  const parId = Object.fromEntries(courses.map((c) => [c.id, c]));
  assert.ok(!parId.oignons || parId.oignons.articles === 1, "un filet d'oignons sert à plusieurs repas");
});

test("le fragile passe d'abord : le poulet (2 jours) est mangé le premier jour", () => {
  const articles = [
    { ingredient: "poulet", quantite: 1 }, { ingredient: "riz", quantite: 1 },
    { ingredient: "pates", quantite: 1 }, { ingredient: "pesto", quantite: 1 },
  ];
  const { menus } = C.proposerMenus(articles, { jours: 3, repas: ["soir"] });
  assert.ok(menus[0].utilises.includes("poulet"), JSON.stringify(menus[0]));
});

test("un produit périmé n'est plus compté comme disponible", () => {
  const articles = [{ ingredient: "saumon", quantite: 5 }, { ingredient: "riz", quantite: 5 }, { ingredient: "haricots_verts", quantite: 5 }];
  const { menus } = C.proposerMenus(articles, { jours: 7, repas: ["soir"] });
  for (const m of menus.filter((m) => m.jour >= 2)) assert.ok(!m.utilises.includes("saumon"));
});

test("option végétarienne : ni viande ni poisson", () => {
  const { articles } = C.analyserTicket(TICKET);
  const { menus } = C.proposerMenus(articles, { vegetarien: true });
  const parId = Object.fromEntries(C.RECETTES.map((r) => [r.id, r]));
  for (const m of menus) assert.ok(C.estVegetarienne(parId[m.recette]), m.recette);
});

test("déterministe et recettes exclues respectées", () => {
  const { articles } = C.analyserTicket(TICKET);
  const a = C.proposerMenus(articles, { exclues: ["carbonara"] });
  const b = C.proposerMenus(articles, { exclues: ["carbonara"] });
  assert.deepEqual(a, b);
  assert.ok(!a.menus.some((m) => m.recette === "carbonara"));
});

test("liste vide : menus proposés, tout part en courses", () => {
  const { menus, courses, restes } = C.proposerMenus([], { jours: 2, repas: ["soir"] });
  assert.equal(menus.length, 2);
  assert.ok(courses.length > 0);
  assert.deepEqual(restes, []);
});
