# HEM application workflow

Current contract, reviewed **22 October 2026**. The website and Android field app share Supabase project `gwqfwtcxlwcmglrozshc`.

## Case lifecycle

```text
new → assigned → in_progress → field_visit_done → report_drafted → completed

report_drafted → field_visit_done  (revise data / regenerate report)
```

The revisions arrow applies to `report_drafted`, before completion. Completed cases cannot be reopened through the normal workflow. A new case can also enter inspection directly where authorization permits. `in_review` and `reviewed` remain legacy compatibility states; senior approval is no longer a required step. Existing legacy review cases can be completed by a valuator or returned to field data/report editing.

Transitions are validated in portal code and the database. Revision checks reject conflicting updates rather than silently overwriting newer work. The database owns `completed_at`; clients cannot backdate it to accelerate deletion.

## 1. Initiation and assignment

An authorized portal user creates the applicant/property/lender case and assigns a field agent. The case creator or other explicitly authorized administrative path controls reassignment. A valuator is assigned or takes responsibility for report preparation after field submission. Reviewer assignment is no longer part of the case UI; old reviewer IDs are preserved for compatibility, not removed from historical data.

Creating an assigned case or changing its assignee queues an Android push event. Unchanged assignments and unassignment do not send new alerts. The notification contains generic text, not applicant details. Delivery requires a registered device and notification permission; no registered device means the event is skipped, while the case remains available in the app.

## 2. Mobile field inspection

The assigned agent opens the case and captures:

- GPS coordinates and reported accuracy; optional address/map enrichment.
- Photos by category, including property evidence, screenshots and map/route/satellite-related images.
- Property documents, audio/video and editable Data Review values.

Data Review has **Save Data**, not its own Submit button. Draft saves do not imply final submission. Field submission is performed through the case workflow, moving to `field_visit_done`. Blank Data Review values are allowed, but GPS location, at least one property document and one property photo remain required. A media recording alone does not satisfy the property-document requirement.

Submitted mobile field work is locked for central processing. Agents cannot approve reports or mark cases completed. Their case access remains limited to permitted assignments.

## 3. Portal Data Review and report mapping

Saved mobile values flow into the case dossier and related field records. The website's Data Review lets authorized users correct the field data. Report forms resolve the selected template's aliases/bindings rather than assuming every lender uses the same field names.

Mapping code is in `hem_portal/src/lib/reports/field-mapping.ts`, `lender-bindings.ts` and the template engine. The selected lender/template determines which fields, formatting and photo slots appear. Missing values must be reviewed; mapping does not invent absent inspection facts. Template-specific QA evidence is under `qa/` and should be rerun when templates change.

Linear land/plinth/slab measurements are entered in feet. The calculation controls derive the associated areas and convert the display/rate unit between square feet, square yards and square metres. Users provide the corresponding rate and select which calculated components belong in the total; slab value is not assumed to be an extra component. The engine carries these values into mapped report fields. Document, physical and calculated areas can represent different business facts and should not be silently treated as interchangeable.

Customer Response Remark is optional and included in MIS; an absent value remains blank. Dashboard/analytics filters support multiple selections and month selection.

## 4. Report generation

A valuator can generate reports from saved mobile draft data during inspection or after field submission where the workflow permits. A report preview/download does not itself mean field submission or case completion. Saved artifacts are recorded in `case_reports` and private `reports` Storage.

Built-in lender templates include KreditBee and Veritas; consult the template registry in `src/lib/report-engine/templates.ts` for the exact current selection. Financial institution display names can be edited in Settings. Generation uses template-specific bindings, photo categories and measurement mappings. Route sketch, satellite/map and other screenshot categories use the designated wide image slots where the template supports them.

The portal renders PDF/DOCX in its Node runtime; no separate report-generator Edge Function, AI extractor or Python report service is required. Normal dossier/evidence changes invalidate a drafted state so a fresh report must be prepared. Locked legacy review cases must be returned for revisions before editing/generation.

## 5. Completion and retention

After a report is saved and the case reaches `report_drafted`, a user with valuation permission can select **Mark case completed** under **Case completion & team assignments**. Senior approval is not required. The UI explains the irreversible 30-day retention policy before completion.

The database records completion time. The hourly cleanup checks for `completed` cases at least 30 days old, removes their actual Storage files first and only then deletes the case and cascading records. Errors preserve metadata for retry; missing completion timestamps never qualify. Shared files referenced by another case are preserved for that case. See [retention implementation and recovery limits](docs/CASE_COMPLETION_RETENTION.md).

## Other staff workflows

Team management, attendance, leave requests, analytics and exports remain separate modules. Removing senior case approval does not remove managers, owners or the leave-review authorization sequence. Access is determined by role, level, active status and case relationships; the presence of a menu item is not the authorization boundary.

## Verification scope

The current release passed 128 portal/backend tests, transactional workflow/retention assertions, a synthetic live file-cleanup test and Android build checks. No real case was completed or aged solely for testing. Physical push delivery and hosted Vercel workflows remain release acceptance tasks. Historical QA reports record what was verified on their dates; they are not universal certification of every future case/template.
