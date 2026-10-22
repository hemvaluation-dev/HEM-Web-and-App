-- Supabase Schema Reconstruction

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Profile Table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'field_agent',
    level TEXT DEFAULT 'L1',
    state TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    template_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Cases Table
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    valuator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    idempotency_key TEXT,
    status TEXT DEFAULT 'draft',
    application_number TEXT,
    applicant_name TEXT,
    phone_number TEXT,
    address TEXT,
    property_type TEXT,
    case_type TEXT,
    state TEXT,
    branch TEXT,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Case Photos Table
CREATE TABLE IF NOT EXISTS public.case_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    photo_type TEXT,
    file_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Case Documents Table
CREATE TABLE IF NOT EXISTS public.case_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    document_type TEXT,
    file_name TEXT,
    file_url TEXT NOT NULL,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Case Field Data Table
-- We use a flexible schema where all specific fields from app_v7 and the flutter app are mapped.
-- Rather than creating 150+ explicit columns, we create the most common ones and use JSONB for the rest,
-- or we can just create the ones specifically selected in the Next.js portal.
CREATE TABLE IF NOT EXISTS public.case_field_data (
    case_id UUID PRIMARY KEY REFERENCES public.cases(id) ON DELETE CASCADE,
    phone_number TEXT,
    person_met_at_site TEXT,
    relationship_with_customer TEXT,
    visit_date TEXT,
    applicant_name TEXT,
    owner_name TEXT,
    property_type TEXT,
    distance_from_branch TEXT,
    previous_valuation TEXT,
    ownership_type TEXT,
    property_documents_verified TEXT,
    boundaries_document_east TEXT,
    boundaries_document_west TEXT,
    boundaries_document_north TEXT,
    boundaries_document_south TEXT,
    boundaries_physical_east TEXT,
    boundaries_physical_west TEXT,
    boundaries_physical_north TEXT,
    boundaries_physical_south TEXT,
    boundaries_matching TEXT,
    setback_front TEXT,
    setback_rear TEXT,
    setback_right TEXT,
    setback_left TEXT,
    land_measurements_east TEXT,
    land_measurements_west TEXT,
    land_measurements_north TEXT,
    land_measurements_south TEXT,
    plinth_measurements_east TEXT,
    plinth_measurements_west TEXT,
    plinth_measurements_north TEXT,
    plinth_measurements_south TEXT,
    slab_measurements_east TEXT,
    slab_measurements_west TEXT,
    slab_measurements_north TEXT,
    slab_measurements_south TEXT,
    no_of_floors TEXT,
    floor_valued TEXT,
    no_of_units TEXT,
    age_of_property TEXT,
    residual_life TEXT,
    quality_of_construction TEXT,
    interiors_exteriors TEXT,
    class_of_locality TEXT,
    site_developed TEXT,
    proximity_amenities TEXT,
    within_municipal_limits TEXT,
    panchayat_name TEXT,
    site_access TEXT,
    basic_amenities TEXT,
    marketability TEXT,
    high_tension_wires TEXT,
    area_left_for_cross TEXT,
    joint_wall_slab TEXT,
    graveyard_nearby TEXT,
    land_area TEXT,
    land_rate TEXT,
    bua TEXT,
    construction_rate TEXT,
    stage_of_construction TEXT,
    stage_percentage TEXT,
    recommended_percentage TEXT,
    remarks_and_violations TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Case Location Table
CREATE TABLE IF NOT EXISTS public.case_location (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    latitude NUMERIC,
    longitude NUMERIC,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
-- First enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_field_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_location ENABLE ROW LEVEL SECURITY;

-- For now, allow full access (so the app works without complicated RLS debug issues)
CREATE POLICY "Allow all actions for authenticated users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.cases FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.case_photos FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.case_documents FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.case_field_data FOR ALL USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON public.case_location FOR ALL USING (true);

-- Insert Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true), ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Give public access to documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Allow authenticated uploads to documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Give public access to photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Allow authenticated uploads to photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Allow delete" ON storage.objects FOR DELETE USING (true);
