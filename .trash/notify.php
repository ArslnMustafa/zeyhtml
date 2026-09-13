<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $data): never {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

$config = [
  'RESEND_API_KEY' => getenv('RESEND_API_KEY') ?: '',
  'DATE_NOTIFY_EMAIL' => getenv('DATE_NOTIFY_EMAIL') ?: '',
  'RESEND_FROM_EMAIL' => getenv('RESEND_FROM_EMAIL') ?: '',
];

$configPath = __DIR__ . '/config.php';
if (file_exists($configPath)) {
  $fileConfig = require $configPath;
  if (is_array($fileConfig)) {
    $config = array_merge($config, $fileConfig);
  }
}

if (
  !$config['RESEND_API_KEY'] ||
  str_contains($config['RESEND_API_KEY'], 'BURAYA_RESEND') ||
  !$config['DATE_NOTIFY_EMAIL'] ||
  !$config['RESEND_FROM_EMAIL']
) {
  respond(500, ['ok' => false, 'error' => 'E-posta ayarı tamamlanmadı. public_html içindeki config.php dosyasına Resend API anahtarınızı ekleyin.']);
}

if (!function_exists('curl_init')) {
  respond(500, ['ok' => false, 'error' => 'PHP cURL eklentisi etkin değil. CyberPanel PHP Extensions bölümünden curl eklentisini açın.']);
}

$payload = json_decode((string) file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !is_array($payload)) {
  respond(400, ['ok' => false, 'error' => 'Geçersiz istek']);
}

$type = $payload['type'] ?? '';
if ($type === 'visit') {
  $allowedPages = ['Ana sayfa', 'Tarih ve saat seçimi', 'Yemek ve içecek seçimi', 'Randevu onayı'];
  $page = trim((string) ($payload['page'] ?? ''));
  if (!in_array($page, $allowedPages, true)) {
    respond(422, ['ok' => false, 'error' => 'Geçersiz sayfa bildirimi']);
  }
  $subject = 'Date sayfası ziyaret edildi';
  $text = "Date davet sayfası ziyaret edildi.\nAçılan bölüm: {$page}";
} elseif ($type === 'date') {
  $date = trim((string) ($payload['date'] ?? ''));
  $time = trim((string) ($payload['time'] ?? ''));
  $allowedTimes = ['13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  $allowedFoods = ['Matcha', 'Çikolatalı pasta ama çok çikolatalı', 'Pizza', 'Sushi', 'Burger', 'Sana bırakıyorum'];
  $selectedDate = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
  $dateValid = $selectedDate && $selectedDate->format('Y-m-d') === $date && $selectedDate <= new DateTimeImmutable('2026-08-30');
  $foods = array_values(array_unique(array_filter((array) ($payload['foods'] ?? []), fn ($food) => is_string($food) && in_array($food, $allowedFoods, true))));
  if (!$dateValid || !in_array($time, $allowedTimes, true) || count($foods) === 0) {
    respond(422, ['ok' => false, 'error' => 'Randevu bilgileri geçersiz']);
  }
  $subject = 'Yeni bir date planı var!';
  $text = "Romantik date isteği onaylandı.\nTarih: {$date}\nSaat: {$time}\nYemek ve içecek: " . implode(', ', $foods);
} else {
  respond(400, ['ok' => false, 'error' => 'Geçersiz bildirim türü']);
}

$request = curl_init('https://api.resend.com/emails');
curl_setopt_array($request, [
  CURLOPT_POST => true,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    'Authorization: Bearer ' . $config['RESEND_API_KEY'],
    'Content-Type: application/json',
  ],
  CURLOPT_POSTFIELDS => json_encode([
    'from' => $config['RESEND_FROM_EMAIL'],
    'to' => [$config['DATE_NOTIFY_EMAIL']],
    'subject' => $subject,
    'text' => $text,
  ], JSON_UNESCAPED_UNICODE),
]);

$response = curl_exec($request);
$curlError = curl_error($request);
$status = (int) curl_getinfo($request, CURLINFO_RESPONSE_CODE);
curl_close($request);

if ($response === false) {
  respond(502, ['ok' => false, 'error' => 'Resend bağlantısı kurulamadı: ' . ($curlError ?: 'bilinmeyen bağlantı hatası')]);
}

if ($status < 200 || $status >= 300) {
  respond(502, ['ok' => false, 'error' => 'Resend bildirimi kabul etmedi. API anahtarını ve gönderen adresini kontrol edin.']);
}

respond(200, ['ok' => true]);
