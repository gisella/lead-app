import { Owner } from '@app/lead-core/domain';

export class OwnerMapper {
  static ownerToEntity(dbOwner: any): Owner {
    return new Owner({
      type: dbOwner.owner_type || 'FIRST',
      first_name: dbOwner.first_name,
      last_name: dbOwner.last_name,
      email: dbOwner.email || undefined,
      birth_date: dbOwner.birth_date.toISOString().split('T')[0],
      monthly_income: Number(dbOwner.monthly_income),
      monthly_payments: (dbOwner.monthly_payments as 12 | 13 | 14) || undefined,
    });
  }

  static ownerToDbEntity(owner: Owner, leadRequestId: number): any {
    return {
      lead_request_id: leadRequestId,
      owner_type: owner.type,
      first_name: owner.first_name,
      last_name: owner.last_name,
      email: owner.email || null,
      birth_date: new Date(owner.birth_date),
      monthly_income: BigInt(owner.monthly_income),
      monthly_payments: owner.monthly_payments || null,
    };
  }

  static ownersToDbEntities(owners: Owner[], leadRequestId: number): any[] {
    return owners.map((owner) => this.ownerToDbEntity(owner, leadRequestId));
  }
}
