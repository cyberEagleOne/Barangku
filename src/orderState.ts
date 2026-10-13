import { defaultTechnician, type Technician } from './DesignSystem';
import type { Order } from './Booking';

export type ShopStatus = 'buka' | 'sibuk' | 'tutup';

export type DemoOrder = {
  code: string;
  device: string;
  model: string;
  damage: string;
  customerName: string;
  customerPhone: string;
  status: number; // 0: Dipesan, 1: Diterima, 2: Dicek, 3: Diperbaiki, 4: Siap diambil, 5: Selesai, -1: Ditolak
  estimateMin: number;
  estimateMax: number;
  message?: string;
  shop: string;
  technicianId: number;
  date: string;
  time: string;
  incoming: boolean;
  rejected?: boolean;
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
    estimateMin: 150000,
    estimateMax: 350000,
    message: 'Laptop kamu sudah kami cek. Yang rusak baterainya, bisa diganti hari ini juga.',
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-20',
    time: '09:00',
    incoming: false,
    rejected: false,
  },
  {
    code: 'BRK-2026-0138',
    device: 'HP',
    model: 'Samsung Galaxy A54',
    damage: 'Layar pecah',
    customerName: 'Budi',
    customerPhone: '0813-1122-3344',
    status: 4,
    estimateMin: 300000,
    estimateMax: 450000,
    message: 'Layar HP sudah diganti dan dites sentuhannya. Normal semua!',
    shop: 'Bengkel HP Bu Sari',
    technicianId: 3,
    date: '2026-10-19',
    time: '10:00',
    incoming: false,
    rejected: false,
  },
  {
    code: 'BRK-2026-0155',
    device: 'Laptop',
    model: 'Lenovo IdeaPad Slim 3',
    damage: 'Mati total setelah kena air',
    customerName: 'Fajar',
    customerPhone: '0857-4433-2211',
    status: 0,
    estimateMin: 200000,
    estimateMax: 500000,
    message: 'Pesanan masuk, menunggu konfirmasi teknisi.',
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-21',
    time: '11:00',
    incoming: true,
    rejected: false,
  },
  {
    code: 'BRK-2026-0159',
    device: 'HP',
    model: 'Xiaomi Redmi Note 12',
    damage: 'Konektor charger longgar',
    customerName: 'Siti',
    customerPhone: '0812-7788-9900',
    status: 0,
    estimateMin: 80000,
    estimateMax: 150000,
    message: 'Pesanan masuk, menunggu konfirmasi teknisi.',
    shop: 'Mas Dedi Servis',
    technicianId: 1,
    date: '2026-10-21',
    time: '14:30',
    incoming: true,
    rejected: false,
  },
];

export function toBookingOrder(demo: DemoOrder, technician: Technician): Order & {
  estimateMin: number;
  estimateMax: number;
  message?: string;
  rejected?: boolean;
} {
  return {
    code: demo.code,
    technician: {
      ...technician,
      min: demo.estimateMin || technician.min,
      max: demo.estimateMax || technician.max,
    },
    details: {
      device: demo.device,
      model: demo.model,
      problem: demo.damage,
      notes: `${demo.damage}. Kontak pelanggan: ${demo.customerName} (${demo.customerPhone})`,
      date: demo.date,
      time: demo.time,
    },
    photoName: '',
    estimateMin: demo.estimateMin,
    estimateMax: demo.estimateMax,
    message: demo.message,
    rejected: demo.rejected || demo.status === -1,
  };
}
