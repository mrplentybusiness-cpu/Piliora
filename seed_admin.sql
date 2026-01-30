-- Create default admin user (password: admin)
INSERT INTO users (username, password) 
VALUES ('admin@piliora.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Seed initial site content
INSERT INTO settings (key, value) 
VALUES ('site_content', '{
  "hero": {
    "headline": "The Purest Form of Radiance",
    "subtext": "Experience the single-ingredient potency of 100% Pili Oil. Harvested from the Tree of Hope in the Philippines, this rare elixir restores vitality and softness.",
    "bgImage": "/attached_assets/generated_images/luxury_golden_oil_texture_macro_shot.png"
  },
  "science": {
    "title": "One Ingredient, Infinite Results",
    "content": "Canarium ovatum. A botanical marvel. Rich in essential fatty acids, Vitamin E, and antioxidants, it doesn'\''t just moisturize—it rebuilds. Our process preserves the oil'\''s raw integrity, delivering a bioactive concentration that synthetic formulas cannot replicate.",
    "image": "/attached_assets/generated_images/botanical_ingredients_minimalist_composition.png"
  },
  "ritual": {
    "title": "Daily Ritual",
    "steps": [
      {"title": "Prepare", "text": "Cleanse skin thoroughly with warm water to open pores."},
      {"title": "Apply", "text": "Warm 2-3 drops of Pili Oil in your palms and press gently into face and neck."},
      {"title": "Protect", "text": "Allow to absorb fully. The antioxidants form a natural barrier against environmental stressors."}
    ]
  },
  "product": {
    "name": "Piliora Pili Oil",
    "price": 85.00,
    "amazonLink": "https://www.amazon.com/dp/EXAMPLE_LINK",
    "image": "/attached_assets/5F1A3299_1765827020713.jpeg",
    "lifestyleImage": "/attached_assets/generated_images/skincare_product_lifestyle_on_stone.png",
    "images": [
      "/attached_assets/5F1A3299_1765827020713.jpeg",
      "/attached_assets/generated_images/skincare_product_lifestyle_on_stone.png",
      "/attached_assets/generated_images/botanical_ingredients_minimalist_composition.png"
    ]
  }
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
