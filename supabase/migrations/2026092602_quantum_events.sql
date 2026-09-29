-- Quantify — Quantum Opportunities Hub
-- 2026-09-26

CREATE TABLE public.quantum_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organiser text,
  event_type text NOT NULL CHECK (event_type IN ('hackathon','webinar','conference','fellowship')),
  region text NOT NULL CHECK (region IN ('india','global')),
  description text,
  start_date date NOT NULL,
  end_date date,
  is_online boolean NOT NULL DEFAULT true,
  registration_url text,
  source_url text,
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quantum_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quantum_events_select_auth" ON public.quantum_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "quantum_events_insert_admin" ON public.quantum_events FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "quantum_events_update_admin" ON public.quantum_events FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "quantum_events_delete_admin" ON public.quantum_events FOR DELETE TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

INSERT INTO public.quantum_events
  (title, organiser, event_type, region, description, start_date, end_date, is_online, registration_url, source_url, is_featured)
VALUES
  ('IBM Quantum Challenge India', 'IBM Quantum', 'hackathon', 'india', 'A practical challenge series for students and developers building with Qiskit.', '2026-10-15', '2026-10-18', true, 'https://quantum.ibm.com/challenges', 'https://quantum.ibm.com', true),
  ('DST-QuEST Quantum Computing Webinar', 'DST-QuEST', 'webinar', 'india', 'An introduction to India''s quantum technology research and education ecosystem.', '2026-10-22', NULL, true, 'https://dst.gov.in', 'https://dst.gov.in', false),
  ('IIT Madras Quantum Computing School', 'IIT Madras', 'conference', 'india', 'An intensive school covering quantum algorithms, hardware and applications.', '2026-11-02', '2026-11-06', false, 'https://iitm.ac.in', 'https://iitm.ac.in', true),
  ('QuantumIndia Community Meetup', 'Quantum Computing India', 'webinar', 'india', 'Community talks and networking for India''s growing quantum developer community.', '2026-11-14', NULL, true, 'https://quantumcomputingindia.com', 'https://quantumcomputingindia.com', false),
  ('Qiskit Global Summer School', 'IBM Quantum / Qiskit', 'fellowship', 'global', 'A global learning programme focused on quantum algorithms and machine learning.', '2027-07-12', '2027-07-23', true, 'https://qiskit.org/education', 'https://qiskit.org', true),
  ('IBM Quantum Challenge', 'IBM Quantum', 'hackathon', 'global', 'Hands-on coding challenges that build practical quantum programming skills.', '2026-12-01', '2026-12-05', true, 'https://quantum.ibm.com/challenges', 'https://quantum.ibm.com', false),
  ('IEEE Quantum Week', 'IEEE', 'conference', 'global', 'International conference and exhibition for quantum science and engineering.', '2026-09-14', '2026-09-18', false, 'https://qce.quantum.ieee.org', 'https://qce.quantum.ieee.org', true),
  ('QURI Quantum Computing Seminar', 'QURI', 'webinar', 'india', 'Research and industry perspectives on emerging quantum computing applications.', '2026-12-10', NULL, true, 'https://quri.network', 'https://quri.network', false),
  ('CERN Quantum Technology Fellowship', 'CERN', 'fellowship', 'global', 'A research fellowship for students and early-career researchers in quantum technologies.', '2027-01-15', '2027-06-30', false, 'https://careers.cern', 'https://careers.cern', false),
  ('Qiskit Fall Fest', 'IBM Quantum / Qiskit', 'hackathon', 'global', 'Community-led workshops and coding events hosted by universities worldwide.', '2026-10-05', '2026-11-15', true, 'https://qiskit.org/events', 'https://qiskit.org', false);
