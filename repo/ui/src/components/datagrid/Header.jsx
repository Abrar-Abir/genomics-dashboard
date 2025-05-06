import { Menu, MenuHandler, MenuList, MenuItem, Button } from "@material-tailwind/react";
import { NoSymbolIcon, CheckCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import ResetIcon from "@assets/reset.png";
import { FORMATS } from "@components/utils.js";
import { secureOpen } from "../../lib/authService";

export default function Header({ reset, state, setHide }) {
	const handleExport = (format) => {
		const params = new URLSearchParams({ hide: state.hide ? "1" : "0" });

		if (state.show.length > 0) {
			params.append("show", JSON.stringify(state.show));
		}

		if (state.filter.size > 0) {
			for (let [key, values] of state.filter) {
				params.append(key, JSON.stringify(values));
			}
		}
		secureOpen(`export/grid/${format}?${params.toString()}`, format);
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
				<Button
					color="gray"
					variant="outlined"
					className="flex items-center gap-1 py-1 h-8"
					onClick={() => setHide(!state.hide)}
				>
					{!state.hide ? (
						<CheckCircleIcon className="h-6 text-gray-900" />
					) : (
						<NoSymbolIcon className="h-6 text-gray-900" />
					)}
					single entries
				</Button>
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
}
