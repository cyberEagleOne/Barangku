$ErrorActionPreference = 'Stop'

$outDir = Join-Path $PSScriptRoot 'Hasil'
New-Item -ItemType Directory -Path $outDir -Force | Out-Null
$pptxPath = Join-Path $outDir 'Presentasi_Barangku_Revisi_Validasi.pptx'

function Color([int]$r, [int]$g, [int]$b) { return $r + 256 * $g + 65536 * $b }
$cream = Color 250 250 247
$white = Color 255 255 255
$green = Color 31 111 92
$dark = Color 28 35 33
$muted = Color 91 103 98
$amber = Color 242 163 58
$line = Color 226 230 227
$pale = Color 227 241 236

$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = -1
$deck = $pp.Presentations.Add()
$deck.PageSetup.SlideWidth = 960
$deck.PageSetup.SlideHeight = 540

function Add-Box($slide, $x, $y, $w, $h, $fill, $stroke = $fill, $radius = $false) {
  $shapeType = if ($radius) { 5 } else { 1 }
  $s = $slide.Shapes.AddShape($shapeType, $x, $y, $w, $h)
  $s.Fill.ForeColor.RGB = $fill
  $s.Line.ForeColor.RGB = $stroke
  $s.Line.Weight = 0.6
  return $s
}
function Add-Text($slide, [string]$value, $x, $y, $w, $h, $size = 20, $color = $dark, $bold = $false, $align = 1) {
  $s = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
  $s.TextFrame.TextRange.Text = $value
  $s.TextFrame.MarginLeft = 0
  $s.TextFrame.MarginRight = 0
  $s.TextFrame.MarginTop = 0
  $s.TextFrame.MarginBottom = 0
  $s.TextFrame.WordWrap = -1
  $s.TextFrame.AutoSize = 0
  $s.TextFrame.TextRange.Font.Name = 'Aptos'
  $s.TextFrame.TextRange.Font.Size = $size
  $s.TextFrame.TextRange.Font.Color.RGB = $color
  $s.TextFrame.TextRange.Font.Bold = if ($bold) { -1 } else { 0 }
  $s.TextFrame.TextRange.ParagraphFormat.Alignment = $align
  return $s
}
function New-Slide([string]$title, [int]$num) {
  $s = $deck.Slides.Add($deck.Slides.Count + 1, 12)
  $s.Background.Fill.ForeColor.RGB = $cream
  if ($title) {
    Add-Text $s $title 54 36 840 46 30 $green $true | Out-Null
    Add-Box $s 54 88 852 2 $amber | Out-Null
  }
  Add-Text $s 'barangku' 54 510 120 18 11 $green $true | Out-Null
  Add-Text $s ('{0:00}' -f $num) 865 510 40 18 10 $muted $false 3 | Out-Null
  return $s
}
function Txt($slide, [string]$t, $x, $y, $w, $h, $size = 20, $color = $dark, $bold = $false) {
  Add-Text $slide $t $x $y $w $h $size $color $bold | Out-Null
}

# 1 — cover
$s = New-Slide '' 1
Add-Box $s 0 0 960 540 $green | Out-Null
$logo = Join-Path (Split-Path $PSScriptRoot) 'public\logo-barangku.png'
if (Test-Path $logo) { $null = $s.Shapes.AddPicture($logo, 0, -1, 58, 36, 108, 108) }
Txt $s 'Barangku' 58 185 750 70 54 $white $true
Txt $s 'Rusak? Benerin dulu, jangan buang.' 60 270 780 50 30 $white $true
Txt $s 'Platform servis laptop dan HP lokal di Tangerang Raya' 60 336 790 54 21 $white
Txt $s 'Presentasi prototipe dan rencana bisnis' 60 454 760 24 16 (Color 227 241 236)

# 2 — problem and solution
$s = New-Slide 'Masalah yang diselesaikan' 2
Txt $s 'Mencari servis yang cocok masih memakan waktu dan penuh ketidakpastian.' 54 112 825 50 22 $dark $true
$problems = @(
  @('01', 'Sulit menemukan tukang servis tepercaya di dekat rumah.'),
  @('02', 'Biaya baru jelas setelah perangkat diperiksa.'),
  @('03', 'Pelanggan sulit memantau perkembangan perbaikan.')
)
$yy = 185
foreach ($item in $problems) {
  Txt $s $item[0] 56 $yy 70 40 26 $amber $true
  Txt $s $item[1] 130 $yy 735 47 22 $dark
  $yy += 82
}
Add-Box $s 54 445 852 42 $pale | Out-Null
Txt $s 'Barangku: bandingkan tukang lokal, pesan servis, lalu pantau statusnya dalam satu alur.' 68 453 825 28 17 $green $true

