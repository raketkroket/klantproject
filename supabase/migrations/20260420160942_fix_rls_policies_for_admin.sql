/*
  # Fix RLS policies for admin approval workflow

  1. Changes
    - Drop and recreate policies on projects, challenges, news, contact_messages
    - Add authenticated (admin) UPDATE policies so approve/reject works
    - Add authenticated INSERT for news, DELETE for news
    - Public sees only approved projects and challenges
    - Admins see everything

  2. Security
    - Public (anon): read approved only, insert pending submissions
    - Authenticated (admin): full read, update status, manage news
*/

-- ========== PROJECTS ==========
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view approved projects" ON projects;
  DROP POLICY IF EXISTS "Public can view approved projects" ON projects;
  DROP POLICY IF EXISTS "Anyone can submit projects" ON projects;
  DROP POLICY IF EXISTS "Public can submit projects" ON projects;
  DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
  DROP POLICY IF EXISTS "Admins can update project status" ON projects;
  DROP POLICY IF EXISTS "Admins can delete projects" ON projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public can view approved projects"
  ON projects FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE POLICY "Public can submit projects"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update project status"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- ========== CHALLENGES ==========
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view approved challenges" ON challenges;
  DROP POLICY IF EXISTS "Public can view approved challenges" ON challenges;
  DROP POLICY IF EXISTS "Anyone can submit challenges" ON challenges;
  DROP POLICY IF EXISTS "Public can submit challenges" ON challenges;
  DROP POLICY IF EXISTS "Admins can view all challenges" ON challenges;
  DROP POLICY IF EXISTS "Admins can update challenge status" ON challenges;
  DROP POLICY IF EXISTS "Admins can delete challenges" ON challenges;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public can view approved challenges"
  ON challenges FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE POLICY "Public can submit challenges"
  ON challenges FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all challenges"
  ON challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update challenge status"
  ON challenges FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete challenges"
  ON challenges FOR DELETE
  TO authenticated
  USING (true);

-- ========== NEWS ==========
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  excerpt text DEFAULT '',
  image_url text DEFAULT '',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view news" ON news;
  DROP POLICY IF EXISTS "Public can view news" ON news;
  DROP POLICY IF EXISTS "Admins can view news" ON news;
  DROP POLICY IF EXISTS "Admins can manage news" ON news;
  DROP POLICY IF EXISTS "Admins can insert news" ON news;
  DROP POLICY IF EXISTS "Admins can delete news" ON news;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public can view news"
  ON news FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can view news"
  ON news FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- ========== CONTACT MESSAGES ==========
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can view messages" ON contact_messages;
  DROP POLICY IF EXISTS "Admins can read contact messages" ON contact_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);
