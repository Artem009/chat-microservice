import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { JoinRoomDto } from './dto/join-room.dto';
import { TypingDto } from './dto/typing.dto';

interface WsClient {
  id: string;
  send: (data: string) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private clientIdCounter = 0;
  private readonly connectedClients = new Map<string, WsClient>();
  private readonly rooms = new Map<string, Set<string>>();
  private readonly clientRooms = new Map<string, Set<string>>();
  private readonly clientUserMap = new Map<string, string>();
  private readonly userClients = new Map<string, Set<string>>();
  private readonly typingUsers = new Map<string, Set<string>>();

  handleConnection(client: WsClient): void {
    const clientId = `ws-${++this.clientIdCounter}`;
    client.id = clientId;
    this.connectedClients.set(clientId, client);
    this.clientRooms.set(clientId, new Set());
    this.logger.log(`Client connected: ${clientId}`);
  }

  handleDisconnect(client: WsClient): void {
    const clientId = client.id;
    const userId = this.clientUserMap.get(clientId);
    const rooms = this.clientRooms.get(clientId);

    // Clear typing state for this client
    if (userId && rooms) {
      for (const roomId of rooms) {
        this.typingUsers.get(roomId)?.delete(userId);
        if (this.typingUsers.get(roomId)?.size === 0) {
          this.typingUsers.delete(roomId);
        }
      }
    }

    // Remove client from rooms
    if (rooms) {
      for (const roomId of rooms) {
        this.rooms.get(roomId)?.delete(clientId);
        if (this.rooms.get(roomId)?.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }

    // Clean up user-client mapping
    if (userId) {
      this.userClients.get(userId)?.delete(clientId);
      const remainingClients = this.userClients.get(userId);
      if (!remainingClients || remainingClients.size === 0) {
        this.userClients.delete(userId);
        // Broadcast offline only when last client for this user disconnects
        if (rooms) {
          for (const roomId of rooms) {
            this.broadcastToRoom(roomId, 'presenceUpdate', {
              userId,
              status: 'offline',
            });
          }
        }
      }
    }

    this.clientUserMap.delete(clientId);
    this.clientRooms.delete(clientId);
    this.connectedClients.delete(clientId);
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: WsClient,
  ): { event: string; data: { conversationId: string } } {
    const { conversationId, userId } = data;
    if (!this.rooms.has(conversationId)) {
      this.rooms.set(conversationId, new Set());
    }
    this.rooms.get(conversationId)!.add(client.id);
    this.clientRooms.get(client.id)?.add(conversationId);

    // Store user-client mapping
    this.clientUserMap.set(client.id, userId);
    if (!this.userClients.has(userId)) {
      this.userClients.set(userId, new Set());
    }
    this.userClients.get(userId)!.add(client.id);

    // Broadcast presence online to other participants
    this.broadcastToRoomExcluding(conversationId, client.id, 'presenceUpdate', {
      userId,
      status: 'online',
    });

    this.logger.log(
      `Client ${client.id} (user: ${userId}) joined conversation: ${conversationId}`,
    );
    return { event: 'joinedConversation', data: { conversationId } };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: WsClient,
  ): { event: string; data: { conversationId: string } } {
    const { conversationId } = data;
    this.rooms.get(conversationId)?.delete(client.id);
    if (this.rooms.get(conversationId)?.size === 0) {
      this.rooms.delete(conversationId);
    }
    this.clientRooms.get(client.id)?.delete(conversationId);
    this.logger.log(`Client ${client.id} left conversation: ${conversationId}`);
    return { event: 'leftConversation', data: { conversationId } };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: WsClient,
  ): void {
    const { conversationId, userId } = data;
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId)!.add(userId);
    this.broadcastToRoomExcluding(conversationId, client.id, 'userTyping', {
      conversationId,
      userId,
    });
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: WsClient,
  ): void {
    const { conversationId, userId } = data;
    this.typingUsers.get(conversationId)?.delete(userId);
    if (this.typingUsers.get(conversationId)?.size === 0) {
      this.typingUsers.delete(conversationId);
    }
    this.broadcastToRoomExcluding(
      conversationId,
      client.id,
      'userStoppedTyping',
      { conversationId, userId },
    );
  }

  broadcastToRoom(
    conversationId: string,
    event: string,
    payload: unknown,
  ): void {
    const clientIds = this.rooms.get(conversationId);
    if (!clientIds) return;

    const message = JSON.stringify({ event, data: payload });
    for (const clientId of clientIds) {
      const client = this.connectedClients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (err) {
          this.logger.error(
            `Failed to send to client ${clientId}: ${(err as Error).message}`,
          );
        }
      }
    }
  }

  broadcastToRoomExcluding(
    conversationId: string,
    excludeClientId: string,
    event: string,
    payload: unknown,
  ): void {
    const clientIds = this.rooms.get(conversationId);
    if (!clientIds) return;

    const message = JSON.stringify({ event, data: payload });
    for (const clientId of clientIds) {
      if (clientId === excludeClientId) continue;
      const client = this.connectedClients.get(clientId);
      if (client) {
        try {
          client.send(message);
        } catch (err) {
          this.logger.error(
            `Failed to send to client ${clientId}: ${(err as Error).message}`,
          );
        }
      }
    }
  }
}
