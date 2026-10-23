export interface VisionPreset {
  id: string;
  nameFr: string;
  nameAr: string;
  tagline: string;
  badge: string;
  imageUrl: string;
  hint: string;
}

export const VISION_PRESETS: VisionPreset[] = [
  {
    id: 'couscous-lamb',
    nameFr: 'Couscous Algérien à l’Agneau',
    nameAr: 'كسكسي جزائري بلحم الخروف والخضر',
    tagline: 'Standard 24cm Tebsi with braised lamb shank, steamed semolina, and chickpeas',
    badge: 'Meat-to-Carb Ratio 1:2.3',
    // High quality food photo representation (Unsplash curated royalty free food imagery)
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=800&q=80',
    hint: 'Couscous Bel Khodra w Lhem with lamb shank, steamed semolina, chickpeas and zucchini',
  },
  {
    id: 'chorba-frik',
    nameFr: 'Chorba Frik Traditionnelle',
    nameAr: 'شوربة فريك بالعاصمة والنعناع',
    tagline: 'Deep earthenware Zlafa bowl with green roasted durum wheat & diced beef',
    badge: 'High Fiber · Low GI',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    hint: 'Chorba Frik green cracked wheat soup with lamb cubes and chickpeas',
  },
  {
    id: 'karantika-slice',
    nameFr: 'Karantika Oranaise au Cumin',
    nameAr: 'كرنتيكا وهرانية بالكمون الساخن',
    tagline: 'Golden baked chickpea custard flan with caramelized Maillard crust',
    badge: 'Plant Protein & Lysine',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
    hint: 'Karantika chickpea flour baked flan with cumin and crust',
  },
  {
    id: 'rechta-poulet',
    nameFr: 'Rechta Algéroise Sauce Blanche',
    nameAr: 'رشتة عاصمية بالدجاج واللفت',
    tagline: 'Steamed thin pasta ribbons with braised chicken and sweet white turnips',
    badge: 'Glucosinolates & Protein',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    hint: 'Rechta Algéroise thin noodles with chicken and white turnip sauce',
  },
];
