# Notes — Masaüstü Not Uygulaması

Electron + React + TypeScript ile geliştirilmiş, Notion tarzı modern bir masaüstü not uygulaması. Veriler yerel dosya sisteminde saklanır; tamamen çevrimdışı çalışır.

![Notes](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

---

## Özellikler

### Notlar
- **Kütüphane**: Tüm Notlar, Favoriler, Son Düzenlenenler, Çöp Kutusu
- **Arama**: Not başlığı ve içeriğinde anlık arama
- **Özel simge**: Her not için emoji simge (sağ tık → Simge değiştir)
- **Sağ tık menüsü**: Düzenle, Favorilere ekle, Çöp kutusuna taşı, Simge değiştir; çöp kutusunda Geri al / Kalıcı sil
- **Şablonlar**: Boş not, Yapılacak listesi, Toplantı notu, Proje planı, Günlük, Fikirler

### Editör (TipTap)
- **Biçimlendirme**: Kalın, italik, üstü çizili, inline kod
- **Bloklar**: Başlık (H1–H3), madde listesi, numaralı liste, yapılacak listesi, alıntı, kod bloğu, yatay çizgi
- **Slash komutları**: `/h1`, `/bullet`, `/todo`, `/quote`, `/code`, `/resim`, `/galeri` vb.
- **Resimler**: Tek resim veya galeri; sürükleyerek taşıma, boyut (Küçük / Orta / Büyük / Tam)
- **Emoji**: Araç çubuğundan veya metin içine emoji ekleme
- **Geri al / Yinele**: Ctrl+Z / Ctrl+Y
- **Seçim menüsü**: Metin seçip sağ tık → Kalın, İtalik, Üstü çizili, Kod
- **Not silindiğinde**: Kısa süre “Geri al” toast ile çöp kutusundan geri getirme

### Arayüz
- **Tema**: Açık / Koyu
- **Yazı boyutu**: Küçük, Orta, Büyük
- **Komut paleti**: Ctrl+K ile notlarda hızlı arama ve geçiş
- **Ayarlar**: Görünüm, Editör (otomatik kaydet), Depolama (dışa/içe aktar, konum bilgisi)
- **Yerel depolama**: Tüm veriler `userData` altında JSON dosyalarında; uygulama kapansa da kalır

---

## Gereksinimler

- **Node.js** 18 veya üzeri
- **npm** veya **yarn**

---

## Kurulum

```bash
git clone https://github.com/YOUR_USERNAME/notes-desktop.git
cd notes-desktop
npm install
```

---

## Çalıştırma

### Geliştirme

```bash
npm run dev
```

Electron main process derlenir, Vite dev server başlar ve uygulama penceresi açılır. Hot reload etkin.

### Production build (paketlenmiş uygulama)

```bash
npm run build
```

- `dist/` — Vite ile derlenmiş renderer
- `dist-electron/` — TypeScript ile derlenmiş main process
- `release/` — Electron Builder çıktısı (Windows: `.exe` vb., macOS: `.app`, Linux: AppImage vb.)

İşletim sistemine göre `release/` içindeki yükleyici veya taşınabilir uygulamayı kullanabilirsiniz.

### Uygulamayı imzalama (Windows)

Windows’ta “Bilinmeyen yayımcı” uyarısını kaldırmak ve SmartScreen’de güvenilir görünmek için kurulumu **kod imzası** (Authenticode) ile imzalayabilirsiniz.

**Ücretsiz seçenek (açık kaynak projeler):** [SignPath Foundation](https://signpath.org/) açık kaynak projelere **ücretsiz** kod imzalama sertifikası veriyor. Projenin GitHub’da public ve açık kaynak lisanslı (örn. MIT) olması yeterli. Başvuru: [signpath.org/apply](https://signpath.org/apply) → formu doldurup `oss-support@signpath.org` adresine gönderin. Onay sonrası imzayı CI/CD (örn. GitHub Actions) veya SignPath araçlarıyla kullanırsınız. Git Extensions, Flameshot, Stellarium gibi projeler bu yöntemi kullanıyor.

**Ücretli sertifika ile (kendi .pfx’iniz varsa):**

1. **Kod imzalama sertifikası edinin**  
   Windows için “Code Signing” (Authenticode) sertifikası gerekir. Örnek sağlayıcılar: DigiCert, Sectigo, SSL.com. (Ücretlidir; yıllık birkaç yüz dolar civarı.)

2. **Sertifikayı .pfx dosyası olarak hazırlayın**  
   Sertifikayı .pfx (veya .p12) ve bir parola ile dışa aktarın. Dosyayı güvenli bir yerde saklayın (örn. `build/` klasörüne koymayın, repo’ya eklemeyin).

3. **Ortam değişkenlerini ayarlayın**  
   Build öncesi şunları tanımlayın:
   - `CSC_LINK` — Sertifika dosyasının yolu (örn. `file://C:/path/to/certificate.pfx`) veya base64 ile kodlanmış içerik.
   - `CSC_KEY_PASSWORD` — .pfx dosyasının parolası.

   Örnek (PowerShell, tek seferlik build):
   ```powershell
   $env:CSC_LINK = "file://C:\path\to\your\certificate.pfx"
   $env:CSC_KEY_PASSWORD = "sertifika_parolaniz"
   npm run build
   ```

4. **Build alın**  
   `npm run build` çalıştırdığınızda electron-builder, bu değişkenler tanımlıysa `.exe` ve kurulumu otomatik imzalar.

Sertifika **tanımlı değilse** build yine tamamlanır; yalnızca imza atılmaz ve Windows “Bilinmeyen yayımcı” diyebilir.

---

## Proje Yapısı

```
not-uygulamasi/
├── src/
│   ├── main/           # Electron ana süreç
│   │   ├── main.ts     # Pencere, menü, lifecycle
│   │   ├── preload.ts  # contextBridge API
│   │   ├── storage.ts  # Notlar ve ayarlar (JSON dosya)
│   │   └── ipc/        # IPC handler'ları
│   ├── renderer/       # React uygulaması
│   │   ├── app/        # App.tsx, main.tsx, global CSS
│   │   ├── components/ # Layout, TrashUndoToast
│   │   ├── features/   # notes, editor, sidebar, settings, search
│   │   ├── store/      # Zustand (notes, settings, command palette, trash undo)
│   │   └── utils/      # noteActions, templates
│   └── shared/         # Ortak TypeScript tipleri (Note, AppSettings)
├── public/             # Statik dosyalar (favicon vb.)
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Klavye Kısayolları

| Kısayol        | İşlev                |
|----------------|----------------------|
| **Ctrl+K**     | Komut paletini aç    |
| **Ctrl+Z**     | Geri al              |
| **Ctrl+Y**     | Yinele               |
| **Ctrl+B**     | Kalın                |
| **Ctrl+I**     | İtalik               |

---

## Teknolojiler

- **Electron** — Masaüstü uygulama
- **React 18** + **TypeScript**
- **Vite** — Build ve dev server
- **Tailwind CSS** — Stil
- **Zustand** — İstemci state
- **TipTap** — Zengin metin editörü
- **Lucide React** — İkonlar

---

## Lisans

MIT License. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## Katkıda Bulunma

1. Repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'i push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın
#
