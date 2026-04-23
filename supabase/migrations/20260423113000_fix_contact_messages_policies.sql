/*
  # Fix contact_messages policies for admin delete/read actions

  Ensures policy set is consistent and idempotent:
  - anon/authenticated can insert contact messages
  - authenticated can read contact messages
  - authenticated can delete contact messages
*/

ALTER TABLE IF EXISTS contact_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can submit contact message" ON contact_messages;
  DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;
  DROP POLICY IF EXISTS "Admins can view contact messages" ON contact_messages;
  DROP POLICY IF EXISTS "Admins can read contact messages" ON contact_messages;
  DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
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

ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can submit challenge submissions" ON challenge_submissions;
  DROP POLICY IF EXISTS "Anyone can submit challenge comments" ON challenge_submissions;
  DROP POLICY IF EXISTS "Anyone can view approved challenge submissions" ON challenge_submissions;
  DROP POLICY IF EXISTS "Admins can view all challenge submissions" ON challenge_submissions;
  DROP POLICY IF EXISTS "Admins can update challenge submissions" ON challenge_submissions;
  DROP POLICY IF EXISTS "Admins can delete challenge submissions" ON challenge_submissions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can submit challenge submissions"
  ON challenge_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved challenge submissions"
  ON challenge_submissions FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE POLICY "Admins can view all challenge submissions"
  ON challenge_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update challenge submissions"
  ON challenge_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete challenge submissions"
  ON challenge_submissions FOR DELETE
  TO authenticated
  USING (true);
