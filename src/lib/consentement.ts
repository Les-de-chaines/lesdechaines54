// Choix du visiteur concernant les cookies tiers (Google Maps), mémorisé dans son navigateur (localStorage).
// Ce n'est pas un cookie : la donnée reste sur son appareil et n'est jamais envoyée.
// Le navigateur peut refuser l'accès (navigation privée, stockage bloqué) : le choix vaut alors pour la page en cours.

export type Choix = 'accepte' | 'refuse';

const CLE = 'consentement-cookies';
const EVENEMENT = 'consentement-change';
let choixEnMemoire: Choix | null = null;

export function lireChoix(): Choix | null {
	try {
		const valeur = localStorage.getItem(CLE);
		if (valeur === 'accepte' || valeur === 'refuse') return valeur;
	} catch {
		// Stockage indisponible
	}
	return choixEnMemoire;
}

export function enregistrerChoix(choix: Choix) {
	choixEnMemoire = choix;
	try {
		localStorage.setItem(CLE, choix);
	} catch {
		// Stockage indisponible : le choix vaut seulement pour cette page
	}
	document.dispatchEvent(new CustomEvent(EVENEMENT, { detail: choix }));
}

// Appelle `rappel` à chaque nouveau choix (fenêtre d'accueil, page Confidentialité…)
export function surChangement(rappel: (choix: Choix) => void) {
	document.addEventListener(EVENEMENT, (e) => rappel((e as CustomEvent<Choix>).detail));
}

// Rouvre la fenêtre de choix
export function ouvrirFenetre() {
	document.dispatchEvent(new CustomEvent('consentement-ouvrir'));
}
