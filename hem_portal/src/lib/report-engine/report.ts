import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import JSZip from 'jszip';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export type ReportData = Record<string, string | number | undefined | null>;

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

async function readTemplate(filename: string): Promise<Buffer> {
  const filepath = path.join(process.cwd(), 'public', 'templates', filename);
  return fs.promises.readFile(filepath);
}

function descendants(node: any, tagName: string): any[] {
  const items = Array.from(node.getElementsByTagName(tagName));
  if (items.length > 0) return items;
  // OOXML DOCX files namespace elements with w: (WordprocessingML) or a: (DrawingML)
  const wItems = Array.from(node.getElementsByTagName(`w:${tagName}`));
  if (wItems.length > 0) return wItems;
  return Array.from(node.getElementsByTagName(`a:${tagName}`));
}

/** Remove shading and highlight formatting from all runs inside a node. */
function stripRunHighlighting(node: Parameters<typeof descendants>[0]) {
  for (const tag of ['shd', 'highlight']) {
    for (const el of [...descendants(node, tag)]) {
      // Only strip from run properties (rPr), not table/cell properties
      const parent = el.parentNode;
      if (parent && (parent.localName === 'rPr' || parent.nodeName === 'w:rPr')) {
        parent.removeChild(el);
      }
    }
  }
}

function setCellText(tables: any[], loc: [number, number, number], value: string) {
  const tbl = tables[loc[0]]; if (!tbl) return;
  const rows = descendants(tbl, 'tr'); const tr = rows[loc[1]]; if (!tr) return;
  const cells = descendants(tr, 'tc'); const tc = cells[loc[2]]; if (!tc) return;
  const tElements = descendants(tc, 't');
  if (tElements.length === 0) {
    const doc = tc.ownerDocument;
    const paragraph = descendants(tc, 'p')[0] || tc.appendChild(doc.createElementNS(W_NS, 'w:p'));
    const run = paragraph.appendChild(doc.createElementNS(W_NS, 'w:r'));
    const text = run.appendChild(doc.createElementNS(W_NS, 'w:t'));
    text.setAttribute('xml:space', 'preserve');
    text.appendChild(doc.createTextNode(value));
    return;
  }
  for (let i = 0; i < tElements.length; i++) {
    const parent = tElements[i].parentNode;
    if (i === 0) {
      if (tElements[i].childNodes.length > 0) tElements[i].childNodes[0].nodeValue = value;
      else tElements[i].appendChild(tElements[i].ownerDocument.createTextNode(value));
    } else {
      if (parent) parent.removeChild(tElements[i]);
    }
  }
  stripRunHighlighting(tc);
}

function setBodyParagraphText(body: any, childIndex: number, value: string) {
  const children = Array.from(body.childNodes).filter((n: any) => n.nodeType === 1);
  const p = children[childIndex]; if (!p) return;
  const tElements = descendants(p, 't');
  if (tElements.length === 0) return;
  for (let i = 0; i < tElements.length; i++) {
    const parent = tElements[i].parentNode;
    if (i === 0) {
      if (tElements[i].childNodes.length > 0) tElements[i].childNodes[0].nodeValue = value;
      else tElements[i].appendChild(tElements[i].ownerDocument.createTextNode(value));
    } else {
      if (parent) parent.removeChild(tElements[i]);
    }
  }
}

function setParagraphByIndex(doc: any, pIndex: number, value: string) {
  const ps = descendants(doc, 'p');
  const p = ps[pIndex]; if (!p) return;
  const tElements = descendants(p, 't');
  if (tElements.length === 0) return;
  for (let i = 0; i < tElements.length; i++) {
    const parent = tElements[i].parentNode;
    if (i === 0) {
      if (tElements[i].childNodes.length > 0) tElements[i].childNodes[0].nodeValue = value;
      else tElements[i].appendChild(tElements[i].ownerDocument.createTextNode(value));
    } else {
      if (parent) parent.removeChild(tElements[i]);
    }
  }
}

