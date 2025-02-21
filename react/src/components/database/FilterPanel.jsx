import { useState } from "react";
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
	Typography,
	Input,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import ResetIcon from "@assets/reset.png";

function Icon({ open }) {
	return (
		<ChevronDownIcon
			className={`${open ? "rotate-180" : ""} transition-transform duration-200 h-5`}
		/>
	);
}

export default function FilterPanel({
	data,
	tableHeaders,
	selectedFilter,
	setSelectedFilter,
	setSelectedRanges,
	openAcc,
	setOpenAcc,
}) {
	const [allExpanded, setAllExpanded] = useState(false);
	const handleOpenAcc = (key) => {
		setOpenAcc((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleToggleAll = () => {
		const newState = {};
		tables.forEach((key) => {
			newState[key] = !allExpanded;
		});
		setOpenAcc(newState);
		setAllExpanded(!allExpanded);
	};

	const toggleSelection = (filterKey, item) => {
		setSelectedFilter((prevSelectedItems) => {
			const newSelectedItems = new Map(prevSelectedItems);

			if (!newSelectedItems.has(filterKey)) {
				newSelectedItems.set(filterKey, [item]);
			} else {
				const items = [...newSelectedItems.get(filterKey)];
				const index = items.indexOf(item);

				if (index > -1) {
					items.splice(index, 1);
				} else {
					items.push(item);
				}
				if (items.length === 0) {
					newSelectedItems.delete(filterKey);
				} else {
					newSelectedItems.set(filterKey, items);
				}
			}
			return new Map(newSelectedItems);
		});
	};

	const handleRangeChange = (columnID, index, value) => {
		setSelectedRanges((prev) => {
			const updatedRanges = {
				...prev,
				[columnID]: prev[columnID] || ["", ""],
			};
			updatedRanges[columnID][index] = value;

			if (updatedRanges[columnID][0] === "" && updatedRanges[columnID][1] === "") {
				delete updatedRanges[columnID];
			}

			return updatedRanges;
		});
	};

	const Range = ({ text, index, table, columnID }) => {
		return (
			<div className="flex items-center space-x-4">
				<div className="w-10">
					<Typography variant="small" color="black">
						{text}
					</Typography>
				</div>
				<div>
					<Input
						// className="!w-40"
						variant="standard"
						label={data?.[table]?.[columnID]?.[index] || "N/A"}
						placeholder={tableHeaders[columnID]?.includes("date") ? "yyyy-mm-dd" : "xx.yy"}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleRangeChange(columnID, index, e.target.value);
							}
						}}
					/>
				</div>
				{/* <div className="ml-4">
					<button>
						<img
							src={ResetIcon}
							className="w-5 cursor-pointer pointer-events-auto"
							onClick={() => console.log("clicked")}
						></img>
					</button>
				</div> */}
			</div>
		);
	};

	const renderRangeControl = (table, columnID) => {
		return (
			<div className="space-y-3">
				<Range text="From" index={0} table={table} columnID={columnID} />
				<Range text="To  " index={1} table={table} columnID={columnID} />
			</div>
		);
	};

	const renderAccordionBody = (table, columnID) => {
		const items = data[table][columnID];

		const filterKey = columnID;
		return (
			<AccordionBody className="py-2 px-1 bg-white max-h-40 overflow-y-auto">
				{items.length > 0 ? (
					<div className="max-h-32 overflow-y-auto py-2">
						{items.map(([value, count], index) => {
							const isSelected = selectedFilter.get(filterKey)?.includes(value) || false;
							return (
								<div
									key={index}
									className={`flex justify-between py-1 px-2 text-xs cursor-pointer ${
										isSelected ? "bg-blue-500/60" : "hover:bg-red-500/10"
									}`}
									onClick={() => toggleSelection(filterKey, value)}
								>
									<span className="text-black">{value || "N/A"}</span>
									<span className="text-gray-800 mr-2">{count}</span>
								</div>
							);
						})}
					</div>
				) : (
					<span>No data received</span>
				)}
			</AccordionBody>
		);
	};

	const renderInnerAccordion = (table) => {
		return Object.keys(data[table]).map((columnID) => {
			return (
				<Accordion
					id={columnID}
					key={columnID}
					open={openAcc?.[columnID] || false}
					icon={<Icon open={openAcc[columnID]} />}
					className="border-b border-gray-400 w-full"
				>
					<AccordionHeader
						onClick={() => handleOpenAcc(columnID)}
						className={`flex justify-between items-center text-sm font-normal w-full m-0 py-0 px-1 hover:bg-indigo-300/60  ${
							!!openAcc[columnID] ? "bg-indigo-400/80 text-white" : "bg-white text-black"
						}`}
					>
						<span>{tableHeaders[columnID]}</span>
					</AccordionHeader>
					<AccordionBody>
						{data[table][columnID].length === 2 && typeof data[table][columnID][1] === "string"
							? renderRangeControl(table, columnID)
							: renderAccordionBody(table, columnID)}
					</AccordionBody>
				</Accordion>
			);
		});
	};
	const renderAccordion = (table) => {
		return (
			<Accordion
				id={table}
				key={table}
				open={openAcc?.[table] || false}
				icon={<Icon open={openAcc[table]} />}
				className="border-b border-gray-200 w-full"
			>
				<AccordionHeader
					onClick={() => handleOpenAcc(table)}
					className={`flex justify-between items-center text-base font-semibold w-full m-0 py-0 px-1 hover:bg-teal-300/40 capitalize ${
						openAcc[table] ? "bg-teal-600 text-white" : "bg-gray-300 text-black"
					}`}
				>
					<span>{table[0].toUpperCase() + table.slice(1)}</span>
				</AccordionHeader>
				<AccordionBody className="py-2 pl-2">{renderInnerAccordion(table)}</AccordionBody>
			</Accordion>
		);
	};
	return (
		<div className="bg-gray-100 p-2 h-screen-minus-header overflow-scroll w-80">
			<Typography variant="h6" color="blue-gray" className="mb-2 flex justify-between">
				Filters
				<span
					onClick={handleToggleAll}
					className={`text-sm cursor-pointer ${allExpanded ? "text-red-500" : "text-green-500"}`}
				>
					{allExpanded ? "Collapse All [-]" : "Expand All [+]"}
				</span>
			</Typography>
			{data && Object.keys(data).map((table) => renderAccordion(table))}
			{!data && <div className="flex justify-center items-center w-full">No data</div>}
		</div>
	);
}
