import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, MapPin, MessageCircle, ShieldCheck, Star, Wrench, X, ChevronDown } from 'lucide-react';
import { Badge, Button, ReviewItem, rupiah } from './DesignSystem';
import { getTechnician, getTechnicianReviews, type Review, type Technician } from './api';

export const locations: Record<number, string> = {
  1: 'Jl. Imam Bonjol No. 24, Karawaci, Kota Tangerang',
  2: 'Jl. Teuku Umar No. 18, Cikokol, Kota Tangerang',
  3: 'Jl. Borobudur No. 12, Bencongan, Kelapa Dua, Tangerang',
  4: 'Jl. Raya Kelapa Dua No. 35, Kelapa Dua, Tangerang',
  5: 'Jl. Prambanan Raya No. 8, Cibodas, Kota Tangerang',
  6: 'Jl. Boulevard Gading Serpong No. 16, Tangerang',
};

function getPrices(t: Technician) {
  const laptop = [
    ['Servis laptop mati total', t.min, t.max],
    ['Ganti baterai laptop', 250000, 650000],
    ['Pasang ulang sistem', 100000, 200000],
    ['Ganti papan ketik laptop', 200000, 450000],
    ['Bersihkan laptop & ganti pasta pendingin', 100000, 200000],
  ];
  const hp = [
    ['Ganti layar HP', 250000, 900000],
    ['Ganti baterai HP', 150000, 350000],
    ['Perbaikan konektor pengisian HP', 100000, 250000],
    ['Servis HP mati total', t.min, t.max],
  ];
  return [...(t.devices.includes('HP') ? hp : []), ...(t.devices.includes('Laptop') ? laptop : [])] as [string, number, number][];
}

