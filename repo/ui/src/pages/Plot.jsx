import { useState, useEffect } from "react";
import { secureFetch } from "@lib/authService.js";

export default function Plot({ query }) {
	const [htmlContent, setHtmlContent] = useState("");

	useEffect(() => {
		async function fetchPlotData() {
			try {
				const plotData = await secureFetch(`plot/?${query}`);
				setHtmlContent(plotData.html);
			} catch (error) {
				console.error("Error fetching plot data:", error);
			}
		}
		fetchPlotData();
	}, [query]);

	return (
		<div className="flex h-screen-minus-header">
			<div style={{ flex: 1, overflow: "auto" }}>
				<div
					style={{ width: "100%", height: "100%", overflow: "auto" }}
					dangerouslySetInnerHTML={{ __html: htmlContent }}
				/>
			</div>
		</div>
	);
}
