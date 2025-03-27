import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { AdjustmentsVerticalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

const DatagridHeader = ({ baseURL, reset }) => {
	const handleExport = (format) => {
		window.open(`${baseURL}/export/datagrid/${format}`, "_blank");
	};
	return (
		<div className="flex justify-between items-center w-full bg-white py-2">
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

			{/* Menu on the right */}
			<div className="flex items-center space-x-4 mr-6">
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

export default DatagridHeader;
