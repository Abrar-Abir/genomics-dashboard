import { useState } from "react";
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
	Typography,
	Checkbox,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

function Icon({ open }) {
	return (
		<ChevronDownIcon
			className={`${open ? "rotate-180" : ""} transition-transform duration-200 h-5`}
		/>
	);
}

export default function Panel({ state, setState, data }) {
	// const [openAcc, setOpenAcc] = useState({});
	// const handleOpenAcc = (key) => {
	// setOpenAcc((prev) => ({ ...prev, [key]: !prev[key] }));
	// };

	const toggleSelection = (filterKey, item) => {
		setSelectedFilter((prevSelectedItems) => {
			const newSelectedItems = { ...prevSelectedItems };
			if (!newSelectedItems[filterKey]) {
				newSelectedItems[filterKey] = [];
			}
			const index = newSelectedItems[filterKey].indexOf(item);
			if (index > -1) {
				newSelectedItems[filterKey] = newSelectedItems[filterKey].filter((val) => val !== item);
			} else {
				if (filterKey === "submission.datatype") {
					newSelectedItems[filterKey] = [item];
				} else {
					newSelectedItems[filterKey] = [...newSelectedItems[filterKey], item];
				}
			}
			return newSelectedItems;
		});
	};

	const renderAccordionBody = (outerKey, key, items) => {
		if (!items) {
			return (
				<AccordionBody className="py-2 px-1 bg-white max-h-40 overflow-y-auto">
					<span>No data received</span>
				</AccordionBody>
			);
		}

		const filterKey = `${outerKey}.${key}`;
		return (
			<AccordionBody className="py-2 px-1 bg-white max-h-60 overflow-y-auto">
				{items.length > 0 ? (
					<div className="max-h-52 overflow-y-auto py-2">
						{items.map(([value, count], index) => {
							const isSelected = selectedFilter[filterKey]?.includes(value) || false;
							return (
								<div
									key={index}
									className={`flex justify-between py-1 px-2 text-xs cursor-pointer ${
										isSelected ? "bg-blue-500/60" : "hover:bg-blue-gray-500/10"
									}`}
									onClick={(e) => {
										toggleSelection(filterKey, value);
									}}
								>
									<span className="text-black">
										{key === "datatype" ? value.slice(1, -1).replace(/'/g, "") : value}
									</span>
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

	const renderInnerAccordion = (key, values) => {
		return values.map((innerKey) => (
			<Accordion
				id={key + "." + innerKey}
				key={innerKey}
				open={!openAcc[`${key}.${innerKey}`]}
				icon={<Icon open={openAcc[`${key}.${innerKey}`]} />}
				className="border-b border-gray-400 w-full"
			>
				<AccordionHeader
					onClick={() => handleOpenAcc(`${key}.${innerKey}`)}
					className={`flex justify-between items-center text-sm font-normal w-full m-0 py-0 px-1 hover:bg-indigo-300/60  ${
						!!openAcc[`${key}.${innerKey}`] ? "bg-indigo-400/80 text-white" : "bg-white text-black"
					}`}
				>
					<span>
						{innerKey === "pi"
							? "PI"
							: innerKey === "project"
							? "SDR No."
							: innerKey === "datatype"
							? "Datatype"
							: ""}
					</span>
				</AccordionHeader>
				<AccordionBody>
					{renderAccordionBody(key, innerKey, data?.[`${key}.${innerKey}`])}
				</AccordionBody>
			</Accordion>
		));
	};
	const renderAccordion = (key, value) => {
		return (
			<Accordion
				id={key}
				key={key}
				open={true}
				icon={<Icon open={openAcc[key]} />}
				className="border-b border-gray-200 w-full"
			>
				<AccordionHeader
					onClick={() => handleOpenAcc(key)}
					className={`flex justify-between items-center text-base font-semibold w-full m-0 py-0 px-1 hover:bg-teal-300/40 capitalize ${
						openAcc[key] ? "bg-teal-600 text-white" : "bg-gray-300 text-black"
					}`}
				>
					<span>{key === "submission" ? "Submission" : key === "project" ? "Project" : ""}</span>
				</AccordionHeader>
				<AccordionBody className="py-2 pl-2">{renderInnerAccordion(key, value)}</AccordionBody>
			</Accordion>
		);
	};
	return (
		<div className="bg-gray-100 p-2 h-full overflow-y-auto w-80">
			<Typography variant="h6" color="blue-gray" className="mb-2 flex justify-between">
				Filters
			</Typography>
			<Checkbox
				checked={hideSingleEntries}
				onClick={() => setHideSingleEntries(!hideSingleEntries)}
				label={<Typography className="text-sm"> Hide Single Entry Samples </Typography>}
			/>
			{data && (
				<>
					{renderAccordion("project", ["pi", "project"])}
					{renderAccordion("submission", ["datatype"])}
				</>
			)}
			{!data && <div className="flex justify-center items-center w-full">No data</div>}
		</div>
	);
}
