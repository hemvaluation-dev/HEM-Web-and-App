"""One-time OOXML maintenance: full-width screenshot frames, preserving report fields.
Run from repository root with lxml installed. Registry photoLayoutVersion makes it idempotent.
No customer media is added. ICICI has separately measured fixed frames in the
registry (its Zurich font and hidden columns differ from the Calibri templates).
Preserve those frameExtent values and independently cloned image relationships. Reflow only the audited, static photo sections of spreadsheets.
"""
import json, re, zipfile, posixpath
from pathlib import Path
from lxml import etree as E
BASE = Path('hem_portal')
REG = BASE / 'template-registry.json'
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
S = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
D = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
A = 'http://schemas.openxmlformats.org/drawingml/2006/main'
WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
def tag(ns,n): return '{'+ns+'}'+n
def parse(b): return E.fromstring(b)
def xml(e): return E.tostring(e,xml_declaration=True,encoding='UTF-8',standalone=True)
def relations(files,part):
 p=posixpath.join(posixpath.dirname(part),'_rels',posixpath.basename(part)+'.rels')
 return {x.get('Id'):posixpath.normpath(posixpath.join(posixpath.dirname(part),x.get('Target'))).lstrip('/') for x in parse(files[p])}
def colnum(s):
 n=0
 for c in s: n=n*26+ord(c)-64
 return n-1
def colname(i):
 s='';i+=1
 while i: i,r=divmod(i-1,26);s=chr(65+r)+s
 return s
# Inclusive one-based static photo sections, verified against all mapped report cells.
AREAS={'axis-finance':(119,137,12,3),'icici':(135,188,15,2),'jm-finance':(359,487,11,3),
 'niwas-finance':(163,313,4,2),'smfg-rural-lap':(152,277,6,2),'tyger-finance':(105,257,6,2),
 'ugrow':(119,238,5,2),'kreditbee':(127,249,11,2)}
registry=json.loads(REG.read_text())
# These three source values were photo captions, not editable report data.
for t in registry:
 t['fields']=[f for f in t['fields'] if f.get('id') not in ['jm-finance_104','jm-finance_105','tyger-finance_87']]
veritas_text=(BASE/'src/lib/report-engine/templates.ts').read_text()
veritas_slots=[]
for m in re.finditer(r"\{media:'([^']+)',label:'([^']+)',photoTypes:\[([^\]]+)\],fullWidth:(true|false)\}",veritas_text):
 veritas_slots.append({'media':m[1],'label':m[2],'fullWidth':m[4]=='true'})
