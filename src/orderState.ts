import { defaultTechnician, type Technician } from './DesignSystem';
import type { Order } from './Booking';

export type DemoOrder = {
  code: string;
  device: string;
  model: string;
  damage: string;
  customerName: string;
  customerPhone: string;
  status: number; // 0: Dipesan, 1: Diterima, 2: Dicek, 3: Diperbaiki, 4: Siap diambil, 5: Selesai
  estimate: number;
  shop: string;
  technicianId: number;
  date: string;
  time: string;
  incoming: boolean;
};

export const initialOrders: DemoOrder[] = [
  {
    code: 'BRK-2026-0142',
    device: 'Laptop',
    model: 'ASUS VivoBook 14',
    damage: 'Baterai drop',
    customerName: 'Rina',
    customerPhone: '0812-9876-5432',
    status: 2,
    estimate: 350000,
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-20',
    time: '09:00',
    incoming: false,
  },
  {
    code: 'BRK-2026-0138',
    device: 'HP',
    model: 'Samsung Galaxy A54',
    damage: 'Layar pecah',
    customerName: 'Budi',
    customerPhone: '0813-1122-3344',
    status: 4,
    estimate: 450000,
    shop: 'Bengkel HP Bu Sari',
    technicianId: 3,
    date: '2026-10-19',
    time: '10:00',
    incoming: false,
  },
  {
    code: 'BRK-2026-0155',
    device: 'Laptop',
    model: 'Lenovo IdeaPad Slim 3',
    damage: 'Mati total setelah kena air',
    customerName: 'Fajar',
    customerPhone: '0857-4433-2211',
    status: 0,
    estimate: 250000,
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-21',
    time: '11:00',
    incoming: true,
  },
  {
    code: 'BRK-2026-0159',
    device: 'HP',
    model: 'Xiaomi Redmi Note 12',
    damage: 'Konektor charger longgar',
    customerName: 'Siti',
    customerPhone: '0812-7788-9900',
    status: 0,
    estimate: 120000,
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-21',
    time: '14:30',
    incoming: true,
  },
];

export function toBookingOrder(demo: DemoOrder, technician: Technician): Order {
  return {
    code: demo.code,
    technician,
    details: {
      device: demo.device,
      model: demo.model,
      problem: demo.damage,
      notes: `${demo.damage}. Kontak pelanggan: ${demo.customerName} (${demo.customerPhone})`,
      date: demo.date,
      time: demo.time,
    },
    photoName: '',
  };
}
