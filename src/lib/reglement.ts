// Règlement intérieur : une seule source pour l'affiche du règlement (src/pages/affiches/reglement.astro).
// Il précise ce que prévoit l'article 14 des statuts (usage du local, participation aux activités, sécurité,
// vente accessoire, comportements attendus) et ne peut pas les contredire.
// Les mots entre *astérisques* sont mis en valeur (couleur d'accent de l'affiche).
// `sous` : sous-points (liste à puces creuses), `groupe` : les points d'un même groupe se suivent sans espace.

export type Regle = { texte: string; sous?: string[]; groupe?: number };

export const titre = 'Le code de la guilde';
export const sousTitre = 'Règlement intérieur';
export const portee = 'Ce code s’applique à toute personne qui passe la porte de la taverne : adhérent·es comme visiteur·ses.';

export const droits = {
	titre: 'Les privilèges des membres',
	regles: [
		{ texte: 'Jouer à *toute notre ludothèque* et profiter du matériel de la taverne', groupe: 1 },
		{ texte: 'Demander aux bénévoles une *explication des règles* (enfin, de presque toutes)', groupe: 1 },
		{ texte: 'Participer à *nos événements* : soirées jeux, tournois, ateliers, initiations…', groupe: 1 },
		{ texte: '*Voter à l’assemblée générale* : une voix par membre à jour de sa cotisation', groupe: 2 },
		{ texte: 'Proposer des idées, des jeux, des événements : *la guilde, c’est vous* !', groupe: 2 },
	] as Regle[],
};

/** Mis en avant à part sur l'affiche */
export const sansObligation = {
	titre: 'Aucune obligation de consommation',
	texte: 'L’adhésion permet de venir jouer pendant un an sans rien dépenser de plus. Mais un café, une bière ou une crêpe pris au comptoir, c’est ce qui *remplit le coffre de la guilde* : de nouveaux jeux sur les étagères et une taverne qui reste ouverte. *Chaque conso compte, merci* !',
};

export const devoirs = {
	titre: 'Le serment de l’aventurier·e',
	regles: [
		{
			texte: 'Le *respect* de toutes et tous, ce qui implique :',
			sous: [
				'Politesse et bienveillance, aucun propos ni comportement discriminant',
				'Du fair-play : ni mauvais perdant, ni mauvais gagnant',
				'Ne pas déranger les tables voisines',
			],
			groupe: 1,
		},
		{ texte: '*Prendre soin des jeux* : les ranger complets, signaler une pièce perdue ou abîmée', groupe: 2 },
		{ texte: 'Ne pas toucher aux *figurines des autres* sans leur accord', groupe: 2 },
		{ texte: 'Ne consommer *que les boissons de la taverne*, l’eau plate y est *offerte à volonté* (la nourriture apportée est autorisée)', groupe: 3 },
		{ texte: 'L’alcool *avec modération*, et jamais pour les mineur·es', groupe: 3 },
		{ texte: '*Ni tabac ni vapoteuse* à l’intérieur', groupe: 3 },
		{ texte: '*Moins de 11 ans* : avec un·e adulte. Dès 11 ans : *bonne conduite exigée*', groupe: 4 },
	] as Regle[],
};

/** Statuts, article 8 */
export const sanction = {
	titre: 'Game over',
	texte: 'Un manquement grave peut entraîner l’exclusion, décidée par le bureau après avoir entendu la personne concernée (statuts, art. 8).',
};

/** Texte avec les *mots* en valeur, en HTML (à afficher avec set:html) */
export const enValeur = (texte: string) =>
	texte.replace(/\*([^*]+)\*/g, '<em class="valeur">$1</em>').replace(/ ([:;!?])/g, ' $1');
