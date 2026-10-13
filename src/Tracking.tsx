import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleAlert, Clock, MapPin, MessageCircle, PackageCheck, Phone, ShieldCheck, Wrench, X } from 'lucide-react';
import { Badge, Button, Chip, Stepper, TechnicianInfo, defaultTechnician, rupiah } from './DesignSystem';
import { formatVisit } from './Booking';
import { locations } from './TechnicianDetail';
import { getOrder, type Order } from './api';

export const repairSteps = ['Dipesan', 'Diterima', 'Dicek', 'Diperbaiki', 'Siap diambil', 'Selesai'];
export const demoOrder: Order = {
  code: 'BRK-2026-0142', technician: defaultTechnician,
  details: { device: 'Laptop', model: 'ASUS VivoBook 14', problem: 'Baterai drop', notes: 'Cepat mati kalau tidak dicolok ke listrik.', date: '2026-10-20', time: '09:00' }, photoName: '',
  status: 2
};

export function getRepairHistory(order: Order, current: number) {
  const date = new Date(`${order.details.date || '2026-10-20'}T${order.details.time || '09:00'}:00`);
  const descriptions = ['Pesanan kamu masuk. Tukang akan mengonfirmasi jadwalnya.', 'Perangkat kamu sudah diterima di toko.', 'Tukang mengecek kerusakan dan menyiapkan perkiraan biaya.', 'Perbaikan dimulai setelah biaya disepakati.', 'Perangkat sudah dites dan siap kamu ambil.', 'Perangkat sudah kamu ambil. Makasih sudah memilih memperbaiki!'];
  return repairSteps.slice(0, current + 1).map((label, i) => {
    const at = new Date(date.getTime() + [0, 30, 90, 150, 300, 360][i] * 60000);
    return { label, description: descriptions[i], at: at.toISOString(), date: at.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), time: at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), index: i };
  }).reverse();
}

