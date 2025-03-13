import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Navbar, Collapse, Typography, IconButton } from "@material-tailwind/react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from "@lib/sidebarConfig.jsx";
import logo from "@assets/logo_without_text.png";

export default function Header(props) {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen((cur) => !cur);

	const location = useLocation();

	useEffect(() => {
		window.addEventListener("resize", () => window.innerWidth >= 960 && setOpen(false));
	}, []);

	return (
		<Navbar shadow={false} fullWidth className="!bg-white py-0 rounded-none relative z-10">
			<div className="flex items-center justify-between">
				<img
					src={logo}
					alt="logo"
					className="h-9 w-auto ml-2 lg:hidden"
					onClick={props.toggleSideBar}
				/>
				<IconButton
					size="sm"
					variant="text"
					onClick={handleOpen}
					className="ml-auto inline-block text-gray-900 lg:hidden"
				>
					{open ? (
						<XMarkIcon className="h-6 w-6" strokeWidth={2} />
					) : (
						<Bars3Icon className="h-6 w-6" strokeWidth={2} />
					)}
				</IconButton>
			</div>
			<Collapse open={open}>
				<div className="p-3">
					{DASHBOARD_SIDEBAR_LINKS.map((item) => (
						<Link to={item.path} key={item.key} onClick={handleOpen}>
							<Typography
								as="li"
								variant="small"
								className={`p-2 py-3 font-medium rounded-md flex gap-x-2 items-center ${
									location.pathname === item.path
										? "!text-cyan-800 bg-blue-gray-100/30"
										: "text-gray-600"
								}`}
							>
								{item.icon}
								{item.label}
							</Typography>
						</Link>
					))}
				</div>
				<div className="grid grid-cols-4 mt-4">
					{DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((item) => (
						<Link to={item.path} key={item.key} onClick={handleOpen}>
							<Typography
								as="li"
								variant="small"
								className={`p-2 py-3 font-medium rounded-md flex flex-col items-center ${
									location.pathname === item.path
										? "!text-gray-900 bg-blue-gray-100/30"
										: "text-gray-500"
								}`}
							>
								{item.icon}
								{item.label}
							</Typography>
						</Link>
					))}
				</div>
			</Collapse>
		</Navbar>
	);
}
