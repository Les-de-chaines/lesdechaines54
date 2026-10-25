import QRCode from 'qrcode';

// QR code en SVG, dessiné au moment du build (aucun service extérieur)
export const qrSvg = (lien: string, dark = '#3e2416', light = '#fbf6ea') =>
	QRCode.toString(lien, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark, light } });
