import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;
  let conversationService: jest.Mocked<ConversationService>;

  const req = { user: { userId: 'user-1' } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [
        {
          provide: ConversationService,
          useValue: {
            create: jest.fn(),
            findByUser: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
    conversationService = module.get(ConversationService);
  });

  it('should create a conversation', async () => {
    conversationService.create.mockResolvedValue({ id: 'conv-1' } as any);

    const result = await controller.create(req, { annonceId: 'annonce-1' });

    expect(conversationService.create).toHaveBeenCalledWith('user-1', { annonceId: 'annonce-1' });
    expect(result).toMatchObject({ id: 'conv-1' });
  });

  it('should find all conversations for the current user', async () => {
    conversationService.findByUser.mockResolvedValue([]);

    await controller.findMine(req);

    expect(conversationService.findByUser).toHaveBeenCalledWith('user-1');
  });

  it('should find one conversation by id', async () => {
    conversationService.findOne.mockResolvedValue({ id: 'conv-1' } as any);

    await controller.findOne('conv-1', req);

    expect(conversationService.findOne).toHaveBeenCalledWith('conv-1', 'user-1');
  });
});
