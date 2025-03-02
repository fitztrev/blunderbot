import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TwitchService } from './twitch.service';

@WebSocketGateway({ namespace: 'twitch-socket', transports: ['polling'] })
export class TwitchGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('TwitchGateway');

  private sockets = [];

  constructor(
    @Inject(forwardRef(() => TwitchService))
    private readonly twitchService: TwitchService
  ) {}

  @SubscribeMessage('botSpeak')
  handleMessage(client: any, payload: any) {
    this.twitchService.botSpeak(payload);
  }

  afterInit(_server: any): any {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket, ..._args): any {
    this.logger.log(`Twitch-Socket Client connected: ${client.id}`);
    this.sockets.push(client);
  }

  handleDisconnect(client: Socket): any {
    this.logger.log(`Twitch-Socket Client disconnected: ${client.id}`);
  }

  public sendDataToSockets(event, data): any {
    this.logger.log(`Sending ${event} event to sockets.`);
    this.sockets.forEach((socket: Socket) => {
      if (socket.connected) {
        socket.emit(event, data);
      }
    });
  }

  public sendDataToOneSocket(event, data): any {
    this.logger.log(`Sending ${event} event to a single socket.`);
    for (let i = 0; i < this.sockets.length; i++) {
      if (this.sockets[i].connected) {
        this.sockets[i].emit(event, data);
        break;
      }
    }
  }
}
