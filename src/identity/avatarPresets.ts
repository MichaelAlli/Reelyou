export interface AvatarPresetDefinition {
  id: string;
  label: string;
  gradientTop: string;
  gradientBottom: string;
  accent: string;
}

export const REELYOU_AVATAR_PRESETS: AvatarPresetDefinition[] = [
  { id: 'preset-dawn', label: 'Dawn', gradientTop: '#FFE8A8', gradientBottom: '#E879A8', accent: '#FFF8E7' },
  { id: 'preset-orbit', label: 'Orbit', gradientTop: '#9AE8FF', gradientBottom: '#5B45B8', accent: '#E8DCFF' },
  { id: 'preset-grove', label: 'Grove', gradientTop: '#B8FFD4', gradientBottom: '#2D6A4F', accent: '#F0FFF4' },
  { id: 'preset-ember', label: 'Ember', gradientTop: '#FFD57A', gradientBottom: '#8B4513', accent: '#FFF4E0' },
  { id: 'preset-night', label: 'Night', gradientTop: '#C4A8FF', gradientBottom: '#0C1230', accent: '#F5F0FF' },
  { id: 'preset-gold', label: 'Gold Path', gradientTop: '#FFF8E7', gradientBottom: '#E8C872', accent: '#1A1538' },
];

export function getAvatarPreset(id: string): AvatarPresetDefinition | undefined {
  return REELYOU_AVATAR_PRESETS.find((p) => p.id === id);
}
