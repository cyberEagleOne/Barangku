export type UserRole = 'pelanggan' | 'tukang';

export interface User {
  id?: string;
  name: string;
  contact: string;
  email?: string;
  phone?: string;
  role: UserRole;
  fresh?: boolean;
}

export type ShopStatus = 'buka' | 'sibuk' | 'tutup';

export interface Technician {
  id: number;
  name: string;
  area: string;
  devices: string[];
  rating: string;
  reviews: number;
  distance: number;
  min: number;
  max: number;
  status: 'open' | 'busy' | 'closed';
  verified: boolean;
  photo?: string;
  address?: string;
}

export interface Review {
  name: string;
  date: string;
  rating: number;
  text: string;
  service: string;
}

// -1: Ditolak, 0: Dipesan, 1: Diterima, 2: Dicek, 3: Diperbaiki, 4: Siap diambil, 5: Selesai
export type OrderStatus = number;

export interface BookingDetails {
  device: string;
  model: string;
  problem: string;
  notes: string;
  date: string;
  time: string;
}

export interface Order {
  code: string;
  technician: Technician;
  details: BookingDetails;
  photoName?: string;
  status: OrderStatus;
  estimateMin?: number;
  estimateMax?: number;
  message?: string;
  rejected?: boolean;
  incoming?: boolean;
  customerName?: string;
  customerPhone?: string;
  technicianId?: number;
  shop?: string;
  // Shortcut properties matching technician dashboard and legacy states
  device?: string;
  model?: string;
  damage?: string;
  date?: string;
  time?: string;
}
