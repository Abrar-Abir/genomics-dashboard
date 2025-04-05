import React from "react";
import { useState, useEffect } from "react";
import { getID, FORMATS } from "@components/utils.js";
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
} from "@material-tailwind/react";
import { secureFetch, secureOpen } from "../../lib/authService";
// const headers = schema.headers;
const formats = ["raw", "csv", "tsv", "json"];

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

	const handleExport = (format) => {
		secureOpen(
			`export/table/${format}?${getID(schema.headers, "Sample Name")}=[${openSample}]`,
			format
		);
	};

	useEffect(() => {
		async function fetchData() {
			try {
				if (openSample !== "") {
					let url = `/table?${getID(schema.headers, "Sample Name")}=[${JSON.stringify(
						openSample
					)}]`;
					const response = await secureFetch(url);
					setSampleData(response);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		}
		fetchData();
	}, [openSample]);

	return (
		<div className="overflow-x-hidden h-full bg-white">
			<Dialog open={openSample != ""} size="xl" className="w-full !z-50 relative">
				<DialogHeader className="flex items-center justify-between">
					<div className="text-left">Data for Sample Name {openSample}</div>
					<div className="flex gap-2">
						{FORMATS.map((format) => {
							return (
								<Button
									key={format}
									color="gray"
									variant="outlined"
									className="flex items-center gap-1 py-1 h-8"
									onClick={() => handleExport(format)}
								>
									{format}
								</Button>
							);
						})}
					</div>
				</DialogHeader>
				<DialogBody>
					<Table
						state={{ limit: 25, sort: [], cols: schema.binaryStr, page: 1 }}
						setState={null}
						data={sampleData}
						minimal={true}
					/>
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
								<React.Fragment key={`pi-fragment-${pi}`}>
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
												<React.Fragment key={`project-fragment-${project}`}>
													<tr key={project} className="sticky z-20 top-[8.85rem]">
														<td className="bg-transparent w-[4rem]"></td>
														{data.headers.map((key, id) => (
															<td
																key={`project-${project}-${key}`}
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
																<tr
																	key={`null-sample-${project}-${index}`}
																	className="sticky z-20 top-[8.85rem]"
																>
																	<td className="w-[4rem] bg-transparent"></td>
																	<td className="w-[10rem] bg-transparent"></td>
																	{data.headers.map((key, id) => (
																		<td
																			key={`null-sample-${project}-${index}-${key}`}
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
																<tr
																	key={`sample-${project}-${index}`}
																	className="bg-white sticky top-[5rem]"
																>
																	<td className="w-[4rem]"></td>
																	<td className="w-[10rem]"></td>
																	{data.headers.map((key, id) => (
																		<td
																			key={`sample-${project}-${index}-${key}`}
																			onClick={
																				key === "Entity"
																					? () => setOpenSample(sampleDict[key])
																					: null
																			}
																			className={
																				"border-[0.2rem] border-white px-4  " +
																				(key === "Entity"
																					? "text-right text-black w-[17rem] bg-cyan-100 hover:bg-cyan-200 font-semibold hover:cursor-pointer"
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
												</React.Fragment>
											);
										})}
								</React.Fragment>
							);
						})}
					</tbody>
				)}
			</table>
		</div>
	);
}
