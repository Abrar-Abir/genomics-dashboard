import { useState, useEffect } from "react";
import { BarChart, Subtitle, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon, ComputerDesktopIcon } from "@heroicons/react/24/solid";

export default function DataSampleStatusChart(props) {
	const [windowSize, setWindowSize] = useState(6);
	const [windowStart, setWindowStart] = useState(0);
	const [toggleStacked, setToggleStacked] = useState(true);
	const [activeCategories, setActiveCategories] = useState(new Set(props.categories));

	useEffect(() => {
		setActiveCategories(new Set(props.categories));
	}, [props.categories]);

	const windowedData = props.data?.slice(windowStart, windowStart + windowSize);

	const scrollData = (direction) => {
		if (direction === "forward") {
			setWindowStart(Math.min(windowStart + windowSize, props.data?.length - windowSize));
		} else {
			setWindowStart(Math.max(0, windowStart - windowSize));
		}
	};

	const handleLegendClick = (category) => {
		setActiveCategories((prev) => {
			const newSet = new Set(prev);
			newSet.has(category) ? newSet.delete(category) : newSet.add(category);
			return newSet;
		});
	};

	const barChartArgs = {
		categories: props.categories.filter((c) => activeCategories.has(c)),
		showAnimation: true,
		animationDuration: 300,
		autoMinValue: true,
		className: props.className + " select-none",
		data: windowedData,
		index: props.index,
		colors: props.colors.filter((_, i) => activeCategories.has(props.categories[i])),
		showLegend: false,
		yAxisWidth: props.yAxisWidth,
		xAxisLabel: props.xAxisLabel,
		stack: toggleStacked,
	};

	return (
		<div className="flex h-full">
			<div className="flex-1 flex flex-col space-y-2">
				<div className="flex justify-end items-center gap-x-4 text-gray-500 hover:text-black">
					<NumberInput
						className="max-w-[5rem]"
						value={windowSize}
						icon={ComputerDesktopIcon}
						step={6}
						enableStepper={true}
						min={0}
						onValueChange={(val) => setWindowSize(val)}
					/>
					<div className="flex justify-end items-center">
						<input
							type="checkbox"
							className="h-4 w-4 mx-2 rounded-sm"
							checked={toggleStacked}
							onChange={() => setToggleStacked(!toggleStacked)}
						/>
						<Subtitle>Stacked</Subtitle>
					</div>
				</div>

				<div className="mt-4 h-full">
					<BarChart {...barChartArgs} />
					{props.data && (
						<div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
							<IconButton
								color={"black"}
								variant={windowStart === 0 ? "outlined" : "filled"}
								disabled={windowStart === 0}
								onClick={() => scrollData("backward")}
							>
								<ChevronLeftIcon className="w-auto h-6" />
							</IconButton>
							<IconButton
								color={"black"}
								variant={windowStart + windowSize >= props.data?.length ? "outlined" : "filled"}
								disabled={windowStart + windowSize >= props.data?.length}
								onClick={() => scrollData("forward")}
							>
								<ChevronRightIcon className="w-auto h-6" />
							</IconButton>
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col items-start ml-6 space-y-2">
				{props.categories.map((category, idx) => (
					<div
						key={category}
						className="flex items-center cursor-pointer space-x-2"
						onClick={() => handleLegendClick(category)}
					>
						<div
							className="w-4 h-4 rounded"
							style={{
								backgroundColor: activeCategories.has(category) ? props.colors[idx] : "#ccc",
							}}
						/>
						<span
							className={`text-sm ${
								activeCategories.has(category) ? "text-black" : "text-gray-400"
							}`}
						>
							{category}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
