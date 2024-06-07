export function formatTime(field: HTMLElement) {
  const date = new Date(field.textContent);
  field.textContent = date.toLocaleDateString('en', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
