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
import { MessageService } from './message.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private messageService: MessageService,
    private jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.cookie?.split('token=')[1];
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    client.rooms.forEach((room) => client.leave(room));
  }

  @SubscribeMessage('joinConversation')
  handleJoin(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.join(conversationId);
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(@MessageBody() conversationId: string, @ConnectedSocket() client: Socket) {
    client.leave(conversationId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { conversationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    try {
      const message = await this.messageService.create(userId, data.conversationId, data.content);
      this.server.to(data.conversationId).emit('newMessage', message);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
