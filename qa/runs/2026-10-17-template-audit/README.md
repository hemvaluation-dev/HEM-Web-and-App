# Built-in template mapping audit - 17 October 2026

All 14 built-in template definitions were checked using synthetic data. The completeness tests generate actual DOCX/XLSX files, verify each independent report input, verify every configured agent binding (including dates, coordinates and floor rows), and check the image bytes at every media slot. Existing valuation tests check area units, rates and calculated totals.

The audit covers 1695 visible report fields and 200 photo slots. Of the visible fields, 648 have case/agent bindings, 59 are calculated by the mapping layer, and 988 are separate lender inputs. Hidden mirrors and document composition fields are tested as well. Workbook formulas are preserved and covered by the existing formula tests; this does not mean every workbook formula was independently recalculated.

| Template | Visible fields | Agent/case | Calculated | Separate inputs | Photo slots |
| --- | ---: | ---: | ---: | ---: | ---: |
| veritas | 113 | 58 | 11 | 44 | 17 |
| aditya-birla-lap | 173 | 59 | 7 | 107 | 11 |
| axis-finance | 150 | 49 | 2 | 99 | 14 |
| chola-sme | 113 | 47 | 3 | 63 | 15 |
| equitas | 134 | 44 | 7 | 83 | 16 |
| icici | 102 | 38 | 7 | 57 | 5 |
| jm-finance | 117 | 40 | 3 | 74 | 17 |
| niwas-finance | 104 | 49 | 0 | 55 | 15 |
| smfg-lap | 125 | 58 | 7 | 60 | 14 |
| smfg-rural-lap | 81 | 27 | 2 | 52 | 14 |
| tyger-finance | 93 | 38 | 0 | 55 | 18 |
| ugrow | 67 | 36 | 0 | 31 | 16 |
| ummeed | 185 | 54 | 6 | 125 | 15 |
| kreditbee | 138 | 51 | 4 | 83 | 13 |

## Issues corrected

- Aditya Birla LAP: the supporting-document paragraph points into the sale-deed cell. It now mirrors the deed-details input instead of overwriting it with another field.
- Excel date fields: twelve date cells in ICICI, JM Finance, Niwas, SMFG Rural LAP and KreditBee now accept calendar dates and write Excel date serials while preserving cell styles. Empty dates clear the previous template values. Invalid dates are rejected. Date pickers replace plain text entry for those fields.

## Limits and use

A blank source stays blank. Lender-specific legal details, approved/documentary areas, signatures, government rates and similar inputs require verified user data; measured site areas do not silently replace them. Missing photographs cannot be created from the field data.

These are generated-file content checks. They do not certify every template's page layout or the correctness of a real inspection. No live cases or storage records were modified during this audit.

Run node --test tests/template-completeness.test.cjs from hem_portal to repeat the checks. The accompanying field-mapping.csv lists every field, input type, source and destination. Generate the inventory with node scripts/audit-template-mapping.cjs.