export function TrackingContent({ order, current, contact, navigate }: { order: Order; current: number; contact: () => void; navigate: (path: string) => void }) {
  const { technician: t, details } = order;
  const history = getRepairHistory(order, current);
  const device = details.device.toLowerCase();
  const checkedMessage = details.problem === 'Baterai drop'
    ? `${details.device} kamu sudah kami cek. Yang rusak baterainya, bisa diganti hari ini juga. Kami konfirmasi biayanya dulu sebelum mulai ya.`
    : `${details.device} kamu sudah kami cek untuk kendala ${details.problem.toLowerCase()}. Kami siapkan pilihan perbaikannya dan konfirmasi biayanya dulu ke kamu ya.`;
  const messages = [
    `Pesanan kamu sudah masuk. Bawa ${device} kamu sesuai jadwal ya. Kalau ada perubahan, kabari kami dulu.`,
    `${details.device} kamu sudah kami terima dengan baik. Sebentar lagi kami cek kerusakannya, nanti kamu dikabari ya.`,
    checkedMessage,
    `${details.device} kamu sedang kami perbaiki sesuai biaya yang disepakati. Setelah beres, kami tes dulu biar kamu tenang.`,
    `${details.device} kamu sudah beres dan sudah kami tes. Kamu bisa ambil di toko saat jam buka ya.`,
    `Makasih sudah ambil ${device} kamu. Semoga lancar dipakai lagi! Kalau ada kendala, kamu boleh hubungi kami.`,
  ];
  const customMessage = (order as any)?.message;
  const estimate = new Date(new Date(history[history.length - 1].at).getTime() + 300 * 60000);
  return <><div className="tracking-stepper"><Stepper steps={repairSteps} current={current} label="Langkah perbaikan" /></div>
    {current === 4 && <section className="pickup-card" aria-live="polite"><div className="pickup-icon"><PackageCheck size={28} /></div><div><h2>Perbaikanmu sudah selesai, silakan diambil di toko</h2><p>Barang kamu sudah dicek dan siap dibawa pulang.</p><div className="pickup-details"><span><MapPin size={16} />{locations[t.id] ?? `${t.area}, Tangerang`}</span><span><Clock size={16} />Senin–Sabtu, 09.00–18.00</span></div></div></section>}
    <div className="tracking-layout"><div className="tracking-main">
      <section className="tracking-card technician-update"><div className="tracking-card-heading"><div className="tracking-heading-icon"><MessageCircle size={20} /></div><h2>Kabar dari tukang</h2><span className="live-label"><span className="dot" /> Kabar terbaru</span></div><div className="update-author"><div className="avatar">{t.name.split(' ').slice(0, 2).map(word => word[0]).join('')}</div><div><strong>{t.name}</strong><time dateTime={history[0].at}>{history[0].date} · {history[0].time}</time></div></div><blockquote>{customMessage || messages[current]}</blockquote><p className="tracking-message-note"><ShieldCheck size={14} /> Kamu akan dikabari kalau ada perubahan.</p></section>
      <section className="tracking-card"><div className="tracking-card-heading"><div className="tracking-heading-icon"><Wrench size={20} /></div><h2>Riwayat perbaikan</h2><span className="history-sort">Terbaru dulu</span></div><ol className="repair-timeline">{history.map((event, i) => <li key={event.label} className={i === 0 ? 'latest' : ''}><span className="timeline-mark">{i === 0 ? <span className="dot" /> : <Check size={14} />}</span><div><div className="timeline-event-title"><strong>{event.label}</strong>{i === 0 && <span className="service-tag">Sekarang</span>}</div><p>{event.description}</p><time dateTime={event.at}>{event.date} · {event.time}</time></div></li>)}</ol></section>
      <section className="tracking-card estimate-card"><div className="tracking-card-heading"><div className="tracking-heading-icon"><CalendarDays size={20} /></div><h2>Perkiraan biaya dan selesai</h2></div><div className="repair-estimates"><div><small>{current === 5 ? 'Biaya servis contoh' : 'Perkiraan biaya'}</small><strong>{rupiah(t.min)} – {rupiah(t.max)}</strong><p>Biaya dikonfirmasi sebelum perbaikan.</p></div><div><small>{current >= 4 ? 'Perbaikan selesai' : 'Perkiraan selesai'}</small><strong>{estimate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong><p>{current >= 4 ? 'Sudah dites oleh tukang.' : `Sekitar pukul ${estimate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`}</p></div></div>{current < 4 && <div className="estimate-note"><Clock size={16} /> Jadwal bisa berubah sesuai hasil pengecekan. Tukang akan kabari kamu.</div>}</section>
    </div><aside className="tracking-sidebar"><section className="tracking-card tracking-order"><h2>Pesanan kamu</h2><TechnicianInfo technician={t} verification /><dl className="summary-data"><div><dt>Perangkat kamu</dt><dd>{details.device} · {details.model}</dd></div><div><dt>Kerusakan</dt><dd>{details.problem}</dd></div><div><dt>Tanggal antar ke toko</dt><dd>{formatVisit(details)}</dd></div></dl><Button className="w-full tracking-desktop-contact" onClick={contact}><MessageCircle size={18} /> Hubungi tukang</Button><Button className="w-full" variant="ghost" onClick={() => navigate(`detail/${t.id}`)}>Lihat detail tukang <ArrowRight size={16} /></Button><p className="tracking-contact-note">Ada yang mau ditanya?<br />Tukangnya siap bantu kamu.</p></section><div className="tracking-peace"><ShieldCheck size={20} /><p>Barang kamu, keputusan kamu.<br />Biaya tambahan harus kamu setujui dulu.</p></div></aside></div><div className="tracking-mobile-bar"><Button className="w-full" onClick={contact}><MessageCircle size={18} /> Hubungi tukang</Button></div></>;
}

export default function Tracking({ order: propOrder, code, navigate, initialStep }: { order?: Order | null; code?: string; navigate: (path: string) => void; initialStep?: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<Order | null>(propOrder ?? null);
  const [current, setCurrent] = useState<number>(initialStep ?? 2);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (!code) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getOrder(code)
      .then(res => {
        if (!isMounted) return;
        setOrderData(res);
        if (res && res.status !== undefined) {
          setCurrent(res.status);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Ada yang salah. Coba lagi ya.');
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [code]);

  if (loading) {
    return (
      <main className="container placeholder-page">
        <p>Memuat...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container placeholder-page">
        <p>{error}</p>
      </main>
    );
  }

  const resolved = orderData ?? (propOrder?.code === code ? propOrder : null);
  const isRejected = (resolved as any)?.rejected || current === -1 || (resolved as any)?.status === -1;
  if (isRejected) {
    return (
      <main className="container placeholder-page tracking-rejected-page">
        <div className="breadcrumb"><a href="#beranda">Beranda</a><span>/</span><span>Lacak perbaikan</span></div>
        <div className="search-empty" style={{ marginTop: '32px' }}>
          <CircleAlert size={48} />
          <h2>Tukang belum bisa terima pesananmu.</h2>
          <p>Tukang belum bisa terima pesananmu. Coba pilih tukang lain ya.</p>
          <Button onClick={() => navigate('hasil-pencarian')}>Cari tukang lain <ArrowRight size={18} /></Button>
        </div>
      </main>
    );
  }
  if (!resolved) return <main className="container placeholder-page"><h1>Pesanan belum ditemukan.</h1><p>Cek lagi kode pesanan kamu, atau pesan servis dulu ya.</p><Button onClick={() => navigate('hasil-pencarian')}><ArrowLeft size={18} /> Cari tukang</Button></main>;
  const contact = () => dialog.current?.showModal();
  return <main className="container tracking-page"><div className="breadcrumb"><a href="#beranda">Beranda</a><span>/</span><span>Lacak perbaikan</span></div><div className="tracking-page-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> KAMU TAHU, BARANGMU SAMPAI MANA</div><h1>Lacak perbaikan</h1><p>Pantau kabarnya di sini. Nggak perlu nebak-nebak lagi.</p></div><div className="tracking-order-code"><small>Kode pesanan kamu</small><div><strong>{resolved.code}</strong><Badge type={current < 4 ? 'busy' : 'open'} label={repairSteps[current]} /></div></div></div>
    <div className="tracking-demo"><div><strong>Coba status perbaikan</strong><small>Pratinjau saja, bukan kabar langsung dari tukang.</small></div><div className="chips">{repairSteps.map((step, i) => <Chip key={step} label={step} selected={current === i} onClick={() => setCurrent(i)} />)}</div></div>
    <div className="tracking-state" aria-live="polite"><TrackingContent order={resolved} current={current} contact={contact} navigate={navigate} /></div><p className="tracking-prototype-note">Data perbaikan, alamat, dan nomor kontak di halaman ini adalah contoh untuk prototipe.</p>
    <dialog ref={dialog} className="contact-dialog tracking-contact-dialog" aria-labelledby="tracking-contact-title"><div className="contact-heading"><h2 id="tracking-contact-title">Hubungi tukang</h2><Button variant="ghost" autoFocus aria-label="Tutup kontak tukang" onClick={() => dialog.current?.close()}><X size={20} /></Button></div><TechnicianInfo technician={resolved.technician} verification /><div className="tracking-phone"><Phone size={20} /><div><small>Nomor WhatsApp contoh</small><strong>0812-0000-0000</strong></div></div><p className="small-text">Nomor ini hanya contoh, bukan kontak toko asli. Tombol di bawah akan membuka WhatsApp di tab baru; jangan kirim data pribadi ya.</p><Button className="w-full" onClick={() => window.open(`https://wa.me/6281200000000?text=${encodeURIComponent(`Halo, aku mau tanya soal perbaikan ${resolved.details.device} dengan kode ${resolved.code}.`)}`, '_blank', 'noopener,noreferrer')}><MessageCircle size={18} /> Chat WhatsApp <ArrowRight size={18} /></Button></dialog>
  </main>;
}
