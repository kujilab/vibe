export function formatTimeJST(timeString: string): string {
  const date = new Date(timeString);
  
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo'
  });
}

export function formatDateJST(dateString: string): string {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timeZone: 'Asia/Tokyo'
  });
}