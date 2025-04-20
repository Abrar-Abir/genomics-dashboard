import {
	Button,
	ButtonGroup,
	Typography,
	Card,
	CardFooter,
	Tooltip,
} from "@material-tailwind/react";
import schema from "@lib/schema.json";
import { getID } from "@components/utils.js";
import { ArrowsUpDownIcon, ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import JsonPng from "@assets/json.png";
import MultiQCLogo from "@assets/multiqc_logo_color.png";
import JbrowseLogo from "@assets/jbrowse.png";
import { secureOpen } from "../../lib/authService";

const bgColors = ["bg-blue-", "bg-teal-", "bg-blue-"];
const headers = schema.headers;
const properties = schema.properties;

const countTrueLanes = (row) => {
	return Object.keys(row).filter((key) => headers[key].startsWith("Lane ") && row[key] === true)
		.length;
};

const JsonIcon = ({ sampleId }) => (
	<img
		src={JsonPng}
		onClick={() => secureOpen(`export/table/raw?${getID(headers, "LIMS ID")}=[${sampleId}]`, "raw")}
		className="ml-2 w-4 h-4 cursor-pointer hover:bg-blue-300 rounded"
	></img>
);
const HtmlIcon = ({ col, id }) => (
	<img
		src={MultiQCLogo}
		onClick={() =>
			window.open(
				col === "Flowcell ID"
					? `https://pme.sidra.org/qc/home?path=sapipe/MultiQC/Flowcell/${id}/${id}.html`
					: `https://pme.sidra.org/qc/home?path=sapipe/MultiQC/submission/${
							id.split("_")[1]
					  }/${id}/${id}.html`,
				"_blank"
			)
		}
		className="ml-2 h-2.5 cursor-pointer hover:bg-blue-300 rounded"
	></img>
);

const JbrowseIcon = ({ sampleId }) => {
	const handleClick = async () => {
		window.open("http://172.32.79.51:8080/?config=0201382681.json", "_blank");
		// try {
		// 	const response = await fetch(`${BASE_URL}/jbrowse/${sampleId}`);

		// 	if (response.ok) {
		// 		const response = await response.json();
		// 		const url = response.url;
		// 		window.open(url, "_blank");
		// 	} else {
		// 		console.error("Error fetching custom URL:", response.statusText);
		// 	}
		// } catch (error) {
		// 	console.error("Error occurred:", error);
		// } finally {
		// 	setLoading(false);
		// }
	};

	return (
		<img
			src={JbrowseLogo}
			onClick={handleClick}
			className="h-5 cursor-pointer hover:bg-blue-300 rounded"
		></img>
	);
};

export default function Table({ state, setState, data, minimal }) {
	const [selectedHeaders, setSelectedHeaders] = useState([]);

	const handlePrev = () => {
		setState("page", (prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNext = () => {
		setState("page", (prevPage) => Math.min(prevPage + 1, Math.ceil(data.count / state.limit)));
	};

	const handleLimit = (number) => {
		setState("limit", number);
		setState("page", 1);
	};

	const getArrow = (head) => {
		const id = getID(headers, head);
		let index;
		if ((index = getID(state.sort, id)) > -1) {
			return (
				<ArrowDownIcon onClick={() => handleSort(id, index)} className="w-4 h-4 text-blue-500" />
			);
		} else if ((index = getID(state.sort, -1 * id)) > -1) {
			return (
				<ArrowUpIcon onClick={() => handleSort(-1 * id, index)} className="w-4 h-4 text-blue-500" />
			);
		} else {
			return (
				<ArrowsUpDownIcon onClick={() => handleSort(id, -1)} className="w-4 h-4 text-blue-500" />
			);
		}
	};

	// const totalPages = ;

	const handleSort = (id, index) => {
		if (index === -1) {
			setState("sort", (prevSort) => [...prevSort, id]);
		} else if (id >= 0) {
			setState("sort", (prevSort) => [
				...prevSort.slice(0, index),
				-1 * id,
				...prevSort.slice(index + 1),
			]);
		} else {
			setState("sort", (prevSort) => [...prevSort.slice(0, index), ...prevSort.slice(index + 1)]);
		}
	};

	const resetHeaders = (binaryStr) => {
		const cols = headers.filter((_, idx) => binaryStr[idx] === "1");
		return cols.sort((col1, col2) => properties[col1].order - properties[col2].order);
	};

	useEffect(() => {
		setSelectedHeaders(resetHeaders(state.cols));
	}, [state.cols]);
	return (
		<section className="flex-1 overflow-x-auto overflow-y-hidden h-full">
			<Card className="w-full h-full flex flex-col !rounded-none">
				<div className="flex-1 overflow-auto">
					<table className="w-full min-w-max table-auto text-left">
						<thead className="sticky top-0 bg-white z-10">
							<tr>
								{selectedHeaders.map((head) => {
									return (
										<th key={head} className="border-b border-gray-300 !p-4">
											<Tooltip content={properties[head].source}>
												<div className="flex items-center space-x-2">
													{head} {!minimal && getArrow(head)}
												</div>
											</Tooltip>
										</th>
									);
								})}
							</tr>
						</thead>
						{data.table && data.table.length > 0 && (
							<tbody>
								{data.table.map((row, rowIndex) => (
									<tr key={rowIndex}>
										{selectedHeaders.map((head) => {
											const columnID = getID(headers, head);
											const bgColor =
												bgColors[Math.floor(properties[head].order / 100)] +
												String((1 + (rowIndex % 2)) * 50);
											return (
												<td key={head} className={`!p-4 ${bgColor}`}>
													<Typography
														as="span"
														variant="small"
														color={row[columnID] === "" ? "red" : "blue-gray"}
														className={typeof row[columnID] === "boolean" ? "font-semibold" : ""}
													>
														{head === "Flowcell Position" ? (
															row[columnID] === "true" ? (
																"A"
															) : (
																"B"
															)
														) : typeof row[columnID] === "boolean" ? (
															row[columnID] ? (
																"True"
															) : (
																"False"
															)
														) : head === "Yield Q30 (Gb)" ? (
															(row[columnID] / Math.pow(10, 9)).toFixed(3)
														) : head === "Mean Q Score" ? (
															(row[columnID] / (2 * countTrueLanes(row))).toFixed(2)
														) : head === "Flowcell ID" ? (
															<>
																<div className="flex items-center space-x-4">
																	{row[columnID]} <HtmlIcon col={head} id={row[columnID]} />
																</div>
															</>
														) : head === "Submission ID" ? (
															<>
																<div className="flex items-center justify-between">
																	<div>{row[columnID]}</div>
																	<HtmlIcon col={head} id={row[columnID]} />
																</div>
															</>
														) : head === "LIMS ID" ? (
															<div className="flex items-center space-y-2">
																{row[columnID]}
																<div className="flex space-x-2 h-max">
																	{" "}
																	<JsonIcon sampleId={row[columnID]} />
																	<JbrowseIcon sampleId={row[columnID]} />
																</div>
															</div>
														) : (
															row[columnID] || "N/A"
														)}
													</Typography>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						)}
					</table>
					{data.table && data.table.length === 0 && (
						<div className="flex justify-center items-center h-full w-full">No data</div>
					)}
				</div>
				{!minimal && (
					<CardFooter className="flex justify-between items-center flex-shrink-0 bg-white">
						<Typography variant="h6" color="blue-gray">
							Page {state.page}{" "}
							<span className="font-normal text-gray-600">
								of {Math.ceil(data.count / state.limit)} (Total {data.count} rows)
							</span>
						</Typography>
						<Typography variant="h6" className="flex space-x-2 font-normal text-gray-600">
							<span>Showing</span>
							<ButtonGroup variant="outlined" size="sm" className="-mt-1">
								{[25, 50, 100, 200].map((limit) => {
									return (
										<Button
											key={limit}
											className={state.limit === limit ? "bg-black text-white" : ""}
											onClick={() => handleLimit(limit)}
										>
											{limit}
										</Button>
									);
								})}
							</ButtonGroup>
							<span>items per page</span>
						</Typography>
						<div className="flex gap-4">
							<Button
								variant="outlined"
								size="sm"
								className="flex items-center gap-1"
								onClick={handlePrev}
								disabled={state.page === 1}
							>
								<ChevronLeftIcon strokeWidth={3} className="h-3 w-3" />
								prev
							</Button>
							<Button
								variant="outlined"
								className="flex items-center gap-1"
								onClick={handleNext}
								disabled={state.page === Math.ceil(data.count / state.limit)}
							>
								next
								<ChevronRightIcon strokeWidth={3} className="h-3 w-3" />
							</Button>
						</div>
					</CardFooter>
				)}
			</Card>
		</section>
	);
}
