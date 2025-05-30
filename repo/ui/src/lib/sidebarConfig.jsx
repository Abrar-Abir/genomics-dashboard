import { ChartBarIcon } from "@heroicons/react/24/outline";
import {
	PresentationChartBarIcon,
	// UserCircleIcon,
	// Cog6ToothIcon,
	InboxIcon,
	PowerIcon,
	TableCellsIcon,
	ViewColumnsIcon,
} from "@heroicons/react/24/solid";
import JbrowseLogo from "@assets/jbrowseIcon.png";
const iconSize = "h-6 w-6";

export const DASHBOARD_SIDEBAR_LINKS = [
	{
		key: "dashboard",
		label: "Dashboard",
		path: "/dashboard",
		icon: <PresentationChartBarIcon className={iconSize} />,
	},
	{
		key: "datatable",
		label: "Datatable",
		path: "/datatable",
		icon: <TableCellsIcon className={iconSize} />,
	},
	{
		key: "datagrid",
		label: "Datagrid",
		path: "/datagrid",
		icon: <ViewColumnsIcon className={iconSize} />,
	},
	// {
	// 	key: "plot",
	// 	label: "Plot",
	// 	path: "/plot",
	// 	icon: <ChartBarIcon className={iconSize} />,
	// },
	{
		key: "jbrowse",
		label: "Jbrowse",
		path: "/jbrowse",
		icon: <img src={JbrowseLogo} className={iconSize} />,
	},
];

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS = [
	// {
	// 	key: "inbox",
	// 	label: "Inbox",
	// 	icon: <InboxIcon className={iconSize} />,
	// 	badge: "",
	// },
	// {
	// 	key: "profile",
	// 	label: "Profile",
	// 	icon: <UserCircleIcon className={iconSize} />,
	// },
	// {
	// 	key: "settings",
	// 	label: "Settings",
	// 	icon: <Cog6ToothIcon className={iconSize} />,
	// },
	{
		key: "logout",
		label: "Logout",
		path: "/login",
		icon: <PowerIcon className={iconSize} />,
	},
];
