import Datepicker from "react-tailwindcss-datepicker";
import { Button } from "@material-tailwind/react";
import require$$0 from "dayjs";
import { AdjustmentsVerticalIcon } from "@heroicons/react/24/solid";
const DATE_FORMAT = "YYYY-MM-DD";
function formatDate(date, format = DATE_FORMAT) {
	return date.format(format);
}

const DashboardHeader = (props) => {
	return (
		<div className="flex justify-between items-center px-6 py-1 bg-white">
			{/* Reset Button on the Left */}
			<Button
				color="gray"
				variant="outlined"
				className="flex items-center gap-1 py-1 h-8"
				onClick={() => props.reset()}
			>
				reset
				<AdjustmentsVerticalIcon className="w-4 h-4 text-gray-900" />
			</Button>

			{/* Datepicker on the Right */}
			<Datepicker
				displayFormat={"DD/MM/YYYY"}
				showShortcuts={true}
				showFooter={true}
				separator={"---"}
				maxDate={new Date()}
				primaryColor={"teal"}
				value={props.dateRange}
				onChange={props.handleDateRangeChange}
				inputClassName="relative transition-all duration-300 h-full pl-4 pr-14 w-full border border-gray-300 rounded-lg tracking-wide text-xs font-medium placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed"
				containerClassName="relative w-60 text-gray-700 h-8"
				toggleClassName="absolute bg-gray-800 rounded-r-lg text-white right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
				configs={{
					shortcuts: {
						today: "Today",
						last7Days: {
							text: "Last 7 days",
							period: {
								start: formatDate(
									require$$0().subtract(7, "d")
								),
								end: formatDate(require$$0()),
							},
						},
						last30Days: {
							text: "Last 30 days",
							period: {
								start: formatDate(
									require$$0().subtract(30, "d")
								),
								end: formatDate(require$$0()),
							},
						},
						monthToDate: {
							text: "MTD",
							period: {
								start: formatDate(
									require$$0().startOf("month")
								),
								end: formatDate(require$$0()),
							},
						},
						yearToDate: {
							text: "YTD",
							period: {
								start: formatDate(require$$0().startOf("year")),
								end: formatDate(require$$0()),
							},
						},
					},
				}}
			/>
		</div>
	);
};

export default DashboardHeader;
