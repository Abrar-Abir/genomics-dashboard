import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
	const [open, setOpen] = useState(false);

	return (
		<div className=" flex flex-col lg:flex-row h-screen overflow-hidden">
			<Sidebar openSide={open} setOpenSide={setOpen} />
			<div className="flex-auto h-full w-auto bg-gray-300/80 z-0 overflow-auto">
				<Outlet />
			</div>
		</div>
	);
}
