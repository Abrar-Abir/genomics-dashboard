import { useState, useEffect } from "react";
import { Card, Grid, Title, BarChart, Button } from "@tremor/react";
import { Dialog, DialogBody, DialogHeader, IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { COLORS, scroll } from "@components/utils.js";
import Legend from "./Legend";

export default function RefgenomeCard({ data }) {
	const legends = data?.legends || [];
	const chart = data?.chart || [];

	const [open, setOpen] = useState(false);
	const [active, setActive] = useState([]);
	const [row, setRow] = useState(4);
	const [start, setStart] = useState(0);

	const plus = () => setRow((prevZoom) => Math.max(prevZoom - 1, 1));
	const minus = () => setRow((prevZoom) => Math.min(prevZoom + 1, 10));
	const size = 4;

	useEffect(() => {
		setActive(legends);
	}, [legends]);

	// const scroll = (direction) => {
	// 	const shift = start + direction * size;
	// 	if (direction === 1) {
	// 		setStart(Math.min(Math.max(chart?.length - size, 0), shift));
	// 	} else if (direction === -1) {
	// 		setStart(Math.max(shift, 0));
	// 	}
	// };

	return (
		<div className="flex flex-col space-y-4 h-full max-h-screen">
			<Legend
				legends={legends}
				colors={COLORS}
				active={active}
				setActive={setActive}
				isVertical={false}
			/>
			<div className="flex justify-between space-x-2">
				{Object.entries(chart)
					.slice(start, start + size)
					.map(([pi, projects]) => {
						const chartData = Object.entries(projects).map(([project, refgenomes]) => {
							return { ...refgenomes, name: project };
						});

						return (
							<Card key={pi}>
								<Title>{pi}</Title>
								<BarChart
									className="w-auto h-[12vh] select-none"
									data={chartData}
									index="name"
									categories={legends.filter((c) => active.includes(c))}
									colors={COLORS.filter((_, i) => active.includes(legends[i]))}
									showAnimation={true}
									animationDuration={500}
									yAxisWidth={40}
									showLegend={false}
									showXAxis={false}
									stack={true}
								/>
							</Card>
						);
					})}
			</div>
			<div className="flex items-center justify-center gap-x-4 mt-2">
				<IconButton
					className="cursor-pointer"
					color={"black"}
					variant={start === 0 ? "outlined" : "filled"}
					disabled={start === 0 ? true : false}
					onClick={() => scroll(-1, start, size, chart?.length, setStart)}
				>
					<ChevronLeftIcon className="w-auto h-6" />
				</IconButton>
				<Button
					className="bg-white text-black hover:bg-gray-200 hover:border-gray-500 border-2 border-gray-500"
					onClick={() => setOpen(true)}
				>
					Show All
				</Button>
				<IconButton
					className="cursor-pointer"
					color={"black"}
					variant={start + size >= Object.keys(chart).length ? "outlined" : "filled"}
					disabled={start + size >= Object.keys(chart).length}
					onClick={() => scroll(1, start, size, chart?.length, setStart)}
				>
					<ChevronRightIcon className="w-auto h-6" />
				</IconButton>
			</div>
			<Dialog open={open} handler={setOpen} size="lg" className="h-[85vh]">
				<DialogHeader className="flex justify-between items-center h-[10vh] px-4">
					<Title>Expanded View</Title>
					<div className="flex items-center gap-2">
						<Button
							className="bg-gray-700 text-white hover:bg-gray-500 border-none inline-flex items-center gap-2"
							onClick={minus}
						>
							<span>Zoom Out</span>
						</Button>
						<Button
							className="bg-gray-700 text-white hover:bg-gray-500 border-none flex items-center gap-2"
							onClick={plus}
						>
							<span>Zoom In</span>
						</Button>
						<Button
							className="bg-gray-700 text-white hover:bg-gray-500 border-none"
							onClick={() => setOpen(false)}
						>
							Close
						</Button>
					</div>
				</DialogHeader>
				<DialogBody className="h-[75vh]">
					<Legend
						legends={legends}
						colors={COLORS}
						active={active}
						setActive={setActive}
						isVertical={false}
					/>
					<Grid numItems={row} className="gap-2 overflow-y-auto max-h-[70vh]">
						{Object.entries(chart).map(([pi, projects]) => {
							const chartData = Object.entries(projects).map(([project, refgenomes]) => {
								return { ...refgenomes, name: project };
							});

							return (
								<Card key={pi} className="pl-1">
									<BarChart
										className="w-auto h-[12vh] select-none"
										data={chartData}
										index="name"
										categories={legends.filter((c) => active.includes(c))}
										showAnimation={true}
										animationDuration={500}
										colors={COLORS.filter((_, i) => active.includes(legends[i]))}
										yAxisWidth={40}
										showLegend={false}
										stack={true}
										showXAxis={false}
									/>
									<Title className="flex justify-center">{pi}</Title>
								</Card>
							);
						})}
					</Grid>
				</DialogBody>
			</Dialog>
		</div>
	);
}
