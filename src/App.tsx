import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, ShieldCheck, List, Navigation, Plus, Minus, ChevronDown, Inbox, X, Wrench } from 'lucide-react';
import DesignSystem, { Button, Chip, Navbar, Footer, TechnicianCard, Badge, defaultTechnician, rupiah, type Technician } from './DesignSystem';
import TechnicianDetail from './TechnicianDetail';
import Tracking, { demoOrder, repairSteps } from './Tracking';
import Booking, { type Order } from './Booking';
import Auth, { ForgotPassword, isProtectedRoute, isTechnicianRoute, safeReturnRoute, type DemoUser } from './Auth';
import MyOrders, { type ListedOrder } from './MyOrders';
import Home from './Home';
import { initialOrders, toBookingOrder, type DemoOrder } from './orderState';
import UntukTukang from './UntukTukang';
import DaftarTukang from './DaftarTukang';

const technicians: Technician[] = [
  { ...defaultTechnician, devices: ['Laptop'] },
  { id: 2, name: 'Kang Arif Laptop', area: 'Cikokol', devices: ['Laptop'], rating: '4,9', reviews: 96, distance: 2.1, min: 175000, max: 600000, status: 'open', verified: true },
  { id: 3, name: 'Bengkel HP Bu Sari', area: 'Bencongan', devices: ['HP'], rating: '4,7', reviews: 84, distance: 2.8, min: 100000, max: 350000, status: 'busy', verified: true },
  { id: 4, name: 'Pak Agus Elektronik', area: 'Kelapa Dua', devices: ['Laptop', 'HP'], rating: '4,6', reviews: 57, distance: 3.4, min: 125000, max: 500000, status: 'open', verified: false },
  { id: 5, name: 'Rizky Servis HP', area: 'Cibodas', devices: ['HP'], rating: '4,8', reviews: 112, distance: 4.2, min: 80000, max: 400000, status: 'closed', verified: true },
  { id: 6, name: 'Bima Komputer', area: 'Gading Serpong', devices: ['Laptop'], rating: '4,9', reviews: 73, distance: 5.6, min: 200000, max: 750000, status: 'busy', verified: true },
];
const filters = ['Semua', 'Laptop', 'HP', 'Terverifikasi', 'Buka sekarang'];
function go(path: string) { location.hash = path; window.scrollTo({ top: 0, behavior: 'instant' }); }
function SearchResults() {
  const [chosenFilters, setFilters] = useState<string[]>(() => {
    const device = new URLSearchParams(location.hash.split('?')[1]).get('perangkat');
    return device === 'Laptop' || device === 'HP' ? [device] : [];
  });
  const [sort, setSort] = useState('distance');
  const [selected, setSelected] = useState<number | null>(1);
  const [showMap, setShowMap] = useState(false);
  const [zoom, setZoom] = useState(1);
  const visible = technicians.filter(t => (!chosenFilters.includes('Laptop') || t.devices.includes('Laptop')) && (!chosenFilters.includes('HP') || t.devices.includes('HP')) && (!chosenFilters.includes('Terverifikasi') || t.verified) && (!chosenFilters.includes('Buka sekarang') || t.status === 'open')).sort((a, b) => sort === 'rating' ? Number(b.rating.replace(',', '.')) - Number(a.rating.replace(',', '.')) : sort === 'price' ? a.min - b.min : a.distance - b.distance);
  const current = visible.find(t => t.id === selected);
  const toggle = (label: string) => {
    const next = label === 'Semua' ? [] : chosenFilters.includes(label) ? chosenFilters.filter(f => f !== label) : [...chosenFilters, label];
    setFilters(next); setSelected(null);
  };
  const selectPin = (id: number) => {
    setSelected(id);
    const card = document.getElementById(`technician-${id}`);
    const list = document.querySelector('.results-list');
    if (card && list && window.innerWidth > 600) list.scrollTo({ top: (card as HTMLElement).offsetTop - (list as HTMLElement).offsetTop, behavior: 'smooth' });
  };
  return <main className="container results-page">
    <div className="breadcrumb"><a href="#beranda">Beranda</a><span>/</span><span>Hasil pencarian</span></div>
    <div className="results-title"><div><div className="eyebrow"><span className="eyebrow-line" /> TUKANG LOKAL, BARANG KEMBALI NORMAL</div><h1>Tukang tepercaya, <span>dekat kamu.</span></h1><p>Bandingkan dulu. Pilih yang pas buat barang dan kantong kamu.</p></div><div className="location-pill"><MapPin size={20} /><div><small>Lokasi pencarian kamu</small><strong>Karawaci, Tangerang</strong></div><Button variant="ghost" aria-label="Ubah lokasi pencarian" onClick={() => go('beranda')}><ChevronDown size={18} /></Button></div></div>
    <div className="results-toolbar"><div className="chips">{filters.map(label => <Chip key={label} label={label} selected={label === 'Semua' ? !chosenFilters.length : chosenFilters.includes(label)} onClick={() => toggle(label)} />)}</div><label className="sort-field"><span>Urutkan:</span><select aria-label="Urutkan hasil pencarian" value={sort} onChange={e => setSort(e.target.value)}><option value="distance">Terdekat</option><option value="rating">Nilai tertinggi</option><option value="price">Biaya terendah</option></select><ChevronDown size={16} /></label></div>
    <div className="results-caption"><p aria-live="polite"><strong>{visible.length} tukang</strong> di sekitar Karawaci <span>· Dalam jarak 6 km</span></p><span><ShieldCheck size={16} /> Pilih dengan tenang, servis dengan jelas.</span><Button variant="secondary" className="map-toggle" onClick={() => setShowMap(!showMap)}>{showMap ? <List size={18} /> : <MapPin size={18} />}{showMap ? 'Lihat daftar' : 'Lihat peta'}</Button></div>
    {!visible.length ? <div className="search-empty"><Inbox size={40} /><h2>Belum ada tukang yang cocok.</h2><p>Belum ada tukang di sekitar sini dengan pilihan kamu.<br />Coba kurangi filter pencarian ya.</p><Button onClick={() => { setFilters([]); setSelected(1); }}>Tampilkan semua tukang <ArrowRight size={18} /></Button></div> :
    <div className={`results-layout ${showMap ? 'show-map' : ''}`}><div className="results-list" aria-label="Daftar tukang">{visible.map(t => <TechnicianCard key={t.id} technician={t} selected={selected === t.id} onSelect={() => setSelected(t.id)} onChoose={() => go(`detail/${t.id}`)} />)}<div className="list-end"><ShieldCheck size={16} />Semua tukang di sekitar kamu sudah ditampilkan.</div></div>
    <div className="search-map" aria-label="Peta ilustrasi lokasi tukang di Tangerang"><div className="map-top-label"><MapPin size={16} /> Sekitar Karawaci <span>· Peta ilustrasi</span></div><div className="map-canvas" style={{ transform: `scale(${zoom})` }}>
      <svg className="map-drawing" viewBox="0 0 736 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs><pattern id="blocks" width="100" height="88" patternUnits="userSpaceOnUse"><rect x="8" y="8" width="34" height="28" rx="5" className="map-block" /><rect x="52" y="8" width="38" height="28" rx="5" className="map-block" /><rect x="8" y="46" width="82" height="32" rx="5" className="map-block" /></pattern></defs>
        <rect width="736" height="720" fill="url(#blocks)" />
        <path d="M600 -30 C530 170 650 200 570 330 S560 570 670 760" className="map-river" />
        <path d="M-30 172 L260 172 L440 258 L770 258 M140 -40 L140 520 L360 760 M-40 480 L320 480 L770 400 M420 -40 L420 370 L300 700 M-30 650 L770 650" className="map-streets" />
        <path d="M-30 350 L270 350 L490 550 L770 550" className="map-main-road" />
        <path d="M-30 350 L270 350 L490 550 L770 550" className="map-road-center" />
        <rect x="220" y="200" width="98" height="72" rx="20" className="map-park" /><rect x="440" y="70" width="94" height="58" rx="16" className="map-park" /><rect x="58" y="553" width="70" height="58" rx="16" className="map-park" />
        <g className="map-place-text"><text x="185" y="135">KARAWACI</text><text x="475" y="208">CIKOKOL</text><text x="80" y="442">BENCONGAN</text><text x="375" y="610">KELAPA DUA</text><text x="80" y="680">CIBODAS</text><text x="200" y="535">GADING SERPONG</text></g><g className="map-street-text"><text x="20" y="338">Jl. Imam Bonjol</text><text x="435" y="539">Jl. Raya Kelapa Dua</text><text x="232" y="244">Taman kota</text></g>
      </svg>
      <div className="you-location"><span /><small>Kamu di sini</small></div>
      {visible.map(t => <button key={t.id} className={`result-pin result-pin-${t.id} ${selected === t.id ? 'selected' : ''}`} aria-pressed={selected === t.id} aria-label={`Tandai ${t.name}, ${t.distance.toLocaleString('id-ID')} km`} onClick={() => selectPin(t.id)}><Wrench size={20} /><span>{t.id}</span></button>)}
    </div><div className="map-controls"><Button variant="secondary" aria-label="Perbesar peta" disabled={zoom >= 1.4} onClick={() => setZoom(Math.min(1.4, zoom + .2))}><Plus size={20} /></Button><Button variant="secondary" aria-label="Perkecil peta" disabled={zoom <= 1} onClick={() => setZoom(Math.max(1, zoom - .2))}><Minus size={20} /></Button></div>
    {current && <div className="map-selected-info"><div className="map-selected-icon"><Wrench size={20} /></div><div><strong>{current.name}</strong><p>{current.area} · {current.distance.toLocaleString('id-ID')} km dari kamu</p><span>Mulai {rupiah(current.min)}</span></div><Button variant="ghost" aria-label={`Lihat detail ${current.name}`} onClick={() => go(`detail/${current.id}`)}><ArrowRight size={22} /></Button></div>}
    <div className="map-bottom-label"><Navigation size={12} /> Lokasi perkiraan untuk contoh pencarian</div></div></div>}
    <div className="results-reassurance"><ShieldCheck size={20} /><p>Barang kamu berharga. <strong>Kenali tukangnya dulu sebelum pesan servis.</strong></p><a href="#sistem-desain">Tentang barangku <ArrowRight size={16} /></a></div>
  </main>;
}