veritas={'id':'veritas','source':'veritas.docx','kind':'docx','photoSlots':veritas_slots}
prepared=[]
for t in registry+[veritas]:
 if t.get('photoLayoutVersion')==1: continue
 path=BASE/'public/templates'/t['source']
 with zipfile.ZipFile(path) as z: files={n:z.read(n) for n in z.namelist()}
 slots={s['media']:s for s in t['photoSlots']}
 if t['kind']=='docx':
  part='word/document.xml';root=parse(files[part]);rels=relations(files,part)
  sect=root.find('.//'+tag(W,'sectPr'));sz=sect.find(tag(W,'pgSz'));mar=sect.find(tag(W,'pgMar'))
  usable=int(sz.get(tag(W,'w')))-int(mar.get(tag(W,'left')))-int(mar.get(tag(W,'right')))
  for blip in root.iter(tag(A,'blip')):
   slot=slots.get(rels.get(blip.get(tag(R,'embed'))))
   if not slot or not slot.get('fullWidth'): continue
   frame=next((p for p in blip.iterancestors() if p.tag in [tag(WP,'inline'),tag(WP,'anchor')]),None)
   if frame is None: continue
   ext=frame.find(tag(WP,'extent'));height=int(ext.get('cy'))
   cell=next((p for p in frame.iterancestors() if p.tag==tag(W,'tc')),None)
   cellw=cell.find('.//'+tag(W,'tcW')) if cell is not None else None
   width=min(usable,int(cellw.get(tag(W,'w'))) if cellw is not None and cellw.get(tag(W,'type'))=='dxa' else usable)
   width=max(1,width-216)*635 # retain normal Word cell padding on both sides
   ext.set('cx',str(width))
   for x in frame.findall('.//'+tag(A,'xfrm')+'/'+tag(A,'ext')): x.set('cx',str(width));x.set('cy',str(height))
   for crop in frame.findall('.//'+tag(A,'srcRect')): crop.getparent().remove(crop)
   for effect in frame.findall(tag(WP,'effectExtent')):
    for k in ['l','r','t','b']: effect.set(k,'0')
   slot['aspectRatio']=width/height
  files[part]=xml(root)
 else:
  start,end,cols,grid=AREAS[t['id']]
  # Assert field mappings cannot be erased by photo-section reflow.
  for f in t['fields']:
   cell=f.get('cell','');m=re.search(r'(\d+)$',cell)
   assert not(m and start<=int(m[1])<=end), (t['id'],f)
  for sheetpart in [p for p in files if re.match(r'xl/worksheets/sheet\d+\.xml$',p)]:
   sheet=parse(files[sheetpart]);drawing=sheet.find(tag(S,'drawing'))
   if drawing is None: continue
   part=relations(files,sheetpart)[drawing.get(tag(R,'id'))];root=parse(files[part]);rels=relations(files,part)
   entries=[]
   rows=sheet.find(tag(S,'sheetData'));rowmap={int(r.get('r')):r for r in rows}
   default=float(sheet.find(tag(S,'sheetFormatPr')).get('defaultRowHeight','15'))
   def y(marker):
    row=int(marker.find(tag(D,'row')).text)
    return sum(float(rowmap[i].get('ht',str(default))) if i in rowmap else default for i in range(1,row+1))*12700+int(marker.find(tag(D,'rowOff')).text)
   for anchor in root:
    b=anchor.find('.//'+tag(A,'blip'));slot=slots.get(rels.get(b.get(tag(R,'embed')))) if b is not None else None
    if slot is None: continue
    fr=anchor.find(tag(D,'from'));to=anchor.find(tag(D,'to'))
    assert fr is not None and to is not None
    height=max(90,min(360,(y(to)-y(fr))/12700))
    entries.append((y(fr),int(fr.find(tag(D,'col')).text),anchor,slot,height))
   if not entries: continue
   entries.sort(key=lambda e:(e[0],e[1]))
   widths=[64.0]*cols
   for c in sheet.findall('.//'+tag(S,'col')):
    for i in range(int(c.get('min'))-1,min(cols,int(c.get('max')))): widths[i]=int(float(c.get('width','8.43'))*7+5)
   total=sum(widths)*9525
   def xpos(x):
    for i,w in enumerate(widths):
     if x<=w*9525 or i==len(widths)-1: return i,round(x)
     x-=w*9525
   def marker(el,x,row,yoff):
    c,off=xpos(x)
    for key,val in [('col',c),('colOff',off),('row',row-1),('rowOff',yoff)]:el.find(tag(D,key)).text=str(round(val))
   # Keep every field/formula outside this audited range byte-for-byte in place.
   for n in range(start,end+1):
    r=rowmap.get(n)
    if r is None: r=E.Element(tag(S,'row'),r=str(n));rows.append(r);rowmap[n]=r
    for c in list(r):r.remove(c)
    r.set('ht','1');r.set('customHeight','1')
   merges=sheet.find(tag(S,'mergeCells'))
   if merges is None: raise ValueError('Expected existing mergeCells')
   for m in list(merges):
    nums=[int(x) for x in re.findall(r'\d+',m.get('ref'))]
    if start<=min(nums)<=end or start<=max(nums)<=end:
     assert min(nums)>=start and max(nums)<=end,(t['id'],m.get('ref'))
     merges.remove(m)
   bands=[];pending=[]
   for entry in entries:
    if entry[3].get('fullWidth'):
     if pending:bands.append(pending);pending=[]
     bands.append([entry])
    else:
     pending.append(entry)
     if len(pending)==grid:bands.append(pending);pending=[]
   if pending:bands.append(pending)
   assert start+len(bands)*2-1<=end,(t['id'],len(bands))
   for i,band in enumerate(bands):
    caption=start+i*2;image=caption+1;height=max(e[4] for e in band)
    rowmap[caption].set('ht','18');rowmap[image].set('ht',str(height+3))
    wide=band[0][3].get('fullWidth');count=1 if wide else grid
    for j,(_,_,anchor,slot,_) in enumerate(band):
     anchor.attrib.pop('editAs',None)
     leftcol=round(j*cols/count);rightcol=round((j+1)*cols/count)-1
     left=sum(widths[:leftcol])*9525;right=sum(widths[:rightcol+1])*9525
     marker(anchor.find(tag(D,'from')),left,image,0);marker(anchor.find(tag(D,'to')),right-9525,image,height*12700)
     width=round(right-left-9525);cy=round(height*12700)
     for ext in anchor.findall('.//'+tag(A,'xfrm')+'/'+tag(A,'ext')):ext.set('cx',str(width));ext.set('cy',str(cy))
     for crop in anchor.findall('.//'+tag(A,'srcRect')):crop.getparent().remove(crop)
     slot['aspectRatio']=width/cy
     cell=E.SubElement(rowmap[caption],tag(S,'c'),r=f'{colname(leftcol)}{caption}',t='inlineStr')
     inline=E.SubElement(cell,tag(S,'is'));E.SubElement(inline,tag(S,'t')).text=slot['label']
     if rightcol>leftcol:E.SubElement(merges,tag(S,'mergeCell'),ref=f'{colname(leftcol)}{caption}:{colname(rightcol)}{caption}')
   merges.set('count',str(len(merges)))
   for r in list(rows):rows.remove(r)
   for n in sorted(rowmap):rows.append(rowmap[n])
   setup=sheet.find(tag(S,'pageSetup'))
   if setup is not None:setup.set('fitToWidth','1');setup.set('fitToHeight','0');setup.attrib.pop('scale',None)
   props=sheet.find(tag(S,'sheetPr'))
   if props is None:props=E.Element(tag(S,'sheetPr'));sheet.insert(0,props)
   fit=props.find(tag(S,'pageSetUpPr'))
   if fit is None:fit=E.SubElement(props,tag(S,'pageSetUpPr'))
   fit.set('fitToPage','1')
   breaks=sheet.find(tag(S,'rowBreaks'))
   if breaks is not None:
    for br in list(breaks):
     if start<=int(br.get('id'))<=end:breaks.remove(br)
    breaks.set('count',str(len(breaks)));breaks.set('manualBreakCount',str(len(breaks)))
   files[part]=xml(root);files[sheetpart]=xml(sheet)
 prepared.append((path,files))
 t['photoLayoutVersion']=1
 print(t['id'],len(slots),'slots prepared')
