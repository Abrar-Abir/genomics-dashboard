import React, { useState } from "react";
import { Card, Title, DonutChart, Icon, Legend } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BiSolidPieChartAlt2 } from "react-icons/bi";
import { RiDonutChartFill } from "react-icons/ri";
import { COLORS } from "@components/utils.js";

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
				<IconButton
					color="deep-orange"
					className="h-8 p-4 w-auto border-2 rounded-lg border-deep-orange-100"
					variant="text"
					size="sm"
					onClick={() => setIsDonut(!isDonut)}
				>
					{isDonut ? <BiSolidPieChartAlt2 /> : <RiDonutChartFill />}
				</IconButton>
			</div>
			<div className="flex space-x-4">
				<DonutChart
					{...donutChartArgs}
					onValueChange={(e) => {
						console.log(e);
						if (e && e.type) {
							setLegendValue(e.type);
							setActiveLabel(e.quantity.toString() + " / " + totalUnits.toString());
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
							categories={data?.map((item) => item.type)}
							colors={COLORS}
							onClickLegendItem={(e) => console.log(e)}
							activeLegend={legendValue}
						/>
					</div>
				)}
			</div>
		</Card>
	);
}
