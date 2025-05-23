import React from "react";
import { Dialog } from "@material-tailwind/react";
import FileExplorer from "../components/shared/Upload";
export default function JBrowse() {
	const jbrowseServerUrl = "http://172.32.79.51:5001";

	return (
		<div className="flex h-screen-minus-header">
			<Dialog open={true} style={{ height: "40rem" }} className="w-full">
				<FileExplorer />
			</Dialog>
			<div style={{ flex: 1, overflow: "auto" }}>
				<iframe
					src={jbrowseServerUrl}
					title="JBrowse Genome Browser"
					style={{ width: "100%", height: "100%", border: "none" }}
				/>
			</div>
		</div>
	);
}
