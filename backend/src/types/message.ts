/**
 * Message structure for WebSocket communication
 */
export interface Message {
  type: string;
  payload: any;
  messageId?: string;
}
