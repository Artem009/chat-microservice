import { ParticipantService } from '../participant.service';

export class BaseController {
  constructor(protected readonly participantService: ParticipantService) {}
}
