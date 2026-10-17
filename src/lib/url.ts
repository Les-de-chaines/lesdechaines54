// Préfixe un chemin interne avec la base du site :
// "/lesdechaines54/" sur GitHub Pages, "/" avec un nom de domaine.
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export function url(path = '') {
	return base + path.replace(/^\//, '');
}
