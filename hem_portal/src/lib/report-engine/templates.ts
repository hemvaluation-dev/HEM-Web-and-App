import registry from '../../../template-registry.json';

export type FieldDef = {
  id:string; label:string; sample?:string; prefix?:string; suffix?:string; defaultValue?:string; mirrorOf?:string; composeTemplate?:string; hidden?:boolean; multiline?:boolean; layoutBlank?:boolean;
  table?:number; row?:number; cell?:number|string; sheet?:string; section?:string; bodyChild?:number; paragraphIndex?:number; cellType?:string; sourceKey?:string;
};
export type PhotoSlotDef = {media:string; label:string; photoTypes?:string[]; fullWidth?:boolean; aspectRatio?:number};
export type TemplateDef = {
  id:string; client:string; source:string; kind:'docx'|'xlsx'; fields:FieldDef[];
  photoCount?:number; photoMedia?:string[]; photoSlots?:PhotoSlotDef[]; clearMedia?:string[];
};

const veritasFields: FieldDef[] = [
  ['application_number','Application number'],['branch','Branch'],['product','Product'],['phone','Phone number'],['applicant_name','Applicant name'],['co_applicant_name',"Co-applicant's name"],['inspection_date','Date of inspection'],['inspected_by','Inspected by'],['authorised_signature','Authorised signature'],['document_holder_name','Document holder name'],['property_type','Property type'],['property_type_other','If others — property type'],['method_valuation','Method of valuation'],['property_address','Property address'],['district','District'],['state','State'],['pincode','Pincode'],['latitude','Latitude'],['longitude','Longitude'],['nearest_landmark','Nearest landmark'],['branch_distance','Distance from nearest Veritas branch'],['civic_status','Civic status'],['civic_status_other','If others — civic status'],['nhb_1991','NHB — 1991'],['nhb_2011','NHB — 2011'],['owner_title_deed',"Owner's name as per title deed / document number"],['title_deed_details','Number of title deed involved with details'],['ownership_type','Ownership type'],['usage','Usage of property'],['usage_other','If others — usage'],['occupancy','Occupancy status'],['approved_plan','Approved plan'],['deviation','Deviation observed'],['floors','Number of floors'],['residential_units','Residential units'],['commercial_units','Commercial units'],['total_units','Total number of units'],['more_than_2_units','More than 2 units (CRE)'],['property_identification','Property identification'],['marketability','Marketability'],['building_age','Age of building'],['future_life','Estimated future life'],['east_title','East — as per title deed'],['east_actual','East — as per actual'],['west_title','West — as per title deed'],['west_actual','West — as per actual'],['north_title','North — as per title deed'],['north_actual','North — as per actual'],['south_title','South — as per title deed'],['south_actual','South — as per actual'],['documents_list','Documents given for site visit'],['purchase_property','Whether property is a purchase property'],['agreement_between','Agreement entered between'],['agreement_value','Agreement value'],['agreement_date','Agreement date'],['agreement_validity','Agreement validity'],['roof','Roof'],['flooring','Flooring'],['eb_service','EB service number'],['meter_number','Meter number'],['property_tax','Property tax'],['plot_demarcated','Plot demarcated'],['road_width','Approximate road width'],['passage_less_10ft','Passage less than 10ft'],['passage_width','Passage width'],['distance_main_road','Distance from abutting main road / street'],['locality','Nature of locality'],['location_surrounding','Location & surrounding'],['facilities','Facility available'],['water_supply','Water supply arrangement'],['drainage','Drainage arrangement'],['condition','Condition of property'],['rental_value','Approximate rental value per month'],['land_sft','Land in Sft'],['glv_sft_sro','GLV/SFT wrt SRO rates'],['glv_land','GLV of land'],['market_range_sft','Market value range per SFT'],['rate_sft','Rate per SQFT adopted'],['land_value','Land value'],['existing_bua','Existing BUA'],['proposed_bua','Proposed BUA'],['total_bua','Total BUA'],['carpet_area','Total carpet area'],['existing_building_value','Existing building value'],['proposed_building_value','Proposed building value'],['enhancement','Enhancement / improvements'],['additional_cost','Additional cost'],['total_building_value','Total building value'],['temp_existing_bua','Temporary roof existing BUA'],['temp_carpet_area','Temporary roof carpet area'],['temp_rate_sft','Temporary roof rate per sqft'],['temp_existing_value','Temporary roof existing building value'],['temp_additional_cost','Temporary roof additional cost'],['temp_total_value','Temporary roof total building value'],['land_plus_rcc','Land value + RCC building value'],['land_plus_temp','Land value + temporary building value'],['total_property_value','Total property value'],['forced_sale_value','Forced / distress sale value'],['work_progress','Percentage of work progress'],['construction_stage','Stage of construction'],['insurance_value','Considered value for property insurance'],['proposal_number','Proposal number'],['existing_loan_amount','Existing sanctioned loan amount'],['request_loan_amount','Request loan amount'],['sanctioned_loan_amount','Sanctioned loan amount'],['lcr','LCR'],['ltv','LTV'],['combined_ltv','Combined LTV'],['structure','Type of structure'],['hazardous_zones','Hazardous zones applicable'],['geometry','Geometry / design / structural configurations met'],['recommended','Recommended'],['comments','Comments']
].map(([id,label])=>({id,label}));

