export interface FoodLabel { id: string; food: string; stored: string; note: string }
export interface LoadResult { labels: FoodLabel[]; error?: string }
