import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';

interface MockClient {
  id: string;
  send: jest.Mock;
  on: jest.Mock;
}

function createMockClient(): MockClient {
  return {
    id: '',
    send: jest.fn(),
    on: jest.fn(),
  };
}

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ChatGateway', () => {
    it('should be defined', () => {
      expect(gateway).toBeDefined();
    });
  });

  describe('handleConnection', () => {
    it('should assign an id and track the client', () => {
      const client = createMockClient();
      gateway.handleConnection(client);

      expect(client.id).toBe('ws-1');
    });

    it('should assign unique ids to multiple clients', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();

      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      expect(client1.id).toBe('ws-1');
      expect(client2.id).toBe('ws-2');
    });
  });

  describe('handleDisconnect', () => {
    it('should remove the client from tracking', () => {
      const client = createMockClient();
      gateway.handleConnection(client);
      gateway.handleDisconnect(client);

      gateway.broadcastToRoom('conv-1', 'test', {});
      expect(client.send).not.toHaveBeenCalled();
    });

    it('should remove client from all rooms on disconnect', () => {
      const client = createMockClient();
      gateway.handleConnection(client);
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-2', userId: 'user-1' },
        client,
      );

      gateway.handleDisconnect(client);

      gateway.broadcastToRoom('conv-1', 'test', {});
      gateway.broadcastToRoom('conv-2', 'test', {});
      expect(client.send).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinConversation', () => {
    it('should add client to conversation room', () => {
      const client = createMockClient();
      gateway.handleConnection(client);

      const result = gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );

      expect(result).toEqual({
        event: 'joinedConversation',
        data: { conversationId: 'conv-1' },
      });
    });

    it('should allow multiple clients in same room', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      // Clear mocks from presence broadcasts during join
      client1.send.mockClear();
      client2.send.mockClear();

      gateway.broadcastToRoom('conv-1', 'test', { msg: 'hello' });

      expect(client1.send).toHaveBeenCalledTimes(1);
      expect(client2.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleLeaveConversation', () => {
    it('should remove client from conversation room', () => {
      const client = createMockClient();
      gateway.handleConnection(client);
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );

      const result = gateway.handleLeaveConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );

      expect(result).toEqual({
        event: 'leftConversation',
        data: { conversationId: 'conv-1' },
      });

      gateway.broadcastToRoom('conv-1', 'test', {});
      expect(client.send).not.toHaveBeenCalled();
    });

    it('should clean up empty rooms', () => {
      const client = createMockClient();
      gateway.handleConnection(client);
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );
      gateway.handleLeaveConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );

      gateway.broadcastToRoom('conv-1', 'test', {});
      expect(client.send).not.toHaveBeenCalled();
    });
  });

  describe('broadcastToRoom', () => {
    it('should send message to all clients in room', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      const payload = { id: 'msg-1', content: 'Hello' };
      gateway.broadcastToRoom('conv-1', 'newMessage', payload);

      const expectedMessage = JSON.stringify({
        event: 'newMessage',
        data: payload,
      });
      expect(client1.send).toHaveBeenCalledWith(expectedMessage);
      expect(client2.send).toHaveBeenCalledWith(expectedMessage);
    });

    it('should not send to clients in other rooms', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-2', userId: 'user-2' },
        client2,
      );

      gateway.broadcastToRoom('conv-1', 'newMessage', { msg: 'hello' });

      expect(client1.send).toHaveBeenCalledTimes(1);
      expect(client2.send).not.toHaveBeenCalled();
    });

    it('should handle send errors gracefully', () => {
      const client = createMockClient();
      client.send.mockImplementation(() => {
        throw new Error('Connection closed');
      });
      gateway.handleConnection(client);
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client,
      );

      expect(() => gateway.broadcastToRoom('conv-1', 'test', {})).not.toThrow();
    });

    it('should be a no-op for non-existent rooms', () => {
      expect(() =>
        gateway.broadcastToRoom('nonexistent', 'test', {}),
      ).not.toThrow();
    });
  });

  describe('handleTyping', () => {
    it('should broadcast userTyping to other participants', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      // Clear send mocks from join presence broadcasts
      client1.send.mockClear();
      client2.send.mockClear();

      gateway.handleTyping(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );

      // Sender should NOT receive typing event
      expect(client1.send).not.toHaveBeenCalled();
      // Other participant should receive it
      expect(client2.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'userTyping',
          data: { conversationId: 'conv-1', userId: 'user-1' },
        }),
      );
    });

    it('should not broadcast to non-existent room', () => {
      const client = createMockClient();
      gateway.handleConnection(client);

      expect(() =>
        gateway.handleTyping(
          { conversationId: 'nonexistent', userId: 'user-1' },
          client,
        ),
      ).not.toThrow();
    });
  });

  describe('handleStopTyping', () => {
    it('should broadcast userStoppedTyping to other participants', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      client1.send.mockClear();
      client2.send.mockClear();

      gateway.handleStopTyping(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );

      expect(client1.send).not.toHaveBeenCalled();
      expect(client2.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'userStoppedTyping',
          data: { conversationId: 'conv-1', userId: 'user-1' },
        }),
      );
    });
  });

  describe('presence', () => {
    it('should broadcast presenceUpdate online on join', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );

      // client2 joins — client1 should receive presence online for user-2
      client1.send.mockClear();
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      expect(client1.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'presenceUpdate',
          data: { userId: 'user-2', status: 'online' },
        }),
      );
      // Joining client should NOT receive their own presence event
      expect(client2.send).not.toHaveBeenCalled();
    });

    it('should broadcast presenceUpdate offline on disconnect', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      client1.send.mockClear();
      client2.send.mockClear();

      gateway.handleDisconnect(client2);

      // client1 should receive offline presence for user-2
      expect(client1.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'presenceUpdate',
          data: { userId: 'user-2', status: 'offline' },
        }),
      );
    });

    it('should NOT broadcast offline when user has other clients', () => {
      const client1 = createMockClient();
      const client2a = createMockClient();
      const client2b = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2a);
      gateway.handleConnection(client2b);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2a,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2b,
      );

      client1.send.mockClear();

      // Disconnect one of user-2's clients
      gateway.handleDisconnect(client2a);

      // Should NOT broadcast offline — user-2 still has client2b
      const offlineMessage = JSON.stringify({
        event: 'presenceUpdate',
        data: { userId: 'user-2', status: 'offline' },
      });
      expect(client1.send).not.toHaveBeenCalledWith(offlineMessage);
    });

    it('should broadcast offline when last client for user disconnects', () => {
      const client1 = createMockClient();
      const client2a = createMockClient();
      const client2b = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2a);
      gateway.handleConnection(client2b);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2a,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2b,
      );

      client1.send.mockClear();

      // Disconnect both of user-2's clients
      gateway.handleDisconnect(client2a);
      gateway.handleDisconnect(client2b);

      // Now should broadcast offline
      expect(client1.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'presenceUpdate',
          data: { userId: 'user-2', status: 'offline' },
        }),
      );
    });
  });

  describe('typing cleanup on disconnect', () => {
    it('should clear typing state when client disconnects', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );

      // user-1 starts typing
      gateway.handleTyping(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );

      client2.send.mockClear();

      // user-1 disconnects — typing should be cleared
      gateway.handleDisconnect(client1);

      // After disconnect, if user-1 typing state was cleaned, a new typing
      // stopTyping should not broadcast stale data
      // We verify by checking the offline broadcast was sent (not typing)
      const calls = client2.send.mock.calls.map(
        (call: [string]) => (JSON.parse(call[0]) as { event: string }).event,
      );
      expect(calls).toContain('presenceUpdate');
      expect(calls).not.toContain('userStoppedTyping');
    });
  });

  describe('broadcastToRoomExcluding', () => {
    it('should send to all clients except excluded one', () => {
      const client1 = createMockClient();
      const client2 = createMockClient();
      const client3 = createMockClient();
      gateway.handleConnection(client1);
      gateway.handleConnection(client2);
      gateway.handleConnection(client3);

      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-1' },
        client1,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-2' },
        client2,
      );
      gateway.handleJoinConversation(
        { conversationId: 'conv-1', userId: 'user-3' },
        client3,
      );

      client1.send.mockClear();
      client2.send.mockClear();
      client3.send.mockClear();

      gateway.broadcastToRoomExcluding('conv-1', client1.id, 'test', {
        foo: 'bar',
      });

      expect(client1.send).not.toHaveBeenCalled();
      expect(client2.send).toHaveBeenCalledTimes(1);
      expect(client3.send).toHaveBeenCalledTimes(1);
    });
  });
});
