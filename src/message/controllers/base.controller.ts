import { MessageService } from '../message.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';

export class BaseController {
  constructor(
    protected readonly messageService: MessageService,
    protected readonly chatGateway: ChatGateway,
  ) {}
}
