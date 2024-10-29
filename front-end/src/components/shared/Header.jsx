import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Button,
  Navbar,
  Collapse,
  Typography,
  IconButton,
  Breadcrumbs,
} from "@material-tailwind/react";

import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  ChevronDoubleRightIcon,
  AdjustmentsVerticalIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import {
  DASHBOARD_SIDEBAR_LINKS,
  DASHBOARD_SIDEBAR_BOTTOM_LINKS,
} from "@lib/sidebarConfig.jsx";
import logo from "@assets/logo_without_text.png";

import SearchBar from "./SearchBar";

import Datepicker from "react-tailwindcss-datepicker";
import require$$0 from "dayjs";
const DATE_FORMAT = "YYYY-MM-DD";
function formatDate(date, format = DATE_FORMAT) {
  return date.format(format);
}

const baseURL =
process.env.NODE_ENV === "production"
  ? "http://172.32.79.51:5001"
  : "http://127.0.0.1:5001";

// render the path name of a page on the header, based on the URL
const generateBreadcrumbs = (location) => {
  const pathname = location.pathname;
  if (pathname === "/") {
    return (
      <Link to="/" className="opacity-60 font-bold hover:text-teal-800/70">
        Dashboard
      </Link>
    );
  }
  const pathnames = pathname.split("/").filter((x) => x);
  return pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    return (
      <Link
        key={to}
        to={to}
        className="opacity-80 font-bold hover:text-teal-800/70"
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Link>
    );
  });
};

export default function Header(props) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen((cur) => !cur);

  const location = useLocation();

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpen(false)
    );
  }, []);
  
  return (
    <Navbar
      shadow={false}
      fullWidth
      className="!bg-white py-3 rounded-none relative z-10"
    >
      <ChevronDoubleRightIcon
        alt="toggle sidebar expand/collapse"
        className={`hidden lg:flex absolute -left-1 top-4 text-black h-6 w-6 stroke-black stroke-1 cursor-pointer bg-gray-200  p-1 transition-all duration-300 hover:bg-gray-300 ${
          props.openSideBar ? "rotate-180 rounded-l-md" : "rounded-r-md"
        }`}
        onClick={props.toggleSideBar}
      />

      <div className="flex items-center justify-between">
        <img
          src={logo}
          alt="logo"
          className="h-9 w-auto ml-2 lg:hidden"
          onClick={props.toggleSideBar}
        />

        {!open && (
          <div>
            <Breadcrumbs className="!bg-transparent">
              {generateBreadcrumbs(location)}
            </Breadcrumbs>
          </div>
        )}
		<div className="flex space-x-4 items-end">
          {location.pathname === "/database" && (
				<SearchBar></SearchBar>
			)}
		</div>
        <div className="flex space-x-4 items-end">
          {location.pathname === "/database" && (
            <div className="flex items-center gap-4">
              <Button
                color="gray"
                variant="outlined"
                className="flex items-center gap-1 py-1 h-8"
                onClick={props.toggleDatabaseFilterPanel}
              >
                view
                <AdjustmentsVerticalIcon className="w-4 h-4 text-gray-900" />
              </Button>
			  <Button
                color="gray"
                variant="outlined"
                className="flex items-center gap-1 py-1 h-8"
                onClick={props.toggleDatabaseFilterPanel}
              >
                filter
                <AdjustmentsVerticalIcon className="w-4 h-4 text-gray-900" />
              </Button>
              <Button
                color="gray"
                variant="outlined"
                className="flex items-center gap-1 py-1 h-8"
              >
                <a href={`${baseURL}/export`}> export </a>  
                <ArrowDownTrayIcon className="w-4 h-4 text-gray-900" />
              </Button>
            </div>
          )}
          {location.pathname === "/" && (
            <Datepicker
              displayFormat={"DD/MM/YYYY"}
              showShortcuts={true}
              showFooter={true}
              separator={"---"}
              maxDate={new Date()}
              primaryColor={"teal"}
              value={props.dateRange}
              onChange={props.handleDateRangeChange}
              inputClassName="relative transition-all duration-300 h-full pl-4 pr-14 w-full border border-gray-300 rounded-lg tracking-wide text-xs font-medium placeholder-gray-400 bg-white focus:ring disabled:opacity-40 disabled:cursor-not-allowed"
              containerClassName="relative w-60 text-gray-700 h-8"
              toggleClassName="absolute bg-gray-800 rounded-r-lg text-white right-0 h-full px-3 text-gray-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              configs={{
                shortcuts: {
                  today: "Today",
                  last7Days: {
                    text: "Last 7 days",
                    period: {
                      start: formatDate(require$$0().subtract(7, "d")),
                      end: formatDate(require$$0()),
                    },
                  },
                  last30Days: {
                    text: "Last 30 days",
                    period: {
                      start: formatDate(require$$0().subtract(30, "d")),
                      end: formatDate(require$$0()),
                    },
                  },
                  monthToDate: {
                    text: "MTD",
                    period: {
                      start: formatDate(require$$0().startOf("month")),
                      end: formatDate(require$$0()),
                    },
                  },
                  yearToDate: {
                    text: "YTD",
                    period: {
                      start: formatDate(require$$0().startOf("year")),
                      end: formatDate(require$$0()),
                    },
                  },
                },
              }}
            />
          )}
        </div>
        {/* Mobile View */}
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