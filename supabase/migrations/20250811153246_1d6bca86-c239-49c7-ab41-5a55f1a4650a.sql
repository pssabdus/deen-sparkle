-- Add password field to children table to store child login passwords
ALTER TABLE children ADD COLUMN login_password TEXT;