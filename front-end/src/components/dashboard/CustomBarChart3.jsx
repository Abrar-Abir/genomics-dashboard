// import { Fragment, useState, useEffect } from "react";
// import { Card, Grid, Title, BarChart, Button, Legend } from "@tremor/react";
// import { Dialog, TransitionChild, Transition } from "@headlessui/react";
// import {
// 	ArrowsPointingOutIcon,
// 	XMarkIcon,
// 	PlusCircleIcon,
// 	MinusCircleIcon,
// } from "@heroicons/react/24/outline";

// const predefinedColors = ["teal", "indigo", "blue", "blue-gray"];

// const CustomBarChart3 = (props) => {
// 	const [isOpen, setIsOpen] = useState(false);
// 	const [genomeColors, setGenomeColors] = useState({});

// 	const openModal = () => setIsOpen(true);
// 	const closeModal = () => setIsOpen(false);
// 	const [rowSize, setRowSize] = useState(props.rowSize);
// 	const plus = () => setRowSize((prevZoom) => Math.max(prevZoom - 1, 1));
// 	const minus = () => setRowSize((prevZoom) => Math.min(prevZoom + 1, 10));

// 	// Calculate number of items in grid and card size based on rowSize level
// 	const numItemsInGrid = rowSize;
// 	var cardSize = props.cardSize;

// 	const dataByPI = props.data.reduce((groups, row) => {
// 		const pi = row.pi;
// 		if (!groups[pi]) {
// 			groups[pi] = [];
// 		}
// 		groups[pi].push(row);
// 		return groups;
// 	}, {});

// 	const genomeNames = [...new Set(props.data.map((item) => item.genome))];

// 	useEffect(() => {
// 		const genomeNames = [...new Set(props.data.map((item) => item.genome))];
// 		const genomeColorMapping = genomeNames.reduce((acc, genome, index) => {
// 			acc[genome] = predefinedColors[index % predefinedColors.length];
// 			return acc;
// 		}, {});
// 		setGenomeColors(genomeColorMapping);
// 	}, []);

// 	useEffect(() => {
// 		setRowSize(4);
// 	}, [isOpen]);

// 	return (
// 		<div className="flex flex-col space-y-4">
// 			<Legend
// 				className="flex justify-end"
// 				categories={genomeNames}
// 				colors={predefinedColors}
// 			/>
// 			<div className="flex justify-between space-x-2">
// 				{Object.entries(dataByPI)
// 					// limit to first 3 PIs when the modal is closed
// 					.slice(0, isOpen ? undefined : 3)
// 					.map(([pi, rows]) => {
// 						const chartData = rows.reduce((result, row) => {
// 							const projectIndex = result.findIndex(
// 								(item) => item.name === row.project
// 							);

// 							if (projectIndex !== -1) {
// 								result[projectIndex][row.genome] =
// 									row.sample_count;
// 							} else {
// 								result.push({
// 									name: row.project,
// 									[row.genome]: row.sample_count,
// 								});
// 							}

// 							return result;
// 						}, []);

// 						const colors = Object.values(genomeColors);

