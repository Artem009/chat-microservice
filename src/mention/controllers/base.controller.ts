import { MentionService } from '../mention.service';

export class BaseController {
  constructor(protected readonly mentionService: MentionService) {}
}
