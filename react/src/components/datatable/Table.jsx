import {
	Button,
	ButtonGroup,
	Typography,
	Card,
	CardFooter,
	Tooltip,
} from "@material-tailwind/react";
import { useOutletContext } from "react-router-dom";

import { ArrowsUpDownIcon, ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";
import JsonPng from "@assets/json.png";
import MultiQCLogo from "@assets/multiqc_logo_color.png";
import JbrowseLogo from "@assets/jbrowse.png";

const bgColors = ["bg-blue-", "bg-teal-", "bg-blue-"];

export default function Table({
	getID,
	data,
	totalCount,
	page,
	setPage,
	limit,
	setLimit,
	tableHeaders,
	tableHeadersProperties,
	selectedColumns,
	columnsToSort,
	setColumnsToSort,
}) {
	const { baseURL } = useOutletContext();

	const JsonIcon = ({ sampleId }) => (
		<img
			src={JsonPng}
			onClick={() =>
				window.open(`${baseURL}/table?${getID(tableHeaders, "LIMS ID")}=${sampleId}`, "_blank")
			}
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
		const handleIconClick = async () => {
			try {
				const response = await fetch(`${baseURL}/jbrowse/${sampleId}`);

				if (response.ok) {
					const responseJson = await response.json();
					const customUrl = responseJson.customUrl;
					window.open(customUrl, "_blank");
				} else {
					console.error("Error fetching custom URL:", response.statusText);
				}
			} catch (error) {
				console.error("Error occurred:", error);
			} finally {
				setLoading(false);
			}
		};

		return (
			<img
				src={JbrowseLogo}
				onClick={handleIconClick}
				className="h-5 cursor-pointer hover:bg-blue-300 rounded"
			></img>
		);
	};

	const handlePrev = () => {
		setPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNext = () => {
		setPage((prevPage) => Math.min(prevPage + 1, Math.ceil(totalCount / limit)));
	};

	const handleLimit = (number) => {
		setLimit(number);
		setPage(1);
	};

	const resetTableHeaders = (binaryStr) => {
		const columnsSelected = tableHeaders.filter((col, index) => binaryStr[index] === "1");

		return columnsSelected.sort(
			(col1, col2) => tableHeadersProperties[col1].order - tableHeadersProperties[col2].order
		);
	};

	const [selectedHeaders, setSelectedHeaders] = useState(() => resetTableHeaders(selectedColumns));

	useEffect(() => {
		setSelectedHeaders(resetTableHeaders(selectedColumns));
	}, [selectedColumns]);

	const totalPages = Math.ceil(totalCount / limit);
	const countTrueLanes = (row) => {
		return Object.keys(row).filter((key) => key.startsWith("Lane ") && row[key] === true).length;
	};

	const handleSort = (id, index) => {
		if (index === -1) {
			setColumnsToSort((prevColumnsToSort) => [...prevColumnsToSort, id]);
		} else if (id >= 0) {
			setColumnsToSort((prevColumnsToSort) => [
				...prevColumnsToSort.slice(0, index),
				-1 * id,
				...prevColumnsToSort.slice(index + 1),
			]);
		} else {
			setColumnsToSort((prevColumnsToSort) => [
				...prevColumnsToSort.slice(0, index),
				...prevColumnsToSort.slice(index + 1),
			]);
		}
	};

	const getArrowIcon = (head) => {
		const id = getID(tableHeaders, head);
		let index;
		if ((index = getID(columnsToSort, id)) > -1) {
			return (
				<ArrowDownIcon onClick={() => handleSort(id, index)} className="w-4 h-4 text-blue-500" />
			);
		} else if ((index = getID(columnsToSort, -1 * id)) > -1) {
			return (
				<ArrowUpIcon onClick={() => handleSort(-1 * id, index)} className="w-4 h-4 text-blue-500" />
			);
		} else {
			return (
				<ArrowsUpDownIcon onClick={() => handleSort(id, -1)} className="w-4 h-4 text-blue-500" />
			);
		}
	};

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
											<Tooltip content={tableHeadersProperties[head].source}>
												<div className="flex items-center space-x-2">
													{head} {getArrowIcon(head)}
												</div>
											</Tooltip>
										</th>
									);
								})}
							</tr>
						</thead>
						<tbody>
							{data.map((row, rowIndex) => (
								<tr key={rowIndex}>
									{selectedHeaders.map((head) => {
										const columnID = getID(tableHeaders, head);
										const bgColor =
											bgColors[Math.floor(tableHeadersProperties[head].order / 100)] +
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
																<JsonIcon sample_id={row[columnID]} />
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
					</table>
					{!Array.isArray(data) && (
						<div className="flex justify-center items-center h-full w-full">No data</div>
					)}
				</div>
				<CardFooter className="flex justify-between items-center flex-shrink-0 bg-white">
					<Typography variant="h6" color="blue-gray">
						Page {page}{" "}
						<span className="font-normal text-gray-600">
							of {Math.ceil(totalCount / limit)} (Total {totalCount} rows)
						</span>
					</Typography>
					<Typography variant="h6" className="flex space-x-2 font-normal text-gray-600">
						<span>Showing</span>
						<ButtonGroup variant="outlined" size="sm" className="-mt-1">
							{[25, 50, 100, 200].map((limitValue) => {
								return (
									<Button
										key={limitValue}
										className={limit === limitValue ? "bg-black text-white" : ""}
										onClick={() => handleLimit(limitValue)}
									>
										{limitValue}
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
							disabled={page === 1}
						>
							<ChevronLeftIcon strokeWidth={3} className="h-3 w-3" />
							prev
						</Button>
						<Button
							variant="outlined"
							className="flex items-center gap-1"
							onClick={handleNext}
							disabled={page === totalPages}
						>
							next
							<ChevronRightIcon strokeWidth={3} className="h-3 w-3" />
						</Button>
					</div>
				</CardFooter>
			</Card>
		</section>
	);
}

// export default DataTable;
