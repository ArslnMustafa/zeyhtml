export function formatVisitNotification(page: string) {
  return [
    "Date davet sayfası ziyaret edildi.",
    `Açılan bölüm: ${page}`,
    "Bu bildirim tarayıcı oturumu başına yalnızca bir kez gönderilir.",
  ].join("\n");
}
