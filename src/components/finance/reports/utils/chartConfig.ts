
import { formatCurrency } from "./formatters";

export const getChartConfig = (maxValue: number) => ({
  margin: {
    top: 20,
    right: 30,
    left: 20,
    bottom: 5,
  },
  yAxisConfig: {
    domain: [0, maxValue + (maxValue * 0.1)],
    tickFormatter: (value: number) => formatCurrency(value),
    width: 100
  },
  barConfig: {
    barSize: 30
  },
  lineConfig: {
    type: "monotone" as const,
    strokeWidth: 3,
    dot: { r: 6 },
    activeDot: { r: 8 }
  }
});

export const getTooltipFormatter = (value: number, name: string) => {
  let label;
  switch(name) {
    case "target":
      label = "المستهدف";
      break;
    case "actual":
      label = "المتحقق";
      break;
    case "variance":
      label = "الانحراف";
      break;
    default:
      label = name;
  }
  return [formatCurrency(Number(value)), label];
};

export const getLegendFormatter = (value: string) => {
  switch(value) {
    case "target":
      return "المستهدف";
    case "actual":
      return "المتحقق";
    case "variance":
      return "الانحراف";
    default:
      return value;
  }
};

