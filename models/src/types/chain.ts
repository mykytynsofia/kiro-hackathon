import { EntryType } from './enums';
import { DrawingData } from './drawing';

/**
 * A single entry in a room's chain (prompt, drawing, or guess)
 */
export interface ChainEntry {
  type: EntryType;
  playerId: string;
  content?: string;
  drawingData?: DrawingData;
  timestamp: number;
}
