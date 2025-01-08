import React, { useState } from "react";
import { Tooltip, Badge } from "@material-tailwind/react";

const AccordionTable = ({ data, tableHeaders, setShowProject }) => {
	const [openPi, setOpenPi] = useState({});
	const handleTogglePi = (pi) => {
		setOpenPi((prevState) => ({
			...prevState,
			[pi]: !prevState[pi],
		}));
	};
	const [openProject, setOpenProject] = useState({});
	const handleToggleProject = (project) => {
		setOpenProject((prevState) => ({
			...prevState,
			[project]: !prevState[project],
		}));
	};

	const handleToggleShow = (project) => {
		setShowProject((prevState) => {
			if (prevState.includes(project)) {
				return prevState.filter((p) => p !== project);
			}
			return [...prevState, project];
		});
	};

	return (
		<div className="overflow-x-hidden h-full bg-white">
			<table className="table-fixed border-collapse">
				<thead className=" sticky top-0 z-30 bg-white">
					<tr>
						<td></td>
						<td></td>
						{tableHeaders.map((key) => (
							<th
								key={key}
								className=" text-center font-semibold"
								style={
									key === "Entity"
										? { width: "17rem", border: "0.20rem solid white" }
										: {
												writingMode: "vertical-rl",
												transform: "rotate(180deg)",
												width: "5rem",
												height: "9rem",
												border: "0.20rem solid white",
										  }
								}
							>
								{key === "count" ? "Count" : key}
							</th>
						))}
					</tr>
				</thead>

				<tbody className="overflow-y-auto">
					{Object.keys(data).map((pi) => {
						const piData = data[pi];
						return (
							<>
								<tr key={pi} className="bg-teal-400 sticky z-20 top-[9rem]">
									{tableHeaders.map((key) => (
										<td
											key={key}
											onClick={key === "Entity" ? () => handleTogglePi(pi) : () => {}}
											className={
												key === "Entity"
													? "px-4 text-right text-white font-normal  hover:bg-teal-300 hover:cursor-pointer"
													: // : key === "count"
													// ? "px-4 text-center bg-blue-400 hover:bg-blue-300 text-white font-normal hover:cursor-pointer"
													piData.header[key] > 0
													? "px-4 text-center bg-teal-600 hover:bg-teal-400 text-white font-normal hover:cursor-pointer"
													: "px-4 text-center text-white"
											}
											style={
												key === "Entity"
													? {
															width: "23rem",
															border: "0.20rem solid white",
													  }
													: {
															width: "5rem",
															border: "0.20rem solid white",
													  }
											}
											colSpan={key === "Entity" ? "3" : "1"}
										>
											{key === "Entity" ? pi : piData.header[key] || ""}
										</td>
									))}
								</tr>

								{openPi[pi] &&
									Object.keys(piData.projects).map((project) => {
										const projectData = piData.projects[project];
										return (
											<>
												<tr key={project} className="bg-light-blue-700 sticky z-10 top-[10.75rem]">
													<td style={{ width: "3rem" }} className="bg-white"></td>
													{tableHeaders.map((key) => (
														<td
															key={key}
															onClick={
																key === "Entity" ? () => handleToggleProject(project) : () => {}
															}
															className={
																key === "Entity"
																	? "px-4 text-right text-white hover:bg-light-blue-500 hover:cursor-pointer"
																	: // : key === "count"
																	// ? "px-4 text-center bg-blue-400 hover:bg-blue-300 text-white hover:cursor-pointer"
																	projectData.header[key] > 0
																	? "px-4 text-center bg-light-blue-900 hover:bg-light-blue-700 text-white hover:cursor-pointer"
																	: "px-4 text-center"
															}
															style={
																key === "Entity"
																	? {
																			width: "20rem",
																			border: "0.20rem solid white",
																	  }
																	: {
																			width: "5rem",
																			border: "0.20rem solid white",
																	  }
															}
															colSpan={key === "Entity" ? "2" : "1"}
														>
															{key === "Entity" ? project : projectData.header[key] || ""}
														</td>
													))}
												</tr>

												{openProject[project] &&
													projectData.samples.map((sampleDict, index) =>
														sampleDict["Entity"] === "null" ? (
															<tr
																key={index}
																className="bg-blue-gray-400  sticky z-5 top-[12.5rem]"
															>
																<td style={{ width: "3rem" }} className="bg-white"></td>
																<td style={{ width: "3rem" }} className="bg-white"></td>
																{tableHeaders.map((key) => (
																	<td
																		key={key}
																		onClick={
																			key === "Entity" ? () => handleToggleShow(project) : () => {}
																		}
																		className={
																			key === "Entity"
																				? "px-4 py-2 text-right text-white hover:bg-blue-gray-300 font-medianbold hover:cursor-pointer"
																				: // : key === "count"
																				// ? "px-4 py-2 text-center bg-blue-400 hover:bg-blue-300 text-white hover:cursor-pointer"
																				sampleDict[key] > 0
																				? "px-4 py-2 text-center bg-blue-gray-600 hover:bg-blue-gray-400 text-white hover:cursor-pointer"
																				: "px-4 py-2 text-center "
																		}
																		style={
																			key === "Entity"
																				? {
																						width: "17rem",
																						border: "0.20rem solid white",
																				  }
																				: {
																						width: "5rem",
																						border: "0.20rem solid white",
																				  }
																		}
																	>
																		{key === "Entity"
																			? "single entry samples"
																			: sampleDict?.[key] || ""}
																	</td>
																))}
															</tr>
														) : (
															<tr key={index} className="bg-white">
																<td style={{ width: "3rem" }} className="bg-white"></td>
																<td style={{ width: "3rem" }} className="bg-white"></td>
																{tableHeaders.map((key) => (
																	<td
																		key={key}
																		className={
																			key === "Entity"
																				? "px-4 py-2 text-right text-black bg-green-50 hover:bg-green-100 font-semibold hover:cursor-pointer"
																				: // : key === "count"
																				// ? "px-4 py-2 text-center bg-blue-400 hover:bg-blue-300 text-white hover:cursor-pointer"
																				sampleDict[key] > 0
																				? "px-4 py-2 text-center bg-green-400 hover:bg-green-300 text-white hover:cursor-pointer"
																				: "px-4 py-2 text-center "
																		}
																		style={
																			key === "Entity"
																				? {
																						width: "17rem",
																						border: "0.20rem solid white",
																				  }
																				: {
																						width: "5rem",
																						border: "0.20rem solid white",
																				  }
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
																		) : (
																			sampleDict?.[key] || ""
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
				{/* </div> */}
			</table>
		</div>
	);
};

export default AccordionTable;
