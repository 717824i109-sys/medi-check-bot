-- Create medicine_info table for genuine medicines
CREATE TABLE public.medicine_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fake_medicine_effects table for fake/suspicious medicines
CREATE TABLE public.fake_medicine_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  side_effects TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS (making tables publicly readable for this use case)
ALTER TABLE public.medicine_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fake_medicine_effects ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth required for medicine info lookup)
CREATE POLICY "Anyone can read medicine info"
  ON public.medicine_info
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read fake medicine effects"
  ON public.fake_medicine_effects
  FOR SELECT
  USING (true);

-- Insert sample data for genuine medicines
INSERT INTO public.medicine_info (name, purpose, description) VALUES
('Paracetamol', 'Used to treat fever and mild to moderate pain', 'Take 1-2 tablets every 4-6 hours. Do not exceed 8 tablets in 24 hours. Can be taken with or without food.'),
('Aspirin', 'Used for pain relief, reducing inflammation, and preventing blood clots', 'Take with food or milk to avoid stomach upset. Common dose is 300-900mg every 4-6 hours as needed.'),
('Ibuprofen', 'Reduces pain, inflammation, and fever', 'Take with food to reduce stomach irritation. Typical dose is 200-400mg every 4-6 hours. Maximum 1200mg per day without doctor supervision.'),
('Amoxicillin', 'Antibiotic used to treat bacterial infections', 'Complete the full course as prescribed. Take at evenly spaced intervals. Can be taken with or without food.'),
('Cetirizine', 'Antihistamine used for allergies and hay fever', 'Usually taken once daily. May cause drowsiness in some people. Do not exceed recommended dose.');

-- Insert sample data for fake medicines
INSERT INTO public.fake_medicine_effects (name, side_effects, reason) VALUES
('Counterfeit Paracetamol', 'May contain harmful substances like chalk, boric acid, or toxic chemicals. Can cause liver damage, kidney failure, or poisoning.', 'Detected due to incorrect packaging, misspelled labels, unusual tablet appearance, or failed verification checks.'),
('Fake Aspirin', 'May cause severe allergic reactions, internal bleeding, or contain no active ingredients leaving conditions untreated.', 'Identified through irregular tablet shape, incorrect color, suspicious batch numbers, or missing security features.'),
('Counterfeit Ibuprofen', 'Can lead to organ damage, allergic reactions, or ineffective pain relief leading to worsening conditions.', 'Detected due to poor quality packaging, incorrect expiry date format, or tampered security seals.'),
('Fake Amoxicillin', 'Ineffective against infections, may contain harmful fillers, can lead to antibiotic resistance or serious health complications.', 'Identified by suspicious manufacturer details, irregular capsule appearance, or failed authenticity verification.'),
('Counterfeit Cetirizine', 'May contain dangerous substances, cause severe allergic reactions, or provide no symptom relief.', 'Detected through packaging inconsistencies, missing holograms, or unverified batch information.');