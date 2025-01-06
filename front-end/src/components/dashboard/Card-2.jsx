import { useState } from "react";
import { Card, Title, Icon, Tab, TabGroup, TabList } from "@tremor/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import DataSampleStatusChart from "./DataSampleStatusChart";
import CustomBarChart2 from "./CustomBarChart2";
import CustomBarChart3 from "./CustomBarChart3";
import predefinedColors from "@lib/colors";

export default function Card2(props) {
	// State to keep track of the selected KPI
	const [selectedTab, setSelectedTab] = useState(0);

	// Arguments to be passed to CustomBarChart1
	const props1 = {
		data: props.data2a,
		index: "pi",
		colors: predefinedColors,
		showLegend: true,
		yAxisWidth: 56,
		xAxisLabel: "PI",
		categories: props.data2a
			? Object.keys(props.data2a[0]).filter((key) => key !== "pi")
			: [],
	};

	// Arguments to be passed to CustomBarChart2
	const props2 = {
		data: props.data2b,
		index: "pi",
		showLegend: false,
		yAxisWidth: 56,
	};

	// Arguments to be passed to CustomBarChart3
	const props3 = {
		cardSize: "w-auto h-[12vh]",
		rowSize: 4,
		data: props.data2c,
	};

	// console.log(props.data2a, props.data2b, props.data2c);
	return (
		<Card
			decoration="top"
			decorationColor="teal"
			className="flex flex-col space-y-2 h-full"
		>
			<div className="flex items-center space-x-0.5 font-cabin">
				<Title> {props.title} </Title>
				<Icon
					icon={InformationCircleIcon}
					variant="simple"
					className=" text-teal-600 hover:text-teal-400 cursor-pointer"
					tooltip={props.tooltip}
				/>
			</div>
			<div className="flex justify-between items-center select-none">
				<TabGroup
					className="flex justify-start"
					index={selectedTab}
					onIndexChange={setSelectedTab}
				>
					<TabList color={"green"} variant="line">
						<Tab key={0}>Data Sample Status</Tab>
						<Tab key={1}>Projects</Tab>
						<Tab key={2}>Reference Genome</Tab>
					</TabList>
				</TabGroup>
			</div>
			<div className="mt-4">
				{selectedTab === 0 && <DataSampleStatusChart {...props1} />}
				{selectedTab === 1 && props.data2b && (
					<CustomBarChart2 {...props2} />
				)}
				{selectedTab === 2 && props.data2c && (
					<CustomBarChart3 {...props3} />
				)}
			</div>
		</Card>
	);
}
