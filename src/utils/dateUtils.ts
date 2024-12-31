export const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const getEventDateTime = (date: string, time: string) => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`);
};