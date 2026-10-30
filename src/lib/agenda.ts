// Créneaux de la taverne, lus au moment du build dans l'agenda Google « Les Dé-Chaînés » (affiches agenda-AAAA-MM).
// L'adresse iCal secrète de l'agenda est dans la variable d'environnement AGENDA_ICS :
//   - en local : fichier .env (non versionné) avec AGENDA_ICS=https://calendar.google.com/calendar/ical/…/basic.ics
//   - à la mise en ligne : secret GitHub AGENDA_ICS (voir .github/workflows/astro.yml)
// Sans adresse, ou si l'agenda ne répond pas, les affiches s'affichent avec un calendrier vide (le build ne casse pas).
//
// Les titres de l'agenda sont des notes internes (« aprem jeux de société / soirée figurine », « horaire à confirmer bloodBowl »…) :
// on y repère les activités (voir `activites`) pour afficher des pastilles propres et colorées.

export type Activite = 'jeux' | 'figurines' | 'bloodbowl' | 'special';

/** Activités reconnues dans les titres de l'agenda, dans l'ordre d'affichage */
export const activites: Record<Activite, { nom: string; court: string; emoji: string; motif: RegExp }> = {
	jeux: { nom: 'Jeux de société', court: 'Jeux', emoji: '🎲', motif: /jeux/i },
	figurines: { nom: 'Figurines', court: 'Figurines', emoji: '⚔️', motif: /figurine/i },
	bloodbowl: { nom: 'Blood Bowl', court: 'Blood Bowl', emoji: '🏈', motif: /blood\s*bowl/i },
	special: { nom: 'Événement spécial', court: '', emoji: '✨', motif: /halloween|portes ouvertes|sp[ée]cial|tournoi|atelier/i },
};

/** Précisions ajoutées sous l'activité quand elles figurent dans le titre */
const precisions: [RegExp, string][] = [
	[/unlock/i, 'Unlock !'],
	[/halloween/i, 'Halloween'],
	[/portes ouvertes/i, 'Portes ouvertes'],
];

/**
 * Vacances scolaires (zone B, académie de Nancy-Metz), dates incluses : sur l'affiche, ces jours sont teintés
 * et un ruban annonce `mention` sur la première semaine de vacances encore sans créneau.
 */
export const vacances: { nom: string; emoji: string; debut: string; fin: string; mention: string }[] = [
	{ nom: 'Vacances de Noël', emoji: '🎄', debut: '2026-12-19', fin: '2027-01-03', mention: 'Planning à venir' },
];

export interface Creneau {
	/** AAAA-MM-JJ, heure de Paris */
	date: string;
	/** HH:MM (vide pour un événement sur la journée) */
	debut: string;
	fin: string;
	activites: Activite[];
	precision?: string;
	/** « horaire à confirmer » dans le titre */
	aConfirmer: boolean;
}

// --- Lecture du fichier iCal ---

interface Propriete {
	params: Record<string, string>;
	valeur: string;
}
type Vevent = Record<string, Propriete[]>;

function lireVevents(ics: string): Vevent[] {
	// Lignes repliées : une ligne qui commence par une espace continue la précédente
	const lignes = ics.replace(/\r?\n[ \t]/g, '').split(/\r?\n/);
	const evenements: Vevent[] = [];
	let courant: Vevent | null = null;
	for (const ligne of lignes) {
		if (ligne === 'BEGIN:VEVENT') courant = {};
		else if (ligne === 'END:VEVENT') {
			if (courant) evenements.push(courant);
			courant = null;
		} else if (courant) {
			const deuxPoints = ligne.indexOf(':');
			if (deuxPoints < 0) continue;
			const [nom, ...params] = ligne.slice(0, deuxPoints).split(';');
			const valeur = ligne.slice(deuxPoints + 1).replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
			(courant[nom] ??= []).push({
				params: Object.fromEntries(params.map((p) => p.split('=') as [string, string])),
				valeur,
			});
		}
	}
	return evenements;
}

// Une date-heure « murale » à Paris : on calcule les récurrences sur l'heure locale, sans souci de changement d'heure
interface Locale {
	date: string;
	heure: string;
}

const paris = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'Europe/Paris',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23',
});

function versParis(instant: Date): Locale {
	const p = Object.fromEntries(paris.formatToParts(instant).map(({ type, value }) => [type, value]));
	return { date: `${p.year}-${p.month}-${p.day}`, heure: `${p.hour}:${p.minute}` };
}

/** 20261125T190000Z (UTC), 20261121T100000 + TZID (heure locale, Paris), 20261125 (journée) */
function lireDate({ valeur }: Propriete): Locale {
	const m = valeur.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})\d{2}(Z)?)?$/);
	if (!m) throw new Error(`Date iCal illisible : ${valeur}`);
	const [, a, mo, j, h, mi, utc] = m;
	if (!h) return { date: `${a}-${mo}-${j}`, heure: '' };
	if (utc) return versParis(new Date(Date.UTC(+a, +mo - 1, +j, +h, +mi)));
	return { date: `${a}-${mo}-${j}`, heure: `${h}:${mi}` };
}

