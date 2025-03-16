import Datepicker from "react-tailwindcss-datepicker";
import { Button } from "@material-tailwind/react";
import { NoSymbolIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { startOfMonth, startOfYear, subDays } from "date-fns";

const getDateRange = (start) => ({
	start: start,
	end: new Date(),
});

export default function Header({ state, setState, reset }) {
	return (
		<div className="flex justify-between items-center px-6 py-1 bg-white sticky top-0 z-50">
			<Button
				color="gray"
				variant="outlined"
				className="flex items-center gap-1 py-1 h-8"
				onClick={() => reset()}
			>
				reset
				<ArrowPathIcon className="w-4 h-4 text-gray-900" />
			</Button>

			<div className="flex items-center gap-4">
				<Button
					color="gray"
					variant="outlined"
					className="flex items-center gap-1 py-1 h-8"
					onClick={() =>
						setState((prevState) => ({
							...prevState,
							qgp: !prevState.qgp,
						}))
					}
				>
					{state.qgp ? (
						<CheckCircleIcon className="h-6 text-gray-900" />
					) : (
						<NoSymbolIcon className="h-6 text-gray-900" />
					)}
					qgp
				</Button>

				<Datepicker
					displayFormat={"YYYY-MM-DD"}
					showShortcuts={true}
					showFooter={true}
					readOnly={true}
					separator={"---"}
					maxDate={new Date()}
					primaryColor={"teal"}
					value={state}
					onChange={setState}
					inputClassName="relative transition-all duration-300 h-full pl-4 pr-14 w-full border border-gray-300 rounded-lg tracking-wide text-xs font-medium placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed"
					containerClassName="relative w-60 text-gray-700 h-8"
					toggleClassName="absolute bg-gray-800 rounded-r-lg text-white right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
					configs={{
						shortcuts: {
							today: "Today",
							last7Days: {
								text: "Last 7 days",
								period: getDateRange(subDays(new Date(), 7)),
							},
							last30Days: {
								text: "Last 30 days",
								period: getDateRange(subDays(new Date(), 30)),
							},
							monthToDate: {
								text: "This Month",
								period: getDateRange(startOfMonth(new Date())),
							},
							yearToDate: {
								text: "This Year",
								period: getDateRange(startOfYear(new Date())),
							},
						},
					}}
				/>
			</div>
		</div>
	);
}
