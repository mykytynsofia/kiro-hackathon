import { ToolType } from './enums';

/**
 * Point coordinate on canvas
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A drawing stroke (continuous path)
 */
export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: ToolType;
}

/**
 * Complete drawing data for a canvas
 */
export interface DrawingData {
  strokes: Stroke[];
  width: number;
  height: number;
}
