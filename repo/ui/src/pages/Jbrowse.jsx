import React, { useState } from "react";
import { Dialog } from "@material-tailwind/react";
import Upload from "../components/jbrowse/Upload";
import Header from "../components/jbrowse/Header";
export default function JBrowse({ suffix }) {
	// const jbrowseServerUrl = `http://172.32.79.51:8000`;
	// useEffect(() => {
	// 	const jbrowseServerUrl = `http://172.32.79.51:8000${suffix}`;
	// }, [suffix]);
	const reset = () => {
		console.log("reset");
	};
	const [show, setShow] = useState(false);
	return (
		<>
			<Header reset={reset} open={() => setShow(true)} />
			<div className="flex h-screen-minus-header">
				<Dialog open={show} style={{ height: "40rem" }} className="w-full">
					<Upload close={() => setShow(false)} />
				</Dialog>
				<div style={{ flex: 1, overflow: "auto" }}>
					<iframe
						src={`http://172.32.79.51:8000${suffix}`}
						title="JBrowse Genome Browser"
						style={{ width: "100%", height: "100%", border: "none" }}
					/>
				</div>
			</div>
		</>
	);
}
