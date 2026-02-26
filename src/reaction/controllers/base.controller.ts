import { ReactionService } from '../reaction.service';
import { ChatGateway } from '../../chat-gateway/chat.gateway';
import { MessageService } from '../../message/message.service';

export class BaseController {
  constructor(
    protected readonly reactionService: ReactionService,
    protected readonly chatGateway: ChatGateway,
    protected readonly messageService: MessageService,
  ) {}
}
