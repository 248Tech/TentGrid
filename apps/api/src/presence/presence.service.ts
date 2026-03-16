import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

export type PresenceRecord = {
  userId: string;
  userName?: string;
  avatarUrl?: string;
  joinedAt: string;
  lastSeenAt: string;
  cursorPosition?: { x: number; y: number } | null;
};

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis;
  private readonly TTL_SECONDS = 30;

  constructor() {
    this.redis = new Redis(process.env["REDIS_URL"] ?? "redis://localhost:6379");
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  private presenceKey(projectId: string) {
    return `presence:project:${projectId}`;
  }

  async join(projectId: string, userId: string, meta: Omit<PresenceRecord, "joinedAt" | "lastSeenAt">) {
    const key = this.presenceKey(projectId);
    const now = new Date().toISOString();
    const record: PresenceRecord = {
      ...meta,
      userId,
      joinedAt: now,
      lastSeenAt: now,
    };
    await this.redis.hset(key, userId, JSON.stringify(record));
    await this.redis.expire(key, this.TTL_SECONDS * 10);
    return record;
  }

  async heartbeat(projectId: string, userId: string, cursorPosition?: { x: number; y: number }) {
    const key = this.presenceKey(projectId);
    const raw = await this.redis.hget(key, userId);
    if (!raw) return null;
    const record = JSON.parse(raw) as PresenceRecord;
    const updated: PresenceRecord = {
      ...record,
      lastSeenAt: new Date().toISOString(),
      cursorPosition: cursorPosition ?? record.cursorPosition,
    };
    await this.redis.hset(key, userId, JSON.stringify(updated));
    await this.redis.expire(key, this.TTL_SECONDS * 10);
    return updated;
  }

  async leave(projectId: string, userId: string) {
    const key = this.presenceKey(projectId);
    await this.redis.hdel(key, userId);
  }

  async getPresent(projectId: string): Promise<PresenceRecord[]> {
    const key = this.presenceKey(projectId);
    const all = await this.redis.hgetall(key);
    if (!all) return [];
    const now = Date.now();
    const results: PresenceRecord[] = [];
    for (const [uid, raw] of Object.entries(all)) {
      try {
        const record = JSON.parse(raw as string) as PresenceRecord;
        const lastSeen = new Date(record.lastSeenAt).getTime();
        if (now - lastSeen < this.TTL_SECONDS * 1000) {
          results.push(record);
        } else {
          // Clean up stale
          await this.redis.hdel(key, uid);
        }
      } catch {
        // ignore corrupt records
      }
    }
    return results;
  }
}
