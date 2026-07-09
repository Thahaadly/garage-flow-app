/**
 * Format a number or numeric string to IDR Rupiah format.
 */
export const formatRupiah = (price?: number | string | null): string => {
  if (!price) return 'Rp 0';
  return `Rp ${Number(price).toLocaleString('id-ID')}`;
};

/**
 * Format a date string into an Indonesian readable date format.
 * (e.g. 01 Jan 2024, 10:00)
 */
export const formatIndonesianDate = (dateString?: string | null): string => {
  if (!dateString) {
    return '-';
  }

  const parsed = new Date(dateString.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) {
    return dateString.replace('T', ' ');
  }

  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
