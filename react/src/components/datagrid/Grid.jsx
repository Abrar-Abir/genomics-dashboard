import React from "react";
import { useState, useEffect } from "react";
import { BASE_URL, getID } from "@components/utils.js";
import Table from "@components/datatable/Table";
import schema from "@lib/schema.json";
import {
	Tooltip,
	Badge,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Button,
	// Typography,
} from "@material-tailwind/react";
const headers = schema.headers;
// import JsonPng from "@assets/json.png";
// import MultiQCLogo from "@assets/multiqc_logo_color.png";

// const JsonIcon = ({ baseURL, sample_id }) => (
// 	<img
// 		src={JsonPng}
// 		onClick={() => window.open(`${baseURL}/raw/database/${sample_id}`, "_blank")}
// 		className="ml-2 w-4 h-4 cursor-pointer hover:bg-blue-300 rounded"
// 	></img>
// );
// const HtmlIcon = ({ col, id }) => (
// 	<img
// 		src={MultiQCLogo}
// 		onClick={() =>
// 			window.open(
// 				col === "flowcell"
// 					? `https://pme.sidra.org/qc/home?path=sapipe/MultiQC/Flowcell/${id}/${id}.html`
// 					: `https://pme.sidra.org/qc/home?path=sapipe/MultiQC/submission/${
// 							id.split("_")[1]
// 					  }/${id}/${id}.html`,
// 				"_blank"
// 			)
// 		}
// 		className="ml-2 h-2.5 cursor-pointer hover:bg-blue-300 rounded"
// 	></img>
// );

