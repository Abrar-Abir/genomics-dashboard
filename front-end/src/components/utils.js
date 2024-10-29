import {
  startOfMonth,
  startOfWeek,
  startOfYear,
  format,
  parse,
} from "date-fns";
import require$$0 from "dayjs";

export function preprocessData(data, period) {
  let aggregatedData = {};

  data.forEach((item) => {
    // Parse the date using the correct format
    let date = parse(item.date, "dd-MM-yyyy", new Date());
    let key;

    switch (period) {
      case 1: // Daily
        key = format(date, "dd-MM-yyyy");
        break;
      case 2: // Weekly
        key = format(startOfWeek(date, { weekStartsOn: 1 }), "dd-MM-yyyy"); // week starts on Monday
        break;
      case 3: // Monthly
        key = format(startOfMonth(date), "MM-yyyy");
        break;
      case 4: // Yearly
        key = format(startOfYear(date), "yyyy");
        break;
      default: // Default to daily
        key = format(date, "dd-MM-yyyy");
    }

    if (!aggregatedData[key]) {
      aggregatedData[key] = {
        date: key,
        Samples: 0,
        Flowcells: 0,
      };
    }

    aggregatedData[key].Samples += item.Samples;
    aggregatedData[key].Flowcells += item.Flowcells;

    // Since SamplesTotal and FlowcellsTotal are cumulative, we should take the latest available total value for the period
    aggregatedData[key].SamplesTotal = item.SamplesTotal;
    aggregatedData[key].FlowcellsTotal = item.FlowcellsTotal;
  });

  // Convert aggregatedData from an object to an array
  return Object.values(aggregatedData);
}

export function formatDate(date, format = "YYYY-MM-DD") {
  return date.format(format);
}

export function formatJsDate(date, format = "YYYYMMDD") {
  return require$$0(date).format(format);
}