const jourMs = 86_400_000;
const versJour = (date: string) => Date.parse(`${date}T00:00:00Z`) / jourMs;
const depuisJour = (n: number) => new Date(n * jourMs).toISOString().slice(0, 10);
const codesJours = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** Dates (AAAA-MM-JJ) des occurrences d'une règle RRULE, jusqu'à `limite` incluse. Gère les règles quotidiennes et hebdomadaires. */
function occurrences(debut: string, rrule: string, limite: string): string[] {
	const r = Object.fromEntries(rrule.split(';').map((p) => p.split('=') as [string, string]));
	const pas = Number(r.INTERVAL ?? 1);
	const fin = r.UNTIL ? lireDate({ params: {}, valeur: r.UNTIL }).date : limite;
	const dernier = versJour(fin < limite ? fin : limite);
	const maximum = r.COUNT ? Number(r.COUNT) : Infinity;
	const premier = versJour(debut);
	const dates: string[] = [];

	if (r.FREQ === 'DAILY') {
		for (let n = premier; n <= dernier && dates.length < maximum; n += pas) dates.push(depuisJour(n));
	} else if (r.FREQ === 'WEEKLY') {
		const jours = (r.BYDAY ?? codesJours[new Date(premier * jourMs).getUTCDay()]).split(',');
		// Semaines comptées depuis le lundi de la semaine du premier jour
		const lundi = premier - ((new Date(premier * jourMs).getUTCDay() + 6) % 7);
		for (let n = premier; n <= dernier && dates.length < maximum; n++) {
			const semaine = Math.floor((n - lundi) / 7);
			if (semaine % pas === 0 && jours.includes(codesJours[new Date(n * jourMs).getUTCDay()])) dates.push(depuisJour(n));
		}
	} else {
		console.warn(`[agenda] Récurrence non gérée (${r.FREQ}) : seule la première date est affichée`);
		dates.push(debut);
	}
	return dates;
}

function analyserTitre(titre: string): Pick<Creneau, 'activites' | 'precision' | 'aConfirmer'> {
	let trouvees = (Object.keys(activites) as Activite[]).filter((cle) => activites[cle].motif.test(titre));
	// « Blood Bowl » se joue avec des figurines : on n'affiche pas les deux
	if (trouvees.includes('bloodbowl') && !/figurine/i.test(titre)) trouvees = trouvees.filter((a) => a !== 'figurines');
	if (trouvees.length > 1) trouvees = trouvees.filter((a) => a !== 'special');
	return {
		activites: trouvees.length ? trouvees : ['special'],
		precision: precisions.find(([motif]) => motif.test(titre))?.[1],
		aConfirmer: /[àa] confirmer/i.test(titre),
	};
}

function versCreneaux(ics: string, limite: string): Creneau[] {
	const evenements = lireVevents(ics);
	// Occurrences modifiées à la main (RECURRENCE-ID) : elles remplacent l'occurrence prévue par la règle
	const modifiees = new Set(
		evenements.filter((e) => e['RECURRENCE-ID']).map((e) => `${e.UID?.[0].valeur}|${lireDate(e['RECURRENCE-ID'][0]).date}`),
	);
	const creneaux: Creneau[] = [];
	for (const e of evenements) {
		if (!e.DTSTART || e.STATUS?.[0].valeur === 'CANCELLED') continue;
		const debut = lireDate(e.DTSTART[0]);
		const fin = e.DTEND ? lireDate(e.DTEND[0]) : debut;
		const titre = e.SUMMARY?.[0].valeur ?? '';
		const uid = e.UID?.[0].valeur;
		const exclues = new Set((e.EXDATE ?? []).flatMap((p) => p.valeur.split(',').map((v) => lireDate({ ...p, valeur: v }).date)));
		const dates =
			e.RRULE && !e['RECURRENCE-ID']
				? occurrences(debut.date, e.RRULE[0].valeur, limite).filter((d) => !exclues.has(d) && !modifiees.has(`${uid}|${d}`))
				: [debut.date];
		for (const date of dates) creneaux.push({ date, debut: debut.heure, fin: fin.heure, ...analyserTitre(titre) });
	}
	return creneaux.sort((a, b) => (a.date + a.debut).localeCompare(b.date + b.debut));
}

// Un seul téléchargement par build, partagé par toutes les affiches. Avec le serveur de dev (qui tourne longtemps),
// l'agenda est retéléchargé au bout de 30 secondes : une modification dans Google Agenda apparaît en rechargeant la page.
let chargement: Promise<Creneau[]> | undefined;
let chargeLe = 0;
const dureeCacheDev = 30_000;