export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || 'hasil-pencarian');
  const [notice, setNotice] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [orders, setOrders] = useState<DemoOrder[]>(initialOrders);

  useEffect(() => { const update = () => { setRoute(location.hash.slice(1) || 'hasil-pencarian'); window.scrollTo(0, 0); }; window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
  const blocked = !user && isProtectedRoute(route);
  useEffect(() => {
    if (blocked) location.replace(`#masuk?next=${encodeURIComponent(route)}`);
  }, [blocked, route]);

  const [page, query = ''] = route.split('?');
  const params = new URLSearchParams(query);
  const next = blocked ? route : params.get('next') ?? undefined;
  const login = (account: DemoUser, destination: string) => { setUser(account); go(destination); };
  const logout = () => { setUser(null); setOrder(null); setNotice('Kamu sudah keluar dari akun demo.'); go('beranda'); };

  const handleBookingComplete = (newBooking: Order) => {
    setOrder(newBooking);
    const demoEntry: DemoOrder = {
      code: newBooking.code,
      device: newBooking.details.device,
      model: newBooking.details.model,
      damage: newBooking.details.problem,
      customerName: user?.name ? user.name.split(' ')[0] : 'Pelanggan',
      customerPhone: user?.contact ?? '0812-0000-0000',
      status: 0,
      estimate: newBooking.technician.min,
      shop: newBooking.technician.name,
      technicianId: newBooking.technician.id,
      date: newBooking.details.date,
      time: newBooking.details.time,
      incoming: true,
    };
    setOrders(prev => [demoEntry, ...prev.filter(o => o.code !== demoEntry.code)]);
  };

  const samples: ListedOrder[] = orders.filter(o => !o.incoming).map(o => {
    const tech = technicians.find(t => t.id === o.technicianId) ?? defaultTechnician;
    return { order: toBookingOrder(o, tech), status: o.status };
  });

  const currentCode = page.split('/')[1];
  const targetOrder = orders.find(o => o.code === currentCode);
  const targetTech = targetOrder ? (technicians.find(t => t.id === targetOrder.technicianId) ?? defaultTechnician) : defaultTechnician;
  const trackingOrder = targetOrder ? toBookingOrder(targetOrder, targetTech) : null;
  const trackingStep = targetOrder ? targetOrder.status : 2;

  let content;
  if (blocked || page === 'masuk' || page === 'daftar') content = user
    ? <main className="container placeholder-page"><h1>Kamu sudah masuk.</h1><p>Akun demo kamu siap dipakai.</p><Button onClick={() => go(safeReturnRoute(next ?? null))}>Lanjut <ArrowRight size={18} /></Button></main>
    : <Auth key={`${page}-${next ?? ''}`} mode={page === 'daftar' ? 'daftar' : 'masuk'} next={next} protectedInfo={!!next} onLogin={login} navigate={go} />;
  else if (user && user.role !== 'tukang' && isTechnicianRoute(page)) content = (
    <main className="container placeholder-page">
      <div className="eyebrow"><span className="eyebrow-line" /> KHUSUS TEKNISI</div>
      <h1>Halaman ini khusus tukang.</h1>
      <p>Akun kamu terdaftar sebagai pelanggan. Silakan kembali ke Beranda atau masuk dengan akun tukang servis.</p>
      <Button onClick={() => go('beranda')}>Kembali ke Beranda <ArrowRight size={18} /></Button>
    </main>
  );
  else if (page === 'lupa-sandi') content = <ForgotPassword key={route} next={next} />;
  else if (page === 'pesanan-saya') content = <MyOrders key={user?.name} orders={samples} fresh={!!user?.fresh && !orders.filter(o => !o.incoming).length} navigate={go} />;
  else if (page === 'profil') content = <main className="container placeholder-page profile-page"><h1>Profil kamu</h1><div className="order-summary"><h2>{user?.name}</h2><p>{user?.contact}</p><p className="small-text">Akun demo · {user?.role === 'tukang' ? 'Tukang servis' : 'Pelanggan'}</p><Button variant="secondary" onClick={logout}>Keluar</Button></div></main>;
  else if (page === 'untuk-tukang') content = <UntukTukang navigate={go} />;
  else if (page === 'daftar-tukang') content = <DaftarTukang user={user} onLogin={login} navigate={go} />;
  else if (page === 'dashboard-tukang') content = (
    <main className="container placeholder-page">
      <div className="eyebrow"><span className="eyebrow-line" /> PANEL TEKNISI</div>
      <h1>Dashboard Tukang</h1>
      <p>Halo, {user?.name}. Halaman dashboard teknisi dengan status buka/tutup dan pesanan masuk akan dibangun di Batch F.</p>
      <div className="my-orders-grid" style={{ marginTop: '24px' }}>
        {orders.map(o => (
          <article key={o.code} className="my-order-card">
            <div className="my-order-heading">
              <span>{o.code}</span>
              <span className="badge busy">{o.incoming ? 'Pesanan Masuk' : `Status: ${repairSteps[o.status]}`}</span>
            </div>
            <strong>{o.customerName} · {o.model}</strong>
            <p className="small-text">{o.damage}</p>
            <Button style={{ marginTop: '16px' }} onClick={() => go(`pesanan-tukang/${o.code}`)}>Lihat pesanan <ArrowRight size={18} /></Button>
          </article>
        ))}
      </div>
    </main>
  );
  else if (page.startsWith('pesanan-tukang/')) {
    const code = page.split('/')[1];
    const ord = orders.find(o => o.code === code);
    content = (
      <main className="container placeholder-page">
        <div className="eyebrow"><span className="eyebrow-line" /> DETAIL PESANAN TEKNISI</div>
        <h1>Detail Pesanan {code}</h1>
        {ord ? (
          <div>
            <p><strong>{ord.customerName}</strong> ({ord.customerPhone}) · {ord.device} {ord.model}</p>
            <p className="small-text">Kerusakan: {ord.damage} · Status saat ini: {repairSteps[ord.status]}</p>
          </div>
        ) : <p>Pesanan tidak ditemukan.</p>}
        <p style={{ marginTop: '16px' }}>Alur lengkap pergerakan status dan perkiraan biaya akan dibangun di Batch F.</p>
        <Button variant="secondary" onClick={() => go('dashboard-tukang')}><ArrowLeft size={18} /> Kembali ke dashboard</Button>
      </main>
    );
  }
  else if (page === 'beranda' || page === 'cara-kerja') content = <Home technicians={technicians} navigate={go} />;
  else if (page.startsWith('detail/')) content = <TechnicianDetail key={route} technician={technicians.find(t => t.id === Number(page.split('/')[1]))} navigate={go} />;
  else if (page.startsWith('pesan/')) content = <Booking key={route} technician={technicians.find(t => t.id === Number(page.split('/')[1]))} navigate={go} onComplete={handleBookingComplete} />;
  else if (page.startsWith('lacak/')) content = <Tracking key={`${route}-${trackingStep}`} order={trackingOrder} initialStep={trackingStep} code={page.split('/')[1]} navigate={go} />;
  else content = <SearchResults />;

  if (route === 'sistem-desain') return <DesignSystem />;
  const routeClass = blocked ? '' : page.startsWith('detail/') ? 'detail-route' : page.startsWith('pesan/') ? 'booking-route' : page.startsWith('lacak/') ? 'tracking-route' : '';
  return <div className={routeClass}><Navbar user={user} onLogout={logout} />{content}<Footer onLink={label => label === 'Cari tukang' ? go('hasil-pencarian') : label === 'Cara kerja' ? (go('beranda'), setTimeout(() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' }), 120)) : label === 'Jadi tukang' ? go('untuk-tukang') : setNotice('Halaman ini belum tersedia. Kamu bisa mencoba pencarian dulu ya.')} />{notice && <div className="toast" role="status"><span>{notice}</span><Button variant="ghost" aria-label="Tutup pemberitahuan" onClick={() => setNotice('')}><X size={18} /></Button></div>}</div>;
}