for path,files in prepared:
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
  for n,b in files.items():z.writestr(n,b)
REG.write_text(json.dumps(registry,indent=2,ensure_ascii=False)+'\n')
# Veritas has a handwritten field registry; keep its measured frame ratios there.
for s in veritas_slots:
 if 'aspectRatio' in s:
  pattern=r"(\{media:'"+re.escape(s['media'])+r"'[^\n]+fullWidth:true)(\})"
  veritas_text=re.sub(pattern,lambda m:m[1]+',aspectRatio:'+str(s['aspectRatio'])+m[2],veritas_text)
(BASE/'src/lib/report-engine/templates.ts').write_text(veritas_text)

# Keep captions and their image row on the same printed page. Excel can otherwise
# split a floating picture even when its anchor belongs to a single tall row.
for t in registry:
 if t['kind']!='xlsx':continue
 path=BASE/'public/templates'/t['source'];start,end,_,_=AREAS[t['id']]
 with zipfile.ZipFile(path) as z:files={n:z.read(n) for n in z.namelist()}
 for part in [p for p in files if re.match(r'xl/worksheets/sheet\d+\.xml$',p)]:
  root=parse(files[part]);rows={int(r.get('r')):r for r in root.findall('.//'+tag(S,'sheetData')+'/'+tag(S,'row'))}
  if not any(start<=n<=end and r.get('ht')=='18' for n,r in rows.items()):continue
  breaks=root.find(tag(S,'rowBreaks'))
  if breaks is None:
   breaks=E.Element(tag(S,'rowBreaks'))
   # rowBreaks follows pageSetup/headerFooter and precedes drawings in ECMA order.
   before=next((c for c in root if E.QName(c).localname in ['colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst']),None)
   if before is not None:root.insert(root.index(before),breaks)
   else:root.append(breaks)
  for br in list(breaks):
   if start-1<=int(br.get('id'))<=end:breaks.remove(br)
  # Convert the printable page budget into unscaled row points. Wide lender
  # sheets shrink to fit the page, allowing several evidence frames per page.
  _,_,cols,_=AREAS[t['id']]
  widths=[64.0]*cols
  for c in root.findall('.//'+tag(S,'col')):
   for i in range(int(c.get('min'))-1,min(cols,int(c.get('max')))):widths[i]=int(float(c.get('width','8.43'))*7+5)
  margins=root.find(tag(S,'pageMargins'))
  horizontal=sum(float(margins.get(k,'0.5')) for k in ['left','right'])*72
  vertical=sum(float(margins.get(k,'0.5')) for k in ['top','bottom'])*72
  scale=min(1,(595-horizontal)/(sum(widths)*.75))
  budget=(792-vertical-55)/scale
  used=budget
  for n in range(start,end):
   if rows.get(n) is None or rows[n].get('ht')!='18':continue
   height=18+float(rows[n+1].get('ht','15'))
   if used+height>budget:
    E.SubElement(breaks,tag(S,'brk'),id=str(n-1),min='0',max='16383',man='1');used=0
   used+=height
  ordered=sorted(breaks,key=lambda b:int(b.get('id')))
  for b in list(breaks):breaks.remove(b)
  for b in ordered:breaks.append(b)
  breaks.set('count',str(len(breaks)));breaks.set('manualBreakCount',str(len(breaks)))
  files[part]=xml(root)
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
  for n,b in files.items():z.writestr(n,b)
