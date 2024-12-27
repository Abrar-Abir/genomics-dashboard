import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import schema from "@lib/schema.json";
import {
  Button,
  Navbar,
  Collapse,
  Typography,
  IconButton,
  Breadcrumbs,
} from "@material-tailwind/react";
import {
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
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

import MenuWithCheckbox from "./Menu";
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

  const tableHeadersAlias = Object.keys(schema.table).reduce((acc, table) => {
	Object.keys(schema.table[table].entity).forEach((key) => {
	  acc[key] = schema.table[table].entity[key].alias; 
	});
	return acc;
  }, {});

const columns = Object.keys(schema.table).flatMap((table) =>
Object.keys(schema.table[table].entity)
).sort();

const columnsAlias = columns.map(col => tableHeadersAlias[col]);


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


  const [allSuggestions, setAllSuggestions] = useState([]);
  const SearchMenu = () => {
	const allKeys = [
	  'pi',
	  'project',
	  'submission',
	  'flowcell',
	  'sample'
	]
	const handleMenuClick = async (key) => {
		props.setSearchKey(key);
		props.setSearchValue('');
		const apiUrl = `${baseURL}/search/${key}`;
		const dataResponse = await fetch(apiUrl);
		if (!dataResponse.ok) {
		console.error("Server error:", dataResponse);
		} else {
		const dataResult = await dataResponse.json();
        setAllSuggestions(dataResult);
	}
}  
	return (
	  <Menu>
		<MenuHandler>
		  <Button variant="outlined">{props.searchKey}</Button>
		</MenuHandler>
		<MenuList>
			{allKeys.map((entity, index) => 
			<MenuItem key={index} onMouseDown={() => handleMenuClick(entity)}>{entity}</MenuItem>
			)}
		</MenuList>
	  </Menu>
	);
  }

  const handleExport = (format) => {
    window.location.href = `${baseURL}/export/${format}`;
  };
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
	{location.pathname === "/database" && (<Button
                color="gray"
                variant="outlined"
                className="flex items-center gap-1 py-1 h-8"
				onClick={() => props.reset()}
              >
                reset
                <AdjustmentsVerticalIcon className="w-4 h-4 text-gray-900" />
              </Button>
		)}
		<div className="flex space-x-4 items-end">
          {location.pathname === "/database" && (
				<SearchMenu></SearchMenu>
			)}
		{/* </div>
		<div className="flex space-x-4 items-end"> */}
          {location.pathname === "/database" && (
				<SearchBar allSuggestions={allSuggestions} setSearchValue = {props.setSearchValue}></SearchBar>
			)}
		</div>
        <div className="flex space-x-4 items-end">
          {location.pathname === "/database" && (
            <div className="flex items-center gap-4">
            <MenuWithCheckbox columns={columnsAlias} selectedColumns={props.selectedColumns} setSelectedColumns={props.setSelectedColumns} ></MenuWithCheckbox>

			<Menu>
      <MenuHandler>
		
        <Button
          color="gray"
          variant="outlined"
          className="flex items-center gap-1 py-1 h-8"
        >
          Export
          <ArrowDownTrayIcon className="w-4 h-4 text-gray-900" />
        </Button>
      </MenuHandler>
      <MenuList>
        <MenuItem onClick={() => handleExport('csv')}>
          CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('tsv')}>
            TSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('json')}>
            JSON
        </MenuItem>
      </MenuList>
    </Menu>          
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
