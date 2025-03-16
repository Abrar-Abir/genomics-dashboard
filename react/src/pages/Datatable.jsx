import { useEffect, useState, useRef } from "react";
import Panel from "@components/datatable/Panel";
import Table from "@components/datatable/Table";
import Header from "@components/datatable/Header";
import { BASE_URL } from "@components/utils.js";

export default function Datatable({ state, setState, reset, headers, properties }) {
	const [data, setData] = useState({});
	const [analytics, setAnalytics] = useState([]);
	const [query, setQuery] = useState("");
	// const [prevQuery, setPrevQuery] = useState("");

	const setStateKey = (key) => (valOrUpdater) => {
		setState((prevState) => ({
			...prevState,
			[key]: typeof valOrUpdater === "function" ? valOrUpdater(prevState[key]) : valOrUpdater,
		}));
	};

	useEffect(() => {
		let queryStr = "";
		if (state.value !== "") {
			queryStr += `&${-1 * state.key}=${state.value}`;
		}

		if (state.filter.size > 0) {
			for (let [key, values] of state.filter) {
				queryStr += `&${key}=${JSON.stringify(values)}`;
			}
		}
		if (Object.keys(state.range).length > 0) {
			Object.entries(state.range).forEach(([key, [start, end]]) => {
				if (start !== "") {
					queryStr += `&${key}>=${start}`;
				}
				if (end !== "") {
					queryStr += `&${key}<=${end}`;
				}
			});
		}
		if (queryStr !== query) {
			setQuery(queryStr);
		}
	}, [state.filter, state.range, state.value]);

	useEffect(() => {
		async function fetchTable() {
			try {
				const api = `${BASE_URL}/table?page=${state.page}&limit=${
					state.limit
				}&sort=${JSON.stringify(state.sort)}${query}`;
				const response = await fetch(api);

				if (!response.ok) throw new Error(`Table Data Fetch Failed: ${response.statusText}`);

				const result = await response.json();
				setData(result);
			} catch (error) {
				console.error("Error fetching table data:", error);
			}
		}
		fetchTable();
	}, [state.page, state.limit, state.sort, query]);

	const prevQueryRef = useRef("");

	useEffect(() => {
		async function fetchAnalytics() {
			try {
				const api = `${BASE_URL}/analytics/table?${query.slice(1)}`;
				const response = await fetch(api);
				if (!response.ok) throw new Error(`Filter Panel Data Fetch Failed: ${response.statusText}`);
				const result = await response.json();
				setAnalytics(result);
				prevQueryRef.current = query;
			} catch (error) {
				console.error("Error fetching filter panel data:", error);
			}
		}

		if (prevQueryRef.current !== query || analytics.length === 0) {
			fetchAnalytics();
		}
	}, [query, analytics.length]);

	return (
		<div className="flex flex-col h-screen overflow-y-hidden">
			<div className="flex-shrink-0">
				<Header
					state={{ query: query, key: state.key, cols: state.cols, sort: state.sort }}
					setState={(key, val) => setStateKey(key)(val)}
					headers={headers}
					reset={reset}
				/>
			</div>
			<div className="flex flex-grow overflow-y-hidden overflow-x-auto">
				<Panel
					state={{ filter: state.filter, range: state.range, open: state.open }}
					setState={(key, val) => setStateKey(key)(val)}
					data={analytics}
					headers={headers}
				/>
				<Table
					state={{ page: state.page, limit: state.limit, cols: state.cols, sort: state.sort }}
					setState={(key, val) => setStateKey(key)(val)}
					data={data}
					headers={headers}
					properties={properties}
				/>
			</div>
		</div>
	);
}
