import { useState } from "react";
import { Card, Title, Icon, Tab, TabGroup, TabList } from "@tremor/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import BarChart2a from "./BarChart2a";
import BarChart2b from "./BarChart2b";
import BarChart2c from "./BarChart2c";
import predefinedColors from "@lib/colors";

export default function Card2({ title, tooltip, data2a, data2b, data2c }) {
	const [selectedTab, setSelectedTab] = useState(0);

	const props1 = {
		data: data2a,
		index: "pi",
		colors: predefinedColors,
		showLegend: true,
		yAxisWidth: 56,
		xAxisLabel: "PI",
		categories: data2a ? Object.keys(data2a[0]).filter((key) => key !== "pi") : [],
	};

	const props2 = {
		data: data2b,
		index: "pi",
		showLegend: false,
		yAxisWidth: 56,
	};

	const props3 = {
		cardSize: "w-auto h-[12vh]",
		rowSize: 4,
		data: data2c,
	};

	return (
		<Card decoration="top" decorationColor="teal" className="flex flex-col space-y-2 h-full">
			<div className="flex items-center space-x-0.5 font-cabin">
				<Title> {title} </Title>
				<Icon
					icon={InformationCircleIcon}
					variant="simple"
					className=" text-teal-600 hover:text-teal-400 cursor-pointer"
					tooltip={tooltip}
				/>
			</div>
			<div className="flex justify-between items-center select-none">
				<TabGroup className="flex justify-start" index={selectedTab} onIndexChange={setSelectedTab}>
					<TabList color={"green"} variant="line">
						<Tab
							key={0}
							className={`${
								selectedTab === 0 ? "bg-blue-gray-50 font-semibold" : ""
							} px-4 py-2 rounded`}
						>
							Data Sample Status
						</Tab>
						<Tab
							key={1}
							className={`${
								selectedTab === 1 ? "bg-blue-gray-50 font-semibold" : ""
							} px-4 py-2 rounded`}
						>
							Projects
						</Tab>
						<Tab
							key={2}
							className={`${
								selectedTab === 2 ? "bg-blue-gray-50 font-semibold" : ""
							} px-4 py-2 rounded`}
						>
							Reference Genome
						</Tab>
					</TabList>
				</TabGroup>
			</div>
			<div className="mt-4">
				{selectedTab === 0 && <BarChart2a {...props1} />}
				{selectedTab === 1 && data2b && <BarChart2b {...props2} />}
				{selectedTab === 2 && data2c && <BarChart2c {...props3} />}
			</div>
		</Card>
	);
}
