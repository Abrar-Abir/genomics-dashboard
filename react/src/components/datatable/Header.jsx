import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { useState } from "react";
import { AdjustmentsVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { getID } from "@components/utils.js";
import MenuWithCheckbox from "../shared/Menu";
import SearchBar from "../shared/SearchBar";
import schema from "@lib/schema.json";
import { secureDownload, secureFetch } from "../../lib/authService";

const headers = schema.headers;

export default function Header({ state, setState, reset }) {
	const handleExport = (format) => {
		secureDownload(
			`/export/table/${format}?sort=${JSON.stringify(state.sort)}${state.query}`,
			format
		);
	};
	const [allSuggestions, setAllSuggestions] = useState([]);
	const SearchMenu = () => {
		const keys = ["PI", "SDR No.", "Submission ID", "Flowcell ID", "LIMS ID", "Sample Name"];
		const handleMenu = async (key) => {
			const id = getID(headers, key);
			setState("key", id);
			setState("value", "");
			const response = await secureFetch(`/search/${id}?${state.query.slice(1)}`);
			setAllSuggestions(response);
		};
		return (
			<Menu>
				<MenuHandler>
					<Button variant="outlined" size="sm">
						{headers[state.key] || "Search"}
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
				<SearchBar allSuggestions={allSuggestions} setValue={(val) => setState("value", val)} />
			</div>

			<div className="flex items-center space-x-4 mr-6">
				<MenuWithCheckbox
					headers={headers}
					cols={state.cols}
					setCols={(cols) => setState("cols", cols)}
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
}
