import { BASE_URL } from "@components/utils.js";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import ProgressCard from "@components/dashboard/ProgressCard";
import PICard from "@components/dashboard/PICard";
import DonutCard from "@components/dashboard/DonutCard";

// const dashboardStateFresh = { start: new Date("2000-01-01"), end: new Date(), qgp: false };

export default function Dashboard({ state, setState, reset }) {
	const [data, setData] = useState({
		"progress-area": [],
		"status-bar": [],
		"project-bar": [],
		"refgenome-bar": [],
		"fctype-donut": [],
		"service-donut": [],
		"sequencer-donut": [],
		"refgenome-donut": [],
	});

	const fetchData = async (key) => {
		try {
			console.log(state);
			const start = format(state.startDate, "yyyyMMdd");
			const end = format(state.endDate, "yyyyMMdd");
			const response = await fetch(`${BASE_URL}/${key}/${start}-${end}`);
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
		await Promise.all(Object.keys(data).map((key) => fetchData(key)));
	};

	useEffect(() => {
		if (state) {
			loadAllData();
		}
	}, [state]);

	return (
		<>
			<DashboardHeader state={state} setState={setState} reset={reset} />
			<section className="flex w-full flex-col items-center lg:items-start px-8 pb-8">
				<div className="grid w-full grid-cols-1 gap-4 md:grid-cols-10 md:grid-rows-2 mt-3 h-full">
					<div className="md:col-span-7 md:row-span-2">
						<ProgressCard data={data["progress-area"]} />
					</div>
					<div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
						<DonutCard
							info={{
								title: "Flowcell Type",
								tooltip:
									"Overview of the usage of different types of flowcells over the specified Demultiplex date range",
								label: " FCs",
							}}
							data={data["fctype-donut"]}
						/>
						<DonutCard
							info={{
								title: "Services",
								tooltip:
									"Overview of the different types of services requested among samples over the specified Demultiplex date range",
								label: " smpls",
							}}
							data={data["service-donut"]}
						/>
					</div>
					<div className="md:col-span-7 md:row-span-2">
						<PICard
							data={{
								status: data["status-bar"],
								project: data["project-bar"],
								refgenome: data["refgenome-bar"],
							}}
						/>
					</div>
					<div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
						<DonutCard
							info={{
								title: "Sequencer",
								tooltip:
									"Overview of the usage of sequencers over the specified Demultiplex date range",
								label: " FCs",
							}}
							data={data["sequencer-donut"]}
						/>
						<DonutCard
							info={{
								title: "Reference Genome",
								tooltip:
									"Overview of the different types of reference genomes among samples over the specified Demultiplex date range",
								label: " smpls",
							}}
							data={data["refgenome-donut"]}
						/>
					</div>
				</div>
			</section>
		</>
	);
}
