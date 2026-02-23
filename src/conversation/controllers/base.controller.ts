import { ConversationService } from '../conversation.service';

export class BaseController {
  constructor(protected readonly conversationService: ConversationService) {}
}
