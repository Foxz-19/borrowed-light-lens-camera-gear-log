export interface Chore { id: string; name: string }
export interface LoadResult { chores: Chore[]; error?: string }
export interface AppState { chores: Chore[]; rotation: number; spinning: boolean; winnerId: string | null }
