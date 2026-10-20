// Contenu d'une affiche d'événement (composant src/components/Affiche.astro).
// Chaque affiche a sa page dans src/pages/affiches/ : copier _modele.astro pour en créer une.
// Les valeurs entre crochets sont surlignées en jaune sur l'affiche : à compléter avant impression.

export interface Evenement {
	/** Petit bandeau au-dessus du titre (type d'événement, thème…) */
	categorie: string;
	/** Un retour à la ligne (\n) sépare la petite première ligne du grand titre */
	titre: string;
	accroche?: string;
	/** Date au format AAAA-MM-JJ */
	date: string;
	debut: string;
	/** Sans heure de fin, l'affiche indique « Dès {debut} » */
	fin?: string;
	/** Déroulé en quelques lignes sous l'horaire (ex. « 13h – 18h » : « Jeux de société ») */
	programme?: { horaire: string; activite: string }[];
	/** À qui s'adresse l'événement (ex. « De 5 à 9 ans ») */
	public?: string;
	/**
	 * Trois images, empilées à droite de l'affiche ; la légende sert à nommer les jeux.
	 * `fichier` : nom d'une image déposée dans src/assets/affiches/.
	 * Sans fichier, un cadre en pointillés décrit l'image attendue.
	 * `cadrage` : partie de l'image à garder quand elle est rognée (ex. « left », « 30% 80% ») ; centrée par défaut.
	 * `icones` : à la place d'une image, quelques emojis en grand (ex. les gourmandises) ; `description` sert alors de texte alternatif.
	 */
	visuels: { description: string; legende?: string; fichier?: string; cadrage?: string; icones?: string[] }[];
	tarifs: { formule: string; prix: string }[];
	/** Ce qui est compris dans le prix */
	inclus?: string;
	/** Dernière ligne avant le pied de l'affiche (réservation, places limitées…) */
	note?: string;
}

/** Vrai si le texte est encore à compléter (entre crochets) */
export const aCompleter = (texte?: string) => !!texte && /^\[.*\]$/.test(texte);
