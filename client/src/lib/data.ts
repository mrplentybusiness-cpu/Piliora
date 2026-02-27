import productMain from "@assets/5F1A3299_1765827020713.jpeg";
import textureBg from "@assets/generated_images/luxury_golden_oil_texture_macro_shot.png";
import ingredientsImg from "@assets/generated_images/botanical_ingredients_minimalist_composition.png";
import lifestyleImg from "@assets/generated_images/skincare_product_lifestyle_on_stone.png";

export const SITE_CONTENT = {
  hero: {
    headline: "The Purest Form of Radiance",
    subtext: "Experience the single-ingredient potency of 100% Pili Oil. Harvested from the 'Tree of Hope' in the Philippines, this rare elixir restores vitality and softness.",
    bgImage: textureBg,
    bottleImage: "/bottle-hero.png",
  },
  science: {
    title: "One Ingredient, Infinite Results",
    content: "Canarium ovatum. A botanical marvel. Rich in essential fatty acids, Vitamin E, and antioxidants, it doesn't just moisturize—it rebuilds. Our process preserves the oil's raw integrity, delivering a bioactive concentration that synthetic formulas cannot replicate.",
    image: ingredientsImg
  },
  ritual: {
    title: "Daily Ritual",
    steps: [
      { title: "Prepare", text: "Cleanse skin thoroughly with warm water to open pores." },
      { title: "Apply", text: "Warm 2-3 drops of Pili Oil in your palms and press gently into face and neck." },
      { title: "Protect", text: "Allow to absorb fully. The antioxidants form a natural barrier against environmental stressors." }
    ]
  },
  product: {
    name: "Piliora Pili Oil",
    price: 85.00,
    amazonLink: "https://www.amazon.com/dp/EXAMPLE_LINK",
    image: productMain,
    lifestyleImage: lifestyleImg,
    images: [productMain, lifestyleImg, ingredientsImg]
  },
  story: {
    heroLabel: "Our Heritage",
    heroHeadline: "The Tree of Hope",
    heroIntro: "From the volcanic soil of the Philippines comes a gift of nature — the Pili tree, known locally as the \"Tree of Hope\" for its remarkable resilience and life-giving properties.",
    originLabel: "The Origin",
    originHeading: "Canarium Ovatum",
    originContent1: "Pronounced \"pee-lee-aura\" — PILIORA takes its name from the Pili tree (Canarium ovatum), a species endemic to the Philippines. For centuries, Filipino communities have revered this tree not just for its prized nuts, but for the precious oil extracted from its kernel.",
    originContent2: "Growing in the nutrient-rich volcanic soil of the Bicol region, the Pili tree thrives in conditions that infuse its oil with an exceptional concentration of vitamins, antioxidants, and essential fatty acids.",
    originContent3: "We partner directly with local farming communities, ensuring fair trade practices and sustainable harvesting methods that protect both the trees and the livelihoods of the families who tend them.",
    originImage: "",
    originRegionTitle: "Bicol Region, Philippines",
    originRegionSubtitle: "Where volcanic soil meets tropical climate",
    philosophyLabel: "Our Philosophy",
    philosophyHeading: "One Ingredient. Pure Intention.",
    philosophyIntro: "In a world of complex formulations and lengthy ingredient lists, we chose a different path. PILIORA is 100% pure Pili Oil — nothing added, nothing taken away.",
    philosophyItems: [
      { title: "Sustainably Sourced", description: "Every drop is ethically harvested from trees grown without pesticides or chemicals, supporting local Filipino communities." },
      { title: "Single Ingredient", description: "We believe in the power of purity. No fillers, no preservatives, no synthetic fragrances — just nature's perfect formula." },
      { title: "Cold-Pressed", description: "Our gentle extraction process preserves the oil's natural bioactive compounds, ensuring maximum potency and efficacy." }
    ],
    commitmentLabel: "Our Commitment",
    commitmentHeading: "Beauty That Gives Back",
    commitmentContent1: "Every purchase of PILIORA directly supports the farming communities of the Bicol region. We pay fair wages, invest in sustainable farming practices, and contribute to local education initiatives.",
    commitmentContent2: "When you choose PILIORA, you're not just choosing exceptional skincare — you're choosing to be part of a movement that values people, planet, and purity above all else."
  },
  layout: {
    headerTagline: "One ingredient. One ritual.",
    footerDescription: "Organic luxury skincare harvested from the volcanic soil of the Philippines. Pure, potent, and ethically sourced.",
    copyrightText: "Piliora Skincare. All rights reserved.",
    instagramUrl: "https://instagram.com",
    facebookUrl: "https://facebook.com",
    mobileMenuTagline: "Pure Pili Oil from the Philippines",
    navHomeLabel: "Home",
    navStoryLabel: "Our Story",
    navAboutLabel: "About",
    footerLogo: "/logo-footer.png",
    mobileLogo: "/logo-footer.png"
  },
  benefits: {
    label: "Nature's Perfect Formula",
    heading: "The Power of Pili Oil",
    subtitle: "Discover why this single ingredient delivers what complex formulas cannot.",
    items: [
      { title: "Vitamin E Rich", description: "Natural antioxidant protection that fights free radicals and prevents premature aging." },
      { title: "Essential Fatty Acids", description: "Omega 6 & 9 penetrate deep to restore skin's moisture barrier and elasticity." },
      { title: "Rapid Absorption", description: "Lightweight molecular structure absorbs instantly without greasy residue." },
      { title: "Anti-Inflammatory", description: "Soothes irritation, reduces redness, and calms sensitive skin conditions." }
    ]
  },
  gallery: {
    label: "The Experience",
    heading: "Luxury in Every Detail"
  }
};

export const ASSETS = {
  productMain,
  textureBg,
  ingredientsImg,
  lifestyleImg
};

export const PRODUCT = {
  id: "pili-oil-001",
  name: "Piliora Pili Oil",
  subtitle: "The Essence of Moisturization",
  price: 85.00,
  volume: "30ml / 1oz",
  description: "Experience the single-ingredient potency of 100% pure Pili Oil. Cold-pressed from the kernels of the Canarium ovatum tree in the Philippines, this rare elixir delivers deep hydration, antioxidant protection, and a natural radiance.",
  images: [productMain, lifestyleImg, ingredientsImg],
  ingredients: ["Canarium Ovatum (Pili) Nut Oil — 100%"],
  benefits: [
    { title: "Deep Hydration", description: "Rich in essential fatty acids that penetrate and restore the skin's moisture barrier." },
    { title: "Anti-Aging", description: "Packed with Vitamin E and antioxidants to fight free radicals and prevent premature aging." },
    { title: "Fast Absorbing", description: "Lightweight molecular structure absorbs instantly without greasy residue." },
    { title: "All Natural", description: "100% pure Pili Oil — no fillers, preservatives, or synthetic additives." },
  ],
};