// 						return (
// 							<Card key={pi}>
// 								<Title>{pi}</Title>
// 								<BarChart
// 									className=""
// 									data={chartData}
// 									index="name"
// 									categories={Object.keys(genomeColors)}
// 									colors={colors}
// 									yAxisWidth={48}
// 									showLegend={false}
// 									showXAxis={false}
// 									stack={true}
// 								/>
// 							</Card>
// 						);
// 					})}
// 			</div>
// 			<Button
// 				className="bg-gray-700 text-white hover:bg-gray-500 border-none mx-auto"
// 				onClick={openModal}
// 			>
// 				{ArrowsPointingOutIcon} Show more
// 			</Button>
// 			<Transition appear show={isOpen} as={Fragment}>
// 				<Dialog
// 					as="div"
// 					className="fixed inset-0 z-10 overflow-y-auto"
// 					onClose={closeModal}
// 				>
// 					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
// 						<TransitionChild
// 							as={Fragment}
// 							enter="ease-out duration-300"
// 							enterFrom="opacity-0"
// 							enterTo="opacity-100"
// 							leave="ease-in duration-200"
// 							leaveFrom="opacity-100"
// 							leaveTo="opacity-0"
// 						>
// 							<Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
// 						</TransitionChild>
// 						<span
// 							className="hidden sm:inline-block sm:align-middle sm:h-screen"
// 							aria-hidden="true"
// 						>
// 							&#8203;
// 						</span>
// 						<TransitionChild
// 							as={Fragment}
// 							enter="ease-out duration-300"
// 							enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
// 							enterTo="opacity-100 translate-y-0 sm:scale-100"
// 							leave="ease-in duration-200"
// 							leaveFrom="opacity-100 translate-y-0 sm:scale-100"
// 							leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
// 						>
// 							<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-[90vw] w-full">
// 								<div className="bg-white p-4 overflow-y-auto h-[85vh] mx-auto max-w-full">
// 									<Legend
// 										className="mb-1 flex justify-end"
// 										categories={genomeNames}
// 										colors={predefinedColors}
// 									/>
// 									<Grid
// 										numItems={numItemsInGrid}
// 										className="gap-2"
// 									>
// 										{Object.entries(dataByPI).map(
// 											([pi, rows]) => {
// 												const chartData = rows.reduce(
// 													(result, row) => {
// 														const projectIndex =
// 															result.findIndex(
// 																(item) =>
// 																	item.name ===
// 																	row.project
// 															);

// 														if (
// 															projectIndex !== -1
// 														) {
// 															result[
// 																projectIndex
// 															][row.genome] =
// 																row.sample_count;
// 														} else {
// 															result.push({
// 																name: row.project,
// 																[row.genome]:
// 																	row.sample_count,
// 															});
// 														}

// 														return result;
// 													},
// 													[]
// 												);

// 												const colors =
// 													Object.values(genomeColors);

// 												return (
// 													<Card
// 														key={pi}
// 														className="pl-1"
// 													>
// 														<BarChart
// 															className={cardSize}
// 															data={chartData}
// 															index="name"
// 															categories={Object.keys(
// 																genomeColors
// 															)}
// 															colors={colors}
// 															yAxisWidth={44}
// 															showLegend={false}
// 															stack={true}
// 															showXAxis={false}
// 														/>
// 														<Title className="flex justify-center">
// 															{pi}
// 														</Title>
// 													</Card>
// 												);
// 											}
// 										)}
// 									</Grid>
// 								</div>
// 								<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex space-x-4">
// 									<Button
// 										className="bg-gray-700 text-white hover:bg-gray-500 border-none mx-auto"
// 										onClick={closeModal}
// 									>
// 										{XMarkIcon} Go back
// 									</Button>
// 									<Button
// 										className="bg-gray-700 text-white hover:bg-gray-500 border-none"
// 										onClick={minus}
// 									>
// 										{MinusCircleIcon} Zoom Out
// 									</Button>
// 									<Button
// 										className="bg-gray-700 text-white hover:bg-gray-500 border-none"
// 										onClick={plus}
// 									>
// 										{PlusCircleIcon} Zoom In
// 									</Button>
// 								</div>
// 							</div>
// 						</TransitionChild>
// 					</div>
// 				</Dialog>
// 			</Transition>
// 		</div>
// 	);
// };

// export default CustomBarChart3;

