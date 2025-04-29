import { useState } from "react";
import { BarChart, NumberInput, Subtitle } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { COLORS, scroll } from "@components/utils.js";

export default function ProjectCard({ data }) {
	const [size, setSize] = useState(6);
	const [start, setStart] = useState(0);
	const [stacked, setStacked] = useState(true);
	const window = data?.slice(start, start + size);

	const projects = window.flatMap((dict) => Object.keys(dict).filter((key) => key !== "pi"));

	// const scroll = (direction) => {
	// 	const shift = start + direction * size;
	// 	if (direction === 1) {
	// 		setStart(Math.min(Math.max(data?.length - size, 0), shift));
	// 	} else if (direction === -1) {
	// 		setStart(Math.max(shift, 0));
	// 	}
	// };

	return (
		<div className="flex flex-col space-y-2 h-full">
			<div className="flex justify-end items-center">
				<input
					type="checkbox"
					className="h-4 w-4 mx-2 rounded-sm"
					checked={stacked}
					onChange={() => setStacked(!stacked)}
				/>

				<Subtitle>Stacked</Subtitle>
			</div>
			<div className="mt-4">
				<BarChart
					categories={projects}
					showAnimation={true}
					animationDuration={500}
					className="select-none"
					data={window}
					index="pi"
					colors={COLORS}
					showLegend={false}
					yAxisWidth={56}
					xAxisLabel="PI"
					stack={stacked}
				/>
				{data && (
					<div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
						<IconButton
							className="cursor-pointer"
							color={"black"}
							variant={start === 0 ? "outlined" : "filled"}
							disabled={start === 0}
							onClick={() => scroll(-1, start, size, data?.length, setStart)}
						>
							<ChevronLeftIcon className="w-auto h-6" />
						</IconButton>
						<NumberInput
							className="max-w-[5rem]"
							value={size}
							step={6}
							enableStepper={true}
							min={0}
							onValueChange={(val) => setSize(val)}
						/>
						<IconButton
							className="cursor-pointer"
							color={"black"}
							variant={start + size >= data?.length ? "outlined" : "filled"}
							disabled={start + size >= data?.length}
							onClick={() => scroll(1, start, size, data?.length, setStart)}
						>
							<ChevronRightIcon className="w-auto h-6" />
						</IconButton>
					</div>
				)}
			</div>
		</div>
	);
}
