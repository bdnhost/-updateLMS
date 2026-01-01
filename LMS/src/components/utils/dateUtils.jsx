// Format date with Israel timezone
export function formatIsraelDate(date, formatStr = 'dd/MM/yyyy HH:mm') {
  if (!date) return '';
  
  const israelDate = new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  
  // Simple formatter
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(israelDate.getDate());
  const month = pad(israelDate.getMonth() + 1);
  const year = israelDate.getFullYear();
  const hours = pad(israelDate.getHours());
  const minutes = pad(israelDate.getMinutes());
  
  if (formatStr === 'dd/MM/yyyy HH:mm') {
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
  if (formatStr === 'dd/MM/yyyy') {
    return `${day}/${month}/${year}`;
  }
  if (formatStr === 'HH:mm') {
    return `${hours}:${minutes}`;
  }
  
  // Default fallback
  return israelDate.toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
}

// Get current Israel time
export function getIsraelTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
}