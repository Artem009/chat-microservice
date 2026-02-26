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
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client);
      gateway.handleJoinConversation({ conversationId: 'conv-2' }, client);

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
        { conversationId: 'conv-1' },
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

      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client1);
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client2);

      gateway.broadcastToRoom('conv-1', 'test', { msg: 'hello' });

      expect(client1.send).toHaveBeenCalledTimes(1);
      expect(client2.send).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleLeaveConversation', () => {
    it('should remove client from conversation room', () => {
      const client = createMockClient();
      gateway.handleConnection(client);
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client);

      const result = gateway.handleLeaveConversation(
        { conversationId: 'conv-1' },
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
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client);
      gateway.handleLeaveConversation({ conversationId: 'conv-1' }, client);

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

      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client1);
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client2);

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

      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client1);
      gateway.handleJoinConversation({ conversationId: 'conv-2' }, client2);

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
      gateway.handleJoinConversation({ conversationId: 'conv-1' }, client);

      expect(() => gateway.broadcastToRoom('conv-1', 'test', {})).not.toThrow();
    });

    it('should be a no-op for non-existent rooms', () => {
      expect(() =>
        gateway.broadcastToRoom('nonexistent', 'test', {}),
      ).not.toThrow();
    });
  });
});
