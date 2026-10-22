// Reproducible, local-only audit of the application's actual report generator.
// Run from hem_portal: node ../qa/template-audit.cjs
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const req = createRequire(path.resolve('package.json'));
const ts = req('typescript');
const JSZip = req('jszip');
const sharp = req('sharp');
const { DOMParser } = req('@xmldom/xmldom');
const root = path.resolve(process.env.QA_OUTPUT || '../qa/runs/2026-09-26');
const templateCode = ts.transpileModule(fs.readFileSync('src/lib/report-engine/templates.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const templateModule = { exports: {} };
const templateRequire = createRequire(path.resolve('src/lib/report-engine/templates.ts'));
new Function('require', 'module', 'exports', templateCode)(templateRequire, templateModule, templateModule.exports);
const templates = templateModule.exports.templates;
fs.mkdirSync(path.join(root, 'fixtures'), { recursive: true });
fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
fs.writeFileSync(path.join(root, 'fixtures/templates.json'), JSON.stringify(templates, null, 2));
const code = ts.transpileModule(fs.readFileSync('src/lib/report-engine/report.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText;
const mod = { exports: {} };
new Function('require', 'module', 'exports', code)(req, mod, mod.exports);
const codes = {'veritas':'VERITAS','aditya-birla-lap':'ADITYA','axis-finance':'AXIS','chola-sme':'CHOLA','equitas':'EQUITAS','icici':'ICICI','jm-finance':'JM','kreditbee':'KREDITBEE','niwas-finance':'NIWAS','smfg-lap':'SMFG','smfg-rural-lap':'SMFG-RURAL','tyger-finance':'TYGER','ugrow':'UGROW','ummeed':'UMMEED'};
function standard(t) {
  return { application_number: `QA-20260926-${codes[t.id]}`, applicant_name: `QA ONLY ${codes[t.id]} Applicant`, owner_name:'QA Test Owner', phone_number:'0000000000', address:'QA ONLY Plot 17, Synthetic Layout, Bengaluru', branch:'QA Bengaluru', state:'Karnataka', property_type:'Residential', latitude:'12.9716', longitude:'77.5946', pincode:'560001', city:'Bengaluru', visit_date:'2026-09-26', person_met_at_site:'QA Test Owner', relationship_with_customer:'Self', distance_from_branch:'5', previous_valuation:'No', ownership_type:'Free Hold', property_documents_verified:'Synthetic QA document only', boundaries_document_east:'QA 30 ft road',boundaries_document_west:'QA Plot 18',boundaries_document_north:'QA Plot 16',boundaries_document_south:'QA Park',boundaries_physical_east:'QA 30 ft road',boundaries_physical_west:'QA Plot 18',boundaries_physical_north:'QA Plot 16',boundaries_physical_south:'QA Park',boundaries_matching:'Yes',setback_front:'5',setback_rear:'3',setback_left:'3',setback_right:'3', land_measurements_east:'40',land_measurements_west:'40',land_measurements_north:'30',land_measurements_south:'30',plinth_measurements_east:'30',plinth_measurements_west:'30',plinth_measurements_north:'30',plinth_measurements_south:'30',slab_measurements_east:'30',slab_measurements_west:'30',slab_measurements_north:'30',slab_measurements_south:'30',no_of_floors:'2',floor_valued:'Ground and first',no_of_units:'1',age_of_property:'5',residual_life:'55',quality_of_construction:'Good',interiors_exteriors:'Good',class_of_locality:'Residential',site_developed:'Developed',proximity_amenities:'Within 2 km',within_municipal_limits:'Yes',panchayat_name:'QA municipality',site_access:'Easy',basic_amenities:'Near By',marketability:'Good',high_tension_wires:'No',area_left_for_cross:'0',joint_wall_slab:'No',graveyard_nearby:'No',land_area:'1200',land_rate:'4000',bua:'1800',construction_rate:'1800',stage_of_construction:'Completed',stage_percentage:'100%',recommended_percentage:'80%',remarks_and_violations:'SYNTHETIC QA ONLY. Do not use for lending or valuation.' };
}
function mockValue(f, i, common) {
  const label=f.label.toLowerCase();
  if (f.cellType === 'number') {
    if (/date/.test(label)) return '46291';
    if (/pin/.test(label)) return '560001';
    if (/mobile|contact|phone/.test(label)) return '0';
    if (/rate/.test(label)) return '4000';
    if (/value|cost|amount/.test(label)) return '4800000';
    if (/area/.test(label)) return '1200';
    if (/age/.test(label)) return '5';
    if (/life/.test(label)) return '55';
    return String(10 + i);
  }
  if (common[f.id] !== undefined) return common[f.id];
  if (/application|reference|request id|deal number|proposal number|ref\. no|los id/.test(label)) return common.application_number;
  if (/applicant|customer|client name/.test(label)) return common.applicant_name;
  if (/owner|holder/.test(label)) return 'QA Test Owner';
  if (/address/.test(label)) return common.address;
  if (/date/.test(label)) return '26-09-2026';
  if (/branch/.test(label)) return common.branch;
  if (/phone|mobile|contact/.test(label)) return '0000000000';
  if (/latitude/.test(label)) return '12.9716';
  if (/longitude/.test(label)) return '77.5946';
  if (/pin code|pincode/.test(label)) return '560001';
  if (/state/.test(label)) return 'Karnataka';
  if (/district|city/.test(label)) return 'Bengaluru';
  if (/type of property|property type|usage/.test(label)) return 'Residential';
  if (/land value|building value|total property value|sale value|insurance value/.test(label)) return '4800000';
  if (/rate|value|amount|cost/.test(label)) return '4000';
  if (/area|sft|bua/.test(label)) return '1200';
  if (/east|west|north|south|boundary/.test(label)) return 'QA boundary road';
  if (/remark|comment|document|detail|observation/.test(label)) return 'QA ONLY synthetic inspection. No real property or lending decision.';
  return `QA ${String(i+1).padStart(3,'0')}`;
}
const nodes=(n,tag)=>Array.from(n.getElementsByTagName(tag));
const text=n=>n?nodes(n,'w:t').map(x=>x.textContent).join(''):null;
function docValue(doc,f){
 if(typeof f.paragraphIndex==='number')return text(nodes(doc,'w:p')[f.paragraphIndex]);
 if(typeof f.bodyChild==='number')return text(Array.from(nodes(doc,'w:body')[0].childNodes).filter(n=>n.nodeType===1)[f.bodyChild]);
 const tbl=nodes(doc,'w:tbl')[f.table];const row=tbl&&nodes(tbl,'w:tr')[f.row];return text(row&&nodes(row,'w:tc')[f.cell]);
}
async function xlsxValues(zip) {
 const parse=async p=>new DOMParser().parseFromString(await zip.file(p).async('text'),'application/xml');
 const shared=nodes(await parse('xl/sharedStrings.xml'),'si').map(si=>nodes(si,'t').map(t=>t.textContent).join(''));
 const rels=new Map(nodes(await parse('xl/_rels/workbook.xml.rels'),'Relationship').map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
 const result={};
 for(const s of nodes(await parse('xl/workbook.xml'),'sheet')) {let p=rels.get(s.getAttribute('r:id'));p=p.startsWith('/')?p.slice(1):'xl/'+p;const doc=await parse(p);for(const c of nodes(doc,'c')){const v=nodes(c,'v')[0]?.textContent;result[s.getAttribute('name')+'!'+c.getAttribute('r')]=c.getAttribute('t')==='s'?shared[Number(v)]:c.getAttribute('t')==='inlineStr'?nodes(c,'t').map(t=>t.textContent).join(''):v??'';}}
 return result;
}
async function main(){
 const image=await sharp(path.join(root,'fixtures/synthetic-property.png')).resize({width:1000}).jpeg({quality:82}).toBuffer();
 fs.writeFileSync(path.join(root,'fixtures/synthetic-property.jpg'),image);
 const results=[];
 for(const t of templates){
  const common=standard(t);const data={...common};for(const [i,f]of t.fields.entries())if(!f.hidden)data[f.id]=mockValue(f,i,common);
  if(t.id==='veritas')Object.assign(data,{land_value:'4800000',total_building_value:'3240000',temp_total_value:'0',total_property_value:'8040000'});
  fs.writeFileSync(path.join(root,`fixtures/${t.id}.json`),JSON.stringify({template:t.id,common,data,photoCount:t.photoCount},null,2));
  const r={template:t.id,kind:t.kind,fields:t.fields.length,photos:t.photoCount,checks:[],mismatches:[]};
  try{
   const out=await mod.exports.generateReport(t.id,data,Array.from({length:t.photoCount},()=>new Blob([image],{type:'image/jpeg'})),t);
   fs.writeFileSync(path.join(root,`reports/${t.id}.${out.extension}`),out.buffer);
   const zip=await JSZip.loadAsync(out.buffer,{checkCRC32:true});r.bytes=out.buffer.length;
   const main=t.kind==='docx'?await zip.file('word/document.xml').async('text'):null;
   if(t.id!=='veritas'){
    const doc=main?new DOMParser().parseFromString(main,'application/xml'):null;const cells=doc?null:await xlsxValues(zip);
    for(const f of t.fields){const expected=f.composeTemplate?f.composeTemplate.replace(/\{([^}]+)\}/g,(_,k)=>String(data[k]??'')):`${f.prefix??''}${data[f.mirrorOf??f.id]??f.defaultValue??''}${f.suffix??''}`;const actual=doc?docValue(doc,f):cells[f.sheet+'!'+f.cell];if(String(actual)!==expected)r.mismatches.push({id:f.id,label:f.label,expected,actual});}
   }else{
    for(const f of t.fields.filter(f=>!['total_property_value','forced_sale_value','land_plus_rcc','land_plus_temp'].includes(f.id))){if(!main.includes(String(data[f.id]).replaceAll('&','&amp;').replaceAll('<','&lt;')))r.mismatches.push({id:f.id,label:f.label,expected:data[f.id]});}
    r.calculations={total:main.includes('80,40,000'),forcedSale:main.includes('64,32,000')};
   }
   const media=t.id==='veritas'?['image3.png','image2.png','image5.png','image4.png','image7.png','image6.png','image9.png','image8.png','image12.png','image10.png','image11.png','image13.png','image14.png','image15.png','image16.png','image17.png','image18.png'].map(p=>'word/media/'+p):t.photoMedia;
   r.photoChecks=[];for(const p of media){const bytes=await zip.file(p).async('nodebuffer');const ratio=t.photoSlots?.find(slot=>slot.media===p)?.aspectRatio;let prepared=sharp(image).rotate();if(ratio)prepared=prepared.resize({width:2400,height:Math.max(1,Math.round(2400/ratio)),fit:'contain',background:'#ffffff'});const expected=await prepared.toFormat(p.endsWith('.png')?'png':'jpeg').toBuffer();r.photoChecks.push({path:p,pass:bytes.equals(expected)});}
   const blank=await mod.exports.generateReport(t.id,{},[],t);const emptyZip=await JSZip.loadAsync(blank.buffer);fs.writeFileSync(path.join(root,`reports/${t.id}-empty.${out.extension}`),blank.buffer);
   const blankText=t.kind==='docx'?await emptyZip.file('word/document.xml').async('text'):JSON.stringify(await xlsxValues(emptyZip));
   // These exact cells are reviewed static headings or validation-list options, not customer fields.
   const reviewedCells = {'jm-finance':['C710','I696','I723','C327'],'tyger-finance':['C72'],'ugrow':['B20']};
   const blankCells = t.kind === 'xlsx' ? await xlsxValues(emptyZip) : null;
   r.reviewedStaticText=[];
   r.blankSampleFlags=[];
   for(const f of t.fields.filter(f=>f.sample?.trim().length>18)) {
     const sample=f.sample.trim();
     if(blankCells) {
       const matches=Object.entries(blankCells).filter(([,value])=>String(value).includes(sample));
       const unexpected=matches.filter(([address])=>!(reviewedCells[t.id]??[]).includes(address.split('!').pop()));
       if(unexpected.length) r.blankSampleFlags.push({id:f.id,label:f.label,cells:unexpected.map(([address])=>address)});
       else if(matches.length) r.reviewedStaticText.push({id:f.id,cells:matches.map(([address])=>address),reason:'Fixed heading or validation-list option'});
     } else if(blankText.includes(sample.replaceAll('&','&amp;'))) r.blankSampleFlags.push({id:f.id,label:f.label});
   }
   if(t.kind==='xlsx') {
     const sharedXml=await emptyZip.file('xl/sharedStrings.xml').async('text');
     const strings=nodes(new DOMParser().parseFromString(sharedXml,'application/xml'),'si').map(si=>nodes(si,'t').map(t=>t.textContent).join(''));
     const cellValues=new Set(Object.values(blankCells).map(String));
     r.unusedSharedStrings=strings.filter(value=>!cellValues.has(value)).length;
   }
   r.result=r.mismatches.length||r.photoChecks.some(p=>!p.pass)||r.blankSampleFlags.length||r.unusedSharedStrings||r.calculations&&Object.values(r.calculations).some(v=>!v)?'FAIL':'PASS';
  }catch(e){r.result='FAIL';r.error=e.message;}
  results.push(r);console.log(t.id,r.result,'field mismatches',r.mismatches.length,'blank sample flags',r.blankSampleFlags?.length??0);
  fs.writeFileSync(path.join(root,'template-results.json'),JSON.stringify(results,null,2));
 }
 if(results.some(r=>r.result!=='PASS')) process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
