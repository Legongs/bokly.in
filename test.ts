import { getStoreStatus } from './lib/business-hours';
import { formatInTimeZone } from 'date-fns-tz';

const schedule = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '21:00' },
  sunday: { isOpen: false, openTime: '09:00', closeTime: '21:00' },
};

console.log('--- TEST: Badge Dinamis ---');

const OriginalDate = global.Date;
function mockDate(isoString: string) {
  const customDate = new OriginalDate(isoString);
  (global as any).Date = class extends OriginalDate {
    constructor(...args: any[]) {
      super(); // Panggil super() untuk menghilangkan error TypeScript
      if (args.length) return new OriginalDate(...(args as [any]));
      return customDate; // Mengembalikan custom instance
    }
    static now() {
      return customDate.getTime();
    }
  };
}


mockDate('2026-09-07T03:00:00.000Z'); // Senin, 10:00 AM WIB (UTC+7)
console.log('Skenario 1: Senin, 10:00 WIB -> Status:', getStoreStatus(schedule, 'Asia/Jakarta'), '(Ekspektasi: open)');

mockDate('2026-09-06T16:00:00.000Z'); // Minggu, 23:00 WIB (UTC+7)
console.log('Skenario 2: Minggu, 23:00 WIB -> Status:', getStoreStatus(schedule, 'Asia/Jakarta'), '(Ekspektasi: closed)');

mockDate('2026-09-07T13:30:00.000Z'); // Senin, 20:30 WIB (UTC+7)
console.log('Skenario 3: Senin, 20:30 WIB -> Status:', getStoreStatus(schedule, 'Asia/Jakarta'), '(Ekspektasi: closing_soon)');

// Restore
global.Date = OriginalDate;