async function imageInTemplate(upload: File | Blob, expected: 'png' | 'jpeg', aspectRatio?: number) {
  let buf = Buffer.from(await upload.arrayBuffer());
  let image = sharp(buf).rotate();
  if (aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0) {
    const meta = await sharp(buf).metadata();
    const rotated = [5, 6, 7, 8].includes(meta.orientation ?? 1);
    const sourceWidth = (rotated ? meta.height : meta.width) || 2400;
    const sourceHeight = (rotated ? meta.width : meta.height) || 2400;
    // Add the required padding without enlarging small evidence images.
    const width = Math.min(2400, Math.ceil(Math.max(sourceWidth, sourceHeight * aspectRatio)));
    image = image.resize({ width, height: Math.max(1, Math.round(width / aspectRatio)), fit: 'contain', background: '#ffffff' });
  }
  return image.toFormat(expected).toBuffer();
}

async function blankLike(original: Buffer, expected: 'png' | 'jpeg') {
  let meta = await sharp(original).metadata();
  return sharp({ create: { width: meta.width || 100, height: meta.height || 100, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .toFormat(expected)
    .toBuffer();
}

// Locations in the checked-in, single-table Veritas lender document.
const VF: Record<string, [number, number, number]> = {
  application_number: [0, 1, 1],
  branch: [0, 2, 1],
  product: [0, 3, 1],
  phone: [0, 4, 1],
  applicant_name: [0, 5, 1],
  co_applicant_name: [0, 6, 1],
  inspection_date: [0, 7, 1],
  inspected_by: [0, 8, 1],
  authorised_signature: [0, 9, 1],
  document_holder_name: [0, 11, 1],
  property_type: [0, 12, 1],
  property_type_other: [0, 13, 1],
  method_valuation: [0, 14, 1],
  property_address: [0, 15, 1],
  district: [0, 16, 1],
  state: [0, 17, 1],
  pincode: [0, 18, 1],
  nearest_landmark: [0, 21, 1],
  branch_distance: [0, 22, 1],
  civic_status: [0, 23, 1],
  civic_status_other: [0, 24, 1],
  nhb_1991: [0, 25, 1],
  nhb_2011: [0, 26, 1],
  owner_title_deed: [0, 27, 1],
  title_deed_details: [0, 28, 1],
  ownership_type: [0, 29, 1],
  usage: [0, 30, 1],
  usage_other: [0, 31, 1],
  occupancy: [0, 32, 1],
  approved_plan: [0, 33, 1],
  deviation: [0, 34, 1],
  floors: [0, 35, 1],
  total_units: [0, 38, 1],
  more_than_2_units: [0, 39, 1],
  property_identification: [0, 40, 1],
  marketability: [0, 41, 1],
  building_age: [0, 42, 1],
  future_life: [0, 43, 1],
  documents_list: [0, 50, 1],
  purchase_property: [0, 51, 1],
  roof: [0, 56, 1],
  flooring: [0, 57, 1],
  property_tax: [0, 60, 1],
  plot_demarcated: [0, 61, 1],
  road_width: [0, 62, 1],
  passage_less_10ft: [0, 64, 1],
  locality: [0, 67, 1],
  location_surrounding: [0, 68, 1],
  facilities: [0, 69, 1],
  water_supply: [0, 70, 1],
  drainage: [0, 71, 1],
  condition: [0, 72, 1],
  rental_value: [0, 73, 1],
  land_sft: [0, 75, 1],
  glv_sft_sro: [0, 76, 1],
  glv_land: [0, 77, 1],
  market_range_sft: [0, 78, 1],
  rate_sft: [0, 79, 1],
  land_value: [0, 80, 1],
  existing_bua: [0, 82, 1],
  proposed_bua: [0, 83, 1],
  total_bua: [0, 84, 1],
  carpet_area: [0, 85, 1],
  existing_building_value: [0, 86, 1],
  proposed_building_value: [0, 87, 1],
  enhancement: [0, 88, 1],
  additional_cost: [0, 89, 1],
  total_building_value: [0, 90, 1],
  temp_existing_bua: [0, 92, 1],
  temp_carpet_area: [0, 93, 1],
  temp_rate_sft: [0, 94, 1],
  temp_existing_value: [0, 95, 1],
  temp_additional_cost: [0, 96, 1],
  temp_total_value: [0, 98, 1],
  land_plus_rcc: [0, 99, 1],
  land_plus_temp: [0, 100, 1],
  total_property_value: [0, 101, 1],
  forced_sale_value: [0, 102, 1],
  work_progress: [0, 103, 1],
  construction_stage: [0, 104, 1],
  insurance_value: [0, 105, 1],
  request_loan_amount: [0, 109, 1],
  sanctioned_loan_amount: [0, 110, 1],
  lcr: [0, 111, 1],
  ltv: [0, 112, 1],
  combined_ltv: [0, 113, 1],
  structure: [0, 114, 1],
  hazardous_zones: [0, 115, 1],
  geometry: [0, 116, 1],
  recommended: [0, 117, 1],
  latitude: [0, 19, 2],
  longitude: [0, 20, 2],
  residential_units: [0, 36, 2],
  commercial_units: [0, 37, 2],
  agreement_between: [0, 52, 2],
  agreement_value: [0, 53, 2],
  agreement_date: [0, 54, 2],
  agreement_validity: [0, 55, 2],
  eb_service: [0, 58, 2],
  meter_number: [0, 59, 2],
  passage_width: [0, 65, 2],
  distance_main_road: [0, 66, 2],
  proposal_number: [0, 107, 2],
  existing_loan_amount: [0, 108, 2],
  east_title: [0, 45, 1],
  east_actual: [0, 45, 2],
  west_title: [0, 46, 1],
  west_actual: [0, 46, 2],
  north_title: [0, 47, 1],
  north_actual: [0, 47, 2],
  south_title: [0, 48, 1],
  south_actual: [0, 48, 2],
  comments: [0, 118, 0],
};

function parseNum(val: any): number {
  const str = String(val ?? '').replace(/,/g, '').replace(/Rs\.?/gi, '').replace(/\/-/g, '').trim();
  const n = Number(str);
  return Number.isNaN(n) ? 0 : n;
}
function money(val: number): string {
  if (val === 0) return '';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
}

async function generateVeritas(data: ReportData, photos: (File | Blob | null)[], template?: {photoSlots?: {aspectRatio?: number}[]}): Promise<Buffer> {
  const raw = await readTemplate('veritas.docx');
  const zip = await JSZip.loadAsync(raw);
  const xml = await zip.file('word/document.xml')!.async('text');
  const relxml = await zip.file('word/_rels/document.xml.rels')!.async('text');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const rel = new DOMParser().parseFromString(relxml, 'application/xml');
  const body = descendants(doc, 'body')[0];
  const tables = descendants(body, 'tbl');

  for (const [k, loc] of Object.entries(VF)) {
    setCellText(tables, loc, String(data[k] ?? ''));
  }

  // Only the standard disclaimer belongs here; the populated source also had
  // an old inspection's numbered notes. Case observations use `comments`.
  const disclaimer = 'Note:Valuation report is Valid When title deed are genuine.This Valuation report prepared based on the available documents only. Any such missing document may effect the value conditionally. This report is for assessing the fair market value of the subjected property and it is not be interpreted as confirmation of ownership or genunity of documents. Further the bank is advised to satisfy itself before accepting thesecurity in terms of genuiness of the title documents/approvals/owners/ identity related to the property.';
  setCellText(tables, [0, 119, 0], disclaimer);
  const noteCell = descendants(descendants(tables[0], 'tr')[119], 'tc')[0];
  for (const paragraph of descendants(noteCell, 'p').slice(1)) paragraph.parentNode?.removeChild(paragraph);

  const land = parseNum(data.land_value), building = parseNum(data.total_building_value), temporary = parseNum(data.temp_total_value), total = data.total_property_value !== undefined ? parseNum(data.total_property_value) : land + building + temporary;
  setCellText(tables, VF.total_property_value, money(total));
  setCellText(tables, VF.forced_sale_value, money(total * .8));
  setCellText(tables, VF.land_plus_rcc, money(land + building));
  setCellText(tables, VF.land_plus_temp, money(land + parseNum(data.temp_total_value)));
  if (data.comments) setCellText(tables, VF.comments, `COMMENTS : ${data.comments}`);

  const relationships = descendants(rel, 'Relationship');
  const final = relationships.find((r: any) => String(r.getAttribute('Target') || '').endsWith('/image19.png'));
  if (final) {
    const rid = final.getAttribute('Id');
    for (const b of descendants(doc, 'blip')) {
      if (b.getAttributeNS(R_NS, 'embed') === rid || b.getAttribute('r:embed') === rid) {
        let p = b.parentNode;
        while (p && !(p.localName === 'p' || p.nodeName === 'w:p')) p = p.parentNode;
        if (p?.parentNode) p.parentNode.removeChild(p);
      }
    }
    final.parentNode?.removeChild(final);
    zip.remove('word/media/image19.png');
  }

  zip.file('word/document.xml', new XMLSerializer().serializeToString(doc));
  zip.file('word/_rels/document.xml.rels', new XMLSerializer().serializeToString(rel));

  const names = [
    'image3.png', 'image2.png', 'image5.png', 'image4.png', 
    'image7.png', 'image6.png', 'image9.png', 'image8.png', 
    'image12.png', 'image10.png', 'image11.png', 'image13.png',
    'image14.png', 'image15.png', 'image16.png', 'image17.png', 'image18.png'
  ];
  for (let i = 0; i < names.length; i++) {
    const f = photos[i];
    if (f) {
      zip.file(`word/media/${names[i]}`, await imageInTemplate(f, 'png', template?.photoSlots?.[i]?.aspectRatio));
    } else {
      const old = await zip.file(`word/media/${names[i]}`)!.async('nodebuffer');
      zip.file(`word/media/${names[i]}`, await blankLike(old, 'png'));
    }
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

function xmlEscapeText(value: string) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class SharedStringsEditor {
  private original: string;
  private items: string[];
  private added: string[] = [];

  constructor(xml: string) {
    this.original = xml;
    this.items = xml.match(/<si(?:\s[^>]*)?>[\s\S]*?<\/si>/g) ?? [];
  }
  private itemAt(index: number | undefined) {
    if (index === undefined) return undefined;
    return index < this.items.length ? this.items[index] : this.added[index - this.items.length];
  }
  private textOf(item: string | undefined) {
    if (!item) return '';
    const raw = [...item.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)].map(m => m[1]).join('');
    return raw.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  }
  private withValue(proto: string | undefined, value: string) {
    const escaped = xmlEscapeText(value);
    let seen = false;
    if (proto && /<t\b[^>]*>[\s\S]*?<\/t>/.test(proto)) {
      return proto.replace(/(<t\b[^>]*>)([\s\S]*?)(<\/t>)/g, (_m, open: string, _old: string, close: string) => {
        if (seen) return `${open}${close}`; seen = true;
        if (!/\bxml:space=/.test(open)) open = open.replace(/>$/, ' xml:space="preserve">');
        return `${open}${escaped}${close}`;
      });
    }
    return `<si><t xml:space="preserve">${escaped}</t></si>`;
  }
  appendFrom(oldIndex: number | undefined, value: string) {
    const proto = this.itemAt(oldIndex);
    if (oldIndex !== undefined && this.textOf(proto) === value) return oldIndex;
    const item = this.withValue(proto, value);
    const idx = this.items.length + this.added.length;
    this.added.push(item);
    return idx;
  }
  render() {
    if (!this.added.length) return this.original;
    let xml = this.original.replace('</sst>', `${this.added.join('')}</sst>`);
    const total = this.items.length + this.added.length;
    if (/\buniqueCount="\d+"/.test(xml)) xml = xml.replace(/\buniqueCount="\d+"/, `uniqueCount="${total}"`);
    return xml;
  }
}

function setXlsxCellPreservingType(xml: string, cellRef: string, value: string, cellType: string | undefined, shared: SharedStringsEditor, date1904 = false): string {
  const ref = cellRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const self = new RegExp(`<c\\b([^>]*\\br="${ref}"[^>]*)\\s*\\/>`);
  const sm = self.exec(xml);
  const normal = new RegExp(`<c\\b([^>]*\\br="${ref}"[^>]*)>([\\s\\S]*?)<\\/c>`);
  const m = sm ? null : normal.exec(xml);
  if (!m && !sm) {
    const rowNumber = cellRef.match(/\d+$/)?.[0];
    if (!rowNumber) throw new Error(`Invalid spreadsheet cell: ${cellRef}`);
    const rowPattern = new RegExp(`<row\\b([^>]*\\br="${rowNumber}"[^>]*)>([\\s\\S]*?)<\\/row>`);
    const row = rowPattern.exec(xml);
    if (!row) throw new Error(`Template row missing: ${cellRef}`);
    const column = (ref: string) => [...ref.replace(/\d/g, '')].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
    const cells = [...row[2].matchAll(/<c\b[^>]*\br="([A-Z]+)\d+"[^>]*(?:\/>|>[\s\S]*?<\/c>)/g)];
    const next = cells.find(cell => column(cell[1]) > column(cellRef));
    const position = next?.index ?? row[2].length;
    const contents = row[2].slice(0, position) + `<c r="${cellRef}"/>` + row[2].slice(position);
    xml = xml.slice(0,row.index) + `<row${row[1]}>${contents}</row>` + xml.slice(row.index+row[0].length);
    return setXlsxCellPreservingType(xml,cellRef,value,cellType,shared,date1904);
  }

  const attrs = (m ? m[1] : sm![1]).replace(/\/$/, '').trimEnd();
  const inner = (m ? m[2] : '').replace(/<f(?:\s[^>]*)?>[\s\S]*?<\/f>|<f\b[^>]*\/>/g, '');

  let replacement: string;
  if (cellType === 'number' || cellType === 'date') {
    if (cellType === 'date' && value !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Use YYYY-MM-DD for ${cellRef}.`);
      const timestamp = Date.parse(`${value}T00:00:00Z`);
      if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error(`Invalid date for ${cellRef}.`);
      const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31);
      const leapDay = !date1904 && timestamp >= Date.UTC(1900, 2, 1) ? 1 : 0;
      value = String((timestamp - epoch) / 86400000 + leapDay);
    }
    // A blank or N/A reference cell may originally be a shared string.
    const numericAttrs = attrs.replace(/\s+t="[^"]*"/g, '');
    const numericInner = inner.replace(/<is\b[^>]*>[\s\S]*?<\/is>/g, '');
    if (value === '') {
      const newInner = numericInner.replace(/<v\b[^>]*>[\s\S]*?<\/v>/, '');
      replacement = `<c${numericAttrs}>${newInner}</c>`;
    } else {
      const cleaned = String(value).replace(/,/g, '').replace(/Rs\.?/gi, '').replace(/\/-/g, '').trim();
      if (cleaned === '' || !Number.isFinite(Number(cleaned))) throw new Error(`Expected a number for ${cellRef}, received: ${value}`);
      const vm = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(numericInner);
      const newInner = vm ? numericInner.slice(0, vm.index) + vm[0].replace(vm[1], xmlEscapeText(cleaned)) + numericInner.slice(vm.index + vm[0].length) : `${numericInner}<v>${xmlEscapeText(cleaned)}</v>`;
      replacement = `<c${numericAttrs}>${newInner}</c>`;
    }
  } else {
    const vm = /<v\b[^>]*>(\d+)<\/v>/.exec(inner);
    const oldIndex = vm && /\bt="s"/.test(attrs) ? Number(vm[1]) : undefined;
    const idx = shared.appendFrom(oldIndex, value);
    let newInner = inner;
    if (vm) newInner = inner.slice(0, vm.index) + vm[0].replace(vm[1], String(idx)) + inner.slice(vm.index + vm[0].length);
    else newInner = `${inner}<v>${idx}</v>`;
    const stringAttrs = /\bt="[^"]*"/.test(attrs) ? attrs.replace(/\bt="[^"]*"/, 't="s"') : `${attrs} t="s"`;
    replacement = `<c${stringAttrs}>${newInner}</c>`;
  }
  const hit = m ?? sm!;
  return xml.slice(0, hit.index) + replacement + xml.slice(hit.index + hit[0].length);
}

function clearSensitiveFormulaCaches(xml: string, stringInputCells: Set<string>) {
  return xml.replace(/<c\b[^>]*>[\s\S]*?<\/c>/g, (cell: string) => {
    if (!/<f(?:\s|>)/.test(cell)) return cell;
    const vm = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(cell);
    if (!vm) return cell;
    const fm = /<f(?:\s[^>]*)?>([\s\S]*?)<\/f>/.exec(cell);
    const formula = (fm?.[1] ?? '').trim().replace(/\$/g, '');
    const isDirectStringRef = /^[A-Z]+\d+$/i.test(formula) && stringInputCells.has(formula.toUpperCase());
    const raw = vm[1].replace(/&(?:amp|lt|gt|quot|apos);/g, 'x').trim();
    const isNumeric = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][-+]?\d+)?$/.test(raw);
    if (!isDirectStringRef && isNumeric) return cell;
    return cell.slice(0, vm.index) + cell.slice(vm.index + vm[0].length);
  });
}

function blankLayoutFiller(sample: string, kind: 'docx' | 'xlsx') {
  const fill = kind === 'docx' ? '\u2002' : ' ';
  return String(sample ?? '').split('').map(ch => ch === '\n' ? '\n' : ch === '\t' ? '\t' : fill).join('');
}

function sanitizeValue(f: any, kind: 'docx' | 'xlsx') {
  if (f.defaultValue !== undefined && f.defaultValue !== null) return String(f.defaultValue);
  if (f.prefix) return String(f.prefix);
  if (!f.sample) return '';
  if (kind === 'docx') return blankLayoutFiller(String(f.sample), 'docx');
  if (f.cellType !== 'number' && f.cellType !== 'date' && f.layoutBlank !== false) return blankLayoutFiller(String(f.sample), 'xlsx');
  return '';
}

function composedValue(f: any, data: ReportData): string | null {
  if (f.composeTemplate) {
    const refs = [...String(f.composeTemplate).matchAll(/\{([^}]+)\}/g)].map((m: any) => m[1]);
    if (!refs.some((k: string) => String(data[k] ?? '') !== '')) return null;
    return String(f.composeTemplate).replace(/\{([^}]+)\}/g, (_m: string, k: string) => String(data[k] ?? ''));
  }
  const key = f.mirrorOf ?? f.id;
  const raw = data[key];
  if (raw === undefined || raw === null || String(raw) === '') return null;
  return `${f.prefix ?? ''}${raw}${f.suffix ?? ''}`;
}

function expectedFormat(name: string): 'png' | 'jpeg' {
  return /\.png$/i.test(name) ? 'png' : 'jpeg';
}

async function replaceConfiguredPhotos(zip: JSZip, photoMedia: string[], clearMedia: string[], photos: (File | Blob | null)[], slots: {media: string; aspectRatio?: number}[] = []) {
  for (const media of clearMedia) {
    const entry = zip.file(media);
    if (!entry) throw new Error(`Configured case-media target not found in template: ${media}`);
    const old = await entry.async('nodebuffer');
    zip.file(media, await blankLike(old, expectedFormat(media)));
  }
  for (let i = 0; i < photoMedia.length; i++) {
    const media = photoMedia[i];
    const upload = photos[i];
    if (!upload) continue;
    if (!zip.file(media)) throw new Error(`Configured photo slot not found in template: ${media}`);
    zip.file(media, await imageInTemplate(upload, expectedFormat(media), slots.find(slot => slot.media === media)?.aspectRatio));
  }
}

async function generateGeneric(data: ReportData, photos: (File | Blob | null)[], template: any): Promise<Buffer> {
  const raw = await readTemplate(template.source);
  const zip = await JSZip.loadAsync(raw);
  const fields = template.fields ?? [];

  if (template.kind === 'docx') {
    const file = zip.file('word/document.xml');
    if (!file) throw new Error('DOCX template is missing word/document.xml');
    const doc = new DOMParser().parseFromString(await file.async('text'), 'application/xml');
    const body = descendants(doc, 'body')[0];
    const tables = descendants(body, 'tbl');
    const writeDocField = (f: any, value: string) => {
      if (typeof f.paragraphIndex === 'number') setParagraphByIndex(doc, f.paragraphIndex, value);
      else if (typeof f.bodyChild === 'number') setBodyParagraphText(body, f.bodyChild, value);
      else setCellText(tables, [f.table, f.row, f.cell], value);
    };

    for (const f of fields) {
      const value = composedValue(f, data);
      writeDocField(f, value !== null ? value : sanitizeValue(f, 'docx'));
    }
    zip.file('word/document.xml', new XMLSerializer().serializeToString(doc));
  } else {
    const wbFile = zip.file('xl/workbook.xml');
    const relFile = zip.file('xl/_rels/workbook.xml.rels');
    const sharedFile = zip.file('xl/sharedStrings.xml');
    if (!wbFile || !relFile || !sharedFile) throw new Error('XLSX template workbook/shared-string relationships are missing');

    const workbookXml = await wbFile.async('text');
    const wb = new DOMParser().parseFromString(workbookXml, 'application/xml');
    const wr = new DOMParser().parseFromString(await relFile.async('text'), 'application/xml');
    const shared = new SharedStringsEditor(await sharedFile.async('text'));
    const date1904 = ['1', 'true'].includes(descendants(wb, 'workbookPr')[0]?.getAttribute('date1904') || '');
    const rels = Array.from(wr.getElementsByTagName('Relationship')) as any[];
    const ridTarget = new Map(rels.map((r: any) => [r.getAttribute('Id'), String(r.getAttribute('Target') || '')]));
    const bySheet = new Map<string, any[]>();

    for (const f of fields) {
      const list = bySheet.get(f.sheet) || [];
      const over = composedValue(f, data);
      list.push({ cell: f.cell, value: over !== null ? over : sanitizeValue(f, 'xlsx'), cellType: f.cellType });
      bySheet.set(f.sheet, list);
    }

    for (const sh of descendants(wb, 'sheet')) {
      const name = sh.getAttribute('name');
      const rid = sh.getAttributeNS(R_NS, 'id') || sh.getAttribute('r:id');
      let target = ridTarget.get(rid);
      if (!target) continue;
      if (target.startsWith('/')) target = target.slice(1);
      if (!target.startsWith('xl/')) target = 'xl/' + target.replace(/^\.\//, '');
      if (!target.startsWith('xl/worksheets/')) target = 'xl/worksheets/' + target.split('/').pop();
      const sf = zip.file(target);
      if (!sf) continue;
      const stringInputs = new Set<string>((fields.filter((f: any) => f.sheet === name && f.cellType !== 'number' && f.cellType !== 'date')).map((f: any) => String(f.cell).toUpperCase()));
      let xml = clearSensitiveFormulaCaches(await sf.async('text'), stringInputs);
      for (const item of bySheet.get(name) || []) {
        xml = setXlsxCellPreservingType(xml, item.cell, item.value, item.cellType, shared, date1904);
      }
      zip.file(target, xml);
    }
    // Drop unused template strings, including the previous customer's values.
    const rendered = shared.render();
    const items = rendered.match(/<si(?:\s[^>]*)?>[\s\S]*?<\/si>/g) ?? [];
    const used = new Map<number, number>();
    let references = 0;
    for (const path of Object.keys(zip.files).filter(path => /^xl\/worksheets\/[^/]+\.xml$/.test(path))) {
      const xml = await zip.file(path)!.async('text');
      zip.file(path, xml.replace(/<c\b[^>]*\bt="s"[^>]*>[\s\S]*?<\/c>/g, cell => cell.replace(/<v>(\d+)<\/v>/, (_match, index) => {
        const old = Number(index);
        if (!items[old]) throw new Error('Invalid shared string reference in report template');
        if (!used.has(old)) used.set(old, used.size);
        references++;
        return `<v>${used.get(old)}</v>`;
      })));
    }
    const open = rendered.match(/<sst\b[^>]*>/)?.[0];
    if (!open) throw new Error('Invalid shared strings in report template');
    const cleanOpen = open.replace(/\s(?:count|uniqueCount)="[^"]*"/g, '').replace(/>$/, ` count="${references}" uniqueCount="${used.size}">`);
    zip.file('xl/sharedStrings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${cleanOpen}${[...used.keys()].map(index => items[index]).join('')}</sst>`);
    zip.file('xl/workbook.xml', workbookXml);
  }

  await replaceConfiguredPhotos(zip, template.photoMedia ?? [], template.clearMedia ?? template.photoMedia ?? [], photos, template.photoSlots);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

/** Clear text highlights, including inherited styles, without changing table design. */
async function whiteTextBackgrounds(buffer: Buffer): Promise<Buffer> {
  const zip = await JSZip.loadAsync(buffer);
  for (const name of Object.keys(zip.files).filter(name => /^word\/.*\.xml$/.test(name))) {
    const xml = await zip.file(name)!.async('text');
    if (!/w:(?:highlight|shd)/.test(xml)) continue;
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    stripRunHighlighting(doc);
    zip.file(name, new XMLSerializer().serializeToString(doc));
  }
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

export async function generateReport(reportId: string, data: ReportData, photos: (File | Blob | null)[], template: any) {
  if (reportId === 'veritas') {
    return {
      buffer: await whiteTextBackgrounds(await generateVeritas(data, photos, template)),
      extension: 'docx' as const,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }
  return {
    buffer: template.kind === 'docx' ? await whiteTextBackgrounds(await generateGeneric(data, photos, template)) : await generateGeneric(data, photos, template),
    extension: template.kind,
    contentType: template.kind === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
}