import { Fragment, useState, useEffect } from "react";
import { Card, Grid, Title, BarChart, Button, Legend } from "@tremor/react";
import {
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from "@material-tailwind/react";
import {
	ArrowsPointingOutIcon,
	XMarkIcon,
	PlusCircleIcon,
	MinusCircleIcon,
} from "@heroicons/react/24/outline";

const predefinedColors = ["teal", "indigo", "blue", "purple"];

const CustomBarChart3 = (props) => {
	const [isOpen, setIsOpen] = useState(false);
	const [genomeColors, setGenomeColors] = useState({});

	const openModal = () => setIsOpen(true);
	const closeModal = () => setIsOpen(false);
	const [rowSize, setRowSize] = useState(props.rowSize);
	const plus = () => setRowSize((prevZoom) => Math.max(prevZoom - 1, 1));
	const minus = () => setRowSize((prevZoom) => Math.min(prevZoom + 1, 10));

	// Calculate number of items in grid and card size based on rowSize level
	const numItemsInGrid = rowSize;
	var cardSize = props.cardSize;

	const dataByPI = props.data.reduce((groups, row) => {
		const pi = row.pi;
		if (!groups[pi]) {
			groups[pi] = [];
		}
		groups[pi].push(row);
		return groups;
	}, {});

	const genomeNames = [
		...new Set(props.data.map((item) => item.genome || "N/A")),
	];

	useEffect(() => {
		const genomeNames = [
			...new Set(props.data.map((item) => item.genome || "N/A")),
		];
		const genomeColorMapping = genomeNames.reduce((acc, genome, index) => {
			acc[genome] = predefinedColors[index % predefinedColors.length];
			// console.log(genome, acc[genome]);
			return acc;
		}, {});
		setGenomeColors(genomeColorMapping);
	}, []);

	useEffect(() => {
		setRowSize(4);
	}, [isOpen]);

	return (
		<div className="flex flex-col space-y-4 max-h-screen">
			<Legend
				className="flex justify-end"
				categories={genomeNames}
				colors={predefinedColors}
			/>
			<div className="flex justify-between space-x-2">
				{Object.entries(dataByPI)
					// limit to first 3 PIs when the modal is closed
					.slice(0, isOpen ? undefined : 3)
					.map(([pi, rows]) => {
						const chartData = rows.reduce((result, row) => {
							const projectIndex = result.findIndex(
								(item) => item.name === row.project
							);

							if (projectIndex !== -1) {
								result[projectIndex][row.genome || "N/A"] =
									row.sample_count;
							} else {
								result.push({
									name: row.project,
									[row.genome || "N/A"]: row.sample_count,
								});
							}

							return result;
						}, []);

						const colors = Object.values(genomeColors);

						return (
							<Card key={pi}>
								<Title>{pi}</Title>
								<BarChart
									className=""
									data={chartData}
									index="name"
									categories={Object.keys(genomeColors)}
									colors={colors}
									yAxisWidth={48}
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
				{/* {<ArrowsPointingOutIcon className="h-5 w-5" />} Show more */}{" "}
				Show more
			</Button>
			<Dialog
				open={isOpen}
				handler={setIsOpen}
				size="lg"
				className="h-[85vh]"
			>
				<DialogHeader className="flex justify-between">
					<Title>Expanded View</Title>
					<Button
						className="bg-gray-700 text-white hover:bg-gray-500 border-none"
						onClick={closeModal}
					>
						{/* <XMarkIcon className="h-5 w-5" />Close */} Close
					</Button>
				</DialogHeader>
				<DialogBody className="">
					<Legend
						className="mb-1 flex justify-end"
						categories={genomeNames}
						colors={predefinedColors}
					/>
					<Grid
						numItems={numItemsInGrid}
						className="gap-2 overflow-y-auto max-h-[70vh]"
					>
						{Object.entries(dataByPI).map(([pi, rows]) => {
							const chartData = rows.reduce((result, row) => {
								const projectIndex = result.findIndex(
									(item) => item.name === row.project
								);

								if (projectIndex !== -1) {
									result[projectIndex][row.genome || "N/A"] =
										row.sample_count;
								} else {
									result.push({
										name: row.project,
										[row.genome || "N/A"]: row.sample_count,
									});
								}

								return result;
							}, []);

							const colors = Object.values(genomeColors);

							return (
								<Card key={pi} className="pl-1">
									<BarChart
										className={cardSize}
										data={chartData}
										index="name"
										categories={Object.keys(genomeColors)}
										colors={colors}
										yAxisWidth={44}
										showLegend={false}
										stack={true}
										showXAxis={false}
									/>
									<Title className="flex justify-center">
										{pi}
									</Title>
								</Card>
							);
						})}
					</Grid>
				</DialogBody>
				<DialogFooter className="flex space-x-4">
					<Button
						className="bg-gray-700 text-white hover:bg-gray-500 border-none"
						onClick={minus}
					>
						{<MinusCircleIcon className="h-5 w-5" />} Zoom Out
					</Button>
					<Button
						className="bg-gray-700 text-white hover:bg-gray-500 border-none"
						onClick={plus}
					>
						{<PlusCircleIcon className="h-5 w-5" />} Zoom In
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
};

export default CustomBarChart3;
