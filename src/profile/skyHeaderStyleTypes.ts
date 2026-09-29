export type SkyHeaderStyleId = 'starlight' | 'golden_glow' | 'constellation';

export const SKY_HEADER_STYLE_OPTIONS: {
  id: SkyHeaderStyleId;
  label: string;
  description: string;
}[] = [
  { id: 'starlight', label: 'Starlight', description: 'Clean lettering with a subtle star accent.' },
  { id: 'golden_glow', label: 'Golden Glow', description: 'Restrained gold emphasis.' },
  {
    id: 'constellation',
    label: 'Constellation',
    description: 'Delicate constellation detail around your name.',
  },
];
