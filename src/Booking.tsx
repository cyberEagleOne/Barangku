import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, CircleAlert, CircleCheck, ImagePlus, MapPin, ShieldCheck, Wrench, X } from 'lucide-react';
import { Badge, Button, Chip, Field, Stepper, TechnicianCard, TechnicianInfo, rupiah } from './DesignSystem';
import { createOrder, type BookingDetails, type Order, type Technician } from './api';

export type { BookingDetails, Order };

const steps = ['Pilih tukang', 'Isi detail', 'Cek ulang', 'Selesai'];
const problems = ['Layar pecah', 'Baterai drop', 'Mati total', 'Lemot'];
const requiredFields: (keyof BookingDetails)[] = ['device', 'model', 'problem', 'date', 'time'];

export function validateBooking(details: BookingDetails): Partial<Record<keyof BookingDetails, string>> {
  return Object.fromEntries(requiredFields.filter(key => !details[key].trim()).map(key => [key, 'Kolom ini belum diisi, isi dulu ya.']));
}

export function formatVisit(details: BookingDetails) {
  if (!details.date) return 'Belum dipilih';
  return `${new Date(`${details.date}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, pukul ${details.time.replace(':', '.')}`;
}

export function OrderSummary({ order, title = 'Ringkasan servis kamu' }: { order: Order; title?: string }) {
  const { technician: t, details } = order;
  return <section className="order-summary"><h2>{title}</h2><TechnicianInfo technician={t} /><dl className="summary-data"><div><dt>Perangkat kamu</dt><dd>{details.device} · {details.model}</dd></div><div><dt>Kerusakan</dt><dd>{details.problem}</dd></div><div><dt>Rencana ke toko</dt><dd>{formatVisit(details)}</dd></div>{order.photoName && <div><dt>Foto kerusakan</dt><dd>{order.photoName}</dd></div>}{details.notes.trim() && <div><dt>Catatan kamu</dt><dd>{details.notes}</dd></div>}</dl><div className="summary-cost"><span>Perkiraan biaya</span><strong>{rupiah(t.min)} – {rupiah(t.max)}</strong><small>Biaya akhir disepakati setelah perangkat dicek.</small></div></section>;
}

export default function Booking({ technician: t, navigate, onComplete }: { technician?: Technician; navigate: (path: string) => void; onComplete: (order: Order) => void }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<BookingDetails>({ device: '', model: '', problem: '', notes: '', date: '', time: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingDetails, string>>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!photo) { setPreview(''); return; } const url = URL.createObjectURL(photo); setPreview(url); return () => URL.revokeObjectURL(url); }, [photo]);
  useEffect(() => { if (step) { window.scrollTo({ top: 0, behavior: 'instant' }); titleRef.current?.focus({ preventScroll: true }); } }, [step]);

  const update = (key: keyof BookingDetails, value: string) => { setDetails(prev => ({ ...prev, [key]: value })); setErrors(prev => ({ ...prev, [key]: undefined })); };
  const next = () => {
    if (step === 1) {
      const invalid = validateBooking(details); setErrors(invalid);
      if (Object.keys(invalid).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>('.booking-form [aria-invalid="true"]')?.focus()); return; }
    }
    setStep(step + 1);
  };

  if (!t) return <main className="container placeholder-page"><h1>Pilih tukang dulu, ya.</h1><p>Kamu belum memilih tukang untuk servis ini.</p><Button onClick={() => navigate('hasil-pencarian')}>Cari tukang dulu</Button></main>;

  const draft: Order = {
    code: 'BRK-2026-0142',
    technician: t,
    details: { ...details },
    photoName: photo?.name ?? '',
    status: 0
  };

  const finish = async () => {
    if (order || creating) return;
    setCreating(true);
    setCreateError('');
    try {
      const created = await createOrder({
        technician: t,
        details,
        photoName: photo?.name ?? '',
      });
      setOrder(created);
      onComplete(created);
      setStep(3);
    } catch {
      setCreateError('Ada yang salah. Coba lagi ya.');
    } finally {
      setCreating(false);
    }
  };

  const localToday = new Date(); localToday.setMinutes(localToday.getMinutes() - localToday.getTimezoneOffset());
  const input = (key: keyof BookingDetails) => ({ name: key, value: details[key], onValueChange: (value: string) => update(key, value), error: errors[key] });

  return <main className="container booking-page">
    <div className="breadcrumb"><a href="#beranda">Beranda</a><span>/</span><a href={`#detail/${t.id}`}>{t.name}</a><span>/</span><span>Pesan servis</span></div>
    <div className="booking-page-heading"><div className="eyebrow"><span className="eyebrow-line" /> SELANGKAH LAGI, BARANG KEMBALI BERES</div><h1>Pesan servis</h1><p>Kasih tahu kendalanya. Biar tukang bisa bantu kamu lebih siap.</p></div>
    <div className="booking-stepper"><Stepper steps={steps} current={step} /></div>
    <div className={`booking-workspace ${step === 3 ? 'is-complete' : ''}`}><section className="booking-main-panel"><div className="booking-step-heading"><span className="booking-step-number">{step + 1}</span><div><h2 ref={titleRef} tabIndex={-1}>{['Tukang pilihan kamu', 'Ceritain barang kamu', 'Sudah sesuai, kan?', 'Pesananmu sudah masuk!'][step]}</h2><p>{['Cek lagi tokonya sebelum lanjut ya.', 'Isi yang wajib dulu. Foto dan catatan boleh menyusul.', 'Cek detailnya dulu sebelum kamu pesan.', 'Tukang bakal segera ngabarin kamu.'][step]}</p></div></div>
      {step === 0 && <div className="chosen-technician"><TechnicianCard technician={t} selected onSelect={() => {}} /><div className="chosen-technician-note"><ShieldCheck size={28} /><h3>Kamu pegang kendalinya.</h3><p>Tukang akan cek barang kamu dulu, lalu konfirmasi biaya. Perbaikan baru dimulai setelah kamu setuju.</p><Button variant="ghost" onClick={() => navigate('hasil-pencarian')}><ArrowLeft size={16} /> Ganti tukang</Button></div></div>}
      {step === 1 && <form id="booking-details" className="booking-form" noValidate onSubmit={e => { e.preventDefault(); next(); }}><div className="booking-fields"><Field label="Jenis perangkat" dropdown options={['Laptop', 'HP']} placeholder="Pilih perangkat kamu" required {...input('device')} /><Field label="Merek dan tipe" placeholder="Contoh: ASUS VivoBook 14" helper="Tulis merek dan tipe yang kamu tahu." required {...input('model')} /></div><Field label="Jenis kerusakan" dropdown options={[...problems, 'Tidak bisa mengisi daya', 'Kerusakan lainnya']} placeholder="Pilih kendala perangkat kamu" required {...input('problem')} /><div className="problem-chips"><p>Atau pilih kendala yang paling sering terjadi:</p><div className="chips">{problems.map(problem => <Chip key={problem} label={problem} selected={details.problem === problem} onClick={() => update('problem', details.problem === problem ? '' : problem)} />)}</div></div><div className="photo-field"><span>Foto kerusakan <small>Opsional</small></span><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" aria-label="Pilih foto kerusakan" className="sr-only" tabIndex={-1} onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setPhotoError('Pilih foto JPG, PNG, atau WebP, maksimal 5 MB ya.'); e.target.value = ''; return; } setPhotoError(''); setPhoto(file); e.target.value = ''; }} />{photo ? <div className="photo-preview">{preview && <img src={preview} alt="Foto kerusakan perangkat kamu" />}<div><strong>{photo.name}</strong><small>{(photo.size / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB · Tersimpan selama kamu mengisi</small></div><Button type="button" variant="ghost" aria-label="Hapus foto" onClick={() => setPhoto(null)}><X size={18} /></Button></div> : <Button type="button" variant="ghost" className="upload-area" onClick={() => fileRef.current?.click()}><ImagePlus size={28} /><span><strong>Tambah foto kerusakan</strong><small>JPG, PNG, atau WebP · Maksimal 5 MB</small></span></Button>}{photoError && <p role="alert" className="upload-error">{photoError}</p>}</div><Field label="Catatan buat tukang" multiline placeholder="Contoh: Laptop tiba-tiba mati waktu dipakai kerja." helper="Opsional. Tulis hal lain yang perlu tukang tahu." {...input('notes')} /><div className="visit-heading"><CalendarDays size={20} /><h3>Kapan kamu mau ke toko?</h3></div><div className="booking-fields"><Field label="Tanggal kunjungan" type="date" min={localToday.toISOString().slice(0, 10)} required {...input('date')} /><Field label="Jam kunjungan" dropdown options={['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']} placeholder="Pilih jam kedatangan" required {...input('time')} /></div><p className="visit-note">Jam kunjungan akan dikonfirmasi tukang. Kalau sedang penuh atau tutup, kamu akan dikabari.</p><button type="submit" className="sr-only" tabIndex={-1}>Lanjut</button></form>}
      {step === 2 && <><OrderSummary order={draft} /><div className="booking-info"><ShieldCheck size={20} /><p>Belum ada pembayaran sekarang. Tukang akan konfirmasi jadwal dan biaya ke kamu dulu.</p></div>{createError && <p className="error-text" role="alert"><CircleAlert size={14} />{createError}</p>}</>}
      {step === 3 && order && <div className="booking-success"><div className="success-circle"><CircleCheck size={44} /></div><p>Pesananmu sudah masuk! Tukang bakal segera ngabarin kamu.</p><div className="order-code"><small>Kode pesanan kamu</small><strong>{order.code}</strong></div><OrderSummary order={order} /><p className="prototype-note">Ini pesanan contoh untuk prototipe. Belum dikirim ke tukang asli.</p></div>}
      <div className="booking-actions">{step < 3 ? <><Button variant="ghost" onClick={() => step === 0 ? navigate(`detail/${t.id}`) : setStep(step - 1)}><ArrowLeft size={18} /> Kembali</Button>{step === 1 ? <Button type="submit" form="booking-details">Lanjut <ArrowRight size={18} /></Button> : <Button onClick={step === 2 ? finish : next} disabled={creating}>{step === 2 ? (creating ? 'Memuat...' : 'Pesan sekarang') : 'Lanjut'}<ArrowRight size={18} /></Button>}</> : <><Button variant="ghost" onClick={() => navigate('beranda')}>Kembali ke beranda</Button><Button onClick={() => navigate(`lacak/${order?.code}`)}>Lacak perbaikan <ArrowRight size={18} /></Button></>}</div>
    </section>{step < 3 && <aside className="booking-help"><div className="booking-help-icon"><ShieldCheck size={26} /></div><h3>Biar nggak ada<br />biaya kejutan.</h3><p>Perkiraan dari {t.name}:</p><strong>{rupiah(t.min)} – {rupiah(t.max)}</strong><ul><li><Check size={16} /> Ceritain kendalanya dulu</li><li><Check size={16} /> Tukang cek perangkat kamu</li><li><Check size={16} /> Kamu setujui biayanya</li></ul><p className="small-text">Barang kamu, keputusan kamu.</p></aside>}</div>
  </main>;
}
