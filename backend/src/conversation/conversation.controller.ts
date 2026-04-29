import { Controller, Post, Get, Param, Body, Request, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateConversationDto) {
    return this.conversationService.create(req.user.userId, dto);
  }

  @Get()
  findMine(@Request() req) {
    return this.conversationService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.conversationService.findOne(id, req.user.userId);
  }
}
