import {
	Typography,
	List,
	ListItem,
	ListItemPrefix,
	ListItemSuffix,
	Chip,
	Navbar,
	Collapse,
	IconButton,
} from "@material-tailwind/react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from "@lib/sidebarConfig.jsx";
import logo from "@assets/logo_without_text.png";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export default function Sidebar({ openSide, setOpenSide }) {
	const [openNav, setOpenNav] = useState(false);
	const location = useLocation();
	const currentPath = location.pathname;

	return (
		<>
			{/* navigation bar for small screen */}
			<div className="lg:hidden">
				<Navbar shadow={false} fullWidth className="py-0 rounded-none !bg-white sticky top-0 z-10 ">
					<div className="flex items-center justify-between" onClick={() => setOpenNav(!openNav)}>
						<img src={logo} alt="logo" className="h-9 w-auto ml-2" />
						<IconButton
							size="sm"
							variant="text"
							className="ml-auto inline-block text-gray-900 lg:hidden"
						>
							{openNav ? (
								<XMarkIcon className="h-6 w-6" strokeWidth={2} />
							) : (
								<Bars3Icon className="h-6 w-6" strokeWidth={2} />
							)}
						</IconButton>
					</div>
					<Collapse open={openNav}>
						<div className="p-3">
							{DASHBOARD_SIDEBAR_LINKS.map((item) => (
								<Link to={item.path} key={item.key} onClick={() => setOpenNav(false)}>
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
								<Link to={item.path} key={item.key} onClick={() => setOpenNav(false)}>
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
			</div>
			{/* sidebar for large screen */}
			<div className="h-screen hidden border-r-2 border-gray-300/80 lg:block">
				<div
					className={`flex flex-col rounded-none h-full p-2 pr-0 transition-all duration-300 ${
						openSide ? "w-48" : "w-20"
					}`}
				>
					<div
						className={` relative flex p-1 pr-0 cursor-pointer items-center`}
						onClick={() => setOpenSide(!openSide)}
					>
						<img src={logo} alt="logo" className="h-8 w-auto ml-2" />
						{openSide && (
							<Typography variant="h5" color="blue-gray" className="ml-4">
								Navigation
							</Typography>
						)}
					</div>
					<div className="flex flex-col h-full">
						<List className="w-full !min-w-0 !pr-0">
							{DASHBOARD_SIDEBAR_LINKS.map((item) => (
								<ListItem
									key={item.key}
									className={`p-0 rounded-none rounded-l-lg ${
										currentPath === item.path ? "bg-gray-300/80 text-cyan-800" : ""
									}`}
									ripple={false}
								>
									<Link
										to={item.path}
										className="w-full h-full flex items-center justify-start m-3 my-2"
									>
										<ListItemPrefix>{item.icon}</ListItemPrefix>
										{openSide ? item.label : ""}
									</Link>
								</ListItem>
							))}
						</List>
						<div className="mt-auto">
							<hr className="border-blue-gray-200 mx-auto w-full" />
							<List className="w-full !min-w-0 !pr-0">
								{DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((item) => (
									<ListItem
										key={item.key}
										className={`p-0 rounded-none rounded-l-lg ${
											currentPath === item.path ? "bg-gray-300/80 text-cyan-800" : ""
										}`}
										ripple={false}
									>
										<Link
											to={item.path}
											className="w-full h-full flex items-center justify-start m-3 "
										>
											<ListItemPrefix>{item.icon}</ListItemPrefix>
											{openSide ? item.label : ""}
											{openSide && item.badge && (
												<ListItemSuffix>
													<Chip
														value={item.badge}
														size="sm"
														variant="ghost"
														color="blue-gray"
														className="rounded-full"
													/>
												</ListItemSuffix>
											)}
										</Link>
									</ListItem>
								))}
							</List>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
