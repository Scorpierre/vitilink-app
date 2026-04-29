import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EntrepriseModule } from './entreprise/entreprise.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    EntrepriseModule,
    ConversationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