/** Créneaux de l'agenda, du plus ancien au plus récent (jusqu'à fin 2027 pour les récurrences sans fin) */
export function creneaux(): Promise<Creneau[]> {
	if (import.meta.env.DEV && Date.now() - chargeLe > dureeCacheDev) chargement = undefined;
	if (!chargement) chargeLe = Date.now();
	return (chargement ??= (async () => {
		const adresse = import.meta.env.AGENDA_ICS;
		if (!adresse) {
			console.warn('[agenda] AGENDA_ICS absent (fichier .env) : affiches agenda sans créneaux');
			return [];
		}
		try {
			const reponse = await fetch(adresse);
			if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
			return versCreneaux(await reponse.text(), '2027-12-31');
		} catch (erreur) {
			console.warn(`[agenda] Agenda Google injoignable (${erreur}) : affiches agenda sans créneaux`);
			return [];
		}
	})());
}

/** « 17:30 » → « 17h30 », « 20:00 » → « 20h », « 00:00 » → « minuit » ; « 23:59 » (fin saisie à la minute près) → « minuit » */
export function heure(h: string) {
	let [heures, minutes] = h.split(':').map(Number);
	if (minutes === 59) [heures, minutes] = [(heures + 1) % 24, 0];
	if (heures === 0 && minutes === 0) return 'minuit';
	return `${heures}h${minutes ? String(minutes).padStart(2, '0') : ''}`;
}

/** « 13h30 – 18h30 » (tiret entre espaces fines, pour tenir dans une case étroite), « Dès 20h », « Journée » */
export const horaire = ({ debut, fin }: Creneau) =>
	debut ? (fin && fin !== debut ? `${heure(debut)} – ${heure(fin)}` : `Dès ${heure(debut)}`) : 'Journée';

/** Précision affichée sous l'horaire (« Unlock ! ») ; un événement spécial sans précision est nommé « Événement spécial » */
export const precision = (c: Creneau) => c.precision ?? (c.activites[0] === 'special' ? activites.special.nom : undefined);

/** Les fichiers d'agenda du mois (src/pages/affiches/agenda-AAAA-MM.astro), du plus ancien au plus récent : « 2026-11 »… */
export const moisPublies = (fichiers: string[]) =>
	fichiers
		.map((fichier) => fichier.match(/^agenda-(\d{4}-\d{2})\.astro$/)?.[1])
		.filter((mois): mois is string => !!mois)
		.sort();

/** Tout ce qu'il faut pour dessiner le calendrier d'un mois (AAAA-MM), sur l'affiche comme sur le site */
export async function moisAgenda(mois: string) {
	const [annee, numero] = mois.split('-').map(Number);
	const nomMois = new Intl.DateTimeFormat('fr-FR', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(annee, numero - 1, 1)));

	const duMois = (await creneaux()).filter((c) => c.date.startsWith(mois));
	const parJour = new Map<number, Creneau[]>();
	for (const c of duMois) {
		const jour = Number(c.date.slice(8));
		parJour.set(jour, [...(parJour.get(jour) ?? []), c]);
	}

	// Grille du lundi au dimanche : cases vides (null) avant le 1er et après le dernier jour
	const nbJours = new Date(Date.UTC(annee, numero, 0)).getUTCDate();
	const decalage = (new Date(Date.UTC(annee, numero - 1, 1)).getUTCDay() + 6) % 7;
	const cases: (number | null)[] = [...Array(decalage).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];
	while (cases.length % 7) cases.push(null);
	const semaines = cases.length / 7;

	// Vacances scolaires : jours concernés, et la première semaine entièrement en vacances et sans créneau (pour le ruban)
	const dateDuJour = (jour: number) => `${mois}-${String(jour).padStart(2, '0')}`;
	const periode = (jour: number | null) =>
		jour ? vacances.find((v) => v.debut <= dateDuJour(jour) && dateDuJour(jour) <= v.fin) : undefined;
	const vacancesDuMois = vacances.filter((v) => cases.some((jour) => periode(jour) === v));
	const rubans = vacancesDuMois.flatMap((v) => {
		const semaine = Array.from({ length: semaines }, (_, i) => cases.slice(i * 7, i * 7 + 7)).findIndex(
			(jours) => jours.every((jour) => !jour || (periode(jour) === v && !parJour.has(jour))) && jours.some((jour) => jour),
		);
		return semaine < 0 ? [] : [{ ...v, semaine }];
	});

	return {
		annee,
		numero,
		nomMois,
		duMois,
		parJour,
		cases,
		semaines,
		dateDuJour,
		periode,
		vacancesDuMois,
		rubans,
		/** Activités présentes dans le mois, pour la légende */
		presentes: (Object.keys(activites) as Activite[]).filter((a) => duMois.some((c) => c.activites.includes(a))),
		aConfirmer: duMois.some((c) => c.aConfirmer),
	};
}

export const nomsJours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
