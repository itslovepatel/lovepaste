-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- This migration adds missing columns to the existing pastes table.

-- Add missing columns
ALTER TABLE pastes ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'plaintext';
ALTER TABLE pastes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes (expires_at)
  WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE pastes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (skip if they already exist)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pastes' AND policyname = 'Allow anonymous insert') THEN
    CREATE POLICY "Allow anonymous insert" ON pastes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pastes' AND policyname = 'Allow anonymous select') THEN
    CREATE POLICY "Allow anonymous select" ON pastes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pastes' AND policyname = 'Allow anonymous delete') THEN
    CREATE POLICY "Allow anonymous delete" ON pastes FOR DELETE USING (true);
  END IF;
END $$;
