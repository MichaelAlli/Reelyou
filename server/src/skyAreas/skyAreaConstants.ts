/** Established taxonomy seeded on first use — ids align with client SKY_AREA_CATEGORIES. */
export const ESTABLISHED_SKY_AREA_SEED: readonly { id: string; label: string; sortOrder: number }[] =
  [
    { id: 'growth', label: 'Growth', sortOrder: 10 },
    { id: 'purpose', label: 'Purpose', sortOrder: 20 },
    { id: 'relationships', label: 'Relationships', sortOrder: 30 },
    { id: 'career', label: 'Career', sortOrder: 40 },
    { id: 'entrepreneurship', label: 'Entrepreneurship', sortOrder: 50 },
    { id: 'creativity', label: 'Creativity', sortOrder: 60 },
    { id: 'health', label: 'Health', sortOrder: 70 },
    { id: 'faith-meaning', label: 'Faith & Meaning', sortOrder: 80 },
    { id: 'learning', label: 'Learning', sortOrder: 90 },
    { id: 'contribution', label: 'Contribution', sortOrder: 100 },
    { id: 'community', label: 'Community', sortOrder: 110 },
    { id: 'dance', label: 'Dance', sortOrder: 120 },
    { id: 'acting', label: 'Acting', sortOrder: 130 },
    { id: 'music', label: 'Music', sortOrder: 140 },
    { id: 'fitness', label: 'Fitness', sortOrder: 150 },
    { id: 'technology', label: 'Technology', sortOrder: 160 },
    { id: 'parenting', label: 'Parenting', sortOrder: 170 },
    { id: 'faith', label: 'Faith', sortOrder: 180 },
    { id: 'career-growth', label: 'Career Growth', sortOrder: 190 },
    { id: 'travel', label: 'Travel', sortOrder: 200 },
    { id: 'writing', label: 'Writing', sortOrder: 210 },
    { id: 'film', label: 'Film', sortOrder: 220 },
    { id: 'photography', label: 'Photography', sortOrder: 230 },
    { id: 'wellness', label: 'Wellness', sortOrder: 240 },
  ] as const;

export const SKY_AREA_PROMOTION_THRESHOLD = 3;

export const MAX_CUSTOM_SKY_AREAS_PER_SAVE = 5;