# 3 — prototype
$s = New-Slide 'Prototipe Barangku' 3
Txt $s 'Aplikasi web responsif dari desain Figma' 54 112 740 36 23 $dark $true
Txt $s 'Alur pelanggan' 54 174 390 30 19 $green $true
Txt $s "Pilih lokasi dan perangkat`nBandingkan tukang di daftar dan peta`nBaca profil, harga awal, dan ulasan`nPesan servis`nLacak status perbaikan" 54 214 405 200 19 $dark
Txt $s 'Alur tukang' 505 174 390 30 19 $green $true
Txt $s "Daftar toko dan jenis servis`nAtur harga awal serta jam buka`nTerima atau tolak pesanan`nPerbarui status pengerjaan" 505 214 388 174 19 $dark
Add-Box $s 54 441 852 47 $pale | Out-Null
Txt $s 'Batas prototipe: pesanan contoh belum dikirim ke tukang sungguhan.' 68 450 825 30 16 $green $true

# 4 — validation
$s = New-Slide 'Validasi prototipe' 4
Txt $s '30' 58 121 220 92 68 $green $true
Txt $s 'responden simulasi' 60 213 260 32 20 $dark
Txt $s '22' 340 121 220 92 68 $green $true
Txt $s 'puas dengan alur' 342 213 260 32 20 $dark
Txt $s '8' 650 121 220 92 68 $amber $true
Txt $s 'masih ragu' 652 213 210 32 20 $dark
Add-Box $s 56 274 850 1 $line | Out-Null
Txt $s 'Fitur yang paling disukai' 58 293 385 28 19 $green $true
Txt $s "19  Pencarian tukang dekat lokasi`n16  Profil, ulasan, dan harga awal`n14  Pelacakan status perbaikan" 58 329 410 106 17 $dark
Txt $s 'Fitur yang paling dikritik' 500 293 385 28 19 $green $true
Txt $s "17  Belum ada pembayaran di aplikasi`n12  Persetujuan biaya belum jelas`n10  Arti label terverifikasi belum rinci" 500 329 390 106 17 $dark
Txt $s 'Data dummy untuk bahan presentasi, bukan hasil survei nyata. Responden boleh memilih lebih dari satu fitur.' 56 461 850 34 12 $muted

# 5 — competition
$s = New-Slide 'Analisis persaingan' 5
$cols = @(54, 260, 565)
$widths = @(206, 305, 341)
Add-Box $s 54 114 852 47 $green | Out-Null
Txt $s 'Alternatif' 66 126 180 27 17 $white $true
Txt $s 'Kekuatan' 272 126 276 27 17 $white $true
Txt $s 'Celah bagi Barangku' 577 126 315 27 17 $white $true
$rows = @(
  @('Bengkel lokal', 'Kontak langsung dan reputasi sekitar', 'Sulit membandingkan beberapa bengkel sekaligus'),
  @('Instagram / WhatsApp', 'Mudah ditemukan dan dihubungi', 'Harga, lokasi, dan progres tidak seragam'),
  @('Pusat servis resmi', 'Prosedur dan standar merek', 'Terbatas pada merek atau perangkat tertentu'),
  @('Barangku', 'Pilihan lokal, lokasi, kisaran harga, dan pelacakan', 'Perlu membangun kepercayaan dan pasokan tukang')
)
$yy = 161
foreach ($row in $rows) {
  Add-Box $s 54 $yy 852 72 $white $line | Out-Null
  Txt $s $row[0] 66 ($yy + 12) 180 49 17 $dark $true
  Txt $s $row[1] 272 ($yy + 10) 278 54 16 $dark
  Txt $s $row[2] 577 ($yy + 10) 310 54 16 $dark
  $yy += 72
}
Txt $s 'Perbandingan kualitatif model layanan, bukan pemeringkatan pasar yang diaudit.' 55 466 850 22 12 $muted

# 6 — market
$s = New-Slide 'Ukuran pasar: fokus awal' 6
Txt $s 'TAM' 55 122 140 42 27 $green $true
Txt $s 'Seluruh belanja servis laptop dan HP yang relevan.' 205 123 680 52 20 $dark
Txt $s 'SAM' 55 210 140 42 27 $green $true
Txt $s 'Permintaan servis di Tangerang Raya yang bisa dijangkau secara digital.' 205 211 680 58 20 $dark
Txt $s 'SOM' 55 314 140 42 27 $green $true
Txt $s 'Bagian transaksi yang realistis diperoleh Barangku dalam 3 tahun.' 205 315 680 58 20 $dark
Add-Box $s 54 407 852 73 $pale | Out-Null
Txt $s 'Angka di bahan tugas: TAM US$8-13 triliun/tahun, SAM US$192 juta/tahun, SOM Rp2,6 miliar/3 tahun. Belum terverifikasi; hitung ulang dengan data lokal dan asumsi yang jelas.' 68 416 824 58 15 $green

