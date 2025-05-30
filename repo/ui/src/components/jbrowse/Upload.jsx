import React, { useState, useEffect } from "react";
import {
	DocumentIcon,
	FolderIcon,
	ArrowLeftCircleIcon,
	ArrowPathIcon,
	CloudArrowUpIcon,
	XMarkIcon,
} from "@heroicons/react/24/solid";
import { secureFetch } from "../../lib/authService";

export default function Upload({ close }) {
	const [currentPath, setCurrentPath] = useState("/");
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState([]);
	const [uploading, setUploading] = useState(false);

	const loadDirectory = async (path = currentPath) => {
		setLoading(true);

		try {
			const data = await secureFetch(`ls${path}`);
			setItems(data);
			setCurrentPath(path);
		} catch (err) {
			setItems(err.message);
		} finally {
			setLoading(false);
		}
	};

	const upload = async () => {
		console.log(currentPath, selected);
		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const uploadPath = targetPath === "/" ? `/${file.name}` : `${targetPath}/${file.name}`;
			await secureFetch(`upload${uploadPath}`, {
				method: "POST",
				body: formData,
			});

			await loadDirectory(currentPath);
		} catch (err) {
			console.log(err.message);
		} finally {
			setUploading(false);
		}
	};

	const handleClick = (item) => {
		if (item.type == "directory") {
			const newPath = currentPath === "/" ? `/${item.name}` : `${currentPath}/${item.name}`;
			setSelected([]);
			loadDirectory(newPath);
		} else {
			setSelected((prevList) => {
				if (prevList.includes(item.name)) {
					return prevList.filter((name) => name !== item.name);
				} else {
					return [...prevList, item.name];
				}
			});
		}
	};

	const navigateUp = () => {
		if (currentPath !== "/") {
			const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
			setSelected([]);
			loadDirectory(parentPath);
		}
	};

	const formatFileSize = (bytes) => {
		if (!bytes) return "0 B";
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
	};

	useEffect(() => {
		loadDirectory("/");
	}, []);

	return (
		<div className="w-full h-full flex flex-col bg-white">
			<div className="border-b border-gray-400 p-4 flex-shrink-0">
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold text-gray-900">File Explorer</h2>
					<div className="ml-auto flex space-x-2">
						<button
							onClick={() => upload()}
							disabled={loading}
							className="p-2 bg-teal-500 text-white hover:bg-teal-300 rounded-lg"
						>
							Upload
						</button>
						<button
							onClick={() => close()}
							disabled={loading}
							className="p-2 bg-teal-500 text-white hover:bg-teal-300 rounded-lg"
						>
							Close
						</button>
					</div>
				</div>

				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-2 min-w-0">
						<button
							onClick={navigateUp}
							disabled={currentPath === "/" || loading}
							className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<ArrowLeftCircleIcon className="w-6 h-6" />
						</button>
						<div className="flex-1 overflow-x-auto">
							<span className="text-base text-gray-800 font-mono bg-gray-50 px-2 py-1 rounded whitespace-nowrap">
								{currentPath}
							</span>
						</div>
					</div>
					<button
						onClick={() => loadDirectory(currentPath)}
						disabled={loading}
						className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
					>
						<ArrowPathIcon className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto">
				{loading ? (
					<div className="flex items-center justify-center h-full text-gray-500">
						<ArrowPathIcon className="w-6 h-6 animate-spin mr-2" />
						Loading...
					</div>
				) : !Array.isArray(items) ? (
					<div className="flex items-center justify-center h-full text-gray-500">
						<p>{items}</p>
					</div>
				) : (
					<div className="p-4">
						<div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3 pb-4">
							{items.map((item, index) => (
								<div
									key={index}
									className={`flex items-start gap-3 p-3 border ${
										item.type === "directory"
											? "border-teal-600 hover:bg-teal-100"
											: "border-blue-gray-600 hover:bg-blue-gray-100"
									} ${
										item.type === "file" && selected.includes(item.name) ? "bg-teal-100" : ""
									} rounded-lg transition-all cursor-pointer`}
									onClick={() => handleClick(item)}
								>
									<div className="flex-shrink-0 mt-1">
										{item.type === "directory" ? (
											<FolderIcon className="w-5 h-5 text-teal-500" />
										) : (
											<DocumentIcon className="w-5 h-5 text-blue-gray-500" />
										)}
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex justify-between items-center mb-1">
											<p className="text-sm font-medium text-gray-900 truncate" title={item.name}>
												{item.name}
											</p>
											{item.size && (
												<p className="text-xs text-gray-500 flex-shrink-0">
													{formatFileSize(item.size)}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
