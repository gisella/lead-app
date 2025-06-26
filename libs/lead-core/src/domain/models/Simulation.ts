import { createHash } from 'crypto';
import { DateTime } from 'luxon';

export class Owner {
  type: 'FIRST' | 'SECOND';
  first_name: string;
  last_name: string;
  email?: string;
  birth_date: string;
  monthly_income: number;
  monthly_payments?: 12 | 13 | 14 | undefined;

  constructor(data: Partial<Owner>) {
    Object.assign(this, data);
  }

  toString() {
    return `${this.type}|${this.first_name?.trim() || ''}|${this.last_name?.trim() || ''}|${this.email?.trim() || ''}|${this.birth_date?.trim() || ''}|${this.monthly_income}|${this.monthly_payments || ''}`;
  }
}

export class Simulation {
  amount: number;
  house_worth: number;
  city: string;
  owners: Owner[];
  hash: string;
  createdAt: DateTime;

  constructor(data: Partial<Simulation>) {
    Object.assign(this, data);
    if (!data.hash) {
      this.hash = this.toHash();
    }
  }

  toString() {
    return `${this.amount}|${this.house_worth}|${this.city?.trim() || ''}|${this.owners?.map((owner) => owner.toString()).join('|') || ''}`;
  }

  toHash(): string {
    return createHash('sha256').update(this.toString()).digest('hex');
  }

  getMinutesFromNow(): number {
    return this.createdAt.diffNow('minutes').minutes;
  }
}
