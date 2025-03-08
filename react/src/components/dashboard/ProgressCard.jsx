import { useState, useEffect } from "react";
import { COLORS } from "@components/utils.js";
import { preprocessData } from "@components/utils.js";
import {
	Card,
	Select,
	SelectItem,
	Subtitle,
	Title,
	Tab,
	TabList,
	TabGroup,
	AreaChart,
	Icon,
	NumberInput,
} from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import {
	ComputerDesktopIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EyeIcon,
	InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { PiEyedropperSampleFill, PiTextColumnsFill } from "react-icons/pi";

export default function ProgressCard({ data }) {
	const [isFlowcellsSelected, setIsFlowcellSelected] = useState(true);
	const [isCumulative, setIsCumulative] = useState(false);
	const [period, setPeriod] = useState(1);
	const [windowSize, setWindowSize] = useState(30);
	const [windowStart, setWindowStart] = useState(0);
	const [preprocessedData, setPreprocessedData] = useState(data);
	const category = isCumulative
		? isFlowcellsSelected
			? "FlowcellsTotal"
			: "SamplesTotal"
		: isFlowcellsSelected
		? "Flowcells"
		: "Samples";

	useEffect(() => {
		if (data) {
			setPreprocessedData(preprocessData(data, period));
		}
	}, [data, period]);

	useEffect(() => {
		if (preprocessedData) {
			setWindowStart(Math.max(0, preprocessedData.length - windowSize));
		}
	}, [preprocessedData, windowSize]);

	const windowedData = preprocessedData?.slice(windowStart, windowStart + windowSize);

	const scroll = (direction) => {
		const newStart = windowStart + direction * windowSize;
		if (direction === 1) {
			setWindowStart(Math.min(Math.max(preprocessedData?.length - windowSize, 0)), newStart);
		} else if (direction === -1) {
			setWindowStart(Math.max(newStart, 0));
		}
	};

	const areaChartArgs = {
		categories: [category],
		showAnimation: true,
		animationDuration: 1000,
		autoMinValue: true,
		className: "select-none",
		data: windowedData,
		index: "date",
		colors: [COLORS[isFlowcellsSelected ? 1 : 0]],
		showLegend: true,
		yAxisWidth: 56,
		xAxisLabel: "Demultiplex Date",
		valueFormatter: (number) => number.toLocaleString("en-US"),
	};

	return (
		<Card decoration="top" decorationColor="teal" className="flex flex-col space-y-2 h-full">
			<div className="flex space-x-0.5 font-cabin items-center">
				<Title> Quantity processed over time</Title>
				<Icon
					icon={InformationCircleIcon}
					variant="simple"
					className=" text-teal-600 hover:text-teal-400 cursor-pointer"
					tooltip="Overview of the number of samples/flowcells processed along with the cumulative number of units in a daily/weekly/monthly/yearly view, over the specified Demultiplex date range."
				/>
			</div>
			<div className="select-none h-[10%] flex flex-col md:flex-row justify-between items-center">
				<TabGroup
					className="flex justify-start"
					index={isFlowcellsSelected}
					onIndexChange={() => setIsFlowcellSelected(!isFlowcellsSelected)}
				>
					<TabList variant="solid" color="indigo">
						<Tab>
							<PiEyedropperSampleFill className="h-5 w-auto inline-block -mt-1" />
							<span className="ml-2">Samples</span>
						</Tab>
						<Tab>
							<PiTextColumnsFill className="h-5 w-auto inline-block rotate-90 -mt-1" />
							<span className="ml-2">Flowcells</span>
						</Tab>
					</TabList>
				</TabGroup>

				{data && (
					<div className="flex flex-col md:flex-row gap-y-4 md:gap-x-4 ml-4">
						<Select
							className="max-w-[14rem] justify-end text-gray-500 hover:text-black"
							value={period}
							placeholder="Select a time period"
							onValueChange={(val) => {
								setPeriod(val);
							}}
							icon={EyeIcon}
						>
							<SelectItem value={1}>Daily</SelectItem>
							<SelectItem value={2}>Weekly</SelectItem>
							<SelectItem value={3}>Monthly</SelectItem>
							<SelectItem value={4}>Yearly</SelectItem>
						</Select>

						<div className="flex items-center text-gray-500 hover:text-black">
							<NumberInput
								value={windowSize}
								icon={ComputerDesktopIcon}
								step={6}
								enableStepper={true}
								min={0}
								onValueChange={(val) => setWindowSize(val)}
							/>
						</div>

						<div className="flex items-center ">
							<input
								type="checkbox"
								id="checkbox1"
								className="h-4 w-4 mx-2 rounded-sm"
								checked={isCumulative}
								onChange={() => setIsCumulative(!isCumulative)}
							/>
							<Subtitle>Cumulative</Subtitle>
						</div>
					</div>
				)}
			</div>
			<div className="mt-4">
				<AreaChart {...areaChartArgs} curveType="linear" />
				{preprocessedData && (
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
							variant={windowStart + windowSize >= preprocessedData?.length ? "outlined" : "filled"}
							disabled={windowStart + windowSize >= preprocessedData?.length ? true : false}
							onClick={() => scroll(1)}
						>
							<ChevronRightIcon className="w-auto h-6" />
						</IconButton>
					</div>
				)}
			</div>
		</Card>
	);
}
