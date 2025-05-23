import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { useState } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { getID, FORMATS } from "@components/utils.js";
import MenuWithCheckbox from "./Menu";
import SearchBar from "./SearchBar";
import ResetIcon from "@assets/reset.png";
import schema from "@lib/schema.json";
import { secureOpen, secureFetch } from "../../lib/authService";

export default function Header({ state, setState, reset }) {
	const handleExport = (format) => {
		secureOpen(`/export/table/${format}?sort=${JSON.stringify(state.sort)}${state.query}`, format);
	};
	const [allSuggestions, setAllSuggestions] = useState([]);
	const SearchMenu = () => {
		const keys = ["PI", "SDR No.", "Submission ID", "Flowcell ID", "LIMS ID", "Sample Name"];
		const handleMenu = async (key) => {
			const id = getID(schema.headers, key);
			setState("key", id);
			setState("value", "");
			const response = await secureFetch(`/search/${id}?${state.query.slice(1)}`);
			setAllSuggestions(response);
		};
		return (
			<Menu>
				<MenuHandler>
					<Button variant="outlined" size="sm">
						{schema.headers[state.key] || "Search"}
					</Button>
				</MenuHandler>
				<MenuList>
					{keys.map((entity, index) => (
						<MenuItem key={index} onMouseDown={() => handleMenu(entity)}>
							{entity}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
		);
	};
	return (
		<div className="!h-14 flex justify-between items-center w-full bg-white z-20 sticky">
			<div className="flex ml-6">
				<Button
					color="gray"
					variant="outlined"
					className="flex items-center gap-1 py-1 h-8"
					onClick={() => reset()}
				>
					reset
					<img src={ResetIcon} className="w-4"></img>
				</Button>
			</div>

			<div className="flex space-x-4 items-center">
				<SearchMenu />
				<SearchBar allSuggestions={allSuggestions} setValue={(val) => setState("value", val)} />
			</div>

			<div className="flex items-center space-x-4 mr-6">
				{/* <FileExplorer /> */}
				<MenuWithCheckbox cols={state.cols} setCols={(cols) => setState("cols", cols)} />
				<Menu>
					<MenuHandler>
						<Button color="gray" variant="outlined" className="flex items-center gap-1 py-1 h-8">
							Export
							<ArrowDownTrayIcon className="w-4 h-4 text-gray-900" />
						</Button>
					</MenuHandler>
					<MenuList>
						{FORMATS.map((format) => (
							<MenuItem key={format} onClick={() => handleExport(format)}>
								{format.toUpperCase()}
							</MenuItem>
						))}
					</MenuList>
				</Menu>
			</div>
		</div>
	);
}
