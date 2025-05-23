import React, { useState, useEffect } from "react";
import { Card, Title, DonutChart, Icon } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import { BiSolidPieChartAlt2 } from "react-icons/bi";
import { RiDonutChartFill } from "react-icons/ri";
import { COLORS } from "@components/utils.js";
import Legend from "./Legend";

export default function DonutCard({ info, data }) {
	const [donut, setDonut] = useState(true);
	const legends = data?.map((item) => item.type);
	const [active, setActive] = useState([]);
	const [label, setLabel] = useState("");

	useEffect(() => {
		setActive(legends);
	}, [data]);

	const filteredData = data.filter((item) => active.includes(item.type));
	const totalUnits = filteredData?.reduce((total, item) => total + item.quantity, 0);
	const valueFormatter = (number) => {
		const percentage = ((number / totalUnits) * 100).toFixed(2);
		return `${percentage}% | ${number}`;
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
					onClick={() => setDonut(!donut)}
				>
					{donut ? <BiSolidPieChartAlt2 /> : <RiDonutChartFill />}
				</IconButton>
			</div>
			<div className="flex items-center justify-start gap-4 w-full">
				<div className="w-[75%] flex-shrink-0">
					<DonutChart
						showLabel={true}
						showAnimation={true}
						animationDuration={500}
						data={filteredData}
						category="quantity"
						index="type"
						variant={donut ? "donut" : "pie"}
						className="text-sm"
						colors={COLORS.filter((_, i) => active.includes(legends[i]))}
						valueFormatter={valueFormatter}
						label={label ? label : totalUnits.toString() + info.label}
						onValueChange={(e) => {
							if (e && e.type) {
								setLabel(e.quantity.toString() + " / " + totalUnits.toString());
							} else {
								setLabel("");
							}
						}}
					/>
				</div>
				{data && (
					<div className="w-[25%] flex flex-col max-h-40 flex-shrink-0 overflow-auto">
						<Legend
							legends={legends}
							colors={COLORS}
							active={active}
							setActive={setActive}
							isVertical={true}
						/>
					</div>
				)}
			</div>
		</Card>
	);
}
