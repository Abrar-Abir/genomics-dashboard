import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import ResetIcon from "@assets/reset.png";
import { FORMATS } from "@components/utils.js";

const DatagridHeader = ({ baseURL, reset }) => {
	const handleExport = (format) => {
		window.open(`${baseURL}/export/datagrid/${format}`, "_blank");
	};
	return (
		<div className="!h-14 flex justify-between items-center w-full bg-white py-2">
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

			<div className="flex items-center space-x-4 mr-6">
				<Menu>
					<MenuHandler>
						<Button color="gray" variant="outlined" className="flex items-center gap-1 py-1 h-8">
							Export
							<ArrowDownTrayIcon className="w-4 h-4 text-gray-900" />
						</Button>
					</MenuHandler>
					<MenuList>
						{FORMATS.map((format) => {
							return (
								<MenuItem key={format} onClick={() => handleExport(format)}>
									{format.toUpperCase()}
								</MenuItem>
							);
						})}
					</MenuList>
				</Menu>
			</div>
		</div>
	);
};

export default DatagridHeader;
