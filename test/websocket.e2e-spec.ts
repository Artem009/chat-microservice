import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createTestApp } from './helpers/e2e-setup';
import WebSocket from 'ws';

interface WsMessage {
  event: string;
  data: unknown;
}

function waitForMessage(ws: WebSocket): Promise<WsMessage> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('WS message timeout')),
      5000,
    );
    ws.once('message', (raw: WebSocket.RawData) => {
      clearTimeout(timeout);
      let text: string;
      if (raw instanceof Buffer) {
        text = raw.toString('utf-8');
      } else if (raw instanceof ArrayBuffer) {
        text = Buffer.from(raw).toString('utf-8');
      } else {
        text = Buffer.concat(raw).toString('utf-8');
      }
      resolve(JSON.parse(text) as WsMessage);
    });
  });
}

function sendWsMessage(ws: WebSocket, event: string, data: unknown): void {
  ws.send(JSON.stringify({ event, data }));
}

function createWsClient(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

describe('WebSocket Gateway (e2e)', () => {
  let app: NestFastifyApplication;
  let port: number;

  const conversationId = '550e8400-e29b-41d4-a716-446655440001';
  const userId1 = '550e8400-e29b-41d4-a716-446655440010';
  const userId2 = '550e8400-e29b-41d4-a716-446655440011';

  beforeAll(async () => {
    ({ app } = await createTestApp());
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address();
    port = typeof address === 'string' ? parseInt(address) : address!.port;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Connection', () => {
    it('should connect successfully', async () => {
      const ws = await createWsClient(port);
      expect(ws.readyState).toBe(WebSocket.OPEN);
      ws.close();
    });
  });

  describe('joinConversation', () => {
    it('should join a conversation and receive confirmation', async () => {
      const ws = await createWsClient(port);

      const messagePromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      const response = await messagePromise;

      expect(response.event).toBe('joinedConversation');
      expect(response.data).toEqual({ conversationId });

      ws.close();
    });

    it('should broadcast presence online to other clients', async () => {
      const ws1 = await createWsClient(port);
      const ws2 = await createWsClient(port);

      // Client 1 joins first
      const join1Promise = waitForMessage(ws1);
      sendWsMessage(ws1, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await join1Promise;

      // Client 2 joins — client 1 should receive presence update
      const presencePromise = waitForMessage(ws1);
      const join2Promise = waitForMessage(ws2);
      sendWsMessage(ws2, 'joinConversation', {
        conversationId,
        userId: userId2,
      });

      const [presence, join2] = await Promise.all([
        presencePromise,
        join2Promise,
      ]);

      expect(join2.event).toBe('joinedConversation');
      expect(presence.event).toBe('presenceUpdate');
      expect(presence.data).toEqual({ userId: userId2, status: 'online' });

      ws1.close();
      ws2.close();
    });
  });

  describe('typing', () => {
    it('should broadcast typing event to other clients in room', async () => {
      const ws1 = await createWsClient(port);
      const ws2 = await createWsClient(port);

      // Both join the conversation
      const join1 = waitForMessage(ws1);
      sendWsMessage(ws1, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await join1;

      const presenceOnWs1 = waitForMessage(ws1);
      const join2 = waitForMessage(ws2);
      sendWsMessage(ws2, 'joinConversation', {
        conversationId,
        userId: userId2,
      });
      await Promise.all([presenceOnWs1, join2]);

      // Client 1 starts typing — client 2 should receive userTyping
      const typingPromise = waitForMessage(ws2);
      sendWsMessage(ws1, 'typing', { conversationId, userId: userId1 });
      const typing = await typingPromise;

      expect(typing.event).toBe('userTyping');
      expect(typing.data).toEqual({ conversationId, userId: userId1 });

      ws1.close();
      ws2.close();
    });

    it('should broadcast stopTyping event to other clients', async () => {
      const ws1 = await createWsClient(port);
      const ws2 = await createWsClient(port);

      // Both join
      const join1 = waitForMessage(ws1);
      sendWsMessage(ws1, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await join1;

      const presenceOnWs1 = waitForMessage(ws1);
      const join2 = waitForMessage(ws2);
      sendWsMessage(ws2, 'joinConversation', {
        conversationId,
        userId: userId2,
      });
      await Promise.all([presenceOnWs1, join2]);

      // Client 1 starts typing
      const typingPromise = waitForMessage(ws2);
      sendWsMessage(ws1, 'typing', { conversationId, userId: userId1 });
      await typingPromise;

      // Client 1 stops typing
      const stopTypingPromise = waitForMessage(ws2);
      sendWsMessage(ws1, 'stopTyping', { conversationId, userId: userId1 });
      const stopTyping = await stopTypingPromise;

      expect(stopTyping.event).toBe('userStoppedTyping');
      expect(stopTyping.data).toEqual({ conversationId, userId: userId1 });

      ws1.close();
      ws2.close();
    });
  });

  describe('Presence (disconnect)', () => {
    it('should broadcast offline when client disconnects', async () => {
      const ws1 = await createWsClient(port);
      const ws2 = await createWsClient(port);

      // Both join
      const join1 = waitForMessage(ws1);
      sendWsMessage(ws1, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await join1;

      const presenceOnWs1 = waitForMessage(ws1);
      const join2 = waitForMessage(ws2);
      sendWsMessage(ws2, 'joinConversation', {
        conversationId,
        userId: userId2,
      });
      await Promise.all([presenceOnWs1, join2]);

      // Client 2 disconnects — client 1 should receive offline presence
      const offlinePromise = waitForMessage(ws1);
      ws2.close();
      const offline = await offlinePromise;

      expect(offline.event).toBe('presenceUpdate');
      expect(offline.data).toEqual({ userId: userId2, status: 'offline' });

      ws1.close();
    });
  });
});
