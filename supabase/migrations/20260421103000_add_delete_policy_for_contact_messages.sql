/*
  # Allow admins to delete contact messages

  Adds a DELETE policy on `contact_messages` for authenticated users,
  aligning behavior with the admin dashboard's delete action.
*/

DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete contact messages" ON contact_messages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admins can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (true);
