import { useState } from "react";
import { Card, Title, Icon, Tab, TabGroup, TabList } from "@tremor/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import StatusChart from "./StatusCard";
import ProjectChart from "./ProjectCard";
import RefgenomeChart from "./RefgenomeCard";

export default function PICard({ data }) {
	const [selectedTab, setSelectedTab] = useState(0);

	return (
		<Card decoration="top" decorationColor="teal" className="flex flex-col space-y-2 h-full">
			<div className="flex items-center space-x-0.5 font-cabin">
				<Title> 2. P.I. Overview </Title>
				<Icon
					icon={InformationCircleIcon}
					variant="simple"
					className=" text-teal-600 hover:text-teal-400 cursor-pointer"
					tooltip="Overview of the distribution of sample requests per PI over the specified date range in different parameters"
				/>
			</div>
			<div className="flex justify-between items-center select-none">
				<TabGroup className="flex justify-start" index={selectedTab} onIndexChange={setSelectedTab}>
					<TabList color={"green"} variant="line">
						<Tab
							key={0}
							className={`${
								selectedTab === 0 ? "bg-blue-gray-50 font-semibold text-black" : ""
							} px-4 py-2 rounded`}
						>
							Sample Status
						</Tab>
						<Tab
							key={1}
							className={`${
								selectedTab === 1 ? "bg-blue-gray-50 font-semibold text-black" : ""
							} px-4 py-2 rounded`}
						>
							Projects
						</Tab>
						<Tab
							key={2}
							className={`${
								selectedTab === 2 ? "bg-blue-gray-50 font-semibold text-black" : ""
							} px-4 py-2 rounded`}
						>
							Reference Genome
						</Tab>
					</TabList>
				</TabGroup>
			</div>
			<div className="mt-4">
				{selectedTab === 0 && <StatusChart data={data.status} />}
				{selectedTab === 1 && <ProjectChart data={data.project} />}
				{selectedTab === 2 && <RefgenomeChart data={data.refgenome} />}
			</div>
		</Card>
	);
}
