import { useState, useEffect } from "react";
import { Card, Grid, Title, BarChart, Button } from "@tremor/react";
import { Dialog, DialogBody, DialogHeader } from "@material-tailwind/react";
import { COLORS } from "@components/utils.js";
import Legend from "./Legend";

export default function RefgenomeCard({ data }) {
	const categories = data?.rg || [];
	const [isOpen, setIsOpen] = useState(false);
	const [genomeColors, setGenomeColors] = useState({});
	const [activeCategories, setActiveCategories] = useState([]);
	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);
	const [rowSize, setRowSize] = useState(4);
	const plus = () => setRowSize((prevZoom) => Math.max(prevZoom - 1, 1));
	const minus = () => setRowSize((prevZoom) => Math.min(prevZoom + 1, 10));

	const numItemsInGrid = rowSize;
	useEffect(() => {
		const genomeColorMapping = categories.reduce((acc, genome, index) => {
			acc[genome] = COLORS[index % COLORS.length];
			return acc;
		}, {});
		setGenomeColors(genomeColorMapping);
		setActiveCategories(categories);
	}, [data]);

	useEffect(() => {
		setRowSize(4);
	}, [isOpen]);

	return (
		<div className="flex flex-col space-y-4 h-full max-h-screen">
			<Legend
				categories={categories}
				colors={COLORS}
				activeCategories={activeCategories}
				setActiveCategories={setActiveCategories}
			/>
			<div className="flex justify-between space-x-2">
				{Object.entries(data.body)
					.slice(0, 4)
					.map(([pi, projects]) => {
						const chartData = Object.entries(projects).map(([project, refgenomes]) => {
							return { ...refgenomes, name: project };
						});

						return (
							<Card key={pi}>
								<Title>{pi}</Title>
								<BarChart
									className="w-auto h-[12vh]"
									data={chartData}
									index="name"
									categories={categories.filter((c) => activeCategories.includes(c))}
									colors={COLORS.filter((_, i) => activeCategories.includes(categories[i]))}
									yAxisWidth={40}
									showLegend={false}
									showXAxis={false}
									stack={true}
								/>
							</Card>
						);
					})}
			</div>
			<Button
				className="bg-gray-700 text-white hover:bg-gray-500 border-none mx-auto"
				onClick={openModal}
			>
				Show All
			</Button>
			<Dialog open={isOpen} handler={setIsOpen} size="lg" className="h-[85vh]">
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
							onClick={closeModal}
						>
							Close
						</Button>
					</div>
				</DialogHeader>

				<DialogBody className="h-[65vh]">
					<Legend
						categories={categories}
						colors={COLORS}
						activeCategories={activeCategories}
						setActiveCategories={setActiveCategories}
					/>
					<Grid numItems={numItemsInGrid} className="gap-2 overflow-y-auto max-h-[60vh]">
						{Object.entries(data.body).map(([pi, projects]) => {
							const chartData = Object.entries(projects).map(([project, refgenomes]) => {
								return { ...refgenomes, name: project };
							});

							return (
								<Card key={pi} className="pl-1">
									<BarChart
										className="w-auto h-[12vh]"
										data={chartData}
										index="name"
										categories={categories.filter((c) => activeCategories.includes(c))}
										colors={COLORS.filter((_, i) => activeCategories.includes(categories[i]))}
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
