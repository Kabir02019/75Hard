import { Redis } from "@upstash/redis";
import { PlayerProfile, EntriesByDate, createDefaultProfile } from "./game";

// Vercel KV was deprecated; the current recommended path is to add a
// Redis integration (Upstash) from the Vercel Marketplace, which sets
// these two environment variables for you automatically.
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

function getProfileKey(playerId: string): string {
  return "profile:" + playerId;
}

function getEntriesKey(playerId: string): string {
  return "entries:" + playerId;
}

export async function loadProfile(playerId: string): Promise<PlayerProfile> {
  const storedProfile = await redisClient.get<PlayerProfile>(getProfileKey(playerId));
  if (storedProfile === null || storedProfile === undefined) {
    return createDefaultProfile();
  }
  return storedProfile;
}

export async function saveProfile(playerId: string, profile: PlayerProfile): Promise<void> {
  await redisClient.set(getProfileKey(playerId), profile);
}

export async function loadEntries(playerId: string): Promise<EntriesByDate> {
  const storedEntries = await redisClient.get<EntriesByDate>(getEntriesKey(playerId));
  if (storedEntries === null || storedEntries === undefined) {
    return {};
  }
  return storedEntries;
}

export async function saveEntries(playerId: string, entries: EntriesByDate): Promise<void> {
  await redisClient.set(getEntriesKey(playerId), entries);
}
