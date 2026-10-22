import { PNG } from 'npm:pngjs@7.0.0';
import { Buffer } from 'node:buffer';
import { bytesToBase64, osmTile } from './open-maps.ts';

// Small bitmap font keeps required attribution in the image itself, including
// photos made by older mobile versions that do not read response metadata.
const glyphs: Record<string, number[]> = {
  '©':[14,17,23,21,23,17,14], 'O':[14,17,17,17,17,17,14],
  'P':[30,17,17,30,16,16,16], 'E':[31,16,16,30,16,16,31],
  'N':[17,25,21,19,17,17,17], 'S':[15,16,16,14,1,1,30],
  'T':[31,4,4,4,4,4,4], 'R':[30,17,17,30,20,18,17],
  'M':[17,27,21,21,17,17,17], 'A':[14,17,17,31,17,17,17],
  ' ':[0,0,0,0,0,0,0],
};
export async function renderStaticMap(lat: number, lng: number) {
  if (Math.abs(lat) > 85.05112878) throw new Error('MAP_OUTSIDE_COVERAGE');
  const zoom = 16, count = 2 ** zoom, size = 256;
  const x = (lng + 180) / 360 * count * 256;
  const radians = lat * Math.PI / 180;
  const y = (1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 * count * 256;
  const left = Math.floor(x - size / 2), top = Math.floor(y - size / 2);
  const image = new PNG({ width: size, height: size });
  for (let tileY = Math.floor(top / 256); tileY <= Math.floor((top + size - 1) / 256); tileY++) {
    for (let tileX = Math.floor(left / 256); tileX <= Math.floor((left + size - 1) / 256); tileX++) {
      const wrappedX = ((tileX % count) + count) % count;
      if (tileY < 0 || tileY >= count) continue;
      const bytes = Buffer.from(await osmTile(zoom, wrappedX, tileY), 'base64');
      const tile = PNG.sync.read(bytes, { checkCRC: true });
      if (tile.width !== 256 || tile.height !== 256) throw new Error('INVALID_MAP_TILE');
      const sourceX = Math.max(0, left - tileX * 256), sourceY = Math.max(0, top - tileY * 256);
      const destX = Math.max(0, tileX * 256 - left), destY = Math.max(0, tileY * 256 - top);
      PNG.bitblt(tile, image, sourceX, sourceY, Math.min(256 - sourceX, size - destX), Math.min(256 - sourceY, size - destY), destX, destY);
    }
  }
  const pixel = (px: number, py: number, color: number[]) => {
    if (px < 0 || px >= size || py < 0 || py >= size) return;
    const i = (py * size + px) * 4;
    image.data[i] = color[0]; image.data[i + 1] = color[1]; image.data[i + 2] = color[2]; image.data[i + 3] = 255;
  };
  // Marker is at the exact requested coordinate, not at the reverse-geocoder's place centroid.
  const cx = Math.round(x - left), cy = Math.round(y - top);
  for (let dy = -8; dy <= 8; dy++) for (let dx = -8; dx <= 8; dx++) {
    const distance = dx * dx + dy * dy;
    if (distance <= 64) pixel(cx + dx, cy + dy, distance <= 25 ? [220, 35, 35] : [255, 255, 255]);
  }
  for (let py = size - 22; py < size; py++) for (let px = 0; px < size; px++) pixel(px, py, [255,255,255]);
  let cursor = 6;
  for (const char of '© OPENSTREETMAP') {
    const glyph = glyphs[char];
    glyph.forEach((row, gy) => { for (let gx = 0; gx < 5; gx++) if (row & (1 << (4 - gx))) {
      for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) pixel(cursor + gx * 2 + sx, size - 18 + gy * 2 + sy, [25,25,25]);
    }});
    cursor += 12;
  }
  return { imageBase64: bytesToBase64(PNG.sync.write(image)), attribution: '© OpenStreetMap contributors', provider: 'OpenStreetMap' };
}
