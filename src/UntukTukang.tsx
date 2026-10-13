import { ArrowRight, CheckCircle2, Clock, Coins, ShieldCheck, Store, Wrench } from 'lucide-react';
import { Button } from './DesignSystem';

export default function UntukTukang({ navigate }: { navigate: (path: string) => void }) {
  return (
    <main className="container untuk-tukang-page">
      {/* Hero Section */}
      <section className="tech-hero">
        <div className="tech-hero-content">
          <div className="tech-pill">
            <span className="tech-pill-dot" />
            <span>Khusus kamu tukang servis</span>
          </div>
          <h1>
            Buka tokomu untuk<br />
            <span>tetangga sekitar.</span>
          </h1>
          <p className="tech-hero-sub">
            Gabung jaringan tukang servis lokal Barangku. Tambah pelanggan baru dari warga terdekat tanpa potongan biaya pendaftaran.
          </p>
          <div className="tech-hero-action">
            <Button className="tech-button" onClick={() => navigate('daftar-tukang')}>
              Daftar jadi tukang <ArrowRight size={22} />
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Keuntungan Utama */}
      <section className="tech-section">
        <div className="section-header">
          <div className="eyebrow"><span className="eyebrow-line" /> KENAPA GABUNG KAMI</div>
          <h2>Tiga keuntungan bermitra dengan Barangku</h2>
          <p>Dibuat praktis untuk tukang lokal. Kami bantu carikan orang yang butuh jasamu.</p>
        </div>

        <div className="tech-benefits-grid">
          <article className="tech-benefit-card">
            <div className="tech-benefit-icon">
              <Store size={28} />
            </div>
            <h3>Pelanggan datang sendiri ke tokomu</h3>
            <p>
              Nggak perlu repot pasang iklan atau keliling cari orang. Tetangga di sekitar Tangerang yang gadget-nya bermasalah langsung menemukan tokomu.
            </p>
          </article>

          <article className="tech-benefit-card">
            <div className="tech-benefit-icon">
              <Clock size={28} />
            </div>
            <h3>Kamu yang atur harga dan jam buka</h3>
            <p>
              Bebas tentukan perkiraan biaya servis dan jam operasional tokomu sendiri. Kapan pun tokomu sibuk atau tutup, tinggal geser satu tombol.
            </p>
          </article>

          <article className="tech-benefit-card">
            <div className="tech-benefit-icon">
              <Coins size={28} />
            </div>
            <h3>Kamu lihat sendiri biaya tiap pesanan</h3>
            <p>
              Semua perkiraan biaya disepakati langsung dengan pelanggan saat barang dicek. Kamu yang pegang kendali penuh atas tarif jasamu.
            </p>
          </article>
        </div>
      </section>

      {/* 3 Langkah Bergabung */}
      <section className="tech-section">
        <div className="section-header">
          <div className="eyebrow"><span className="eyebrow-line" /> CARA BERGABUNG</div>
          <h2>Tiga langkah mudah jadi mitra tukang</h2>
          <p>Proses sederhana, tanpa syarat rumit yang bikin pusing.</p>
        </div>

        <div className="tech-steps-grid">
          <article className="tech-step-item">
            <div className="tech-step-badge">1</div>
            <div className="tech-step-body">
              <h3>Isi data diri dan tokomu</h3>
              <p>Tulis nama toko, alamat di Tangerang, jam operasional, dan jenis servis spesialisasi kamu dalam waktu kurang dari 3 menit.</p>
            </div>
          </article>

          <article className="tech-step-item">
            <div className="tech-step-badge">2</div>
            <div className="tech-step-body">
              <h3>Kami cek dulu datamu</h3>
              <p>Kami memastikan info tokomu sudah sesuai agar pelanggan merasa tenang saat datang ke tempatmu.</p>
            </div>
          </article>

          <article className="tech-step-item">
            <div className="tech-step-badge">3</div>
            <div className="tech-step-body">
              <h3>Mulai terima pesanan masuk</h3>
              <p>Tokomu langsung tampil di halaman pencarian. Cukup pantau pesanan dari dashboard sederhana kami.</p>
            </div>
          </article>
        </div>
      </section>

      {/* Reassurance Strip */}
      <section className="tech-reassurance">
        <div className="tech-reassurance-icon">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h3>Siap bantu tetangga dan kembangkan usahamu?</h3>
          <p>Pendaftaran gratis dan tokomu bisa langsung online hari ini.</p>
        </div>
        <Button className="tech-button" onClick={() => navigate('daftar-tukang')}>
          Daftar jadi tukang sekarang <ArrowRight size={22} />
        </Button>
      </section>
    </main>
  );
}
