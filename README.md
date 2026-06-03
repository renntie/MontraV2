# 💰 Montra — Personal Finance PWA

> Aplikasi manajemen keuangan pribadi yang modern, responsif, dan siap digunakan sebagai PWA.

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand (dengan DevTools) |
| Backend/DB | Supabase (Auth, Postgres, Realtime) |
| Charts | Recharts |
| PWA | vite-plugin-pwa + Workbox |
| Icons | Lucide React |
| Date | date-fns |

## 🚀 Setup & Instalasi

### 1. Clone & Install
```bash
git clone <repo-url>
cd montra
npm install
```

### 2. Setup Supabase
1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** → paste isi file `supabase-schema.sql` → Run
3. Aktifkan **Google OAuth** di Authentication → Providers (opsional)

### 3. Konfigurasi Environment
```bash
cp .env.example .env
```
Isi `.env` dengan kredensial Supabase Anda:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Jalankan Development Server
```bash
npm run dev
```

### 5. Build Production
```bash
npm run build
npm run preview  # Test PWA locally
```

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── atoms/          # Komponen dasar (Button, Input, Badge, dll)
│   ├── molecules/      # Kombinasi atoms (TransactionItem, MonthPicker, dll)
│   ├── organisms/      # Komponen kompleks (TransactionForm, Charts, Sidebar, dll)
│   └── pages/          # Halaman utama (Dashboard, Transactions, Analytics, Planning)
├── services/           # Layer API Supabase (authService, transactionService, dll)
├── store/              # Zustand stores (authStore, transactionStore, uiStore, dll)
├── utils/              # Helper functions (formatters, csvExport, categoryIcons)
└── lib/                # Konfigurasi library (supabase.js)
```

## ✨ Fitur

- ✅ **Auth** — Email/Password + Google OAuth
- ✅ **Transaksi** — CRUD Pemasukan & Pengeluaran
- ✅ **Kategori** — Custom kategori dengan ikon & warna
- ✅ **Dashboard** — Ringkasan saldo, chart donut kategori
- ✅ **Analitik** — Bar chart 6 bulan, tingkat tabungan, breakdown pengeluaran
- ✅ **Anggaran** — Budget bulanan per kategori dengan progress bar
- ✅ **Target Tabungan** — Savings goal dengan tracking progress
- ✅ **Hutang/Piutang** — Manajemen debt & receivable
- ✅ **Export CSV** — Export transaksi ke file CSV
- ✅ **Filter & Search** — Filter by tipe, kategori, dan pencarian
- ✅ **PWA** — Install to Home Screen, Offline Ready
- ✅ **Realtime** — Sinkronisasi data via Supabase Realtime
- ✅ **Dark Theme** — UI gelap modern dengan Tailwind CSS
- ✅ **Responsif** — Bottom Nav (mobile) ↔ Sidebar (desktop)

## 🎨 Design System

**Warna:**
- Background: `#121212`
- Surface: `#1E1E1E` – `#2C2C2C`
- Pemasukan: `#34D399` (hijau pastel)
- Pengeluaran: `#FB7185` (merah muda pastel)

**Font:** Plus Jakarta Sans

## 🔧 Debugging

Semua Zustand stores terhubung ke Redux DevTools. Install ekstensi [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools) di browser untuk inspeksi state secara real-time.

Store names:
- `AuthStore` — state autentikasi user
- `TransactionStore` — data transaksi & filter
- `CategoryStore` — daftar kategori
- `UIStore` — state UI (modal, toast, route aktif)
