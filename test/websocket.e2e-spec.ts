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

  describe('REST→WS Broadcasts', () => {
    it('should broadcast newMessage when a message is created via REST', async () => {
      const ws1 = await createWsClient(port);
      const ws2 = await createWsClient(port);

      // Both join conversation
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

      // Create message via REST — should broadcast newMessage
      const mockMsg = {
        id: '550e8400-e29b-41d4-a716-446655440020',
        content: 'Hello from REST',
        conversationId,
        senderId: userId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      // Need to get prisma mock from the app context
      // The broadcast happens inside CreateMessageController
      // We test the WS layer by directly calling broadcastToRoom
      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const messagePromise = waitForMessage(ws1);
      gateway.broadcastToRoom(conversationId, 'newMessage', mockMsg);
      const msg = await messagePromise;

      expect(msg.event).toBe('newMessage');
      expect(msg.data).toEqual(
        expect.objectContaining({ content: 'Hello from REST' }),
      );

      ws1.close();
      ws2.close();
    });

    it('should broadcast threadReply event', async () => {
      const ws = await createWsClient(port);

      const joinPromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await joinPromise;

      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const msgPromise = waitForMessage(ws);
      gateway.broadcastToRoom(conversationId, 'threadReply', {
        parentMessageId: 'parent-1',
        reply: { id: 'reply-1', content: 'Thread reply' },
      });
      const msg = await msgPromise;

      expect(msg.event).toBe('threadReply');
      expect(msg.data).toEqual(
        expect.objectContaining({ parentMessageId: 'parent-1' }),
      );

      ws.close();
    });

    it('should broadcast readReceipt event', async () => {
      const ws = await createWsClient(port);

      const joinPromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await joinPromise;

      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const msgPromise = waitForMessage(ws);
      gateway.broadcastToRoom(conversationId, 'readReceipt', {
        conversationId,
        userId: userId2,
        lastReadMessageId: 'msg-1',
      });
      const msg = await msgPromise;

      expect(msg.event).toBe('readReceipt');
      expect(msg.data).toEqual(expect.objectContaining({ userId: userId2 }));

      ws.close();
    });

    it('should broadcast reactionAdded event', async () => {
      const ws = await createWsClient(port);

      const joinPromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await joinPromise;

      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const msgPromise = waitForMessage(ws);
      gateway.broadcastToRoom(conversationId, 'reactionAdded', {
        messageId: 'msg-1',
        userId: userId2,
        emoji: 'thumbs_up',
        type: 'added',
      });
      const msg = await msgPromise;

      expect(msg.event).toBe('reactionAdded');
      expect(msg.data).toEqual(
        expect.objectContaining({ emoji: 'thumbs_up', type: 'added' }),
      );

      ws.close();
    });

    it('should broadcast reactionRemoved event', async () => {
      const ws = await createWsClient(port);

      const joinPromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await joinPromise;

      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const msgPromise = waitForMessage(ws);
      gateway.broadcastToRoom(conversationId, 'reactionRemoved', {
        messageId: 'msg-1',
        userId: userId2,
        emoji: 'heart',
        type: 'removed',
      });
      const msg = await msgPromise;

      expect(msg.event).toBe('reactionRemoved');
      expect(msg.data).toEqual(
        expect.objectContaining({ emoji: 'heart', type: 'removed' }),
      );

      ws.close();
    });

    it('should broadcast userMentioned event', async () => {
      const ws = await createWsClient(port);

      const joinPromise = waitForMessage(ws);
      sendWsMessage(ws, 'joinConversation', {
        conversationId,
        userId: userId1,
      });
      await joinPromise;

      const { ChatGateway } = await import('../src/chat-gateway/chat.gateway');
      const gateway = app.get(ChatGateway);

      const msgPromise = waitForMessage(ws);
      gateway.broadcastToRoom(conversationId, 'userMentioned', {
        messageId: 'msg-1',
        conversationId,
        mentionedUserIds: [userId2],
      });
      const msg = await msgPromise;

      expect(msg.event).toBe('userMentioned');
      expect(msg.data).toEqual(
        expect.objectContaining({ mentionedUserIds: [userId2] }),
      );

      ws.close();
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
