-- Create Agencies table
CREATE TABLE public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  founded_year INTEGER,
  description TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Manufacturers table
CREATE TABLE public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  founded_year INTEGER,
  specialization TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Crew Members table
CREATE TABLE public.crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  date_of_birth DATE,
  role TEXT NOT NULL,
  bio TEXT,
  missions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Rockets table
CREATE TABLE public.rockets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  description TEXT,
  height_meters DECIMAL(10,2),
  mass_kg DECIMAL(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Rocket Variants table
CREATE TABLE public.rocket_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rocket_id UUID NOT NULL REFERENCES public.rockets(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  payload_capacity_kg DECIMAL(15,2),
  stages INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  mission_type TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  description TEXT,
  budget_usd DECIMAL(20,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Launches table
CREATE TABLE public.launches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  rocket_variant_id UUID REFERENCES public.rocket_variants(id) ON DELETE SET NULL,
  launch_date TIMESTAMPTZ NOT NULL,
  launch_site TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  success BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Payloads table
CREATE TABLE public.payloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  launch_id UUID REFERENCES public.launches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mass_kg DECIMAL(10,2),
  orbit TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Crew Assignments table
CREATE TABLE public.crew_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_member_id UUID NOT NULL REFERENCES public.crew_members(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  assignment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(crew_member_id, mission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rocket_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies allowing public read access for all tables
CREATE POLICY "Allow public read for agencies" ON public.agencies FOR SELECT USING (true);
CREATE POLICY "Allow public read for manufacturers" ON public.manufacturers FOR SELECT USING (true);
CREATE POLICY "Allow public read for crew_members" ON public.crew_members FOR SELECT USING (true);
CREATE POLICY "Allow public read for rockets" ON public.rockets FOR SELECT USING (true);
CREATE POLICY "Allow public read for rocket_variants" ON public.rocket_variants FOR SELECT USING (true);
CREATE POLICY "Allow public read for missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow public read for launches" ON public.launches FOR SELECT USING (true);
CREATE POLICY "Allow public read for payloads" ON public.payloads FOR SELECT USING (true);
CREATE POLICY "Allow public read for crew_assignments" ON public.crew_assignments FOR SELECT USING (true);

-- Create policies allowing public write access (for demo purposes)
CREATE POLICY "Allow public insert for agencies" ON public.agencies FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for agencies" ON public.agencies FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for agencies" ON public.agencies FOR DELETE USING (true);

CREATE POLICY "Allow public insert for manufacturers" ON public.manufacturers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for manufacturers" ON public.manufacturers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for manufacturers" ON public.manufacturers FOR DELETE USING (true);

CREATE POLICY "Allow public insert for crew_members" ON public.crew_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for crew_members" ON public.crew_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for crew_members" ON public.crew_members FOR DELETE USING (true);

CREATE POLICY "Allow public insert for rockets" ON public.rockets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for rockets" ON public.rockets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for rockets" ON public.rockets FOR DELETE USING (true);

CREATE POLICY "Allow public insert for rocket_variants" ON public.rocket_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for rocket_variants" ON public.rocket_variants FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for rocket_variants" ON public.rocket_variants FOR DELETE USING (true);

CREATE POLICY "Allow public insert for missions" ON public.missions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for missions" ON public.missions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for missions" ON public.missions FOR DELETE USING (true);

CREATE POLICY "Allow public insert for launches" ON public.launches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for launches" ON public.launches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for launches" ON public.launches FOR DELETE USING (true);

CREATE POLICY "Allow public insert for payloads" ON public.payloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for payloads" ON public.payloads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for payloads" ON public.payloads FOR DELETE USING (true);

CREATE POLICY "Allow public insert for crew_assignments" ON public.crew_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for crew_assignments" ON public.crew_assignments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for crew_assignments" ON public.crew_assignments FOR DELETE USING (true);

-- Insert sample data for Agencies
INSERT INTO public.agencies (name, country, founded_year, description, website) VALUES
('NASA', 'USA', 1958, 'National Aeronautics and Space Administration', 'https://www.nasa.gov'),
('SpaceX', 'USA', 2002, 'Space Exploration Technologies Corp.', 'https://www.spacex.com'),
('ESA', 'Europe', 1975, 'European Space Agency', 'https://www.esa.int'),
('ISRO', 'India', 1969, 'Indian Space Research Organisation', 'https://www.isro.gov.in'),
('Roscosmos', 'Russia', 1992, 'Russian Federal Space Agency', 'https://www.roscosmos.ru');

-- Insert sample data for Manufacturers
INSERT INTO public.manufacturers (name, country, founded_year, specialization) VALUES
('Boeing', 'USA', 1916, 'Aerospace and Defense'),
('Lockheed Martin', 'USA', 1995, 'Aerospace and Defense'),
('SpaceX', 'USA', 2002, 'Rockets and Spacecraft'),
('Arianespace', 'France', 1980, 'Launch Services'),
('Northrop Grumman', 'USA', 2018, 'Aerospace and Defense');

-- Insert sample data for Crew Members
INSERT INTO public.crew_members (name, nationality, date_of_birth, role, bio, missions_count) VALUES
('Neil Armstrong', 'American', '1930-08-05', 'Commander', 'First person to walk on the Moon', 2),
('Sally Ride', 'American', '1951-05-26', 'Mission Specialist', 'First American woman in space', 2),
('Yuri Gagarin', 'Russian', '1934-03-09', 'Pilot', 'First human in space', 1),
('Chris Hadfield', 'Canadian', '1959-08-29', 'Commander', 'Canadian astronaut and ISS commander', 3),
('Sunita Williams', 'American', '1965-09-19', 'Flight Engineer', 'Holds record for longest spaceflight by a woman', 2);