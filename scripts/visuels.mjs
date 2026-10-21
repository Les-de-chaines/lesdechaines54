// Génère les visuels PNG de chaque affiche, après `astro build` :
//   dist/visuels/<affiche>-a4.png         affiche A4 (1240 × 1754, 150 dpi)
//   dist/visuels/<affiche>-facebook.png   couverture d'événement Facebook (1920 × 1005)
//   dist/visuels/<affiche>-instagram.png  publication Instagram (1080 × 1350, portrait 4:5)
// Chaque page d'affiche sait se mettre à ces formats avec « ?format=… » (voir src/components/Affiche.astro).
// Utilisation : npm run visuels (un navigateur Chromium doit être installé : npx playwright install chromium).
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const DIST = path.resolve('dist');
const SORTIE = path.join(DIST, 'visuels');

// Taille de la fenêtre en px CSS (entiers) et taille finale : l'échelle largeurFinale / largeur donne pile la hauteur finale.
// A4 : la feuille fait 210 × 297 mm, soit 794 × 1123 px. Facebook et Instagram : la feuille est mise à l'échelle
// de la fenêtre (zoom dans Affiche.astro), car leur hauteur en mm ne tombe pas sur un nombre entier de pixels.
const FORMATS = {
	a4: { largeur: 794, hauteur: 1123, largeurFinale: 1240 },
	facebook: { largeur: 1024, hauteur: 536, largeurFinale: 1920 },
	instagram: { largeur: 800, hauteur: 1000, largeurFinale: 1080 },
};

// Affiches publiées : dist/affiches/AAAA-MM-JJ-nom/index.html
const affiches = fs
	.readdirSync(path.join(DIST, 'affiches'), { withFileTypes: true })
	.filter((d) => d.isDirectory() && fs.existsSync(path.join(DIST, 'affiches', d.name, 'index.html')))
	.map((d) => d.name);

// Petit serveur local sur dist/ : les chemins du site commencent par la base (ex. « /lesdechaines54/ »)
const base = (process.env.BASE_PATH ?? '/').replace(/\/?$/, '/');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const serveur = http.createServer((req, res) => {
	let chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
	if (chemin.startsWith(base)) chemin = '/' + chemin.slice(base.length);
	let fichier = path.join(DIST, chemin);
	if (!fichier.startsWith(DIST)) return res.writeHead(403).end();
	if (fs.existsSync(fichier) && fs.statSync(fichier).isDirectory()) fichier = path.join(fichier, 'index.html');
	if (!fs.existsSync(fichier)) return res.writeHead(404).end();
	res.writeHead(200, { 'Content-Type': types[path.extname(fichier)] ?? 'application/octet-stream' });
	fs.createReadStream(fichier).pipe(res);
});
await new Promise((ok) => serveur.listen(0, '127.0.0.1', ok));
const origine = `http://127.0.0.1:${serveur.address().port}${base}`;

fs.mkdirSync(SORTIE, { recursive: true });
const navigateur = await chromium.launch();
for (const [format, { largeur, hauteur, largeurFinale }] of Object.entries(FORMATS)) {
	const page = await navigateur.newPage({
		viewport: { width: largeur, height: hauteur },
		deviceScaleFactor: largeurFinale / largeur,
	});
	for (const affiche of affiches) {
		await page.goto(`${origine}affiches/${affiche}/?format=${format}`, { waitUntil: 'networkidle' });
		await page.evaluate(() => document.fonts.ready);
		const fichier = path.join(SORTIE, `${affiche}-${format}.png`);
		await page.screenshot({ path: fichier });
		console.log(`✓ visuels/${path.basename(fichier)}`);
	}
	await page.close();
}
await navigateur.close();
serveur.close();
