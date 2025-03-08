import { useState, useEffect } from "react";
// useeffect?
import { BarChart, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon, ComputerDesktopIcon } from "@heroicons/react/24/solid";
import { COLORS } from "@components/utils.js";

export default function ProjectCard({ data }) {
	const [windowSize, setWindowSize] = useState(6);
	const [windowStart, setWindowStart] = useState(0);
	const [categories, setCategories] = useState([]);
	const [colors, setColors] = useState(COLORS);

	useEffect(() => {
		setWindowStart(0);
	}, [windowSize]);

	const windowedData = data?.slice(windowStart, windowStart + windowSize);

	useEffect(() => {
		if (data) {
			const allProjects = {};
			const windowedData = data.slice(windowStart, windowStart + windowSize);

			windowedData.forEach((item) => {
				Object.keys(item).forEach((key) => {
					if (key !== "pi") {
						allProjects[key] = true;
					}
				});
			});

			const allCategories = Object.keys(allProjects);
			setCategories(allCategories);
			const allColors = allCategories.map((_, i) => COLORS[i % COLORS.length]);
			setColors(allColors);
		}
	}, [windowStart, windowSize]);

	const scroll = (direction) => {
		const newStart = windowStart + direction * windowSize;
		if (direction === 1) {
			setWindowStart(Math.min(Math.max(data?.length - windowSize, 0), newStart));
		} else if (direction === -1) {
			setWindowStart(Math.max(newStart, 0));
		}
	};

	const valueFormatter = (number) => `${Intl.NumberFormat("us").format(number).toString()}`;

	const barChartArgs = {
		categories: categories,
		showAnimation: true,
		animationDuration: 1000,
		className: "select-none",
		data: windowedData,
		index: "pi",
		colors: colors,
		showLegend: false,
		yAxisWidth: 56,
		valueFormatter: valueFormatter,
		stack: true,
	};

	return (
		<div className="flex flex-col space-y-2 h-full">
			<div className="flex justify-end items-center gap-x-4 text-gray-500 hover:text-black h-[10%]">
				<NumberInput
					className="max-w-[5rem]"
					value={windowSize}
					icon={ComputerDesktopIcon}
					step={6}
					enableStepper={true}
					min={0}
					// ??
					onValueChange={(val) => setWindowSize(val)}
				/>
			</div>
			<div className="mt-4">
				<BarChart {...barChartArgs} />
				{data && (
					<div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
						<IconButton
							className="cursor-pointer"
							color={"black"}
							variant={windowStart === 0 ? "outlined" : "filled"}
							disabled={windowStart === 0 ? true : false}
							onClick={() => scroll(-1)}
						>
							<ChevronLeftIcon className="w-auto h-6" />
						</IconButton>
						<IconButton
							className="cursor-pointer"
							color={"black"}
							variant={windowStart + windowSize >= data?.length ? "outlined" : "filled"}
							disabled={windowStart + windowSize >= data?.length ? true : false}
							onClick={() => scroll(1)}
						>
							<ChevronRightIcon className="w-auto h-6" />
						</IconButton>
					</div>
				)}
			</div>
		</div>
	);
}
