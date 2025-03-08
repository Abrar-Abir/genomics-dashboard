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
import { COLORS } from "@components/utils.js";
// import { act } from "react";

export default function DonutCard({ info, data }) {
	const [legendValue, setLegendValue] = useState("");
	const [activeLabel, setActiveLabel] = useState("");
	const [isDonut, setIsDonut] = useState(true);

	const totalUnits = data?.reduce((total, item) => total + item.quantity, 0);
	const valueFormatter = (number) => {
		const percentage = ((number / totalUnits) * 100).toFixed(2);
		return `${percentage}% | ${Intl.NumberFormat("us").format(number)}`;
	};

	const donutChartArgs = {
		showLabel: true,
		showAnimation: true,
		animationDuration: 500,
		data: data,
		category: "quantity",
		index: "type",
		variant: isDonut ? "donut" : "pie",
		className: " text-sm", ///
		colors: COLORS,
		valueFormatter: valueFormatter,
		label: legendValue
			? activeLabel
			: Intl.NumberFormat("us").format(totalUnits).toString() + info.label,
	};

	const legendArgs = {
		categories: data?.map((item) => item.type),
		colors: COLORS,
		// enableLegendSlider: true,
	};

	return (
		<Card decoration="top" decorationColor="teal" className="flex flex-col space-y-2 h-full">
			<div className="flex justify-between font-cabin">
				<div className="flex items-center space-x-0.5">
					<Title> {info.title} </Title>{" "}
					<Icon
						icon={InformationCircleIcon}
						variant="simple"
						className=" text-teal-600 hover:text-teal-400 cursor-pointer"
						tooltip={info.tooltip}
					/>
				</div>
				<IconButton color="deep-orange" variant="text" size="sm">
					{isDonut ? (
						<BiSolidPieChartAlt2
							className="h-8 p-1 w-auto border-2 rounded-lg border-deep-orange-50"
							onClick={() => setIsDonut(false)}
						/>
					) : (
						<RiDonutChartFill
							className="h-8 p-1 w-auto border-2 rounded-lg border-deep-orange-50"
							onClick={() => setIsDonut(true)}
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
				{data && (
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
}
