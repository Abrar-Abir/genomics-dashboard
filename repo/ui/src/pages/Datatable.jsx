import { useEffect, useState, useRef } from "react";
import Panel from "@components/datatable/Panel";
import Table from "@components/datatable/Table";
import Header from "@components/datatable/Header";
import { secureFetch } from "@lib/authService.js";

export default function Datatable({ state, setState, reset, query, setQuery, setSuffix }) {
	const [data, setData] = useState({});
	const [analytics, setAnalytics] = useState([]);
	// const [query, setQuery] = useState("");

	const setStateKey = (key) => (valOrUpdater) => {
		setState((prevState) => ({
			...prevState,
			[key]: typeof valOrUpdater === "function" ? valOrUpdater(prevState[key]) : valOrUpdater,
		}));
	};

	useEffect(() => {
		const params = new URLSearchParams();

		if (state.value !== "") {
			params.set(`${-1 * state.key}`, state.value);
		}

		if (state.filter.size > 0) {
			for (let [key, values] of state.filter) {
				params.set(key, JSON.stringify(values));
			}
		}

		if (Object.keys(state.range).length > 0) {
			Object.entries(state.range).forEach(([key, [start, end]]) => {
				if (start !== "") {
					params.set(`${key}>=`, start);
				}
				if (end !== "") {
					params.set(`${key}<=`, end);
				}
			});
		}

		const queryStr = params.toString();

		if (queryStr !== query) {
			setQuery(queryStr);
		}
	}, [state.filter, state.range, state.value]);

	useEffect(() => {
		async function fetchTable() {
			try {
				const params = new URLSearchParams({
					page: state.page,
					limit: state.limit,
					sort: JSON.stringify(state.sort),
				});
				const response = await secureFetch(`table?${params.toString()}&${query}`);
				setData(response);
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
				const response = await secureFetch(`analytics/table?${query}`);
				setAnalytics(response);

				for (let key in response) {
					if (!state.open.hasOwnProperty(key)) {
						state.open[key] = true;
					}
				}

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
					reset={reset}
				/>
			</div>
			<div className="flex flex-grow overflow-y-hidden overflow-x-auto">
				<Panel
					state={{ filter: state.filter, range: state.range, open: state.open }}
					setState={(key, val) => setStateKey(key)(val)}
					data={analytics}
				/>
				<Table
					state={{ page: state.page, limit: state.limit, cols: state.cols, sort: state.sort }}
					setState={(key, val) => setStateKey(key)(val)}
					data={data}
					minimal={false}
					setSuffix={setSuffix}
				/>
			</div>
		</div>
	);
}