export default function TechnicianDetail({
  technician: propTechnician,
  id,
  navigate
}: {
  technician?: Technician;
  id?: number;
  navigate: (path: string) => void;
}) {
  const [tech, setTech] = useState<Technician | null>(propTechnician ?? null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!propTechnician && !!id);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [sent, setSent] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    let isMounted = true;
    const targetId = id ?? propTechnician?.id;
    if (!targetId) return;

    setLoading(!tech);
    setError('');
    Promise.all([
      propTechnician ? Promise.resolve(propTechnician) : getTechnician(targetId),
      getTechnicianReviews(targetId)
    ])
      .then(([tRes, rRes]) => {
        if (!isMounted) return;
        setTech(tRes);
        setReviews(rRes);
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
  }, [id, propTechnician]);

  if (loading) {
    return (
      <main className="container detail-page">
        <p>Memuat...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container detail-page">
        <p>{error}</p>
      </main>
    );
  }

  const t = tech;
  if (!t) return <main className="container placeholder-page"><h1>Tukang belum ditemukan.</h1><p>Coba pilih tukang dari hasil pencarian ya.</p><Button onClick={() => navigate('hasil-pencarian')}><ArrowLeft size={18} /> Kembali ke pencarian</Button></main>;

  const book = () => navigate(`pesan/${t.id}`);
  return <main className="container detail-page">
    <div className="breadcrumb"><a href="#beranda">Beranda</a><span>/</span><a href="#hasil-pencarian">Hasil pencarian</a><span>/</span><span>{t.name}</span></div>
    <div className="detail-photo"><img src={t.photo ?? 'https://images.unsplash.com/photo-1580835916901-40770720c505?auto=format&fit=crop&w=1600&q=85'} alt={`Contoh tempat kerja ${t.name}`} /><div className="detail-photo-label"><Wrench size={16} /> Tempat barang kamu dibenerin</div><span className="detail-photo-note">Foto ilustrasi</span></div>
    <header className="detail-heading"><div><div className="detail-heading-badges">{t.verified && <Badge />}<Badge type={t.status} /></div><h1>{t.name}</h1><p className="detail-specialty">Servis {t.devices.join(' & ')} · Tukang lokal di {t.area}</p><div className="detail-rating"><Star size={18} fill="currentColor" /><strong>{t.rating}</strong><Button variant="ghost" onClick={() => document.getElementById('ulasan-tukang')?.scrollIntoView({ behavior: 'smooth' })}>{t.reviews} ulasan pelanggan</Button><span className="rating-divider" /><MapPin size={16} /><span>{t.distance.toLocaleString('id-ID')} km dari kamu</span></div></div><div className="detail-location"><p><MapPin size={19} /><span>{locations[t.id]}<small>Alamat contoh untuk prototipe</small></span></p><p><Clock size={19} /><span>Senin–Sabtu, 09.00–18.00<small>{t.status === 'open' ? 'Buka sekarang · Tutup pukul 18.00' : t.status === 'busy' ? 'Sedang sibuk · Tanya antrean dulu ya' : 'Tutup sekarang · Buka lagi pukul 09.00'}</small></span></p></div></header>
    <div className="detail-layout"><div className="detail-content">
      <section className="detail-section"><div className="detail-section-title"><Wrench size={20} /><h2>Tentang tukang ini</h2></div><p>{t.name} bantu benerin {t.devices.join(' dan ')} kamu di {t.area}. Mulai dari pengecekan sampai ganti komponen, kerusakannya dijelasin pakai bahasa yang gampang dimengerti. Biaya dibicarakan dulu sebelum dikerjakan, jadi kamu bisa memutuskan dengan tenang.</p><div className="detail-promises"><span><Check size={16} /> Biaya disepakati dulu</span><span><Check size={16} /> Barang dites sebelum diambil</span></div></section>
      <section className="detail-section"><div className="detail-section-title"><h2>Perkiraan biaya</h2><span className="service-tag">{t.devices.join(' & ')}</span></div><p className="detail-section-subtitle">Biar kamu punya gambaran sebelum datang.</p><div className="price-table-wrap" tabIndex={0} aria-label="Tabel perkiraan biaya servis"><table className="price-table"><thead><tr><th scope="col">Jenis servis</th><th scope="col">Perkiraan biaya</th></tr></thead><tbody>{getPrices(t).map(([service, min, max]) => <tr key={service}><th scope="row">{service}</th><td>{rupiah(min)} – {rupiah(max)}</td></tr>)}</tbody></table></div><div className="price-explanation"><ShieldCheck size={18} /><p>Biaya bisa beda tergantung tipe perangkat dan kerusakannya. <strong>Tukang akan konfirmasi ke kamu sebelum mulai.</strong></p></div></section>
      <section id="ulasan-tukang" className="detail-section detail-reviews"><div className="detail-section-title"><h2>Ulasan pelanggan</h2><span className="detail-review-score"><Star size={17} fill="currentColor" /><strong>{t.rating}</strong><span>({t.reviews} ulasan)</span></span></div><p className="detail-section-subtitle">Cerita dari orang yang sudah pernah servis di sini.</p><div className="detail-review-list">{reviews.slice(0, expanded ? reviews.length : 4).map(review => <ReviewItem key={review.name} review={review} />)}</div>{expanded && <p className="review-sample-note" role="status">Semua 6 contoh ulasan sudah ditampilkan. Jumlah ulasan toko adalah data contoh.</p>}<Button variant="ghost" className="all-reviews-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>{expanded ? 'Tampilkan lebih sedikit' : 'Lihat semua ulasan'}<ChevronDown size={18} className={expanded ? 'rotate-180' : ''} /></Button></section>
    </div><aside className="booking-sidebar"><div className="booking-card"><div className="eyebrow">BENERIN DULU, YUK.</div><p className="booking-price-label">Perkiraan biaya servis</p><strong className="booking-price">{rupiah(t.min)} –<br />{rupiah(t.max)}</strong><p className="booking-price-note">Biaya akhir setelah perangkat dicek.</p><div className="booking-status"><Badge type={t.status} /><span>{t.status === 'open' ? 'Siap terima barang kamu' : t.status === 'busy' ? 'Ada antrean, tanya dulu ya' : 'Bisa pesan untuk saat toko buka'}</span></div><Button className="w-full" onClick={book}>Pesan servis <ArrowRight size={18} /></Button><Button variant="secondary" className="w-full" onClick={() => { setSent(false); dialog.current?.showModal(); }}><MessageCircle size={18} /> Hubungi tukang</Button><div className="booking-assurance"><ShieldCheck size={18} /><p>Nggak perlu bayar sekarang.<br />Sepakati biaya dengan tukang dulu.</p></div></div><p className="sidebar-note">Kamu tetap punya pilihan.<br />Kalau belum cocok, <a href="#hasil-pencarian">cari tukang lain.</a></p></aside></div>
    <div className="mobile-booking-bar"><div><small>Perkiraan mulai</small><strong>{rupiah(t.min)}</strong></div><Button onClick={book}>Pesan servis <ArrowRight size={18} /></Button></div>
    <dialog ref={dialog} className="contact-dialog"><div className="contact-heading"><h2>Hubungi {t.name}</h2><Button variant="ghost" autoFocus aria-label="Tutup percakapan" onClick={() => dialog.current?.close()}><X size={20} /></Button></div><p className="small-text">Ini contoh percakapan. Pesan kamu tidak dikirim ke tukang asli.</p>{sent ? <div className="placeholder-note" role="status"><Check size={24} /><p>Pesan contoh kamu sudah dikirim.<br />Di aplikasi nanti, tukang akan membalas di sini.</p></div> : <form onSubmit={e => { e.preventDefault(); setSent(true); }}><label className="field"><span>Pesan kamu</span><textarea required defaultValue={`Halo, aku mau tanya servis ${t.devices[0].toLowerCase()}. Masih bisa terima hari ini?`} /></label><Button type="submit" className="w-full">Kirim pesan contoh <ArrowRight size={18} /></Button></form>}</dialog>
  </main>;
}
