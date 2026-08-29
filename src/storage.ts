import { isCabinetItem } from "./domain";
import type { CabinetItem } from "./types";

const STORAGE_KEY = "amber-cabinet:v1";

export interface LoadResult {
  items: CabinetItem[];
  warning?: string;
}

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export class CabinetStorage {
  constructor(private readonly storage: Storage, private readonly key = STORAGE_KEY) {}

  load(): LoadResult {
    let raw: string | null;
    try {
      raw = this.storage.getItem(this.key);
    } catch {
      return { items: [], warning: "This browser blocked access to saved cabinet data. Changes may not survive a refresh." };
    }
    if (!raw) return { items: [] };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error();
      const seen = new Set<string>();
      const items = parsed.filter((value): value is CabinetItem => isCabinetItem(value) && !seen.has(value.id) && !!seen.add(value.id));
      return items.length === parsed.length ? { items } : { items, warning: `Recovered ${items.length} valid unique cabinet records; invalid data was ignored.` };
    } catch {
      return { items: [], warning: "Saved cabinet data was invalid. Nothing was overwritten; start fresh or restore your browser data." };
    }
  }

  save(items: CabinetItem[]): SaveResult {
    try {
      this.storage.setItem(this.key, JSON.stringify(items));
      return { ok: true };
    } catch {
      return { ok: false, error: "The cabinet could not be saved. Check browser storage permissions or available space." };
    }
  }
}
