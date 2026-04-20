
/*
  # Software Talent Hub - Initial Schema

  ## Overview
  Full schema for a platform connecting software talent with businesses.

  ## New Tables

  ### projects
  - Public submissions (no auth required to submit)
  - Requires admin approval before becoming visible
  - Fields: title, description, author info, tech stack, URLs, status

  ### challenges
  - Company/user submitted challenges
  - Requires admin approval before becoming visible
  - Fields: title, description, company info, deadline, difficulty, prize

  ### news
  - Admin-only news posts
  - Public can read, only admins can write

  ### companies
  - Partner companies displayed on homepage
  - Admin managed

  ### contact_messages
  - Public contact form submissions
  - Only admins can read

  ## Security
  - RLS enabled on all tables
  - Public can submit projects/challenges/contact messages
  - Only approved content is publicly readable
  - Only authenticated admins can manage content and read pending items
*/

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  author_name text NOT NULL,
  author_email text DEFAULT '',
  tech_stack text[] DEFAULT '{}',
  github_url text DEFAULT '',
  demo_url text DEFAULT '',
  image_url text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a project"
  ON projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved projects"
  ON projects FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update project status"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  company_name text NOT NULL,
  contact_email text DEFAULT '',
  deadline date,
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  prize text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a challenge"
  ON challenges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved challenges"
  ON challenges FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Admins can view all challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update challenge status"
  ON challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  image_url text DEFAULT '',
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news"
  ON news FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text DEFAULT '',
  website_url text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Seed demo companies
INSERT INTO companies (name, logo_url, website_url, description) VALUES
  ('Philips', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Philips_logo_new.svg/120px-Philips_logo_new.svg.png', 'https://www.philips.nl', 'Technologie en zorg'),
  ('ASML', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/ASML_Holding_N.V._logo.svg/200px-ASML_Holding_N.V._logo.svg.png', 'https://www.asml.com', 'Halfgeleider technologie'),
  ('Booking.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Booking.com_logo.svg/200px-Booking.com_logo.svg.png', 'https://www.booking.com', 'Travel technologie'),
  ('TomTom', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/TomTom_logo.svg/200px-TomTom_logo.svg.png', 'https://www.tomtom.com', 'Navigatie en locatietechnologie'),
  ('Adyen', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Adyen_Corporate_Logo.svg/200px-Adyen_Corporate_Logo.svg.png', 'https://www.adyen.com', 'Betalingstechnologie'),
  ('Coolblue', '', 'https://www.coolblue.nl', 'E-commerce platform')
ON CONFLICT DO NOTHING;

-- Enable realtime for projects and challenges
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE news;
