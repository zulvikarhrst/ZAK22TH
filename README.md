# A Little Piece of Us — Zahra (V8 Matching Edition)

Romantic scrapbook birthday website for Zahra, built with HTML, CSS, and vanilla JavaScript.

## Run locally

1. Extract this folder.
2. Open `birthday-surprise-zahra-v4` in VS Code.
3. Open `index.html` with Live Server.

## Preview modes

- `?dev=true` — preview the birthday lock screen.
- `?dev=home` — skip the countdown and lock to review the main website.
- No query parameter — follow the real birthday date gate (12 November 2026, WIB).

## Little Things About You — Matching Game

The Little Things page is now an easy memory matching game:
- 8 cards / 4 matching pairs.
- Each successful pair reveals a handwritten-style appreciation note.
- Shows pairs found, number of moves, and progress.
- Includes a Play again button and a completion message.
- Responsive layout and reduced-motion support.

## Add your own media

Keep these file paths and names, or update the references in `index.html`:

- See `MEDIA-GUIDE.txt` for the current V9 media filenames and supported extensions.

The ZIP includes empty placeholder folders. Add your own photos, video, and music after extracting it.

## Publish with GitHub Pages

Push the project files to the repository. In **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/(root)`, then save. Make sure `index.html` is at the repository root.

## Notes

- Browsers generally require a user interaction before audible autoplay. Music starts after the birthday code is submitted, with a play/pause control available.
- The birthday code and date gate are client-side presentation features, not secure authentication. Do not put private information in a public repository.


## V9 — Pengaturan foto, video, dan musik

Letakkan media pada folder `assets` dengan nama dasar berikut. Ekstensi foto dideteksi otomatis, sehingga `.jpeg`, `.jpg`, `.png`, dan `.webp` dapat digunakan tanpa mengubah HTML.

### Foto
- Foto halaman Birthday: `assets/images/birthday-photo.jpeg`
- Galeri: `assets/images/photo-1.jpeg` sampai `photo-10.jpeg`
- Foto sampul video (opsional): `assets/images/video-cover.jpeg`
- Ekstensi foto yang didukung: `.jpeg`, `.jpg`, `.png`, `.webp`

### Video
- Video utama: `assets/videos/memory-1.mp4` (disarankan)
- Alternatif: `assets/videos/memory-1.webm`
- Poster video opsional: `assets/images/video-cover.jpeg`
- Untuk kompatibilitas browser, gunakan MP4 dengan codec H.264 dan audio AAC.

### Musik
- Musik latar: `assets/music/song.mp3`
- Alternatif: `song.ogg` atau `song.wav`
- Musik mulai diputar setelah Zahra memasukkan kode dengan benar karena browser membatasi autoplay bersuara.

### Penting
- Nama dasar file harus sama persis, termasuk tanda hubung dan angka.
- Jangan menambahkan garis miring di awal path; seluruh path sudah relatif agar kompatibel dengan GitHub Pages pada repository project.
- Jika foto belum tersedia, placeholder scrapbook akan tetap muncul. Setelah file ditambahkan, muat ulang halaman dengan `Ctrl + F5`.
- File pribadi tidak ikut disertakan dalam ZIP template ini; masukkan foto, video, dan musik milikmu sendiri ke folder yang sesuai.