export default function Grid({ state, setState, data }) {
	const [openSample, setOpenSample] = useState("");
	const closeModal = () => setOpenSample("");
	const [sampleData, setSampleData] = useState([]);

	const handleTogglePi = (pi) => {
		setState("openPi", (prevState) => ({
			...prevState,
			[pi]: !prevState[pi],
		}));
	};

	const handleToggleProject = (project) => {
		setState("openProject", (prevState) => ({
			...prevState,
			[project]: !prevState[project],
		}));
	};

	const handleToggleShow = (project) => {
		setState("show", (prevState) => {
			if (prevState.includes(project)) {
				return prevState.filter((p) => p !== project);
			}
			return [...prevState, project];
		});
	};

	// const bgColors = ["bg-blue-", "bg-teal-", "bg-blue-"];
	// const countTrueLanes = (row) => {
	// 	return Object.keys(row).filter((key) => key.startsWith("Lane ") && row[key] === true).length;
	// };

	const handleExport = (format) => {
		console.log(openSample);
		window.open(`${BASE_URL}/export/database/${format}?sample_name=${openSample}`, "_blank");
	};

	useEffect(() => {
		async function fetchData() {
			try {
				if (openSample !== "") {
					let url = `${BASE_URL}/table?${getID(headers, "Sample Name")}=[${JSON.stringify(
						openSample
					)}]`;
					const response = await fetch(url);
					if (!response.ok) {
						console.error("Server error:", dataResponse);
					} else {
						const result = await response.json();
						setSampleData(result.table);
					}
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData();
	}, [openSample]);

	// console.log(data);

	return (
		<div className="overflow-x-hidden h-full bg-white">
			<Dialog open={openSample != ""} size="xl" className="w-full !z-50 relative">
				<DialogHeader className="flex items-center justify-between">
					<div className="text-left">Data for Sample Name {openSample}</div>
					<div className="flex gap-2">
						<Button
							color="gray"
							variant="outlined"
							className="flex items-center gap-1 py-1 h-8"
							onClick={() => handleExport("raw")}
						>
							Raw
						</Button>
						<Button
							color="gray"
							variant="outlined"
							className="flex items-center gap-1 py-1 h-8"
							onClick={() => handleExport("csv")}
						>
							CSV
						</Button>
						<Button
							color="gray"
							variant="outlined"
							className="flex items-center gap-1 py-1 h-8"
							onClick={() => handleExport("tsv")}
						>
							TSV
						</Button>
						<Button
							color="gray"
							variant="outlined"
							className="flex items-center gap-1 py-1 h-8"
							onClick={() => handleExport("json")}
						>
							JSON
						</Button>
					</div>
				</DialogHeader>
				<DialogBody>
					<div className="flex-1 overflow-auto">
						{/* <table className="w-full min-w-max table-auto text-left">
							<thead className="sticky top-0 bg-white z-10">
								<tr>
									{sampleTableHeaders.map((head) => {
										return (
											<th key={head} className="border-b border-gray-300 !p-4">
												<Tooltip content={sampleTableHeadersProperties[head].source}>
													<div className="flex items-center space-x-2">
														<Typography
															color="blue-gray"
															variant="small"
															className="!font-bold"
														></Typography>
														{head}
													</div>
												</Tooltip>
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								{sampleData.map((row, rowIndex) => (
									<tr key={rowIndex}>
										{sampleTableHeaders.map((head) => {
											const bgColor =
												bgColors[sampleTableHeadersProperties[head].group] +
												String((1 + (rowIndex % 2)) * 50);
											return (
												<td key={head} className={`!p-4 ${bgColor}`}>
													<Typography
														variant="small"
														color={row[head] === "" ? "red" : "blue-gray"}
														className={typeof row[head] === "boolean" ? "font-semibold" : ""}
													>
														{head === "Flowcell Position" ? (
															row[head] === "true" ? (
																"A"
															) : (
																"B"
															)
														) : typeof row[head] === "boolean" ? (
															row[head] ? (
																"True"
															) : (
																"False"
															)
														) : head === "Yield Q30 (Gb)" ? (
															(row[head] / Math.pow(10, 9)).toFixed(3)
														) : head === "Mean Q Score" ? (
															(row[head] / (2 * countTrueLanes(row))).toFixed(2)
														) : head === "Flowcell ID" ? (
															<>
																<div className="flex items-center space-x-4">
																	{row[head]} <HtmlIcon id={row[head]} />
																</div>
															</>
														) : head === "Submission ID" ? (
															<>
																<div className="flex items-center justify-between">
																	<div>{row[head]}</div>
																	<HtmlIcon id={row[head]} />
																</div>
															</>
														) : head === "LIMS ID" ? (
															<>
																<div className="flex items-center space-x-4">
																	{row[head]} <JsonIcon baseURL={baseURL} sample_id={row[head]} />
																</div>
															</>
														) : (
															row[head] || "N/A"
														)}
													</Typography>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table> */}
						<Table
							state={{ limit: 25, sort: [], cols: headers, page: 1 }}
							setState={null}
							data={sampleData}
							minimal={true}
						/>
					</div>
				</DialogBody>

				<DialogFooter>
					<Button
						className="bg-gray-700 text-white hover:bg-gray-500 border-none"
						onClick={closeModal}
					>
						Close
					</Button>
				</DialogFooter>
			</Dialog>
			<table className="table-fixed border-collapse">
				<thead className="sticky top-0 z-30 bg-gray-300 border-y-4 border-white">
					<tr>
						<td></td>
						<td className="border-0"></td>
						{data.headers.map((key) => (
							<th
								key={key}
								className="text-center font-semibold"
								style={
									key === "Entity"
										? {
												width: "17rem",
												height: "9rem",

												border: "0.2rem solid white",
												borderLeft: "0rem solid white",
										  }
										: {
												writingMode: "vertical-rl",
												transform: "rotate(180deg)",
												width: "5rem",
												height: "9rem",
												border: "0.2rem solid white",
										  }
								}
							>
								{key}
							</th>
						))}
					</tr>
				</thead>
				{data?.grid === null ? (
					<tbody>
						<tr>
							<td className="bg-teal-400 text-center text-white" colSpan={data.headers.length + 3}>
								No result exist
							</td>
						</tr>
					</tbody>
				) : (
					<tbody className="overflow-y-auto">
						{Object.keys(data.grid).map((pi) => {
							const piData = data.grid[pi];
							return (
								<>
									<tr key={`pi-${pi}`} className="bg-teal-400 sticky z-20 top-[8.85rem]">
										{data.headers.map((key, id) => {
											return (
												<td
													key={`pi-${pi}-header-${key}`}
													onClick={key === "Entity" ? () => handleTogglePi(pi) : () => {}}
													className={
														"border-2 border-white px-4 text-white " +
														(key === "Entity"
															? "w-[31rem] text-left hover:bg-teal-300 hover:cursor-pointer"
															: key === "Count" || piData.header[id - 1] > 0
															? "w-[5rem] text-center bg-teal-600"
															: "w-[5rem]")
													}
													colSpan={key === "Entity" ? "3" : "1"}
												>
													{key === "Entity"
														? pi
														: key === "Count"
														? piData.header.reduce((acc, curr) => acc + curr, 0)
														: piData.header[id - 1] || ""}
												</td>
											);
										})}
									</tr>

									{state.openPi[pi] &&
										Object.keys(piData.projects).map((project) => {
											const projectData = piData.projects[project];

											return (
												<>
													<tr key={project} className="sticky z-20 top-[8.85rem]">
														<td className="bg-transparent w-[4rem]"></td>
														{/*  */}
														{data.headers.map((key, id) => (
															<td
																key={key}
																onClick={
																	key === "Entity" ? () => handleToggleProject(project) : () => {}
																}
																className={
																	"border-2 border-white px-4 text-white " +
																	(key === "Entity"
																		? "w-[27rem] text-left bg-light-blue-700 hover:bg-light-blue-500 hover:cursor-pointer"
																		: key === "Count" || projectData.header[id - 1] > 0
																		? "w-[5rem] text-center bg-light-blue-900"
																		: "w-[5rem] bg-light-blue-700")
																}
																colSpan={key === "Entity" ? "2" : "1"}
															>
																{key === "Entity"
																	? project
																	: key === "Count"
																	? projectData.header.reduce((acc, curr) => acc + curr, 0)
																	: projectData.header[id - 1] || ""}
															</td>
														))}
													</tr>

													{state.openProject[project] &&
														projectData.samples.map((sampleDict, index) =>
															sampleDict["Entity"] === "null" ? (
																<tr key={index} className="sticky z-20 top-[8.85rem]">
																	<td className="w-[4rem] bg-transparent"></td>

																	<td className="w-[10rem] bg-transparent"></td>

																	{data.headers.map((key, id) => (
																		<td
																			key={key}
																			onClick={
																				key === "Entity"
																					? () => handleToggleShow(project)
																					: () => {}
																			}
																			className={
																				"border-[0.2rem] border-white px-4 text-white bg-blue-gray-400 " +
																				(key === "Entity"
																					? "text-right hover:bg-blue-gray-300 font-medianbold hover:cursor-pointer w-[17rem]"
																					: key === "Count" || sampleDict.row[id - 1] > 0
																					? "text-center bg-blue-gray-600 w-[5rem]"
																					: "w-[5rem]")
																			}
																		>
																			{key === "Entity"
																				? "single entry samples"
																				: key === "Count"
																				? sampleDict.row.reduce((acc, curr) => acc + curr, 0)
																				: sampleDict.row[id - 1] || ""}
																		</td>
																	))}
																</tr>
															) : (
																<tr key={index} className="bg-white sticky top-[5rem]">
																	<td className="w-[4rem]"></td>
																	<td className="w-[10rem]"></td>

																	{data.headers.map((key, id) => (
																		<td
																			key={key}
																			onClick={
																				key === "Entity"
																					? () => setOpenSample(sampleDict[key])
																					: null
																			}
																			className={
																				"border-[0.2rem] border-white px-4  " +
																				(key === "Entity"
																					? "text-right text-black w-[17rem] bg-cyan-100 hover:bg-cyan-200 font-semibold hover:cursor-pointer" //
																					: sampleDict.row[id - 1] > 0 || key === "Count"
																					? "text-center w-[5rem] bg-cyan-600 hover:bg-cyan-400 text-white hover:cursor-pointer"
																					: "w-[5rem]")
																			}
																		>
																			{key === "Entity" ? (
																				"other" in sampleDict ? (
																					sampleDict?.other ? (
																						<Tooltip
																							content={
																								"sample was also sequenced under SDR " +
																								String(sampleDict.other)
																							}
																						>
																							<Badge color="blue">{sampleDict?.[key]}</Badge>
																						</Tooltip>
																					) : (
																						sampleDict?.[key]
																					)
																				) : (
																					sampleDict?.[key]
																				)
																			) : key === "Count" ? (
																				sampleDict.row.reduce((acc, curr) => acc + curr, 0)
																			) : (
																				sampleDict.row[id - 1] || ""
																			)}
																		</td>
																	))}
																</tr>
															)
														)}
												</>
											);
										})}
								</>
							);
						})}
					</tbody>
				)}
			</table>
		</div>
	);
}
