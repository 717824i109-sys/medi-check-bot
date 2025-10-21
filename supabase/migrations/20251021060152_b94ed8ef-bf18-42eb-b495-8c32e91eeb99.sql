-- Create verified medicines batch ledger table
CREATE TABLE IF NOT EXISTS public.verified_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  medicine_name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  manufacture_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  verification_source TEXT NOT NULL, -- 'OpenFDA', 'WHO', 'Manual', 'Auto'
  is_genuine BOOLEAN NOT NULL DEFAULT true,
  verification_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB, -- Additional data from APIs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster batch lookups
CREATE INDEX idx_verified_medicines_batch ON public.verified_medicines(batch_number);
CREATE INDEX idx_verified_medicines_name ON public.verified_medicines(medicine_name);

-- Enable RLS
ALTER TABLE public.verified_medicines ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can verify)
CREATE POLICY "Anyone can read verified medicines"
  ON public.verified_medicines
  FOR SELECT
  USING (true);

-- Only authenticated users can insert (for future admin panel)
CREATE POLICY "Authenticated users can insert verified medicines"
  ON public.verified_medicines
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_verified_medicines_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_verified_medicines_updated_at
  BEFORE UPDATE ON public.verified_medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verified_medicines_timestamp();