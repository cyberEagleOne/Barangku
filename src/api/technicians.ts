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

export async function getFeaturedReviews(): Promise<Review[]> {
  return Promise.resolve([
    {
      name: 'Rina Ayu',
      date: '2 minggu lalu',
      rating: 5,
      text: 'Laptop yang tadinya mati total akhirnya nyala lagi. Mas Dedi jelasin kerusakannya dengan sabar, biayanya juga sesuai perkiraan. Makasih ya!',
      service: 'Servis laptop',
    },
    {
      name: 'Andi Pratama',
      date: '3 minggu lalu',
      rating: 5,
      text: 'Nggak langsung disuruh ganti komponen. Dicek dulu, terus dikasih pilihan yang pas di kantong. Senang nemu tukang yang jujur dekat rumah.',
      service: 'Ganti baterai laptop',
    },
    {
      name: 'Dewi Lestari',
      date: '1 bulan lalu',
      rating: 5,
      text: 'Layar HP retak selesai tepat waktu dan hasilnya rapi. Nggak ada biaya tambahan di luar kesepakatan awal.',
      service: 'Ganti layar HP',
    },
  ]);
}

export async function registerTechnicianShop(shopData: {
  name: string;
  phone: string;
  email?: string;
  shopName: string;
  address: string;
  hours?: string;
  services?: string[];
  minPrice?: string | number;
}): Promise<Technician> {
  const min = typeof shopData.minPrice === 'string' ? parseInt(shopData.minPrice, 10) || 100000 : (shopData.minPrice || 100000);
  const devices = shopData.services?.filter(s => ['Laptop', 'HP'].includes(s)) ?? ['Laptop', 'HP'];
  const newTech: Technician = {
    id: inMemoryStore.technicians.length + 1,
    name: shopData.shopName || shopData.name || 'Tukang Servis',
    area: 'Karawaci',
    devices: devices.length ? devices : ['Laptop', 'HP'],
    rating: '5,0',
    reviews: 0,
    distance: 1.0,
    min,
    max: min * 3,
    status: 'open',
    verified: true,
    photo: 'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=800&q=80',
    address: shopData.address || 'Karawaci, Kota Tangerang',
  };

  inMemoryStore.technicians.push(newTech);

  // Keep tukang session in memory store
  inMemoryStore.currentUser = {
    id: `user-${Date.now()}`,
    name: newTech.name,
    contact: shopData.phone || shopData.email || '0812-0000-0000',
    phone: shopData.phone,
    email: shopData.email,
    role: 'tukang',
    fresh: true,
  };

  return Promise.resolve(newTech);
}


