# HEM Associates - Application Workflow Documentation

This document outlines the end-to-end lifecycle of a case within the HEM Associates Valuation platform, starting from case creation by an Admin to the final generation of a valuation report, including the mobile app field visit processes.

---

## 1. Case Creation (Web Portal)

The journey begins when an Admin creates a new case in the web dashboard. This is usually triggered when a bank or financial institution requests a property valuation.

### Data Passed During Creation:
When creating a case, the following data points are captured:
- **Application Number / Case Ref** (Mandatory)
- **Applicant Name** (Mandatory)
- **Phone Number** (Mandatory)
- **Property Address** (Mandatory)
- **State** (Mandatory)
- **Branch** (Mandatory)
- **Property Type** (e.g., Residential, Commercial, Industrial, Vacant Land)
- **Client (Bank/Institution)** (Mandatory)
- **Initiation Date** (The date/time the case was assigned to HEM)
- **Assigned Field Officer** (Agent responsible for visiting the site - Optional at creation)
- **Assigned Valuator** (Person responsible for drafting the report - Optional at creation)
- **Initial Documents** (PDFs/Images provided by the bank)

**State Transition:** 
- If no Field Officer is assigned, the status becomes `new`.
- If a Field Officer is assigned, the status becomes `assigned`.

---

## 2. Field Visit & Data Collection (Mobile App)

The assigned Field Officer (Agent) logs into the mobile app and sees the case in their pending queue. They travel to the physical property to conduct the inspection.

### Step 2.1: Check-In (Location Verification)
- The agent arrives at the property and clicks **"Check-In"**.
- The app captures the agent's exact **GPS Coordinates (Latitude & Longitude)** and the timestamp.
- **State Transition:** Status updates to `in_progress`.

### Step 2.2: Photo Capture
- The agent uses the app's camera workflow to capture mandatory and optional photos of the property.
- Standard photos include: Elevation, Road, Interiors (Hall, Kitchen, Bedroom), Boundaries (North, South, East, West), Meter, and a Selfie at the site.
- Photos are immediately uploaded to Supabase Storage and linked to the case.
- **State Transition:** Status updates to `photos_uploaded`.

### Step 2.3: Document Upload
- The agent uploads any physical documents collected at the site (e.g., electricity bills, property tax receipts, layouts).

### Step 2.4: AI Data Extraction (Optional)
- The agent can run the AI Extraction tool.
- The app sends the uploaded documents and photos to the Groq extraction service through the protected Supabase/portal API path.
- The AI automatically extracts measurements, names, and boundary details from the documents to speed up data entry.

### Step 2.5: Data Review & Submission
- The agent fills out a comprehensive digital form capturing physical metrics.
- **Key Data Collected:**
  - Land Measurements & Built-Up Area (BUA)
  - Boundaries (Physical vs. Documented)
  - Road Width & Approach Road
  - Meter Number & Owner details
  - Proximity to hazards, civic amenities, and city center
  - Stage and Quality of Construction
- **Save Draft:** If fields are missing, the agent can click **"Save Draft"**. The data is saved, status becomes `data_drafted`, and the agent can return later.
- **Submit Case:** If all mandatory fields are fully populated, the agent clicks **"Submit Case"**.
- **State Transition:** Status updates to `field_visit_done` and the `submitted_at` timestamp is permanently recorded. The case disappears from the agent's active mobile queue.

---

## 3. Valuation & Report Generation (Web Portal)

Once the field visit is submitted, the case moves back to the web portal for the Valuators and Reviewers.

### Step 3.1: Data Review
- The assigned Valuator logs into the web portal.
- They open the case and review:
  - The GPS location on an interactive map (to verify the agent actually visited the correct site).
  - The photos and documents uploaded from the mobile app.
  - The physical measurements and boundary details submitted by the agent.

### Step 3.2: Financial Valuation
- The Valuator inputs the financial metrics based on the field data and market research.
- **Data Entered:**
  - Land Rate / Flat Rate
  - Construction Rate
  - Total Market Value
  - Distress Value
  - Government Value
  - Recommended Percentage (%)

### Step 3.3: Report Generation & Completion
- The Valuator finalizes the report data.
- The system can generate the final PDF valuation report to be sent to the bank.
- **State Transition:** Status updates to `completed` or `delivered`.

---

## 4. Analytics & MIS Reporting (Web Portal)

Admins and Managers use the web dashboard to track operational efficiency.

- **Dashboard Analytics:** Displays KPIs like Total Cases, Completion Rate, and Average Turnaround Time (TAT).
- **MIS Export:** Admins can generate a dynamic CSV report containing all case details.
  - **Turnaround Time (TAT)** is automatically calculated in days (difference between the `Initiation Date` and the `Submitted Date`).
  - Contains all extracted field data, location data, and timestamps for auditing.
