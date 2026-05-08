import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: jest.Mocked<MessageService>;

  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: {
            findByConversation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    messageService = module.get(MessageService);
  });

  it('should return messages for a conversation', async () => {
    messageService.findByConversation.mockResolvedValue([{ id: 'msg-1' }] as any);

    const result = await controller.findAll('conv-1', req);

    expect(messageService.findByConversation).toHaveBeenCalledWith('conv-1', 'user-1');
    expect(result).toEqual([{ id: 'msg-1' }]);
  });
});
