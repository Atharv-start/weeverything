import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagesService } from '../messages/messages.service';
import { ConversationsService } from '../conversations/conversations.service';
import { PrismaClient } from '@weeverything/database';

interface AuthSocket extends Socket {
  userId?: string;
  displayName?: string;
}

@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(','),
    credentials: true,
  },
  namespace: '/ws',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly messagesService: MessagesService,
    private readonly conversationsService: ConversationsService,
    private readonly prisma: PrismaClient,
  ) {}

  async handleConnection(socket: AuthSocket) {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      }) as { sub: string; displayName?: string };

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, displayName: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        socket.disconnect();
        return;
      }

      socket.userId = user.id;
      socket.displayName = user.displayName;

      // Track presence
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, new Set());
      }
      this.onlineUsers.get(user.id)!.add(socket.id);

      // Auto-join all user conversations
      const memberships = await this.prisma.conversationMember.findMany({
        where: { userId: user.id, leftAt: null },
        select: { conversationId: true },
      });
      for (const m of memberships) {
        await socket.join(`conv:${m.conversationId}`);
      }

      // Notify contacts of online status
      this.broadcastPresence(user.id, true);
    } catch {
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: AuthSocket) {
    if (!socket.userId) return;

    const sockets = this.onlineUsers.get(socket.userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(socket.userId);
        this.broadcastPresence(socket.userId, false);
      }
    }
  }

  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { conversationId: string; content: string; replyToId?: string },
  ) {
    if (!socket.userId) return;

    try {
      const message = await this.messagesService.sendMessage(
        data.conversationId,
        socket.userId,
        data.content,
        data.replyToId,
      );

      this.server.to(`conv:${data.conversationId}`).emit('message:new', {
        conversationId: data.conversationId,
        message,
      });
    } catch (err) {
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!socket.userId) return;
    socket.to(`conv:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId: socket.userId,
      displayName: socket.displayName,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (!socket.userId) return;
    socket.to(`conv:${data.conversationId}`).emit('typing:update', {
      conversationId: data.conversationId,
      userId: socket.userId,
      displayName: socket.displayName,
      isTyping: false,
    });
  }

  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() socket: AuthSocket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    if (!socket.userId) return;
    try {
      await this.messagesService.markRead(data.conversationId, socket.userId, data.messageId);
      socket.to(`conv:${data.conversationId}`).emit('message:read', {
        conversationId: data.conversationId,
        messageId: data.messageId,
        userId: socket.userId,
        readAt: new Date().toISOString(),
      });
    } catch {
      // Silently fail read receipts
    }
  }

  isOnline(userId: string): boolean {
    return (this.onlineUsers.get(userId)?.size ?? 0) > 0;
  }

  emitToUser(userId: string, event: string, data: unknown) {
    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit(event, data);
      }
    }
  }

  private async broadcastPresence(userId: string, isOnline: boolean) {
    const connections = await this.prisma.connection.findMany({
      where: { userId },
      select: { connectedId: true },
    });

    for (const conn of connections) {
      this.emitToUser(conn.connectedId, 'presence:update', {
        userId,
        isOnline,
        lastSeen: isOnline ? undefined : new Date().toISOString(),
      });
    }
  }
}
