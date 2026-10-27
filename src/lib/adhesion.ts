// Grille tarifaire : une seule source pour la page Infos pratiques et l'affiche de la guilde.
// Adhésions annuelles, puis adhésions à la journée.

export const adhesions = [
	{ formule: 'Adhésion adulte', detail: '18 ans et plus', prix: '25 €' },
	{
		formule: 'Adhésion solidaire',
		detail:
			'Moins de 18 ans, étudiants, bénéficiaires de minima sociaux, ou si vous estimez ne pas avoir les moyens de payer 25 €',
		prix: '15 €',
	},
	{ formule: 'Adhésion familiale', detail: 'Un ou deux adultes et les enfants mineurs qu\'ils accompagnent', prix: '50 €' },
	{
		formule: 'Adhésion de soutien',
		detail: 'Si vous en avez les moyens et souhaitez nous donner un coup de pouce',
		prix: '50 €',
	},
];

export const visiteurs = [
	{ formule: 'Individuel', prix: '3 €' },
	{ formule: 'Famille', prix: '10 €' },
];
