// Demo implementation. Replace with real API calls.

import { inMemoryStore, initialTechnicians } from './mockData';
import type { BookingDetails, Order, OrderStatus, Technician } from './types';

export async function getOrder(code: string): Promise<Order | null> {
  const found = inMemoryStore.orders.find(o => o.code === code);
  return Promise.resolve(found ? { ...found } : null);
}

export async function getMyOrders(_userContact?: string): Promise<Order[]> {
  // Returns customer orders (completed/accepted initial orders plus orders created by the customer)
  const list = inMemoryStore.orders.filter(
    o => !o.incoming || (o as any).isCustomerOrder
  );
  return Promise.resolve([...list]);
}

export async function getTechnicianOrders(technicianId?: number): Promise<Order[]> {
  const list = inMemoryStore.orders.filter(
    o => !technicianId || o.technicianId === technicianId
  );
  return Promise.resolve([...list]);
}

export async function createOrder(data: {
  technician: Technician;
  details: BookingDetails;
  photoName?: string;
  customerName?: string;
  customerPhone?: string;
  code?: string;
}): Promise<Order> {
  const code = data.code || `BRK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const tech = data.technician || initialTechnicians[0];

  const newOrder: Order & { isCustomerOrder?: boolean } = {
    code,
    technician: tech,
    technicianId: tech.id,
    shop: tech.name,
    details: data.details,
    photoName: data.photoName || '',
    status: 0,
    estimateMin: tech.min,
    estimateMax: tech.max,
    message: 'Pesanan masuk, menunggu konfirmasi tukang.',
    incoming: true,
    rejected: false,
    customerName: data.customerName || 'Pelanggan',
    customerPhone: data.customerPhone || '0812-0000-0000',
    device: data.details.device,
    model: data.details.model,
    damage: data.details.problem,
    date: data.details.date,
    time: data.details.time,
    isCustomerOrder: true,
  };

  inMemoryStore.orders = [newOrder, ...inMemoryStore.orders.filter(o => o.code !== code)];
  return Promise.resolve({ ...newOrder });
}

export async function updateOrderStatus(
  code: string,
  status: OrderStatus,
  details?: {
    message?: string;
    estimateMin?: number;
    estimateMax?: number;
    rejected?: boolean;
    incoming?: boolean;
  }
): Promise<Order> {
  const orderIndex = inMemoryStore.orders.findIndex(o => o.code === code);
  if (orderIndex === -1) {
    throw new Error(`Order ${code} tidak ditemukan.`);
  }

  const existing = inMemoryStore.orders[orderIndex];
  const newEstimateMin = details?.estimateMin !== undefined ? details.estimateMin : existing.estimateMin;
  const newEstimateMax = details?.estimateMax !== undefined ? details.estimateMax : existing.estimateMax;

  const updated: Order = {
    ...existing,
    status,
    technician: {
      ...existing.technician,
      min: newEstimateMin ?? existing.technician.min,
      max: newEstimateMax ?? existing.technician.max,
    },
    ...(details?.message !== undefined ? { message: details.message } : {}),
    ...(details?.estimateMin !== undefined ? { estimateMin: details.estimateMin } : {}),
    ...(details?.estimateMax !== undefined ? { estimateMax: details.estimateMax } : {}),
    ...(details?.rejected !== undefined ? { rejected: details.rejected } : {}),
    ...(details?.incoming !== undefined ? { incoming: details.incoming } : {}),
  };

  inMemoryStore.orders[orderIndex] = updated;
  return Promise.resolve({ ...updated });
}

export async function acceptOrder(code: string): Promise<Order> {
  return updateOrderStatus(code, 1, { incoming: false, rejected: false });
}

export async function rejectOrder(code: string): Promise<Order> {
  return updateOrderStatus(code, -1, { incoming: false, rejected: true });
}
