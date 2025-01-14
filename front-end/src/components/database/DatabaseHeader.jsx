import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { useState } from "react";
import { AdjustmentsVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import MenuWithCheckbox from "../shared/Menu";
import SearchBar from "../shared/SearchBar";

// import schema from "@lib/schema.json";

// const tableHeadersAlias = Object.keys(schema.table).reduce((acc, table) => {
// 	Object.keys(schema.table[table].entity).forEach((key) => {
// 		acc[key] = schema.table[table].entity[key].alias;
// 	});
// 	return acc;
// }, {});

// const columns = Object.keys(schema.table)
// 	.flatMap((table) => Object.keys(schema.table[table].entity))
// 	.sort();

// const columnsAlias = columns.map((col) => tableHeadersAlias[col]);
const DatabaseHeader = ({
	baseURL,
	tableHeaders,
	searchKey,
	setSearchKey,
	setSearchValue,
	selectedColumns,
	setSelectedColumns,
	reset,
}) => {
	// console.log(props);
	const handleExport = (format) => {
		window.open(`${baseURL}/export/database/${format}`, "_blank");
	};
	const [allSuggestions, setAllSuggestions] = useState([]);
	const SearchMenu = () => {
		const allKeys = [
			"project.pi",
			"project.project",
			"submission.submission_id",
			"flowcell.flowcell_id",
			"sample.sample_id",
			"sample.sample_name",
		];
		const handleMenuClick = async (key) => {
			setSearchKey(tableHeaders[key.split(".")[1]]);
			setSearchValue("");
			const apiUrl = `${baseURL}/search/${key}`;
			const dataResponse = await fetch(apiUrl);
			if (!dataResponse.ok) {
				console.error("Server error:", dataResponse);
			} else {
				const dataResult = await dataResponse.json();
				setAllSuggestions(dataResult);
			}
		};
		return (
			<Menu>
				<MenuHandler>
					<Button variant="outlined" size="sm">
						{searchKey}
					</Button>
				</MenuHandler>
				<MenuList>
					{allKeys.map((entity, index) => (
						<MenuItem key={index} onMouseDown={() => handleMenuClick(entity)}>
							{tableHeaders[entity.split(".")[1]]}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		);
	};
	return (
		<div className="flex justify-between items-center w-full bg-white z-20 sticky">
			{/* Reset button on the left */}
			<div className="flex ml-6">
				<Button
					color="gray"
					variant="outlined"
					className="flex items-center gap-1 py-1 h-8"
					onClick={() => reset()}
				>
					reset
					<AdjustmentsVerticalIcon className="w-4 h-4 text-gray-900" />
				</Button>
			</div>

			{/* SearchMenu and SearchBar in the center */}
			<div className="flex space-x-4 items-center">
				<SearchMenu />
				<SearchBar
					allSuggestions={allSuggestions}
					setSearchValue={setSearchValue}
					searchKey={searchKey}
				/>
			</div>

			{/* MenuWithCheckbox and Menu on the right */}
			<div className="flex items-center space-x-4 mr-6">
				<MenuWithCheckbox
					columns={tableHeaders}
					selectedColumns={selectedColumns}
					setSelectedColumns={setSelectedColumns}
				/>
				<Menu>
					<MenuHandler>
						<Button color="gray" variant="outlined" className="flex items-center gap-1 py-1 h-8">
							Export
							<ArrowDownTrayIcon className="w-4 h-4 text-gray-900" />
						</Button>
					</MenuHandler>
					<MenuList>
						<MenuItem onClick={() => handleExport("csv")}>CSV</MenuItem>
						<MenuItem onClick={() => handleExport("tsv")}>TSV</MenuItem>
						<MenuItem onClick={() => handleExport("json")}>JSON</MenuItem>
					</MenuList>
				</Menu>
			</div>
		</div>
	);
};

export default DatabaseHeader;
