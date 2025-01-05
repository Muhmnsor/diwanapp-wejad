import { ChartData } from "@/types/dashboard";

export const calculateChartData = (allEvents: any[]): {
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
  eventsByMonth: ChartData[];
} => {
  const eventsByType: ChartData[] = Object.entries(
    allEvents.reduce((acc: Record<string, number>, event) => {
      const type = event.event_type === 'online' ? 'عن بعد' : 'حضوري';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Number(value) }));

  const eventsByBeneficiary: ChartData[] = [
    { 
      name: 'البيئة', 
      value: allEvents.filter(event => event.event_path === 'environment').length 
    },
    { 
      name: 'المجتمع', 
      value: allEvents.filter(event => event.event_path === 'community').length 
    },
    { 
      name: 'المحتوى', 
      value: allEvents.filter(event => event.event_path === 'content').length 
    }
  ];

  const eventsByBeneficiaryType: ChartData[] = Object.entries(
    allEvents.reduce((acc: Record<string, number>, event) => {
      const type = event.beneficiary_type === 'men' ? 'رجال' : 
                   event.beneficiary_type === 'women' ? 'نساء' : 'رجال ونساء';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Number(value) }));

  const eventsByPrice: ChartData[] = Object.entries(
    allEvents.reduce((acc: Record<string, number>, event) => {
      const type = event.price === 0 || event.price === null ? 'مجاني' : 'مدفوع';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Number(value) }));

  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const eventsByMonth: ChartData[] = arabicMonths.map((month, index) => ({
    name: month,
    value: allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === index;
    }).length
  }));

  return {
    eventsByType,
    eventsByBeneficiary,
    eventsByBeneficiaryType,
    eventsByPrice,
    eventsByMonth
  };
};