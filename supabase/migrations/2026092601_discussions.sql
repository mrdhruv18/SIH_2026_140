-- ============================================================
-- Quantify — Discussion Forum Migration
-- 2026-09-26
-- ============================================================

-- 1. Categories ---------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  icon        text,
  sort_order  int DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE discussion_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON discussion_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_all"  ON discussion_categories FOR ALL    TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 2. Tags ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags_select_all"  ON discussion_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "tags_insert_auth" ON discussion_tags FOR INSERT TO authenticated WITH CHECK (true);

-- 3. Discussions ---------------------------------------------------
CREATE TABLE IF NOT EXISTS discussions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES discussion_categories(id),
  type        text NOT NULL CHECK (type IN ('question','discussion','research','project','help')),
  title       text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 300),
  content     text NOT NULL CHECK (char_length(content) >= 10),
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','solved','closed')),
  view_count  int  NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discussions_select_auth" ON discussions FOR SELECT TO authenticated USING (true);
CREATE POLICY "discussions_insert_own"  ON discussions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "discussions_update_own"  ON discussions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "discussions_delete_own"  ON discussions FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Discussion ↔ Tags join ----------------------------------------
CREATE TABLE IF NOT EXISTS discussion_tag_map (
  discussion_id uuid REFERENCES discussions(id)     ON DELETE CASCADE,
  tag_id        uuid REFERENCES discussion_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (discussion_id, tag_id)
);

ALTER TABLE discussion_tag_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tag_map_select_all"  ON discussion_tag_map FOR SELECT TO authenticated USING (true);
CREATE POLICY "tag_map_insert_auth" ON discussion_tag_map FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tag_map_delete_own"  ON discussion_tag_map FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM discussions d WHERE d.id = discussion_id AND d.user_id = auth.uid()));

-- 5. Replies -------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_replies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id   uuid REFERENCES discussions(id)         ON DELETE CASCADE NOT NULL,
  user_id         uuid REFERENCES auth.users(id)          ON DELETE CASCADE NOT NULL,
  parent_reply_id uuid REFERENCES discussion_replies(id)  ON DELETE CASCADE,
  content         text NOT NULL CHECK (char_length(content) >= 1),
  is_accepted     boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "replies_select_auth" ON discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "replies_insert_own"  ON discussion_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "replies_update_own"  ON discussion_replies FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "replies_delete_own"  ON discussion_replies FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE TRIGGER replies_updated_at
  BEFORE UPDATE ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Votes ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_votes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id)           ON DELETE CASCADE NOT NULL,
  discussion_id uuid REFERENCES discussions(id)          ON DELETE CASCADE,
  reply_id      uuid REFERENCES discussion_replies(id)   ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, discussion_id),
  UNIQUE (user_id, reply_id),
  CHECK (
    (discussion_id IS NOT NULL AND reply_id IS NULL) OR
    (discussion_id IS NULL AND reply_id IS NOT NULL)
  )
);

ALTER TABLE discussion_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_all"   ON discussion_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "votes_insert_own"   ON discussion_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_delete_own"   ON discussion_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Reports -------------------------------------------------------
CREATE TABLE IF NOT EXISTS discussion_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id)           ON DELETE CASCADE NOT NULL,
  discussion_id uuid REFERENCES discussions(id)          ON DELETE CASCADE,
  reply_id      uuid REFERENCES discussion_replies(id)   ON DELETE CASCADE,
  reason        text NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','misleading','off-topic','other')),
  description   text,
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed')),
  created_at    timestamptz DEFAULT now(),
  CHECK ((discussion_id IS NOT NULL) OR (reply_id IS NOT NULL))
);

ALTER TABLE discussion_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert_own"   ON discussion_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_select_admin" ON discussion_reports FOR SELECT TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_discussions_user_id     ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category_id ON discussions(category_id);
CREATE INDEX IF NOT EXISTS idx_discussions_status      ON discussions(status);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at  ON discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_type        ON discussions(type);
CREATE INDEX IF NOT EXISTS idx_replies_discussion_id   ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_replies_user_id         ON discussion_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_discussion_id     ON discussion_votes(discussion_id);
CREATE INDEX IF NOT EXISTS idx_votes_reply_id          ON discussion_votes(reply_id);

-- ============================================================
-- Seed: Quantum-Specific Categories
-- ============================================================
INSERT INTO discussion_categories (name, slug, description, icon, sort_order) VALUES
  ('Quantum Fundamentals',      'quantum-fundamentals',      'Qubits, superposition, measurement, entanglement, and quantum states',              '⚛️',  1),
  ('Quantum Mathematics',       'quantum-mathematics',       'Linear algebra, complex numbers, tensor products, Dirac notation',                  '🔢',  2),
  ('Quantum Algorithms',        'quantum-algorithms',        'Deutsch-Jozsa, Grover, Shor, Simon, QFT, VQE, QAOA and more',                      '⚡',  3),
  ('Quantum Programming',       'quantum-programming',       'Qiskit, Q#, PennyLane, Cirq, quantum circuits and simulators',                     '💻',  4),
  ('Quantum Hardware',          'quantum-hardware',          'Superconducting qubits, trapped ions, photonics, neutral atoms, cryogenics',        '🔬',  5),
  ('Quantum Information',       'quantum-information',       'Quantum communication, teleportation, superdense coding, channels',                 '📡',  6),
  ('Quantum Cryptography',      'quantum-cryptography',      'QKD, BB84, quantum security, post-quantum cryptography',                           '🔐',  7),
  ('Quantum Error Correction',  'quantum-error-correction',  'Quantum noise, decoherence, surface codes, fault tolerance',                       '🛡️',  8),
  ('Quantum Machine Learning',  'quantum-ml',                'Quantum neural networks, quantum kernels, variational circuits, hybrid QML',        '🤖',  9),
  ('Quantum Research',          'quantum-research',          'Research papers, new discoveries, experimental results, open problems',             '📚', 10),
  ('Projects',                  'projects',                  'Quantum projects, Qiskit implementations, student and research projects',           '🚀', 11),
  ('Career & Learning',         'career-learning',           'Learning roadmaps, quantum careers, internships, research opportunities',           '🎓', 12)
ON CONFLICT (slug) DO NOTHING;
