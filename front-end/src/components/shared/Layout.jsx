import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
	// for toggling expand/collapse the main sidebar on the left
	const [openSideBar, setOpenSideBar] = useState(false);
	const toggleSideBar = () => {
		setOpenSideBar(!openSideBar);
	};

	const baseURL =
		process.env.NODE_ENV === "production"
			? "http://172.32.79.51:5001"
			: //   ? "https://genomics-dashboard-flask.onrender.com"
			  "http://localhost:5001";

	const [selectedFilterGrid, setSelectedFilterGrid] = useState({});

	return (
		<div className="h-screen w-screen overflow-hidden flex">
			<Sidebar openSideBar={openSideBar} toggleSideBar={toggleSideBar} />
			<div className="flex flex-col flex-1 overflow-auto">
				<Header
					openSideBar={openSideBar}
					toggleSideBar={toggleSideBar}
				/>
				<div className="flex-1 min-h-0 max-h-full w-full bg-gray-300/80 z-0 overflow-x-hidden ">
					<Outlet
						context={{
							baseURL,
							selectedFilterGrid,
							setSelectedFilterGrid,
						}}
					/>
				</div>
			</div>
		</div>
	);
}

export default Layout;
