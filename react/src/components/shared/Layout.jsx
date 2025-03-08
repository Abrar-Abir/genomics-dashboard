import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
	const [openSideBar, setOpenSideBar] = useState(false);
	const toggleSideBar = () => {
		setOpenSideBar(!openSideBar);
	};

	return (
		<div className="h-screen w-screen overflow-hidden flex">
			<Sidebar openSideBar={openSideBar} toggleSideBar={toggleSideBar} />
			<div className="flex flex-col flex-1 overflow-auto">
				<Header openSideBar={openSideBar} toggleSideBar={toggleSideBar} />
				<div className="flex-1 min-h-0 max-h-full w-full bg-gray-300/80 z-0 overflow-x-hidden ">
					<Outlet />
				</div>
			</div>
		</div>
	);
}

export default Layout;
