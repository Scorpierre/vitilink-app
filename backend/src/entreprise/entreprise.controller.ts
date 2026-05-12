import { Body, Controller, Get, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EntrepriseService } from './entreprise.service';
import { UpdateEntrepriseDto } from './dto/update-entreprise.dto';

@Controller('entreprise')
@UseGuards(JwtAuthGuard)
export class EntrepriseController {
  constructor(private readonly entrepriseService: EntrepriseService) {}

  @Get('me')
  async getMine(@Request() req) {
    const userId = req.user.userId;
    const entreprise = await this.entrepriseService.getMine(userId);

    return {
      status: HttpStatus.OK,
      message: '',
      result: entreprise,
    };
  }

  @Post('update')
  async updateMine(@Body() dto: UpdateEntrepriseDto, @Request() req) {
    const userId = req.user.userId;
    const result = await this.entrepriseService.updateMine(userId, dto);

    return {
      status: HttpStatus.OK,
      message: 'Entreprise mise à jour.',
      result,
    };
  }
}