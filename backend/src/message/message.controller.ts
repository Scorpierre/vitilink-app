import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(@Param('conversationId') conversationId: string, @Request() req) {
    return this.messageService.findByConversation(conversationId, req.user.userId);
  }
}
