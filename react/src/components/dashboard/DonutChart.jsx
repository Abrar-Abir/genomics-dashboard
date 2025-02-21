import React, { useState } from "react";
import {
	Card,
	Title,
	DonutChart,
	//   Tab,
	//   TabList,
	//   TabGroup,
	Icon,
	Legend,
} from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
// assets
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BiSolidPieChartAlt2 } from "react-icons/bi";
import { RiDonutChartFill } from "react-icons/ri";
import predefinedColors from "@lib/colors";
// import { act } from "react";

const CustomDonutChart = (props) => {
	const [legendValue, setLegendValue] = useState("");
	const [activeLabel, setActiveLabel] = useState("");
	const [chartVariant, setChartVariant] = useState("donut");

	const totalUnits = props.data?.reduce((total, item) => total + item.quantity, 0);
	const valueFormatter = (number) => {
		const percentage = ((number / totalUnits) * 100).toFixed(2);
		return `${percentage}% | ${Intl.NumberFormat("us").format(number).toString()}`;
	};

	const donutChartArgs = {
		showLabel: true, // To show the label at the centre of the donut chart
		showAnimation: true,
		animationDuration: 500,
		data: props.data,
		category: props.category,
		index: props.index,
		variant: chartVariant,
		className: props.className + " text-sm",
		colors: predefinedColors,
		valueFormatter: valueFormatter,
		// The label is the total units formatted as a US number + the label received as prop
		label: legendValue
			? activeLabel
			: Intl.NumberFormat("us").format(totalUnits).toString() + props.label,
	};

	const legendArgs = {
		// className: "flex flex-col max-w-fit",
		categories: props.data?.map((item) => item.type), // Categories are the type of each data item
		colors: predefinedColors, // Colors received as props
		// enableLegendSlider: true,
	};

	return (
		<Card decoration="top" decorationColor="teal" className="flex flex-col space-y-2 h-full">
			<div className="flex justify-between font-cabin">
				<div className="flex items-center space-x-0.5">
					<Title> {props.title} </Title>{" "}
					<Icon
						icon={InformationCircleIcon}
						variant="simple"
						className=" text-teal-600 hover:text-teal-400 cursor-pointer"
						tooltip={props.tooltip}
					/>
				</div>
				<IconButton color="deep-orange" variant="text" size="sm">
					{chartVariant === "donut" ? (
						<BiSolidPieChartAlt2
							className="h-8 p-1 w-auto border-2 rounded-lg border-deep-orange-50"
							onClick={() => setChartVariant("pie")}
						/>
					) : (
						<RiDonutChartFill
							className="h-8 p-1 w-auto border-2 rounded-lg border-deep-orange-50"
							onClick={() => setChartVariant("donut")}
						/>
					)}
				</IconButton>
			</div>
			<div className="flex space-x-4">
				<DonutChart
					{...donutChartArgs}
					onValueChange={(e) => {
						if (e && e.type) {
							setLegendValue(e.type);
							setActiveLabel(
								Intl.NumberFormat("us").format(e.quantity).toString() +
									" / " +
									Intl.NumberFormat("us").format(totalUnits).toString()
							);
						} else {
							setLegendValue("");
						}
					}}
				/>
				{props.data && (
					<div className="flex max-h-40">
						<Legend
							enableLegendSlider
							className="custom-legend"
							{...legendArgs}
							// onClickLegendItem={(e) => {
							//   legendValue === e ? setLegendValue("") : setLegendValue(e);
							//   console.log(e);
							// }}
							activeLegend={legendValue}
						/>
					</div>
				)}
			</div>
		</Card>
	);
};

export default CustomDonutChart;
