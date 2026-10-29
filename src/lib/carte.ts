// Carte de la buvette : une seule source pour la page du site et les affiches à imprimer.
// `aVerifier` surligne en jaune un prix encore à confirmer (à retirer une fois le prix fixé).

export interface Article {
	nom: string;
	/** Contenance, ex. « 33 cl » */
	format?: string;
	/** Précision sous le nom, ex. les parfums */
	detail?: string;
	prix: string;
	aVerifier?: boolean;
	/** Petite feuille après le nom : existe en version végétale */
	feuille?: boolean;
	/** Sous-catégorie dans la rubrique (ex. « Sans alcool ») : un intertitre s'affiche quand elle change */
	groupe?: string;
}

export interface Rubrique {
	titre: string;
	icone: string;
	/** Petite mention sous le titre de la rubrique */
	note?: string;
	/** Petite feuille après la note (légende des articles marqués `feuille`) */
	feuille?: boolean;
	articles: Article[];
}

export const carte: Rubrique[] = [
	{
		titre: 'Boissons chaudes',
		icone: '☕',
		note: 'Lait végétal sur demande.',
		feuille: true,
		articles: [
			{ nom: 'Café', prix: '1 €' },
			{ nom: 'Thé', prix: '1 €' },
			{ nom: 'Chocolat chaud', prix: '2 €', feuille: true },
			{ nom: 'Chaï latte', prix: '3 €', feuille: true },
		],
	},
	{
		titre: 'Softs',
		icone: '🥤',
		articles: [
			{ nom: 'Sirop à l’eau', prix: '1 €' },
			{ nom: 'Eau pétillante', prix: '1 €' },
			{ nom: 'Jus de fruits', format: '25 cl', detail: 'Pomme, fraise, mangue', prix: '1,50 €' },
			{ nom: 'Soda', format: '33 cl', detail: 'Coca, Pepsi Zero, Lipton, Oasis', prix: '2 €' },
			{ nom: 'Symple, ginger beer', detail: 'Infusion pétillante', prix: '3,50 €' },
		],
	},
	{
		titre: 'Bières',
		icone: '🍺',
		articles: [
			{ groupe: 'Zéro degré, potion de lucidité', nom: 'Tourtel citron', format: '27,5 cl', prix: '2,50 €' },
			{ groupe: 'Zéro degré, potion de lucidité', nom: 'Leffe blonde 0.0', format: '25 cl', prix: '2,50 €' },
			{ groupe: 'Réservé aux aventuriers niveau 18+', nom: 'Leffe blonde', format: '25 cl', prix: '3 €' },
			{ groupe: 'Réservé aux aventuriers niveau 18+', nom: 'La Chouffe blonde', format: '33 cl', prix: '4 €' },
		],
	},
	{
		titre: 'Grignotage',
		icone: '🍪',
		articles: [
			{ nom: 'Cookie', prix: '1 €' },
			{ nom: 'Chips', prix: '1 €' },
			{ nom: 'Compote', prix: '1 €' },
			{ nom: 'Bonbons', detail: '3 petits sachets', prix: '2 €' },
		],
	},
	{
		titre: 'Crêpes',
		icone: '🥞',
		note: 'Selon les jours et les talents des bénévoles !',
		articles: [
			{ nom: 'Crêpe au sucre', prix: '2 €' },
			{ nom: 'Crêpe au Nutella', prix: '2,50 €' },
		],
	},
];

// Mentions obligatoires dès qu'on affiche de l'alcool (loi Évin, Code de la santé publique)
export const mentionsAlcool = [
	'L’abus d’alcool est dangereux pour la santé, à consommer avec modération.',
	'Vente d’alcool interdite aux mineurs.',
];
