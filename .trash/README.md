# CyberPanel için kolay HTML/PHP paketi

Bu paket **Node.js, SSH, terminal, PM2 veya veritabanı kullanmadan** CyberPanel Dosya Yöneticisi üzerinden çalışır. Arayüz HTML, CSS ve JavaScript ile; bildirimler ise yalnızca `notify.php` ile çalışır.

## Hızlı kurulum

`KURULUM_BASLAT.txt` dosyasındaki yedi adımı izle. Kısaca: paketi `public_html` içine çıkar, `config.php` dosyasına Resend API anahtarını yapıştır ve PHP cURL eklentisinin açık olduğunu doğrula.

> `config.php` gerçek API anahtarını içerir. Dosyayı indirme, paylaşma veya `.htaccess` korumasını silme.

| Dosya | Görev |
|---|---|
| `index.html` | Randevu akışının ana sayfası |
| `styles.css` | Bej ve toprak tonlu tasarım |
| `app.js` | Kaçan Hayır butonu, seçimler, sayfa geçişleri |
| `notify.php` | Resend API üzerinden güvenli doğrulamalı bildirim gönderimi |
| `config.php` | Dosya Yöneticisinden düzenlenecek Resend ayarları |
| `KURULUM_BASLAT.txt` | Terminal gerektirmeyen kurulum adımları |
| `assets/` | Menü kartlarının görselleri |

Bu statik sürümde seçimler e-posta ile gönderilir. Kalıcı randevu geçmişi, yönetim paneli veya veritabanı gerektiğinde Node.js sürümüne daha sonra geçebiliriz.
