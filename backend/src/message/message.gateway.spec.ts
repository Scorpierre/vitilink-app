import { JwtService } from '@nestjs/jwt';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let messageService: jest.Mocked<Pick<MessageService, 'create'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'verify'>>;

  beforeEach(() => {
    messageService = { create: jest.fn() };
    jwtService = { verify: jest.fn() };

    gateway = new MessageGateway(
      messageService as unknown as MessageService,
      jwtService as unknown as JwtService,
    );

    gateway.server = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as any;
  });

  describe('handleConnection', () => {
    it('should set userId on client data from valid JWT cookie', () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' } as any);
      const client = {
        handshake: { headers: { cookie: 'token=valid-jwt' } },
        data: {},
        disconnect: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.data.userId).toBe('user-1');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client if no token in cookie', () => {
      const client = {
        handshake: { headers: { cookie: '' } },
        data: {},
        disconnect: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if token is invalid', () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });
      const client = {
        handshake: { headers: { cookie: 'token=bad-jwt' } },
        data: {},
        disconnect: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect client if cookie header is missing', () => {
      const client = {
        handshake: { headers: {} },
        data: {},
        disconnect: jest.fn(),
      } as any;

      gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should leave all rooms on disconnect', () => {
      const client = {
        rooms: new Set(['room-1', 'room-2']),
        leave: jest.fn(),
      } as any;

      gateway.handleDisconnect(client);

      expect(client.leave).toHaveBeenCalledTimes(2);
      expect(client.leave).toHaveBeenCalledWith('room-1');
      expect(client.leave).toHaveBeenCalledWith('room-2');
    });
  });

  describe('handleJoin', () => {
    it('should join the given conversation room', () => {
      const client = { join: jest.fn() } as any;

      gateway.handleJoin('conv-1', client);

      expect(client.join).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('handleLeave', () => {
    it('should leave the given conversation room', () => {
      const client = { leave: jest.fn() } as any;

      gateway.handleLeave('conv-1', client);

      expect(client.leave).toHaveBeenCalledWith('conv-1');
    });
  });

  describe('handleMessage', () => {
    it('should do nothing if client has no userId', async () => {
      const client = { data: {}, emit: jest.fn() } as any;

      await gateway.handleMessage({ conversationId: 'conv-1', content: 'Hi' }, client);

      expect(messageService.create).not.toHaveBeenCalled();
    });

    it('should create message and emit to conversation room', async () => {
      const mockMessage = { id: 'msg-1', content: 'Hello' };
      messageService.create.mockResolvedValue(mockMessage as any);

      const roomEmit = jest.fn();
      gateway.server = { to: jest.fn().mockReturnValue({ emit: roomEmit }) } as any;

      const client = { data: { userId: 'user-1' }, emit: jest.fn() } as any;

      await gateway.handleMessage({ conversationId: 'conv-1', content: 'Hello' }, client);

      expect(messageService.create).toHaveBeenCalledWith('user-1', 'conv-1', 'Hello');
      expect(gateway.server.to).toHaveBeenCalledWith('conv-1');
      expect(roomEmit).toHaveBeenCalledWith('newMessage', mockMessage);
    });

    it('should include clientId in emitted message payload when provided', async () => {
      const mockMessage = { id: 'msg-1', content: 'Hello' };
      messageService.create.mockResolvedValue(mockMessage as any);

      const roomEmit = jest.fn();
      gateway.server = { to: jest.fn().mockReturnValue({ emit: roomEmit }) } as any;

      const client = { data: { userId: 'user-1' }, emit: jest.fn() } as any;

      await gateway.handleMessage(
        { conversationId: 'conv-1', content: 'Hello', clientId: 'local-1' },
        client,
      );

      expect(roomEmit).toHaveBeenCalledWith('newMessage', {
        ...mockMessage,
        clientId: 'local-1',
      });
    });

    it('should emit error event to client if service throws', async () => {
      messageService.create.mockRejectedValue(new Error('Accès refusé'));

      const clientEmit = jest.fn();
      const client = { data: { userId: 'user-1' }, emit: clientEmit } as any;

      await gateway.handleMessage({ conversationId: 'conv-1', content: 'Hi' }, client);

      expect(clientEmit).toHaveBeenCalledWith('error', { message: 'Accès refusé' });
    });

    it('should emit messageError with clientId if service throws for an optimistic message', async () => {
      messageService.create.mockRejectedValue(new Error('Accès refusé'));

      const clientEmit = jest.fn();
      const client = { data: { userId: 'user-1' }, emit: clientEmit } as any;

      await gateway.handleMessage(
        { conversationId: 'conv-1', content: 'Hi', clientId: 'local-1' },
        client,
      );

      expect(clientEmit).toHaveBeenCalledWith('messageError', {
        clientId: 'local-1',
        message: 'Accès refusé',
      });
    });

    it('should emit generic error message if error has no message', async () => {
      messageService.create.mockRejectedValue({});

      const clientEmit = jest.fn();
      const client = { data: { userId: 'user-1' }, emit: clientEmit } as any;

      await gateway.handleMessage({ conversationId: 'conv-1', content: 'Hi' }, client);

      expect(clientEmit).toHaveBeenCalledWith('error', { message: 'Unknown error' });
    });
  });
});
