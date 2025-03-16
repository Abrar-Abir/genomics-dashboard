import { useState } from "react";
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
	Typography,
	Input,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
// import ResetIcon from "@assets/reset.png";

function Icon({ open }) {
	return (
		<ChevronDownIcon
			className={`${open ? "rotate-180" : ""} transition-transform duration-200 h-5`}
		/>
	);
}

export default function Panel({ state, setState, data, headers }) {
	const [allExpanded, setAllExpanded] = useState(false);
	const handleOpen = (key) => {
		setState("open", (prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const handleToggle = () => {
		const newState = state.open;
		Object.keys(data).forEach((key) => {
			newState[key] = !allExpanded;
		});
		setState("open", newState);
		setAllExpanded(!allExpanded);
	};

	const toggle = (key, item) => {
		setState("filter", (prevItems) => {
			const newItems = new Map(prevItems);

			if (!newItems.has(key)) {
				newItems.set(key, [item]);
			} else {
				const items = [...newItems.get(key)];
				const index = items.indexOf(item);

				if (index > -1) {
					items.splice(index, 1);
				} else {
					items.push(item);
				}
				if (items.length === 0) {
					newItems.delete(key);
				} else {
					newItems.set(key, items);
				}
			}
			return new Map(newItems);
		});
	};

	const handleRange = (columnID, index, value) => {
		setState("range", (prev) => {
			const newRange = {
				...prev,
				[columnID]: prev[columnID] || ["", ""],
			};
			newRange[columnID][index] = value;

			if (newRange[columnID][0] === "" && newRange[columnID][1] === "") {
				delete newRange[columnID];
			}
			return newRange;
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
						label={data[table]?.[columnID]?.[index] || "N/A"}
						placeholder={headers[columnID]?.includes("date") ? "yyyy-mm-dd" : "xx.yy"}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleRange(columnID, index, e.target.value);
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

	const renderRange = (table, columnID) => {
		return (
			<div className="space-y-3">
				<Range text="From" index={0} table={table} columnID={columnID} />
				<Range text="To  " index={1} table={table} columnID={columnID} />
			</div>
		);
	};

	const renderBody = (table, columnID) => {
		const items = data[table][columnID];
		const key = columnID;
		return (
			<AccordionBody className="py-2 px-1 bg-white max-h-40 overflow-y-auto">
				{items.length > 0 ? (
					<div className="max-h-32 overflow-y-auto py-2">
						{items.map(([value, count], index) => {
							const selected = state.filter.get(key)?.includes(value) || false;
							return (
								<div
									key={index}
									className={`flex justify-between py-1 px-2 text-xs cursor-pointer ${
										selected ? "bg-blue-500/60" : "hover:bg-red-500/10"
									}`}
									onClick={() => toggle(key, value)}
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

	const renderAccordion = (table) => {
		return Object.keys(data[table]).map((columnID) => {
			return (
				<Accordion
					id={columnID}
					key={columnID}
					open={state.open[columnID] || false}
					icon={<Icon open={state.open[columnID]} />}
					className="border-b border-gray-400 w-full"
				>
					<AccordionHeader
						onClick={() => handleOpen(columnID)}
						className={`flex justify-between items-center text-sm font-normal w-full m-0 py-0 px-1 hover:bg-indigo-300/60  ${
							state.open[columnID] ? "bg-indigo-400/80 text-white" : "bg-white text-black"
						}`}
					>
						<span>{headers[columnID]}</span>
					</AccordionHeader>
					<AccordionBody>
						{data[table][columnID].length === 2 && typeof data[table][columnID][1] === "string"
							? renderRange(table, columnID)
							: renderBody(table, columnID)}
					</AccordionBody>
				</Accordion>
			);
		});
	};
	const render = (table) => {
		return (
			<Accordion
				id={table}
				key={table}
				open={state.open[table] || false}
				icon={<Icon open={state.open[table]} />}
				className="border-b border-gray-200 w-full"
			>
				<AccordionHeader
					onClick={() => handleOpen(table)}
					className={`flex justify-between items-center text-base font-semibold w-full m-0 py-0 px-1 hover:bg-teal-300/40 capitalize ${
						state.open[table] ? "bg-teal-600 text-white" : "bg-gray-300 text-black"
					}`}
				>
					<span>{table[0].toUpperCase() + table.slice(1)}</span>
				</AccordionHeader>
				<AccordionBody className="py-2 pl-2">{renderAccordion(table)}</AccordionBody>
			</Accordion>
		);
	};
	return (
		<div className="bg-gray-100 p-2 h-screen-minus-header overflow-scroll w-80">
			<Typography variant="h6" color="blue-gray" className="mb-2 flex justify-between">
				Filters
				<span
					onClick={handleToggle}
					className={`text-sm cursor-pointer ${allExpanded ? "text-red-500" : "text-green-500"}`}
				>
					{allExpanded ? "Collapse All [-]" : "Expand All [+]"}
				</span>
			</Typography>
			{data && Object.keys(data).map((table) => render(table))}
			{!data && <div className="flex justify-center items-center w-full">No data</div>}
		</div>
	);
}
