import { Redis } from "@upstash/redis";
import { PlayerProfile, EntriesByDate, createDefaultProfile } from "./game";

// Vercel KV was deprecated; the current recommended path is to add a
// Redis integration (Upstash) from the Vercel Marketplace. That
// integration injects KV_REST_API_URL / KV_REST_API_TOKEN (the naming it
// kept from the old "Vercel KV" days) rather than
// UPSTASH_REDIS_REST_URL/TOKEN, so we read whichever is actually set.
function getRedisUrl(): string {
  const kvStyleUrl = process.env.KV_REST_API_URL;
  if (kvStyleUrl !== undefined && kvStyleUrl.length > 0) {
    return kvStyleUrl;
  }
  const upstashStyleUrl = process.env.UPSTASH_REDIS_REST_URL;
  if (upstashStyleUrl !== undefined && upstashStyleUrl.length > 0) {
    return upstashStyleUrl;
  }
  return "";
}

function getRedisToken(): string {
  const kvStyleToken = process.env.KV_REST_API_TOKEN;
  if (kvStyleToken !== undefined && kvStyleToken.length > 0) {
    return kvStyleToken;
  }
  const upstashStyleToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (upstashStyleToken !== undefined && upstashStyleToken.length > 0) {
    return upstashStyleToken;
  }
  return "";
}

// Built lazily, on first actual use, instead of when this module is first
// imported. This matters at build time: Next.js imports every route
// module to collect metadata about it, without ever calling the handler.
// If the Redis client were constructed at import time with a missing or
// malformed URL, that import would throw and take the whole build down
// with it. Deferring construction means a bad value only breaks the one
// request that actually touches the database, instead of every deploy.
let cachedRedisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (cachedRedisClient !== null) {
    return cachedRedisClient;
  }
  cachedRedisClient = new Redis({
    url: getRedisUrl(),
    token: getRedisToken(),
  });
  return cachedRedisClient;
}

function getProfileKey(playerId: string): string {
  return "profile:" + playerId;
}

function getEntriesKey(playerId: string): string {
  return "entries:" + playerId;
}

export async function loadProfile(playerId: string): Promise<PlayerProfile> {
  const redisClient = getRedisClient();
  const storedProfile = await redisClient.get<PlayerProfile>(getProfileKey(playerId));
  if (storedProfile === null || storedProfile === undefined) {
    return createDefaultProfile();
  }
  return storedProfile;
}

export async function saveProfile(playerId: string, profile: PlayerProfile): Promise<void> {
  const redisClient = getRedisClient();
  await redisClient.set(getProfileKey(playerId), profile);
}

export async function loadEntries(playerId: string): Promise<EntriesByDate> {
  const redisClient = getRedisClient();
  const storedEntries = await redisClient.get<EntriesByDate>(getEntriesKey(playerId));
  if (storedEntries === null || storedEntries === undefined) {
    return {};
  }
  return storedEntries;
}

export async function saveEntries(playerId: string, entries: EntriesByDate): Promise<void> {
  const redisClient = getRedisClient();
  await redisClient.set(getEntriesKey(playerId), entries);
}