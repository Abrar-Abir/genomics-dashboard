import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
// import config, { sampleData } from "@lib/dashboardConfig.cjs";
import { formatJsDate } from "@components/utils";
import DashboardHeader from "../components/dashboard/DashboardHeader";

import AreaChartCard from "@components/dashboard/AreaChart";
import Card2 from "@components/dashboard/Card2";
import CustomDonutChart from "@components/dashboard/CustomDonutChart";

export default function Dashboard({ state, setState, reset }) {
	const { baseURL } = useOutletContext();
	const [data, setData] = useState({
		areachart: null,
		barchart2a: null,
		barchart2b: null,
		barchart2c: null,
		donutchart3: null,
		donutchart4: null,
		donutchart5: null,
		donutchart6: null,
	});

	const fetchData = async (key) => {
		try {
			const start = formatJsDate(state.start, "YYYYMMDD");
			const end = formatJsDate(state.end, "YYYYMMDD");
			const response = await fetch(`${baseURL}/${key}/${start}-${end}`);
			if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

			const data = await response.json();
			setData((prevState) => ({
				...prevState,
				[key]: data,
			}));
		} catch (error) {
			console.error(error);
		}
	};

	const loadAllData = async () => {
		await Promise.all(Object.keys(data).map(({ key }) => fetchData(key)));
	};

	useEffect(() => {
		loadAllData();
	}, [state]);

	// useEffect(() => {
	// 	// if (config.useSampleData) {
	// 	// 	setData({
	// 	// 		...sampleData,
	// 	// 	});
	// 	// } else {
	// 	async function fetchData() {
	// 		// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	// 		if (state.start && state.end) {
	// 			const start = formatJsDate(state.start, "YYYYMMDD");
	// 			const end = formatJsDate(state.end, "YYYYMMDD");

	// 			// await delay(5);
	// 			const response1 = await fetch(`${baseURL}/areachart/${start}-${end}`);
	// 			if (!response1.ok) {
	// 				console.error("Server error:", response1);
	// 			} else {
	// 				const data = await response1.json();
	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data1: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response2a = await fetch(`${baseURL}/barchart2a/${start}-${end}`);
	// 			if (!response2a.ok) {
	// 				console.error("Server error:", response2a);
	// 			} else {
	// 				const data = await response2a.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data2a: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response2b = await fetch(`${baseURL}/barchart2b/${start}-${end}`);
	// 			if (!response2b.ok) {
	// 				console.error("Server error:", response2b);
	// 			} else {
	// 				const data = await response2b.json();
	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data2b: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response2c = await fetch(`${baseURL}/barchart2c/${start}-${end}`);
	// 			if (!response2c.ok) {
	// 				console.error("Server error:", response2c);
	// 			} else {
	// 				const data = await response2c.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data2c: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response3 = await fetch(`${baseURL}/donutchart3/${start}-${end}`);
	// 			if (!response3.ok) {
	// 				console.error("Server error:", response3);
	// 			} else {
	// 				const data = await response3.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data3: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response4 = await fetch(`${baseURL}/donutchart4/${start}-${end}`);
	// 			if (!response4.ok) {
	// 				console.error("Server error:", response4);
	// 			} else {
	// 				const data = await response4.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data4: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response5 = await fetch(`${baseURL}/donutchart5/${start}-${end}`);
	// 			if (!response5.ok) {
	// 				console.error("Server error:", response5);
	// 			} else {
	// 				const data = await response5.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data5: data,
	// 				}));
	// 			}

	// 			// await delay(5);
	// 			const response6 = await fetch(`${baseURL}/donutchart6/${start}-${end}`);
	// 			if (!response6.ok) {
	// 				console.error("Server error:", response6);
	// 			} else {
	// 				const data = await response6.json();

	// 				setData((prevState) => ({
	// 					...prevState,
	// 					data6: data,
	// 				}));
	// 			}
	// 		}
	// 	}

	// 	fetchData();
	// 	// }
	// }, [dateRange]);

	return (
		<>
			<DashboardHeader dateRange={dateRange} handleDateRangeChange={setDateRange} reset={reset} />
			<section className="flex w-full flex-col items-center lg:items-start px-8 pb-8">
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-10 md:grid-rows-2 mt-3 h-full">
					<div className="md:col-span-7 md:row-span-2">
						<AreaChartCard
							title="1. Quantity processed over time"
							tooltip="Overview of the no. of samples/flowcells processed along with the cumulative no. of units in a daily/weekly/monthly/yearly view, over the specified date range. This is the Demultiplex Date"
							data={data.data1}
							index="date"
							colors={["blue", "amber", "red"]}
							showLegend={true}
							xAxisLabel="Demultiplex Date"
							yAxisWidth={56}
							kpis={["Samples", "Flowcells", "SamplesTotal", "FlowcellsTotal"]}
						/>
					</div>
					<div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
						<CustomDonutChart
							title="3. Flowcell - Type distribution"
							tooltip="Overview of the usage of different types of flowcells over the specified date range"
							data={data.data3}
							index="type"
							category="quantity"
							variant="donut"
							label=" FCs"
						/>
						<CustomDonutChart
							title="4. Services distribution"
							tooltip="Overview of the different types of services requested among samples over the specified date range"
							data={data.data4}
							index="type"
							category="quantity"
							label=" smpls"
						/>
					</div>
					<div className="md:col-span-7 md:row-span-2">
						<Card2
							title="2. P.I. Overview"
							tooltip="Overview of the distribution of sample requests per PI over the specified date range in different parameters"
							data2a={data.data2a == [] ? null : data.data2a}
							data2b={data.data2b}
							data2c={data.data2c}
						/>
					</div>
					<div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
						<CustomDonutChart
							title="5. Sequencer distribution"
							tooltip="Overview of the usage of sequencers over the specified date range"
							data={data.data5}
							index="type"
							category="quantity"
							label=" FCs"
						/>
						<CustomDonutChart
							title="6. Reference Genome distribution"
							tooltip="Overview of the different types of reference genomes among samples over the specified date range"
							data={data.data6}
							index="type"
							category="quantity"
							label=" smpls"
						/>
					</div>
				</div>
			</section>
		</>
	);
}
