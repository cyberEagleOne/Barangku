// Demo implementation. Replace with real API calls.

import { getMockReviewsForTechnician, inMemoryStore } from './mockData';
import type { Review, ShopStatus, Technician } from './types';

export async function searchTechnicians(options?: {
  device?: string;
  filters?: string[];
  sort?: string;
}): Promise<Technician[]> {
  const chosenFilters = options?.filters ?? (options?.device ? [options.device] : []);
  const sort = options?.sort ?? 'distance';

  let list = inMemoryStore.technicians.filter(t => {
    if (chosenFilters.includes('Laptop') && !t.devices.includes('Laptop')) return false;
    if (chosenFilters.includes('HP') && !t.devices.includes('HP')) return false;
    if (chosenFilters.includes('Terverifikasi') && !t.verified) return false;
    if (chosenFilters.includes('Buka sekarang') && t.status !== 'open') return false;
    return true;
  });

  list = list.sort((a, b) => {
    if (sort === 'rating') {
      return Number(b.rating.replace(',', '.')) - Number(a.rating.replace(',', '.'));
    }
    if (sort === 'price') {
      return a.min - b.min;
    }
    return a.distance - b.distance;
  });

  return Promise.resolve([...list]);
}

export async function getTechnician(id: number): Promise<Technician | null> {
  const tech = inMemoryStore.technicians.find(t => t.id === id);
  return Promise.resolve(tech ? { ...tech } : null);
}

export async function getTechnicianReviews(id: number): Promise<Review[]> {
  const tech = inMemoryStore.technicians.find(t => t.id === id);
  if (!tech) return Promise.resolve([]);
  return Promise.resolve(getMockReviewsForTechnician(tech));
}

export async function getShopStatus(_technicianId: number = 1): Promise<ShopStatus> {
  return Promise.resolve(inMemoryStore.shopStatus);
}

export async function setShopStatus(
  status: ShopStatus,
  technicianId: number = 1
): Promise<ShopStatus> {
  inMemoryStore.shopStatus = status;
  const tech = inMemoryStore.technicians.find(t => t.id === technicianId);
  if (tech) {
    tech.status = status === 'buka' ? 'open' : status === 'sibuk' ? 'busy' : 'closed';
  }
  return Promise.resolve(inMemoryStore.shopStatus);
}
