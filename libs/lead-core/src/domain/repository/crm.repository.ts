import { Lead } from '@app/lead-core/domain';

export abstract class CrmRepositoryI {
  abstract syncLead(lead: Lead): Promise<void>;
}
