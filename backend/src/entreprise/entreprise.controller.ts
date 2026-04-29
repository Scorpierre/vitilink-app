import { Controller, Post, Get, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { EntrepriseService } from './entreprise.service';
import { CreateEntrepriseDto } from './dto/create-entreprise.dto';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('entreprise')
export class EntrepriseController {
  constructor(private readonly entrepriseService: EntrepriseService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateEntrepriseDto) {
    return this.entrepriseService.create(req.user.userId, dto);
  }

  @Get('me')
  findMine(@Request() req) {
    return this.entrepriseService.findByUser(req.user.userId);
  }

  @Patch()
  update(@Request() req, @Body() dto: UpdateEntrepriseDto) {
    return this.entrepriseService.update(req.user.userId, dto);
  }
}
