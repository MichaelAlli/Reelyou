/** Display constellation — reference-aligned clusters with glowing star positions (normalized 0–1). */
export interface MySkyDisplayConstellation {
  id: string;
  color: string;
  stars: ReadonlyArray<{ x: number; y: number; size: number }>;
  /** Index pairs into `stars` for luminous connecting lines. */
  links: ReadonlyArray<[number, number]>;
}

/** Six colorful constellation groups — matches full My Sky reference composition. */
export const MY_SKY_DISPLAY_CONSTELLATIONS: ReadonlyArray<MySkyDisplayConstellation> = [
  {
    id: 'purpose-seekers',
    color: '#C44DFF',
    stars: [
      { x: 0.17, y: 0.13, size: 7.2 },
      { x: 0.24, y: 0.19, size: 5.8 },
      { x: 0.13, y: 0.21, size: 5.2 },
      { x: 0.21, y: 0.27, size: 6.4 },
      { x: 0.28, y: 0.15, size: 5 },
    ],
    links: [[0, 1], [1, 4], [1, 2], [2, 3], [0, 2]],
  },
  {
    id: 'personal-growth',
    color: '#32CD32',
    stars: [
      { x: 0.76, y: 0.11, size: 6.8 },
      { x: 0.83, y: 0.17, size: 5.6 },
      { x: 0.72, y: 0.19, size: 5.4 },
      { x: 0.80, y: 0.24, size: 6.2 },
      { x: 0.87, y: 0.13, size: 4.8 },
    ],
    links: [[0, 1], [0, 2], [1, 4], [1, 3], [2, 3]],
  },
  {
    id: 'mindset-masters',
    color: '#00A3FF',
    stars: [
      { x: 0.14, y: 0.36, size: 6.6 },
      { x: 0.21, y: 0.42, size: 5.4 },
      { x: 0.11, y: 0.44, size: 5 },
      { x: 0.18, y: 0.48, size: 5.8 },
    ],
    links: [[0, 1], [0, 2], [1, 3], [2, 3]],
  },
  {
    id: 'career-reinvention',
    color: '#FF8C00',
    stars: [
      { x: 0.79, y: 0.38, size: 6.8 },
      { x: 0.86, y: 0.44, size: 5.6 },
      { x: 0.74, y: 0.45, size: 5.2 },
      { x: 0.82, y: 0.50, size: 6 },
      { x: 0.89, y: 0.40, size: 4.8 },
    ],
    links: [[0, 1], [0, 2], [1, 4], [1, 3], [2, 3]],
  },
  {
    id: 'heart-healing',
    color: '#E0218A',
    stars: [
      { x: 0.16, y: 0.56, size: 6.4 },
      { x: 0.23, y: 0.62, size: 5.6 },
      { x: 0.12, y: 0.64, size: 5 },
      { x: 0.20, y: 0.68, size: 5.8 },
    ],
    links: [[0, 1], [0, 2], [1, 3], [2, 3]],
  },
  {
    id: 'creativity-souls',
    color: '#4169E1',
    stars: [
      { x: 0.77, y: 0.58, size: 6.6 },
      { x: 0.84, y: 0.64, size: 5.4 },
      { x: 0.73, y: 0.66, size: 5.2 },
      { x: 0.81, y: 0.70, size: 5.8 },
      { x: 0.88, y: 0.60, size: 4.8 },
    ],
    links: [[0, 1], [0, 2], [1, 4], [1, 3], [2, 3]],
  },
];

/** Golden shooting-star trail — normalized path matching reference arc. */
export const MY_SKY_SHOOTING_STAR_PATH = {
  start: { x: 0.5, y: 0.92 },
  control: { x: 0.62, y: 0.62 },
  end: { x: 0.48, y: 0.38 },
} as const;
