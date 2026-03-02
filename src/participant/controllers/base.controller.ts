import { ParticipantService } from '../participant.service';
import { ConversationService } from '../../conversation/conversation.service';

export class BaseController {
  constructor(
    protected readonly participantService: ParticipantService,
    protected readonly conversationService: ConversationService,
  ) {}
}