export const veritas: TemplateDef = {id:'veritas',client:'H.E.M. Associates / Veritas',source:'veritas.docx',kind:'docx',fields:veritasFields,photoCount:17, photoSlots: [
{media:'word/media/image3.png',label:'Property elevation',photoTypes:['Elevation Photo'],fullWidth:false,aspectRatio:1.1465798045602607},
{media:'word/media/image2.png',label:'Approach road',photoTypes:['Road Photo'],fullWidth:false,aspectRatio:1.0592105263157894},
{media:'word/media/image5.png',label:'Selfie at property',photoTypes:['Selfie'],fullWidth:false,aspectRatio:1.1513157894736843},
{media:'word/media/image4.png',label:'Bedroom',photoTypes:['Bedroom'],fullWidth:false,aspectRatio:1.3381889763779529},
{media:'word/media/image7.png',label:'Kitchen',photoTypes:['Kitchen'],fullWidth:false,aspectRatio:1.0125391849529781},
{media:'word/media/image6.png',label:'Hall',photoTypes:['Hall'],fullWidth:false,aspectRatio:1.07375},
{media:'word/media/image9.png',label:'Interior room',photoTypes:['Bedroom'],fullWidth:false,aspectRatio:0.9817142857142858},
{media:'word/media/image8.png',label:'Electricity meter',photoTypes:['Meter'],fullWidth:false,aspectRatio:0.9145299145299145},
{media:'word/media/image12.png',label:'Power bill',photoTypes:['Power Bill'],fullWidth:false,aspectRatio:0.9767241379310345},
{media:'word/media/image10.png',label:'Person at site',photoTypes:['Selfie'],fullWidth:false,aspectRatio:1.1155844155844157},
{media:'word/media/image11.png',label:'Setback',photoTypes:['Set Back Photos'],fullWidth:false,aspectRatio:0.9952076677316294},
{media:'word/media/image13.png',label:'Interior room 2',photoTypes:['Hall'],fullWidth:false,aspectRatio:1.08801261829653},
{media:'word/media/image14.png',label:'Government rate screenshot',photoTypes:['Others - Government Rate Screenshot'],fullWidth:true,aspectRatio:1.9039120245177574},
{media:'word/media/image15.png',label:'Prohibited property screenshot',photoTypes:['Others - Prohibited Property Screenshot'],fullWidth:true,aspectRatio:3.1619760479041914},
{media:'word/media/image16.png',label:'Cadastral / BhuNaksha map',photoTypes:['Others - Cadastral / BhuNaksha Map'],fullWidth:true,aspectRatio:1.8508587451805116},
{media:'word/media/image17.png',label:'Map / route sketch',photoTypes:['Others - Map Screenshot','Others - Route Sketch'],fullWidth:true,aspectRatio:1.7361499260233437},
{media:'word/media/image18.png',label:'Satellite view',photoTypes:['Others - Satellite View'],fullWidth:true,aspectRatio:1.7482204932958119}
]};

const configured = (registry as TemplateDef[]).map(t => {
  const photoSlots = t.photoSlots ?? (t.photoMedia ?? []).map((media, i) => ({ media, label: `Property / report photo ${i + 1}` }));
  return { ...t, photoSlots, photoMedia: photoSlots.map(s => s.media), photoCount: photoSlots.length, fields: t.fields.map((f, i) => ({ ...f, id: f.id || `${t.id}_${i}` })) };
});

export const templates: TemplateDef[] = [veritas, ...configured];

const templateKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/template$/, '');
const aliases: Record<string, string> = {
  veritashl: 'veritas', veritaseel: 'veritas', veritasfinance: 'veritas',
  krazybee: 'kreditbee', krazybeeserviceslimited: 'kreditbee',
};

/** Resolve legacy institution slugs without guessing an unrelated lender. */
export function findTemplate(id?: string | null): TemplateDef | undefined {
  if (!id) return undefined;
  const key = templateKey(id);
  const canonical = aliases[key] ?? key;
  return templates.find(t => templateKey(t.id) === canonical || templateKey(t.client) === canonical);
}

export function getTemplate(id: string) {
  const template = findTemplate(id);
  if (!template) throw new Error('Choose a supported report template.');
  return template;
}
