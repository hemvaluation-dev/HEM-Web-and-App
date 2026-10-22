import { legacyMeasurements } from '@/lib/valuation/legacy';
import { areaUnits, unit, measurementGroups } from '@/lib/valuation/measurements';
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { computeValuation } from "@/lib/valuation";

const INK = "#222222";
const BORDER = "#999999";
const BRAND_BLUE = "#1d4e89";
const BRAND_GREEN = "#2f5233";
const HEAD_BG = "#eef2ef";

const styles = StyleSheet.create({
  page: {
    paddingTop: 82,
    paddingBottom: 34,
    paddingHorizontal: 28,
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: INK,
  },
  headerFixed: {
    position: "absolute",
    top: 18,
    left: 28,
    right: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: BRAND_GREEN,
    paddingBottom: 6,
  },
  logo: { width: 42, height: 34, marginRight: 8 },
  companyName: { fontSize: 17, fontFamily: "Helvetica-Bold", color: BRAND_BLUE },
  contactBlock: { alignItems: "flex-end", marginLeft: "auto" },
  contactLine: { fontSize: 6.8, color: "#333", marginBottom: 1, textAlign: "right" },
  footerFixed: {
    position: "absolute",
    bottom: 12,
    left: 28,
    right: 28,
    textAlign: "right",
    fontSize: 7.5,
    color: "#555",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 3,
  },
  reportTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    textDecoration: "underline",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textDecoration: "underline",
    marginTop: 10,
    marginBottom: 3,
  },
  boxRowWrap: { flexDirection: "row", flexWrap: "wrap" },
  box: {
    flexDirection: "row",
    borderWidth: 0.6,
    borderColor: BORDER,
    marginTop: -0.6,
    marginLeft: -0.6,
  },
  boxLabel: {
    backgroundColor: HEAD_BG,
    padding: 4,
    borderRightWidth: 0.6,
    borderRightColor: BORDER,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.6,
  },
  boxValue: { padding: 4, fontSize: 8, flex: 1 },
  table: { borderWidth: 0.6, borderColor: BORDER, marginTop: 2 },
  tr: { flexDirection: "row" },
  th: {
    backgroundColor: HEAD_BG,
    padding: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.6,
    borderRightWidth: 0.6,
    borderRightColor: BORDER,
    borderBottomWidth: 0.6,
    borderBottomColor: BORDER,
  },
  td: {
    padding: 4,
    fontSize: 8,
    borderRightWidth: 0.6,
    borderRightColor: BORDER,
    borderBottomWidth: 0.6,
    borderBottomColor: BORDER,
  },
  listLine: { fontSize: 8, marginBottom: 3, lineHeight: 1.3 },
  photoBox: {
    width: "48%",
    marginBottom: 10,
    borderWidth: 0.6,
    borderColor: BORDER,
  },
  photoImg: { width: "100%", height: 150, objectFit: "cover" },
  photoCaption: {
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    padding: 3,
    borderTopWidth: 0.6,
    borderTopColor: BORDER,
  },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
});

function Box({ label, value, full }) {
  return (
    <View style={[styles.box, { width: full ? "100%" : "50%" }]}>
      <View style={[styles.boxLabel, { width: "40%" }]}>
        <Text>{label}</Text>
      </View>
      <View style={styles.boxValue}>
        <Text>{value || "-"}</Text>
      </View>
    </View>
  );
}

function BoxRow({ items }) {
  return (
    <View style={styles.boxRowWrap}>
      {items.map((it, i) => (
        <Box key={i} label={it.label} value={it.value} full={it.full || items.length === 1} />
      ))}
    </View>
  );
}

function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function Header({ company, logoDataUrl }) {
  return (
    <View style={styles.headerFixed} fixed>
      <View style={styles.headerRow}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML <img> */}
        {logoDataUrl ? <Image src={logoDataUrl} style={styles.logo} /> : null}
        <Text style={styles.companyName}>{company.name}</Text>
        <View style={styles.contactBlock}>
          <Text style={styles.contactLine}>{company.addressLine}</Text>
          <Text style={styles.contactLine}>Tel: {company.phone}</Text>
          <Text style={styles.contactLine}>Email: {company.email}</Text>
        </View>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <Text
      style={styles.footerFixed}
      fixed
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  );
}

