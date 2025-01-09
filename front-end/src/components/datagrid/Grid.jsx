import React from "react";
import { Tooltip, Badge } from "@material-tailwind/react";

const AccordionTable = ({
	data,
	tableHeaders,
	setShowProject,
	openPi,
	setOpenPi,
	openProject,
	setOpenProject,
}) => {
	const handleTogglePi = (pi) => {
		setOpenPi((prevState) => ({
			...prevState,
			[pi]: !prevState[pi],
		}));
	};

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
				<thead className="sticky top-0 z-30 bg-gray-300 ">
					<tr>
						<td></td>
						<td></td>
						{tableHeaders.map((key) => (
							<th
								key={key}
								className="text-center font-semibold"
								style={
									key === "Entity"
										? {
												width: "17rem",
												borderLeft: "0rem solid",
												border: "0.2rem solid white",
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
				{data === null ? (
					<tbody>
						<tr>
							<td className="bg-teal-400 text-center text-white" colSpan={tableHeaders.length + 3}>
								No result exist
							</td>
						</tr>
					</tbody>
				) : (
					<tbody className="overflow-y-auto">
						{Object.keys(data).map((pi) => {
							const piData = data[pi];
							return (
								<>
									<tr key={pi} className="bg-teal-400 sticky z-20 top-[8.85rem]">
										{tableHeaders.map((key, id) => {
											return (
												<td
													key={key}
													onClick={key === "Entity" ? () => handleTogglePi(pi) : () => {}}
													className={
														"border-2 border-white px-4 text-white " +
														(key === "Entity"
															? "w-[23rem] text-right hover:bg-teal-300 hover:cursor-pointer"
															: key === "Count" || piData.header[id - 1] > 0
															? "w-[5rem] text-center bg-teal-600 hover:bg-teal-400 hover:cursor-pointer"
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

									{openPi[pi] &&
										Object.keys(piData.projects).map((project) => {
											const projectData = piData.projects[project];

											return (
												<>
													<tr key={project} className="sticky z-20 top-[8.85rem]">
														<td className="bg-transparent w-[3rem]"></td>
														{tableHeaders.map((key, id) => (
															<td
																key={key}
																onClick={
																	key === "Entity" ? () => handleToggleProject(project) : () => {}
																}
																className={
																	"border-2 border-white px-4 text-white " +
																	(key === "Entity"
																		? "w-[20rem] text-right bg-light-blue-700 hover:bg-light-blue-500 hover:cursor-pointer"
																		: key === "Count" || projectData.header[id - 1] > 0
																		? "w-[5rem] text-center bg-light-blue-900 hover:bg-light-blue-700 hover:cursor-pointer"
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

													{openProject[project] &&
														projectData.samples.map((sampleDict, index) =>
															sampleDict["Entity"] === "null" ? (
																<tr key={index} className="sticky z-20 top-[8.85rem]">
																	<td className="w-[3rem] bg-transparent"></td>
																	<td className="w-[3rem] bg-transparent"></td>
																	{tableHeaders.map((key, id) => (
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
																					? "text-center bg-blue-gray-600 hover:bg-blue-gray-400 hover:cursor-pointer w-[5rem]"
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
																<tr key={index} className="bg-white">
																	<td className="w-[3rem]"></td>
																	<td className="w-[3rem]"></td>
																	{tableHeaders.map((key, id) => (
																		<td
																			key={key}
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
};

export default AccordionTable;
