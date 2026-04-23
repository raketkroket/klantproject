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