export default function ValuationReportDocument({ data, logoDataUrl }) {
  const a = data.applicant;
  const m = data.meta;
  const b = data.boundaries;
  const bd = data.buildingDetails;
  const occ = data.occupant;
  const loc = data.location;
  const mun = data.municipal;
  const e = data.electricity;
  const v = data.valuation;
  const measured = legacyMeasurements(data);
  const { landAmount, constructionAmount } = computeValuation(v);
  const totalValue = Number(measured.total_value || 0);
  const p = data.photographs;

  const address = [a.doorPlotNo, a.streetName, a.syNo, a.villageName, a.landMark, a.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <Document title={`Valuation Report - ${a.applicantName || "Report"}`}>
      <Page size="A4" style={styles.page} wrap>
        <Header company={data.companyInfo} logoDataUrl={logoDataUrl} />
        <Footer />

        <Text style={styles.reportTitle}>VALUATION REPORT</Text>

        <BoxRow
          items={[
            { label: "Date of Initiate", value: m.dateOfInitiate },
            { label: "Date of visit", value: m.dateOfVisit },
          ]}
        />
        <BoxRow
          items={[
            { label: "Contact number", value: m.contactNumber },
            { label: "Name of person met at site", value: m.personMetAtSite },
          ]}
        />
        <BoxRow items={[{ label: "Relationship with the customer", value: m.relationshipWithCustomer, full: true }]} />

        <BoxRow items={[{ label: "Name of the Applicant", value: a.applicantName, full: true }]} />
        <BoxRow items={[{ label: "Name of the Owner", value: a.ownerName, full: true }]} />
        <BoxRow
          items={[
            { label: "Type of property", value: a.typeOfProperty },
            { label: "Distance from Branch Office", value: a.distanceFromBranch },
          ]}
        />
        <BoxRow items={[{ label: "Address at site", value: address || "-", full: true }]} />
        <BoxRow
          items={[
            {
              label: "Valuation of this property done before?",
              value: a.valuedBefore === "Yes" ? `Yes — ${a.valuedBeforeDetails || ""}` : "No",
            },
            { label: "Ownership type", value: data.ownershipType },
          ]}
        />

        <SectionTitle>Sanction plan approval &amp; other documents details</SectionTitle>
        <View style={styles.table}>
          {data.documentsVerified
            .filter((d) => d.text?.trim())
            .map((doc, i) => (
              <Text key={doc.id} style={[styles.listLine, { padding: 4 }]}>
                {i + 1}. {doc.text}
              </Text>
            ))}
        </View>

        <SectionTitle>Boundaries as per documents &amp; site</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "16%" }]}>Boundaries</Text>
            <Text style={[styles.th, { width: "21%" }]}>EAST</Text>
            <Text style={[styles.th, { width: "21%" }]}>WEST</Text>
            <Text style={[styles.th, { width: "21%" }]}>NORTH</Text>
            <Text style={[styles.th, { width: "21%", borderRightWidth: 0 }]}>SOUTH</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "16%", fontFamily: "Helvetica-Bold" }]}>As per Doc</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.east.doc || "-"}</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.west.doc || "-"}</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.north.doc || "-"}</Text>
            <Text style={[styles.td, { width: "21%", borderRightWidth: 0 }]}>{b.south.doc || "-"}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "16%", fontFamily: "Helvetica-Bold" }]}>As per Site</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.east.site || "-"}</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.west.site || "-"}</Text>
            <Text style={[styles.td, { width: "21%" }]}>{b.north.site || "-"}</Text>
            <Text style={[styles.td, { width: "21%", borderRightWidth: 0 }]}>{b.south.site || "-"}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "16%", fontFamily: "Helvetica-Bold" }]}>Matching</Text>
            <Text style={[styles.td, { width: "84%", borderRightWidth: 0 }]}>{b.matching}</Text>
          </View>
        </View>

        <SectionTitle>Dimensions (in ft)</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "28%" }]}>Type</Text>
            <Text style={[styles.th, { width: "18%" }]}>East</Text>
            <Text style={[styles.th, { width: "18%" }]}>West</Text>
            <Text style={[styles.th, { width: "18%" }]}>North</Text>
            <Text style={[styles.th, { width: "18%", borderRightWidth: 0 }]}>South</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "28%" }]}>Land Dimensions</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.landDimensions.east || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.landDimensions.west || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.landDimensions.north || "-"}</Text>
            <Text style={[styles.td, { width: "18%", borderRightWidth: 0 }]}>{data.landDimensions.south || "-"}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "28%" }]}>Building Dimensions</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.buildingDimensions.east || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.buildingDimensions.west || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.buildingDimensions.north || "-"}</Text>
            <Text style={[styles.td, { width: "18%", borderRightWidth: 0 }]}>{data.buildingDimensions.south || "-"}</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "28%" }]}>Slab Dimensions</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.slabDimensions.east || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.slabDimensions.west || "-"}</Text>
            <Text style={[styles.td, { width: "18%" }]}>{data.slabDimensions.north || "-"}</Text>
            <Text style={[styles.td, { width: "18%", borderRightWidth: 0 }]}>{data.slabDimensions.south || "-"}</Text>
          </View>
        </View>

        <SectionTitle>Set Backs (in ft)</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "25%" }]}>Front</Text>
            <Text style={[styles.th, { width: "25%" }]}>Rear / Back</Text>
            <Text style={[styles.th, { width: "25%" }]}>Right</Text>
            <Text style={[styles.th, { width: "25%", borderRightWidth: 0 }]}>Left</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "25%" }]}>{data.setBacks.front || "-"}</Text>
            <Text style={[styles.td, { width: "25%" }]}>{data.setBacks.back || "-"}</Text>
            <Text style={[styles.td, { width: "25%" }]}>{data.setBacks.right || "-"}</Text>
            <Text style={[styles.td, { width: "25%", borderRightWidth: 0 }]}>{data.setBacks.left || "-"}</Text>
          </View>
        </View>

        <SectionTitle>Occupant &amp; building details</SectionTitle>
        <BoxRow
          items={[
            { label: "Vacant / Occupied", value: occ.status },
            { label: "Name of Occupant", value: occ.nameOfOccupant },
          ]}
        />
        <BoxRow
          items={[
            { label: "Property Demarcation", value: bd.propertyDemarcation },
            { label: "Property Identified through", value: bd.propertyIdentifiedThrough },
          ]}
        />
        <BoxRow
          items={[
            { label: "Type of structure", value: bd.typeOfStructure },
            { label: "Plot Area", value: bd.plotArea },
          ]}
        />
        <BoxRow
          items={[
            { label: "No. of Floors", value: bd.noOfFloors },
            { label: "Floor Valued", value: bd.floorValued },
          ]}
        />
        <BoxRow
          items={[
            { label: "No of unit per floor", value: bd.noOfUnitPerFloor },
            { label: "No. of lifts", value: bd.noOfLifts },
          ]}
        />
        <BoxRow
          items={[
            { label: "No. of units", value: data.unitDetails.noOfUnits },
            { label: "Quality of construction", value: data.quality.construction },
          ]}
        />
        <BoxRow
          items={[
            { label: "Interiors / Exteriors", value: data.quality.interiorsExteriors },
            { label: "Age of the property", value: data.age.ageOfProperty },
          ]}
        />
        <BoxRow items={[{ label: "Residual life", value: data.age.residualLife, full: true }]} />

        <SectionTitle>Location</SectionTitle>
        <BoxRow
          items={[
            { label: "Type (Comm./Res./Ind./Mix)", value: loc.type },
            { label: "Class of Locality", value: loc.classOfLocality },
          ]}
        />
        <BoxRow
          items={[
            { label: "Site is (Dev/Under Dev)", value: loc.siteIs },
            { label: "Proximity to civic amenities", value: loc.proximityToCivicAmenities },
          ]}
        />
        <BoxRow
          items={[
            { label: "Close Vicinity / Landmark", value: data.closeVicinity },
            { label: "Property within municipal Limits", value: mun.withinLimits },
          ]}
        />
        <BoxRow
          items={[
            { label: "Name of Panchayat", value: mun.nameOfPanchayat },
            { label: "Site Access", value: data.siteAccess },
          ]}
        />
        <BoxRow
          items={[
            { label: "Availability of basic amenities", value: data.basicAmenities },
            { label: "Marketability", value: data.marketability },
          ]}
        />

        <SectionTitle>Electricity &amp; miscellaneous checks</SectionTitle>
        <BoxRow items={[{ label: "Electricity Meter Service No.", value: e.meterServiceNo, full: true }]} />
        <BoxRow
          items={[
            { label: "High Tension wires", value: e.highTensionWires },
            { label: "Electricity in the name of", value: e.inNameOf },
          ]}
        />
        <BoxRow
          items={[
            { label: "Property tax in the name of", value: e.propertyTaxInNameOf },
            { label: "Area left for cross", value: e.areaLeftForCross },
          ]}
        />
        <BoxRow
          items={[
            { label: "Joint wall and Joint slab", value: e.jointWallSlab },
            { label: "Any graveyard nearby", value: e.graveyardNearby },
          ]}
        />

        <SectionTitle>Floor Wise Area (in Sqft.)</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "40%" }]}>Floor</Text>
            <Text style={[styles.th, { width: "30%" }]}>Plinth area</Text>
            <Text style={[styles.th, { width: "30%", borderRightWidth: 0 }]}>Slab area</Text>
          </View>
          {data.floorWiseArea.map((row) => (
            <View key={row.id} style={styles.tr}>
              <Text style={[styles.td, { width: "40%" }]}>{row.floor || "-"}</Text>
              <Text style={[styles.td, { width: "30%" }]}>{row.plinthArea || "0"}</Text>
              <Text style={[styles.td, { width: "30%", borderRightWidth: 0 }]}>{row.slabArea || "0"}</Text>
            </View>
          ))}
        </View>

        <SectionTitle>Description of constructed area and rates</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "34%" }]}>Description</Text>
            <Text style={[styles.th, { width: "22%" }]}>Area</Text>
            <Text style={[styles.th, { width: "22%" }]}>Rate (Rs.)</Text>
            <Text style={[styles.th, { width: "22%", borderRightWidth: 0 }]}>Amount (Rs.)</Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "34%" }]}>Land (Sq.Yds.)</Text>
            <Text style={[styles.td, { width: "22%" }]}>{v.landAreaSqYds || "0"}</Text>
            <Text style={[styles.td, { width: "22%" }]}>{v.landRate || "0"}</Text>
            <Text style={[styles.td, { width: "22%", borderRightWidth: 0 }]}>
              {landAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "34%" }]}>Total construction area</Text>
            <Text style={[styles.td, { width: "22%" }]}>{v.totalConstructionArea || "0"}</Text>
            <Text style={[styles.td, { width: "22%" }]}>{v.constructionRate || "0"}</Text>
            <Text style={[styles.td, { width: "22%", borderRightWidth: 0 }]}>
              {constructionAmount.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "78%", fontFamily: "Helvetica-Bold" }]}>Total Value</Text>
            <Text style={[styles.td, { width: "22%", borderRightWidth: 0, fontFamily: "Helvetica-Bold" }]}>
              {totalValue.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "34%" }]}>Stage of construction</Text>
            <Text style={[styles.td, { width: "22%" }]}>{v.stageOfConstruction}</Text>
            <Text style={[styles.td, { width: "22%" }]}>Stage %: {v.stagePercent}</Text>
            <Text style={[styles.td, { width: "22%", borderRightWidth: 0 }]}>Rec. %: {v.recommendedPercent}</Text>
          </View>
        </View>

        <SectionTitle>Floorwise details of usage of property</SectionTitle>
        <View style={styles.table}>
          <View style={styles.tr}>
            <Text style={[styles.th, { width: "22%" }]}>Floor</Text>
            <Text style={[styles.th, { width: "22%" }]}>Usage</Text>
            <Text style={[styles.th, { width: "14%" }]}>Units</Text>
            <Text style={[styles.th, { width: "22%" }]}>Yr of tenancy</Text>
            <Text style={[styles.th, { width: "20%", borderRightWidth: 0 }]}>Rental assessment</Text>
          </View>
          {data.floorwiseUsage.map((row) => (
            <View key={row.id} style={styles.tr}>
              <Text style={[styles.td, { width: "22%" }]}>{row.floor || "-"}</Text>
              <Text style={[styles.td, { width: "22%" }]}>{row.usage || "-"}</Text>
              <Text style={[styles.td, { width: "14%" }]}>{row.units || "-"}</Text>
              <Text style={[styles.td, { width: "22%" }]}>{row.tenancyYear || "-"}</Text>
              <Text style={[styles.td, { width: "20%", borderRightWidth: 0 }]}>{row.rentalAssessment || "-"}</Text>
            </View>
          ))}
        </View>

        <View wrap={false} style={{ marginTop: 10 }}>
          <SectionTitle>Remarks</SectionTitle>
          <View style={styles.table}>
            {data.remarks
              .filter((r) => r.text?.trim())
              .map((r, i) => (
                <Text key={r.id} style={[styles.listLine, { padding: 4 }]}>
                  {i + 1}. {r.text}
                </Text>
              ))}
          </View>
          {data.gpsCoordinates ? (
            <Text style={{ fontSize: 8, marginTop: 4, color: BRAND_BLUE }}>
              GPS Coordinates: {data.gpsCoordinates}
            </Text>
          ) : null}
          <Text style={{ marginTop: 26, textAlign: "right", fontSize: 8.5, fontFamily: "Helvetica-Bold" }}>
            (Authorized Signatory)
          </Text>
        </View>

        <View break>
          <Text style={[styles.sectionTitle, { textAlign: "center", fontSize: 10 }]}>PHOTOGRAPHS</Text>
          <Text style={{ fontSize: 8.5, marginBottom: 2 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Applicant Name: </Text>
            {p.applicantName || a.applicantName || "-"}
          </Text>
          <Text style={{ fontSize: 8.5, marginBottom: 8 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Address: </Text>
            {p.address || address || "-"}
          </Text>

          <View style={styles.photoGrid}>
            {[p.elevation, p.roadView, ...p.extra]
              .filter((ph) => ph && ph.image)
              .map((ph) => (
                <View key={ph.id} style={[styles.photoBox, /^others\s*[-–]/i.test(ph.caption || "") ? { width: "100%" } : {}]} wrap={false}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image, not an HTML <img> */}
                  <Image src={ph.image} style={[styles.photoImg, /^others\s*[-–]/i.test(ph.caption || "") ? { height: 250, objectFit: "contain" } : {}]} />
                  <Text style={styles.photoCaption}>{(ph.caption || "").toUpperCase()}</Text>
                </View>
              ))}
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>SITE MEASUREMENTS AND VALUATION</Text>
        <Text style={{ fontSize: 9, marginBottom: 12 }}>Measurements are in feet. Area = average east/west x average north/south. Irregular plots require survey verification.</Text>
        {measurementGroups.map(g => <View key={g.area} style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 11 }}>{g.label}</Text>
          <Text style={{ fontSize: 9 }}>East: {measured[g.prefix + '_measurements_east'] || '-'} fts; West: {measured[g.prefix + '_measurements_west'] || '-'} fts; North: {measured[g.prefix + '_measurements_north'] || '-'} fts; South: {measured[g.prefix + '_measurements_south'] || '-'} fts</Text>
          <Text style={{ fontSize: 9 }}>Area: {measured[g.area] || '-'} {areaUnits[unit(measured[g.area + '_unit'])]}; Rate: INR {measured[g.rate] || '-'} per {areaUnits[unit(measured[g.rate + '_unit'])]}; Value: INR {measured[g.amount] || '-'}</Text>
          <Text style={{ fontSize: 9 }}>Included in total: {(measured['include_' + g.prefix + '_value'] ?? (g.prefix !== 'slab')) ? 'Yes' : 'No'}</Text>
        </View>)}
        <Text style={{ fontSize: 11 }}>Total valuation: INR {measured.total_value || '-'}</Text>
      </Page>
    </Document>
  );
}
