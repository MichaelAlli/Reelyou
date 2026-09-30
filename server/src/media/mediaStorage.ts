import fs from 'node:fs';
import path from 'node:path';

import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { config } from '../config.js';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const s = config.media.s3;
    s3Client = new S3Client({
      region: s.region,
      endpoint: s.endpoint || undefined,
      credentials: {
        accessKeyId: s.accessKeyId,
        secretAccessKey: s.secretAccessKey,
      },
      forcePathStyle: Boolean(s.endpoint),
    });
  }
  return s3Client;
}

function localPathForKey(storageKey: string): string {
  const root = path.resolve(config.media.localRoot);
  const full = path.join(root, storageKey);
  if (!full.startsWith(root)) throw new Error('invalid_storage_key');
  return full;
}

export function buildStorageKey(ownerUserId: string, assetId: string, ext: string): string {
  const safeExt = ext.replace(/[^a-z0-9.]/gi, '').slice(0, 8) || 'bin';
  return `users/${ownerUserId}/${assetId}.${safeExt}`;
}

export function extensionForContentType(contentType: string): string {
  const ct = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
  if (ct.includes('jpeg')) return 'jpg';
  if (ct.includes('png')) return 'png';
  if (ct.includes('webp')) return 'webp';
  if (ct.includes('quicktime')) return 'mov';
  if (ct.includes('mp4')) return 'mp4';
  if (ct.includes('mpeg')) return 'mp3';
  if (ct.includes('wav')) return 'wav';
  if (ct.includes('webm')) return 'webm';
  return 'bin';
}

export async function createPresignedUploadUrl(input: {
  storageKey: string;
  contentType: string;
  sizeBytes: number;
}): Promise<{ uploadUrl: string; uploadHeaders: Record<string, string> }> {
  if (config.media.storage === 'local') {
    return {
      uploadUrl: `/v1/media/upload/${encodeURIComponent(input.storageKey)}`,
      uploadHeaders: { 'Content-Type': input.contentType },
    };
  }
  const command = new PutObjectCommand({
    Bucket: config.media.s3.bucket,
    Key: input.storageKey,
    ContentType: input.contentType,
    ContentLength: input.sizeBytes,
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 900 });
  return { uploadUrl, uploadHeaders: { 'Content-Type': input.contentType } };
}

export async function objectExists(storageKey: string): Promise<boolean> {
  if (config.media.storage === 'local') {
    return fs.existsSync(localPathForKey(storageKey));
  }
  try {
    await getS3Client().send(
      new HeadObjectCommand({ Bucket: config.media.s3.bucket, Key: storageKey }),
    );
    return true;
  } catch {
    return false;
  }
}

export async function writeLocalObject(storageKey: string, body: Buffer): Promise<void> {
  const file = localPathForKey(storageKey);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, file);
}

export async function createReadAccessUrl(storageKey: string): Promise<string> {
  if (config.media.storage === 'local') {
    return `/v1/media/raw/${encodeURIComponent(storageKey)}`;
  }
  const command = new GetObjectCommand({
    Bucket: config.media.s3.bucket,
    Key: storageKey,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: config.media.signedUrlTtlSec });
}

export async function deleteObject(storageKey: string): Promise<void> {
  if (config.media.storage === 'local') {
    const file = localPathForKey(storageKey);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    return;
  }
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: config.media.s3.bucket, Key: storageKey }),
  );
}

export function readLocalObject(storageKey: string): Buffer | null {
  const file = localPathForKey(storageKey);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file);
}
