import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { useOutletContext } from "react-router-dom";
import { useState } from "react";
import { AdjustmentsVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

import MenuWithCheckbox from "../shared/Menu";
import SearchBar from "../shared/SearchBar";

const DatabaseHeader = ({
	getID,
	tableHeaders,
	query,
	searchKey,
	setSearchKey,
	setSearchValue,
	selectedColumns,
	setSelectedColumns,
	reset,
}) => {
	const { baseURL } = useOutletContext();
	const handleExport = (format) => {
		window.open(`${baseURL}/export/table/${format}`, "_blank");
	};
	const [allSuggestions, setAllSuggestions] = useState([]);
	const SearchMenu = () => {
		const allKeys = ["PI", "SDR No.", "Submission ID", "Flowcell ID", "LIMS ID", "Sample Name"];
		const handleMenuClick = async (key) => {
			const id = getID(tableHeaders, key);
			setSearchKey(id);
			setSearchValue("");
			const apiUrl = `${baseURL}/search/${id}?${query.slice(1)}`;
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
						{tableHeaders[searchKey] || "Search"}
					</Button>
				</MenuHandler>
				<MenuList>
					{allKeys.map((entity, index) => (
						<MenuItem key={index} onMouseDown={() => handleMenuClick(entity)}>
							{entity}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		);
	};
	return (
		<div className="flex justify-between items-center w-full bg-white z-20 sticky">
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

			<div className="flex space-x-4 items-center">
				<SearchMenu />
				<SearchBar allSuggestions={allSuggestions} setSearchValue={setSearchValue} />
			</div>

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
						{["csv", "tsv", "json"].map((format) => (
							<MenuItem key={format} onClick={() => handleExport(format)}>
								{format.toUpperCase()}
							</MenuItem>
						))}
					</MenuList>
				</Menu>
			</div>
		</div>
	);
};

export default DatabaseHeader;
