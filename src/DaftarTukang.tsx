import { useState, type ChangeEvent } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, CheckCircle2, CircleAlert, Eye, EyeOff, Store, UploadCloud } from 'lucide-react';
import { Button, Stepper, type DemoUser } from './DesignSystem';

const STEPS = ['Data diri', 'Data toko', 'Jenis servis'];

const AVAILABLE_SERVICES = [
  'Laptop',
  'HP',
  'Ganti layar',
  'Ganti baterai',
  'Servis mati total',
  'Install ulang'
];

type FormData = {
  name: string;
  phone: string;
  email: string;
  password: string;
  shopName: string;
  address: string;
  hours: string;
  photoUploaded: boolean;
  services: string[];
  minPrice: string;
};

export default function DaftarTukang({
  user,
  onLogin,
  navigate
}: {
  user: DemoUser | null;
  onLogin: (account: DemoUser, destination: string) => void;
  navigate: (path: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: user?.name || '',
    phone: user?.contact?.startsWith('08') ? user.contact : '',
    email: user?.contact?.includes('@') ? user.contact : '',
    password: '',
    shopName: '',
    address: 'Karawaci, Kota Tangerang',
    hours: 'Senin–Sabtu, 09.00–18.00',
    photoUploaded: false,
    services: ['Laptop', 'HP', 'Ganti baterai'],
    minPrice: '100000'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const toggleService = (srv: string) => {
    setFormData(prev => {
      const exists = prev.services.includes(srv);
      const next = exists ? prev.services.filter(s => s !== s !== false && s !== srv) : [...prev.services, srv];
      return { ...prev, services: next };
    });
    setErrors(prev => ({ ...prev, services: '' }));
  };

  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) errs.name = 'Kolom ini belum diisi, isi dulu ya.';
      if (!formData.phone.trim()) errs.phone = 'Kolom ini belum diisi, isi dulu ya.';
      if (!formData.email.trim()) errs.email = 'Kolom ini belum diisi, isi dulu ya.';
      if (!formData.password || formData.password.length < 8) {
        errs.password = 'Kata sandi minimal 8 karakter ya.';
      }
    } else if (step === 1) {
      if (!formData.shopName.trim()) errs.shopName = 'Kolom ini belum diisi, isi dulu ya.';
      if (!formData.address.trim()) errs.address = 'Kolom ini belum diisi, isi dulu ya.';
      if (!formData.hours.trim()) errs.hours = 'Kolom ini belum diisi, isi dulu ya.';
    } else if (step === 2) {
      if (!formData.services.length) errs.services = 'Pilih minimal satu jenis servis ya.';
      if (!formData.minPrice.trim()) errs.minPrice = 'Tulis perkiraan biaya awal ya.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setIsDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('untuk-tukang');
    }
  };

  const handleFinish = () => {
    const tukangUser: DemoUser = {
      name: formData.shopName || formData.name || 'Tukang Servis',
      contact: formData.phone || formData.email || '081234567890',
      fresh: true,
      role: 'tukang'
    };
    onLogin(tukangUser, 'dashboard-tukang');
  };

  if (isDone) {
    return (
      <main className="container daftar-tukang-page">
        <div className="tech-confirm-card">
          <div className="tech-confirm-icon">
            <CheckCircle2 size={56} />
          </div>
          <h1>Pendaftaranmu sudah masuk!</h1>
          <p className="tech-confirm-sub">
            Selamat datang, <strong>{formData.name}</strong>! Toko <strong>{formData.shopName}</strong> sudah aktif di Barangku.
          </p>

          <div className="tech-summary-box">
            <div className="tech-summary-row">
              <span className="label">Nama toko</span>
              <strong>{formData.shopName}</strong>
            </div>
            <div className="tech-summary-row">
              <span className="label">Alamat</span>
              <span>{formData.address}</span>
            </div>
            <div className="tech-summary-row">
              <span className="label">Jam buka</span>
              <span>{formData.hours}</span>
            </div>
            <div className="tech-summary-row">
              <span className="label">Layanan</span>
              <span>{formData.services.join(', ')}</span>
            </div>
            <div className="tech-summary-row">
              <span className="label">Mulai biaya</span>
              <strong>Rp {Number(formData.minPrice || 0).toLocaleString('id-ID')}</strong>
            </div>
          </div>

          <div className="tech-confirm-action">
            <Button className="tech-button tech-button-full" onClick={handleFinish}>
              Buka dashboard <ArrowRight size={22} />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container daftar-tukang-page">
      <div className="daftar-tukang-header">
        <div className="eyebrow"><span className="eyebrow-line" /> PENDAFTARAN MITRA TEKNISI</div>
        <h1>Daftar jadi tukang</h1>
        <p className="daftar-tukang-sub">Tiga langkah mudah agar tokomu bisa langsung menerima pelanggan di Tangerang.</p>
      </div>

      <div className="tech-stepper-wrap">
        <Stepper steps={STEPS} current={step} label="Langkah pendaftaran teknisi" />
      </div>

      <div className="tech-form-card">
        {step === 0 && (
          <section className="tech-form-step">
            <div className="step-title-wrap">
              <h2>Langkah 1: Data diri kamu</h2>
              <p>Informasi akun untuk masuk ke dashboard teknisi.</p>
            </div>

            <div className="tech-form-fields">
              <label className="field tech-field">
                <span>Nama lengkap <span className="required-mark">*</span></span>
                <input
                  type="text"
                  placeholder="Contoh: Mas Dedi Wahyudi"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  className={errors.name ? 'invalid' : ''}
                />
                {errors.name && <small className="error-text"><CircleAlert size={14} />{errors.name}</small>}
              </label>

              <label className="field tech-field">
                <span>Nomor HP (WhatsApp) <span className="required-mark">*</span></span>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  className={errors.phone ? 'invalid' : ''}
                />
                {errors.phone && <small className="error-text"><CircleAlert size={14} />{errors.phone}</small>}
              </label>

              <label className="field tech-field">
                <span>Email <span className="required-mark">*</span></span>
                <input
                  type="email"
                  placeholder="Contoh: dedi@email.com"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  className={errors.email ? 'invalid' : ''}
                />
                {errors.email && <small className="error-text"><CircleAlert size={14} />{errors.email}</small>}
              </label>

              <label className="field tech-field">
                <span>Kata sandi akun <span className="required-mark">*</span></span>
                <div className="input-wrap with-suffix">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 8 karakter"
                    value={formData.password}
                    onChange={e => updateField('password', e.target.value)}
                    className={errors.password ? 'invalid' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </Button>
                </div>
                {errors.password && <small className="error-text"><CircleAlert size={14} />{errors.password}</small>}
              </label>
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="tech-form-step">
            <div className="step-title-wrap">
              <h2>Langkah 2: Data toko servis kamu</h2>
              <p>Informasi yang akan dilihat pelanggan saat mencari tukang terdekat.</p>
            </div>

            <div className="tech-form-fields">
              <label className="field tech-field">
                <span>Nama toko servis <span className="required-mark">*</span></span>
                <input
                  type="text"
                  placeholder="Contoh: Dedi Servis Laptop & HP"
                  value={formData.shopName}
                  onChange={e => updateField('shopName', e.target.value)}
                  className={errors.shopName ? 'invalid' : ''}
                />
                {errors.shopName && <small className="error-text"><CircleAlert size={14} />{errors.shopName}</small>}
              </label>

              <label className="field tech-field">
                <span>Alamat lengkap toko <span className="required-mark">*</span></span>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Imam Bonjol No. 24, Karawaci, Tangerang"
                  value={formData.address}
                  onChange={e => updateField('address', e.target.value)}
                  className={errors.address ? 'invalid' : ''}
                />
                {errors.address && <small className="error-text"><CircleAlert size={14} />{errors.address}</small>}
              </label>

              <label className="field tech-field">
                <span>Jam operasional buka <span className="required-mark">*</span></span>
                <input
                  type="text"
                  placeholder="Contoh: Senin–Sabtu, 09.00–18.00"
                  value={formData.hours}
                  onChange={e => updateField('hours', e.target.value)}
                  className={errors.hours ? 'invalid' : ''}
                />
                {errors.hours && <small className="error-text"><CircleAlert size={14} />{errors.hours}</small>}
              </label>

              <div className="tech-upload-area">
                <span className="tech-upload-label">Foto toko (Opsional)</span>
                <div
                  className={`tech-upload-dropzone ${formData.photoUploaded ? 'uploaded' : ''}`}
                  onClick={() => updateField('photoUploaded', !formData.photoUploaded)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') updateField('photoUploaded', !formData.photoUploaded); }}
                >
                  {formData.photoUploaded ? (
                    <div className="upload-preview-state">
                      <CheckCircle2 size={32} />
                      <strong>Foto toko terpilih</strong>
                      <small>Klik untuk ganti atau batalkan foto</small>
                    </div>
                  ) : (
                    <div className="upload-empty-state">
                      <Camera size={32} />
                      <strong>Unggah foto tokomu</strong>
                      <small>Bisa foto tampak depan toko atau meja kerja. Format JPG atau PNG.</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="tech-form-step">
            <div className="step-title-wrap">
              <h2>Langkah 3: Jenis servis & perkiraan biaya</h2>
              <p>Pilih spesialisasi perbaikan yang biasa kamu kerjakan.</p>
            </div>

            <div className="tech-form-fields">
              <div className="tech-chips-field">
                <span className="tech-chips-label">
                  Pilih layanan yang kamu terima <span className="required-mark">*</span>
                </span>
                <div className="tech-big-chips" role="group" aria-label="Pilihan jenis servis">
                  {AVAILABLE_SERVICES.map(srv => {
                    const selected = formData.services.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        aria-pressed={selected}
                        className={`tech-big-chip ${selected ? 'selected' : ''}`}
                        onClick={() => toggleService(srv)}
                      >
                        {selected && <Check size={20} />}
                        <span>{srv}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.services && <small className="error-text"><CircleAlert size={14} />{errors.services}</small>}
              </div>

              <label className="field tech-field">
                <span>Perkiraan biaya servis mulai dari (Rp) <span className="required-mark">*</span></span>
                <input
                  type="number"
                  placeholder="Contoh: 100000"
                  value={formData.minPrice}
                  onChange={e => updateField('minPrice', e.target.value)}
                  className={errors.minPrice ? 'invalid' : ''}
                />
                <small className="help-text">Perkiraan ini akan ditampilkan sebagai patokan awal untuk pelanggan.</small>
                {errors.minPrice && <small className="error-text"><CircleAlert size={14} />{errors.minPrice}</small>}
              </label>
            </div>
          </section>
        )}

        {/* Desktop Buttons */}
        <div className="tech-form-actions desktop-actions">
          <Button variant="secondary" className="tech-button" onClick={handleBack}>
            <ArrowLeft size={20} /> Kembali
          </Button>
          <Button className="tech-button" onClick={handleNext}>
            {step === 2 ? 'Selesai daftar' : 'Lanjut'} <ArrowRight size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="tech-mobile-bar">
        <Button variant="secondary" className="tech-button" onClick={handleBack}>
          <ArrowLeft size={18} /> Kembali
        </Button>
        <Button className="tech-button" onClick={handleNext}>
          {step === 2 ? 'Selesai daftar' : 'Lanjut'} <ArrowRight size={18} />
        </Button>
      </div>
    </main>
  );
}
