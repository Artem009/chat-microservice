import { MessageService } from '../message.service';

export class BaseController {
  constructor(protected readonly messageService: MessageService) {}
}
