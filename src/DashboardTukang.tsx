import { useEffect, useState } from 'react';
import { ArrowRight, Check, CheckCircle2, ChevronRight, Clock, Inbox, Laptop, Smartphone, Store, Wrench, X, XCircle } from 'lucide-react';
import { Badge, Button } from './DesignSystem';
import { repairSteps } from './Tracking';
import { acceptOrder, getShopStatus, getTechnicianOrders, rejectOrder, setShopStatus, type Order, type ShopStatus } from './api';

export default function DashboardTukang({
  orders: propOrders,
  shopStatus: propShopStatus,
  onStatusChange,
  onAccept,
  onReject,
  navigate
}: {
  orders?: Order[];
  shopStatus?: ShopStatus;
  onStatusChange?: (status: ShopStatus) => void;
  onAccept?: (code: string) => void;
  onReject?: (code: string) => void;
  navigate: (path: string) => void;
}) {
  const [orders, setOrders] = useState<Order[]>(propOrders ?? []);
  const [shopStatus, setShopStatusState] = useState<ShopStatus>(propShopStatus ?? 'buka');
  const [loading, setLoading] = useState(!propOrders);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalCode, setRejectModalCode] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    Promise.all([
      getTechnicianOrders(),
      getShopStatus()
    ])
      .then(([ordersRes, statusRes]) => {
        if (!isMounted) return;
        setOrders(ordersRes);
        setShopStatusState(statusRes);
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

  const handleStatusChange = async (status: ShopStatus) => {
    try {
      await setShopStatus(status);
      setShopStatusState(status);
      onStatusChange?.(status);
    } catch {
      setError('Ada yang salah. Coba lagi ya.');
    }
  };

  const handleTerima = async (code: string) => {
    setActionLoading(true);
    try {
      await acceptOrder(code);
      onAccept?.(code);
      navigate(`pesanan-tukang/${code}`);
    } catch {
      setError('Ada yang salah. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectModalCode) return;
    setActionLoading(true);
    try {
      await rejectOrder(rejectModalCode);
      onReject?.(rejectModalCode);
      setOrders(prev => prev.map(o => o.code === rejectModalCode ? { ...o, incoming: false, rejected: true, status: -1 } : o));
      setRejectModalCode(null);
    } catch {
      setError('Ada yang salah. Coba lagi ya.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container dashboard-tukang-page">
        <p>Memuat...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container dashboard-tukang-page">
        <p>{error}</p>
      </main>
    );
  }

  const incomingOrders = orders.filter(o => o.incoming && !o.rejected && o.status !== -1);
  const activeOrders = orders.filter(o => !o.incoming && !o.rejected && o.status >= 1 && o.status < 5);
  const completedOrders = orders.filter(o => !o.incoming && !o.rejected && o.status === 5);

  return (
    <main className="container dashboard-tukang-page">
      {/* Header */}
      <div className="dash-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> PANEL TUKANG</div>
          <h1>Dashboard Toko</h1>
          <p className="dash-subtitle">Pantau status tokomu dan pesanan yang masuk hari ini.</p>
        </div>
      </div>

      {/* Large Status Toggle: Buka, Sibuk, Tutup (at least 80px tall) */}
      <section className="dash-status-section" aria-label="Status operasional toko">
        <span className="dash-status-label">Status tokomu saat ini:</span>
        <div className="dash-status-toggle">
          <button
            type="button"
            className={`dash-status-btn status-buka ${shopStatus === 'buka' ? 'active' : ''}`}
            aria-pressed={shopStatus === 'buka'}
            onClick={() => handleStatusChange('buka')}
          >
            {shopStatus === 'buka' ? <Check size={28} /> : <span className="status-dot green" />}
            <span>Buka</span>
          </button>

          <button
            type="button"
            className={`dash-status-btn status-sibuk ${shopStatus === 'sibuk' ? 'active' : ''}`}
            aria-pressed={shopStatus === 'sibuk'}
            onClick={() => handleStatusChange('sibuk')}
          >
            {shopStatus === 'sibuk' ? <Check size={28} /> : <span className="status-dot orange" />}
            <span>Sibuk</span>
          </button>

          <button
            type="button"
            className={`dash-status-btn status-tutup ${shopStatus === 'tutup' ? 'active' : ''}`}
            aria-pressed={shopStatus === 'tutup'}
            onClick={() => handleStatusChange('tutup')}
          >
            {shopStatus === 'tutup' ? <Check size={28} /> : <span className="status-dot gray" />}
            <span>Tutup</span>
          </button>
        </div>
        <p className="dash-status-hint">
          {shopStatus === 'buka' && 'Tokomu tampil buka di pencarian. Pelanggan bisa memesan servis.'}
          {shopStatus === 'sibuk' && 'Tokomu ditandai sedang sibuk. Pelanggan tahu ada antrean perbaikan.'}
          {shopStatus === 'tutup' && 'Tokomu ditandai tutup sementara. Tidak menerima pesanan baru.'}
        </p>
      </section>

      {/* Today's Summary as 3 Big Numbers */}
      <section className="dash-summary-grid">
        <div className="dash-summary-card">
          <span className="dash-summary-num">{incomingOrders.length}</span>
          <span className="dash-summary-title">Pesanan masuk</span>
          <small>Perlu konfirmasi kamu</small>
        </div>
        <div className="dash-summary-card">
          <span className="dash-summary-num">{activeOrders.length}</span>
          <span className="dash-summary-title">Sedang dikerjakan</span>
          <small>Dalam proses perbaikan</small>
        </div>
        <div className="dash-summary-card">
          <span className="dash-summary-num">{completedOrders.length}</span>
          <span className="dash-summary-title">Selesai</span>
          <small>Sudah diserahkan</small>
        </div>
      </section>

      {/* Pesanan Masuk (Incoming Orders) */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2>Pesanan masuk ({incomingOrders.length})</h2>
          <p>Pelanggan baru yang memilih tokomu. Segera konfirmasi ya.</p>
        </div>

        {incomingOrders.length === 0 ? (
          <div className="search-empty tech-empty">
            <Inbox size={48} />
            <h2>Belum ada pesanan masuk.</h2>
            <p>Belum ada pesanan masuk. Tenang, nanti kami kabari ya.</p>
          </div>
        ) : (
          <div className="incoming-orders-list">
            {incomingOrders.map(ord => (
              <article key={ord.code} className="incoming-order-card">
                <div className="incoming-card-top">
                  <div className="incoming-card-title">
                    <span className="incoming-code">{ord.code}</span>
                    <h3>{ord.device || ord.details.device} · {ord.model || ord.details.model}</h3>
                  </div>
                  <span className="badge busy">Perlu konfirmasi</span>
                </div>

                <div className="incoming-card-details">
                  <div className="incoming-detail-row">
                    <span className="label">Keluhan:</span>
                    <strong>{ord.damage || ord.details.problem}</strong>
                  </div>
                  <div className="incoming-detail-row">
                    <span className="label">Pelanggan:</span>
                    <span>{(ord.customerName || 'Pelanggan').split(' ')[0]}</span>
                  </div>
                  <div className="incoming-detail-row">
                    <span className="label">Jadwal antar:</span>
                    <span>{ord.time || ord.details.time} · {ord.date || ord.details.date}</span>
                  </div>
                </div>

                {/* Two huge buttons: Terima & Tolak */}
                <div className="incoming-card-actions">
                  <Button
                    variant="secondary"
                    className="tech-button"
                    onClick={() => setRejectModalCode(ord.code)}
                    disabled={actionLoading}
                  >
                    <X size={20} /> Tolak
                  </Button>
                  <Button
                    className="tech-button"
                    onClick={() => handleTerima(ord.code)}
                    disabled={actionLoading}
                  >
                    <Check size={20} /> Terima
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Sedang Dikerjakan (In Progress Orders) */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2>Sedang dikerjakan ({activeOrders.length})</h2>
          <p>Daftar perbaikan yang sedang berjalan di tokomu.</p>
        </div>

        {activeOrders.length === 0 ? (
          <div className="search-empty tech-empty">
            <Wrench size={40} />
            <h2>Tidak ada perbaikan aktif.</h2>
            <p>Terima pesanan masuk di atas untuk mulai mengerjakan.</p>
          </div>
        ) : (
          <div className="active-orders-list">
            {activeOrders.map(ord => (
              <article key={ord.code} className="active-order-card">
                <div className="active-card-info">
                  <div className="active-card-top">
                    <span className="incoming-code">{ord.code}</span>
                    <Badge type={ord.status === 4 ? 'open' : 'busy'} label={repairSteps[ord.status]} />
                  </div>
                  <h3>{ord.device || ord.details.device} · {ord.model || ord.details.model}</h3>
                  <p className="active-damage">Keluhan: {ord.damage || ord.details.problem}</p>
                  <p className="active-meta">Pelanggan: {ord.customerName || 'Pelanggan'} · Perkiraan: Rp {(ord.estimateMin ?? ord.technician.min).toLocaleString('id-ID')} – Rp {(ord.estimateMax ?? ord.technician.max).toLocaleString('id-ID')}</p>
                </div>
                <Button
                  className="tech-button active-card-btn"
                  onClick={() => navigate(`pesanan-tukang/${ord.code}`)}
                >
                  Buka <ChevronRight size={20} />
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Confirmation Modal for Tolak */}
      {rejectModalCode && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="modal-content">
            <h2 id="reject-title">Yakin mau tolak pesanan ini?</h2>
            <p>Pesanan {rejectModalCode} akan dibatalkan dan pelanggan akan disarankan mencari tukang lain.</p>
            <div className="modal-actions">
              <Button
                variant="secondary"
                className="tech-button"
                onClick={() => setRejectModalCode(null)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                className="tech-button tech-button-danger"
                onClick={handleConfirmReject}
                disabled={actionLoading}
              >
                Ya, tolak pesanan
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
