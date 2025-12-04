import { MessageHandler, HandlerContext } from '../types';

/**
 * Routes messages to appropriate handlers
 */
export class MessageRouter {
  private handlers: Map<string, MessageHandler> = new Map();

  /**
   * Register a handler for a message type
   */
  register(type: string, handler: MessageHandler): void {
    this.handlers.set(type, handler);
  }

  /**
   * Route a message to its handler
   */
  async route(context: HandlerContext): Promise<void> {
    const handler = this.handlers.get(context.message.type);

    if (!handler) {
      throw new Error(`No handler registered for message type: ${context.message.type}`);
    }

    await handler(context);
  }

  /**
   * Check if a handler exists for a message type
   */
  hasHandler(type: string): boolean {
    return this.handlers.has(type);
  }
}
