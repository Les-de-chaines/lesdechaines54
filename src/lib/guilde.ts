// La guilde : une seule source pour la page Qui sommes-nous et l'affiche de la guilde.

export const quetes = [
	{ etape: 'Quête de départ', texte: 'trouver un espace sans enfants pour se retrouver et jouer.' },
	{ etape: 'Quête secondaire', texte: 'trouver de la place pour ranger les nouveaux jeux.' },
	{ etape: 'Résultat', texte: 'impossible.' },
	{ etape: 'Nouvelle quête', texte: 'ouvrir un café jeux !' },
];

// `croise` : deux emojis croisés, le second en miroir
export const bureau: { embleme: string; croise?: boolean; prenom: string; titre: string; texte: string }[] = [
	{
		embleme: '🍪',
		prenom: 'Cindy',
		titre: 'Fée des cookies',
		texte:
			"Point faible\u00a0: choisir. Le jeu, le personnage, et même le cookie, puisqu'elle en apporte trois fournées pour trouver la meilleure recette. Point fort\u00a0: un sac sans fond, où elle range les projets des autres en plus des siens. Elle apprend tout, partout, tout le temps… sauf les règles.",
	},
	{
		embleme: '🧚',
		prenom: 'Perrine',
		titre: 'Fée des crêpes',
		texte:
			"Quête principale\u00a0: finir un projet. Quêtes secondaires\u00a0: les 47 autres déjà commencés. Une tête pleine d'idées, des projets plein les bras et des armoires de jeux qui rêvent de prendre l'air. Elle dit oui aux défis les plus fous et aux crêpes à toute heure.",
	},
	{
		embleme: '🖌️',
		croise: true,
		prenom: 'Nicolas',
		titre: "Pinceau de l'Empereur",
		texte:
			"Pinceau dans une main, liste d'armée dans l'autre, il mène ses troupes à la bataille contre ses potes jusqu'à pas d'heure, entre deux matchs de Blood Bowl. Le trésor de la guilde est entre de bonnes mains\u00a0: il compte aussi bien ses pièces d'or que ses points d'armée.",
	},
	{
		embleme: '💀',
		prenom: 'Christophe',
		titre: 'Nécron à manette',
		texte:
			"Némésis du Pinceau de l'Empereur, il affronte ses adversaires avec ses Nécrons\u00a0: immortels, mais jamais aidés par les dés. Gamer entre deux batailles, il a une arme secrète\u00a0: sa tchatche. Il vous convaincra de rejouer une partie avant que vous ayez fini de ranger.",
	},
];