# 7 — GTM
$s = New-Slide 'Strategi masuk pasar' 7
Txt $s 'Fokus awal: Tangerang Raya, servis laptop dan HP' 54 116 850 45 24 $dark $true
Txt $s 'Pasokan tukang' 54 187 375 28 21 $green $true
Txt $s 'Rekrut bengkel lokal. Verifikasi identitas dan toko. Tampilkan harga awal, spesialisasi, serta jam operasional.' 54 225 390 140 19 $dark
Txt $s 'Permintaan pelanggan' 505 187 375 28 21 $green $true
Txt $s 'Gunakan pencarian lokal, konten sosial, ulasan pelanggan, rujukan, dan selebaran QR di lokasi mitra.' 505 225 390 140 19 $dark
Add-Box $s 54 405 852 75 $pale | Out-Null
Txt $s 'Ukur: tukang aktif, konversi pencarian ke pesanan, pesanan diterima, dan pelanggan kembali.' 68 423 825 52 18 $green $true

# 8 — revenue
$s = New-Slide 'Model pendapatan dan harga' 8
Txt $s 'Usulan utama' 54 122 410 30 20 $green $true
Txt $s 'Langganan bulanan untuk mitra yang memakai fitur promosi dan pengelolaan pesanan setelah manfaatnya terbukti.' 54 161 405 112 20 $dark
Txt $s 'Usulan sekunder' 505 122 410 30 20 $green $true
Txt $s 'Komisi dari pesanan yang selesai, setelah pembayaran dan pencatatan transaksi terintegrasi.' 505 161 390 112 20 $dark
Add-Box $s 54 314 852 1 $line | Out-Null
Txt $s 'Kondisi prototipe saat ini' 54 342 800 30 21 $green $true
Txt $s 'Pendaftaran tukang gratis. Pelanggan belum membayar saat memesan. Biaya final disepakati setelah pemeriksaan barang.' 54 381 835 73 19 $dark
Txt $s 'Tarif langganan dan persentase komisi belum ditetapkan; perlu uji kemauan bayar dan biaya akuisisi.' 54 464 850 29 13 $muted

# 9 — Lean Canvas
$s = New-Slide 'Lean Canvas Barangku' 9
$blocks = @(
  @('Masalah', 'Sulit mencari tukang tepercaya; biaya tidak pasti; progres kurang terlihat.'),
  @('Segmen pelanggan', 'Pemilik laptop/HP di Tangerang Raya dan bengkel servis lokal.'),
  @('Nilai unik', 'Bandingkan tukang terdekat dan pantau servis dalam satu tempat.'),
  @('Solusi', 'Pencarian lokasi, profil/ulasan, pemesanan, pelacakan.'),
  @('Kanal', 'SEO lokal, media sosial, rujukan, QR di mitra.'),
  @('Pendapatan', 'Usulan langganan mitra dan komisi per pesanan selesai.'),
  @('Biaya', 'Produk, server/peta, verifikasi, dukungan, pemasaran.'),
  @('Metrik kunci', 'Tukang aktif, konversi, pesanan selesai, pembelian ulang.'),
  @('Keunggulan', 'Hipotesis: jaringan tukang lokal dan riwayat transaksi.')
)
$xValues = @(54, 343, 632)
$yValues = @(112, 240, 368)
for ($i = 0; $i -lt $blocks.Count; $i++) {
  $col = $i % 3; $row = [math]::Floor($i / 3)
  $x = $xValues[$col]; $y = $yValues[$row]
  Add-Box $s $x $y 274 110 $white $line | Out-Null
  Txt $s $blocks[$i][0] ($x + 11) ($y + 10) 250 25 17 $green $true
  Txt $s $blocks[$i][1] ($x + 11) ($y + 39) 251 64 15 $dark
}

# 10 — next steps
$s = New-Slide 'Apa yang perlu dibuktikan berikutnya' 10
$steps = @(
  'Uji prototipe dengan responden nyata untuk mengganti data simulasi.',
  'Hitung pasar Tangerang dengan data lokal dan asumsi yang terbuka.',
  'Tetapkan aturan verifikasi tukang dan persetujuan biaya servis.',
  'Uji kemauan bayar mitra serta komisi yang layak.',
  'Jalankan pilot dengan bengkel nyata dan ukur pesanan selesai.'
)
$yy = 122
for ($i = 0; $i -lt $steps.Count; $i++) {
  Txt $s ('{0:00}' -f ($i + 1)) 55 $yy 60 34 22 $amber $true
  Txt $s $steps[$i] 116 $yy 770 52 20 $dark
  $yy += 69
}
Add-Box $s 54 473 852 2 $amber | Out-Null
Txt $s 'Sumber utama: gambar tugas dan kode proyek Barangku.' 54 487 850 18 11 $muted

$deck.SaveAs($pptxPath, 24)
$previewDir = Join-Path $PSScriptRoot '.preview'
New-Item -ItemType Directory -Path $previewDir -Force | Out-Null
foreach ($slide in $deck.Slides) {
  $previewPath = Join-Path $previewDir ('slide-{0:00}.png' -f $slide.SlideIndex)
  $slide.Export($previewPath, 'PNG', 1280, 720)
}
$deck.Close()
$pp.Quit()
Write-Output $pptxPath
