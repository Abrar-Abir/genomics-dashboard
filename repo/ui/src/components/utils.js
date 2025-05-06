import {format, startOfWeek, startOfMonth, startOfYear, parse } from "date-fns";

export const BASE_URL = "http://localhost:5001";
// const BASE_URL = "https://genomics-dashboard-flask.onrender.com";
// const BASE_URL = "http://172.32.79.51:5001";
export const DATE_FORMAT = "yyyyMMdd";
export const COLORS = [
	"teal", // #14b8a6
	"blue", // #a855f7
	"orange", // #6366f1
	"green", // #22c55e
	"indigo", // #ef4444
	"cyan", // #06b6d4
	"red", // #f97316
	"amber", // #f59e0b
	"purple", // #3b82f6
	"lime", // #84cc16
	"yellow", // #eab308
  ];

export const FORMATS = ["raw", "csv", "tsv", "json"]

export function getID(array, element) {
	for (let i = 0; i < array.length; i++) {
		if (array[i] === element) {
			return i;
		}
	}
	return -1;
}

export function scroll ( direction, start, size, dataLength, setStart ){
	const shift = start + direction * size;
	if (direction === 1) {
		setStart(Math.min(Math.max(dataLength - size, 0), shift));
	} else if (direction === -1) {
		setStart(Math.max(shift, 0));
	}
};


export function preprocessData(data, period) {
	if (data === null){return []};
  let aggregatedData = {};
  data.forEach((item) => {
    let date = parse(item.date, "dd-MM-yyyy", new Date());
    let key;

    switch (period) {
      case 1: 
        key = format(date, "dd-MM-yyyy");
        break;
      case 2:
        key = format(startOfWeek(date), "dd-MM-yyyy");
        break;
      case 3: 
        key = format(startOfMonth(date), "MM-yyyy");
        break;
      case 4: 
        key = format(startOfYear(date), "yyyy");
        break;
      default: 
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

    aggregatedData[key].SamplesTotal = item.SamplesTotal;
    aggregatedData[key].FlowcellsTotal = item.FlowcellsTotal;
  });

  return Object.values(aggregatedData);
}
