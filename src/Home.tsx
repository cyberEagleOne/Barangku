import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Search, ShieldCheck, Wrench, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button, Field, TechnicianCard, ReviewItem } from './DesignSystem';
import { getFeaturedReviews, searchTechnicians, type Review, type Technician } from './api';

export default function Home({
  technicians: propTechnicians,
  navigate
}: {
  technicians?: Technician[];
  navigate: (path: string) => void;
}) {
  const [device, setDevice] = useState('');
  const [problem, setProblem] = useState('');
  const [locationText, setLocationText] = useState('Karawaci, Tangerang');
  const [techs, setTechs] = useState<Technician[]>(propTechnicians ?? []);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(!propTechnicians?.length);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      propTechnicians ? Promise.resolve(propTechnicians) : searchTechnicians(),
      getFeaturedReviews()
    ])
      .then(([tList, rList]) => {
        if (!isMounted) return;
        setTechs(tList);
        setReviews(rList);
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
  }, [propTechnicians]);

  useEffect(() => {
    if (location.hash === '#cara-kerja' || location.hash.includes('cara-kerja')) {
      const timer = setTimeout(() => {
        document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (device && device !== 'Semua perangkat') params.set('perangkat', device);
    if (problem && problem !== 'Semua kerusakan') params.set('kerusakan', problem);
    const qs = params.toString();
    navigate(`hasil-pencarian${qs ? `?${qs}` : ''}`);
  };

  if (loading) {
    return (
      <main className="container home-page">
        <p>Memuat...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container home-page">
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className="container home-page">
      {/* 1. Hero Section */}
      <section className="home-hero">
        <div className="home-hero-text">
          <div className="hero-pill">
            <span className="hero-pill-dot" />
            <span>Solusi benerin gadget tanpa waswas</span>
          </div>
          <h1>
            Rusak? Benerin dulu,<br />
            <span>jangan buang.</span>
          </h1>
          <p className="home-hero-sub">
            Hubungkan barang rusakmu ke tukang servis lokal tepercaya di sekitar Tangerang. Transparan, jelas, dan dekat dari rumah.
          </p>
        </div>

        <form className="home-search-panel" onSubmit={handleSearch}>
          <div className="home-search-fields">
            <Field
              label="Jenis perangkat"
              dropdown
              value={device}
              onValueChange={setDevice}
              placeholder="Pilih jenis perangkat"
              options={['Semua perangkat', 'Laptop', 'HP']}
            />
            <Field
              label="Kerusakan"
              dropdown
              value={problem}
              onValueChange={setProblem}
              placeholder="Pilih jenis kerusakan"
              options={[
                'Semua kerusakan',
                'Layar pecah / retak',
                'Baterai cepat habis',
                'Mati total',
                'Kena air',
                'Keyboard / tombol rusak',
                'Sistem lambat / instal ulang',
                'Kerusakan lain'
              ]}
            />
            <Field
              label="Lokasi kamu"
              value={locationText}
              onValueChange={setLocationText}
              placeholder="Contoh: Karawaci, Tangerang"
            />
          </div>
          <Button type="submit" className="home-search-submit">
            <Search size={20} />
            <span>Cari tukang terdekat</span>
          </Button>
        </form>
      </section>

      {/* 2. Cara Kerja Section */}
      <section id="cara-kerja" className="home-section cara-kerja-section">
        <div className="section-header">
          <div className="eyebrow"><span className="eyebrow-line" /> MUDAH & TRANSPARAN</div>
          <h2>Cara kerja barangku</h2>
          <p>Tiga langkah gampang sampai barangmu kembali normal.</p>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <div className="step-num"><Smartphone size={22} /></div>
            <h3>1. Ceritakan keluhan</h3>
            <p>Pilih perangkat dan kerusakan yang kamu alami. Nggak perlu pusing istilah teknis, jelaskan saja apa yang terjadi.</p>
          </article>
          <article className="step-card">
            <div className="step-num"><ShieldCheck size={22} /></div>
            <h3>2. Pilih tukang tepercaya</h3>
            <p>Bandingkan jarak, perkiraan biaya, dan ulasan tetangga sekitar sebelum kamu menentukan pilihan yang pas.</p>
          </article>
          <article className="step-card">
            <div className="step-num"><CheckCircle2 size={22} /></div>
            <h3>3. Beres dan tenang</h3>
            <p>Pantau progres perbaikan secara terbuka. Ambil barang setelah dicek bareng dan berfungsi normal kembali.</p>
          </article>
        </div>
      </section>

      {/* 3. Tukang Pilihan di Dekat Kamu */}
      <section className="home-section featured-techs-section">
        <div className="section-header">
          <div className="eyebrow"><span className="eyebrow-line" /> TUKANG PILIHAN</div>
          <h2>Tukang pilihan di dekat kamu</h2>
          <p>Tukang jujur dengan keahlian teruji dan tempat usaha yang jelas di sekitar Tangerang.</p>
        </div>
        <div className="home-techs-grid">
          {techs.slice(0, 3).map(tech => (
            <TechnicianCard
              key={tech.id}
              technician={tech}
              onChoose={() => navigate(`detail/${tech.id}`)}
            />
          ))}
        </div>
        <div className="home-section-action">
          <Button variant="secondary" onClick={() => navigate('hasil-pencarian')}>
            Lihat semua tukang di Tangerang <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* 4. Kata Mereka */}
      <section className="home-section reviews-section">
        <div className="section-header">
          <div className="eyebrow"><span className="eyebrow-line" /> CERITA TETANGGA</div>
          <h2>Kata mereka</h2>
          <p>Cerita asli dari warga yang memilih benerin dulu daripada buru-buru beli baru.</p>
        </div>
        <div className="home-reviews-grid">
          {reviews.map((rev, idx) => (
            <ReviewItem key={idx} review={rev} />
          ))}
        </div>
      </section>

      {/* 5. CTA Strip untuk Tukang */}
      <section className="home-tech-cta">
        <div className="tech-cta-content">
          <div className="tech-cta-badge">
            <Wrench size={16} />
            <span>UNTUK TUKANG SERVIS</span>
          </div>
          <h2>Kamu tukang servis? Gabung barangku</h2>
          <p>Bantu tetangga di sekitarmu dan kembangkan tokomu tanpa biaya pendaftaran.</p>
        </div>
        <Button className="tech-cta-btn" onClick={() => navigate('untuk-tukang')}>
          Daftar jadi tukang <ArrowRight size={20} />
        </Button>
      </section>
    </main>
  );
}
