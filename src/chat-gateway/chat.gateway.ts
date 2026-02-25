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

  handleConnection(client: WsClient): void {
    const clientId = `ws-${++this.clientIdCounter}`;
    client.id = clientId;
    this.connectedClients.set(clientId, client);
    this.clientRooms.set(clientId, new Set());
    this.logger.log(`Client connected: ${clientId}`);
  }

  handleDisconnect(client: WsClient): void {
    const clientId = client.id;
    const rooms = this.clientRooms.get(clientId);
    if (rooms) {
      for (const roomId of rooms) {
        this.rooms.get(roomId)?.delete(clientId);
        if (this.rooms.get(roomId)?.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
    this.clientRooms.delete(clientId);
    this.connectedClients.delete(clientId);
    this.logger.log(`Client disconnected: ${clientId}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: WsClient,
  ): { event: string; data: { conversationId: string } } {
    const { conversationId } = data;
    if (!this.rooms.has(conversationId)) {
      this.rooms.set(conversationId, new Set());
    }
    this.rooms.get(conversationId)!.add(client.id);
    this.clientRooms.get(client.id)?.add(conversationId);
    this.logger.log(
      `Client ${client.id} joined conversation: ${conversationId}`,
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
    this.logger.log(
      `Client ${client.id} left conversation: ${conversationId}`,
    );
    return { event: 'leftConversation', data: { conversationId } };
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
}
