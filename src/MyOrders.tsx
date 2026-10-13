import { useEffect, useState } from 'react';
import { ArrowRight, Inbox, Laptop, Smartphone } from 'lucide-react';
import { Badge, Button, Chip, TechnicianInfo } from './DesignSystem';
import { repairSteps } from './Tracking';
import { getMyOrders, type Order } from './api';

export type ListedOrder = { order: Order; status: number };

export default function MyOrders({
  orders: propOrders,
  fresh,
  navigate
}: {
  orders?: ListedOrder[];
  fresh?: boolean;
  navigate: (path: string) => void;
}) {
  const [emptyDemo, setEmptyDemo] = useState(!!fresh);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(!propOrders);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    getMyOrders()
      .then(res => {
        if (!isMounted) return;
        setApiOrders(res);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Ada yang salah. Coba lagi ya.');
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="container my-orders-page">
        <p>Memuat...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container my-orders-page">
        <p>{error}</p>
      </main>
    );
  }

  const orders: ListedOrder[] = propOrders ?? apiOrders.map(order => ({ order, status: order.status }));

  return (
    <main className="container my-orders-page">
      <div className="eyebrow"><span className="eyebrow-line" /> BARANG KAMU, KABARNYA DI SINI</div>
      <h1>Pesanan saya</h1>
      <p className="my-orders-intro">Cek kabar servis kamu tanpa perlu nebak-nebak.</p>
      <div className="orders-demo">
        <span>Coba tampilan:</span>
        <Chip label="Ada pesanan" selected={!emptyDemo} onClick={() => setEmptyDemo(false)} />
        <Chip label="Belum ada pesanan" selected={emptyDemo} onClick={() => setEmptyDemo(true)} />
      </div>
      {emptyDemo || !orders.length ? (
        <div className="search-empty">
          <Inbox size={40} />
          <h2>Kamu belum punya pesanan.</h2>
          <p>Kamu belum punya pesanan. Cari tukang dulu yuk.</p>
          <Button onClick={() => navigate('hasil-pencarian')}>
            Cari tukang terdekat <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="my-orders-grid">
          {orders.map(({ order, status }) => (
            <article key={order.code} className="my-order-card">
              <div className="my-order-heading">
                <span>{order.code}</span>
                <Badge
                  type={status === -1 ? 'closed' : status < 4 ? 'busy' : 'open'}
                  label={status === -1 ? 'Ditolak' : repairSteps[status] ?? 'Diproses'}
                />
              </div>
              <TechnicianInfo technician={order.technician} verification />
              <div className="my-order-device">
                {order.details.device === 'HP' ? <Smartphone size={20} /> : <Laptop size={20} />}
                <div>
                  <strong>{order.details.model}</strong>
                  <p>{order.details.device} · {order.details.problem}</p>
                </div>
              </div>
              {(order as any)?.message && (
                <p className="my-order-note">
                  <strong>Kabar:</strong> “{(order as any).message}”
                </p>
              )}
              {order.technician.min > 0 && status !== -1 && (
                <p className="my-order-estimate">
                  Perkiraan: <strong>Rp {order.technician.min.toLocaleString('id-ID')} – Rp {order.technician.max.toLocaleString('id-ID')}</strong>
                </p>
              )}
              <Button className="w-full" onClick={() => navigate(`lacak/${order.code}`)}>
                {status === -1 ? 'Lihat status' : 'Lacak'} <ArrowRight size={18} />
              </Button>
            </article>
          ))}
        </div>
      )}
      <p className="orders-prototype-note">Pesanan contoh untuk mencoba alur barangku. Belum ada servis sungguhan.</p>
    </main>
  );
}
