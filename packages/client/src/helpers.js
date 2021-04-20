// Return the date's suffix
export const getDateSuffix = (date) => {
  if (!date) {
    console.error('no date');
  }
  const dateStr = String(date);
  const dateLastNum = Number(dateStr[1] || dateStr[0]);

  switch (dateLastNum) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}