-- Initialize Settings Table for CMS Text
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize Users Table for Admin Access
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data
INSERT INTO settings (key, value) VALUES
('hero_headline', 'The Purest Form of Radiance'),
('hero_subtext', 'Experience the single-ingredient potency of 100% Pili Oil.'),
('amazon_link', 'https://www.amazon.com/dp/EXAMPLE_LINK')
ON CONFLICT (key) DO NOTHING;

-- Note: In production, password should be hashed (e.g., bcrypt)
INSERT INTO users (username, password_hash) VALUES
('admin', 'HASHED_PASSWORD_HERE')
ON CONFLICT (username) DO NOTHING;
