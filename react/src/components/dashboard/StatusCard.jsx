import { useState, useEffect } from "react";
import { BarChart, Subtitle, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon, ComputerDesktopIcon } from "@heroicons/react/24/solid";
import { COLORS } from "@components/utils.js";
import Legend from "./Legend";
export default function StatusCard({ data }) {
	const categories = data?.status || [];
	const [windowSize, setWindowSize] = useState(6);
	const [windowStart, setWindowStart] = useState(0);
	const [toggleStacked, setToggleStacked] = useState(true);
	const [activeCategories, setActiveCategories] = useState(categories);
	useEffect(() => {
		setActiveCategories(categories);
	}, [categories]);
	const chartData = data?.body || [];
	const windoweddata = chartData.slice(windowStart, windowStart + windowSize);

	const scroll = (direction) => {
		const newStart = windowStart + direction * windowSize;
		if (direction === 1) {
			setWindowStart(Math.min(Math.max(chartData?.length - windowSize, 0), newStart));
		} else if (direction === -1) {
			setWindowStart(Math.max(newStart, 0));
		}
	};

	const barChartArgs = {
		categories: categories.filter((c) => activeCategories.includes(c)),
		showAnimation: true,
		animationDuration: 300,
		autoMinValue: true,
		data: windoweddata,
		index: "pi",
		colors: COLORS.filter((_, i) => activeCategories.includes(categories[i])),
		showLegend: false,
		yAxisWidth: 56,
		xAxisLabel: "PI",
		stack: toggleStacked,
	};

	return (
		<div className="flex h-full">
			<div className="flex-1 flex flex-col space-y-2">
				<div className="flex justify-between items-center ml-6 gap-x-4 text-gray-500 hover:text-black">
					<div className="flex items-center gap-x-4">
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
					<Legend
						categories={categories}
						colors={COLORS}
						activeCategories={activeCategories}
						setActiveCategories={setActiveCategories}
					/>
				</div>

				<div className="mt-4 h-full">
					<BarChart {...barChartArgs} />
					{chartData && (
						<div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
							<IconButton
								color={"black"}
								variant={windowStart === 0 ? "outlined" : "filled"}
								disabled={windowStart === 0}
								onClick={() => scroll(-1)}
							>
								<ChevronLeftIcon className="w-auto h-6" />
							</IconButton>
							<IconButton
								color={"black"}
								variant={windowStart + windowSize >= chartData?.length ? "outlined" : "filled"}
								disabled={windowStart + windowSize >= chartData?.length}
								onClick={() => scroll(1)}
							>
								<ChevronRightIcon className="w-auto h-6" />
							</IconButton>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
