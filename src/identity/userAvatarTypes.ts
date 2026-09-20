export type AvatarSourceType = 'profilePhoto' | 'presetAvatar' | 'customAvatar' | 'defaultSilhouette';

export interface CustomAvatarConfig {
  silhouette: 'traveler' | 'stargazer' | 'pathfinder';
  skinTone: string;
  hairStyle: 'short' | 'waves' | 'coil' | 'bald';
  hairColor: string;
  clothingStyle: 'wrap' | 'cloak' | 'tunic';
  clothingColor: string;
  accessory?: 'none' | 'star-pin' | 'compass';
}

export interface UserAvatarIdentity {
  version: number;
  avatarSourceType: AvatarSourceType;
  avatarAssetId?: string;
  profilePhotoUri?: string | null;
  customAvatarConfig?: CustomAvatarConfig;
}

export const DEFAULT_CUSTOM_AVATAR: CustomAvatarConfig = {
  silhouette: 'traveler',
  skinTone: '#C68642',
  hairStyle: 'waves',
  hairColor: '#2A1F1A',
  clothingStyle: 'wrap',
  clothingColor: '#3D3566',
  accessory: 'star-pin',
};

export const DEFAULT_USER_AVATAR_IDENTITY: UserAvatarIdentity = {
  version: 1,
  avatarSourceType: 'defaultSilhouette',
};
