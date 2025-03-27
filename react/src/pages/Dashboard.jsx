import { BASE_URL } from "@components/utils.js";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import Header from "@components/dashboard/Header";
import ProgressCard from "@components/dashboard/ProgressCard";
import PICard from "@components/dashboard/PICard";
import DonutCard from "@components/dashboard/DonutCard";
import { DATE_FORMAT } from "@components/utils.js";
import axios from "axios";

export default function Dashboard({ state, setState, reset }) {
	const token = localStorage.getItem("token");
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
			const start = format(state.startDate, DATE_FORMAT);
			const end = format(state.endDate, DATE_FORMAT);
			const response = await axios.get(`${BASE_URL}/${key}/${start}-${end}/${!state.qgp}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// console.log(response.data);
			// if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
			if (response.status !== 200) throw new Error(`Server error: ${response.statusText}`);

			setData((prevState) => ({
				...prevState,
				[key]: response.data,
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
			<Header state={state} setState={setState} reset={reset} />
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
