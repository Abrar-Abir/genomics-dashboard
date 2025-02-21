import {
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";
import {
  DASHBOARD_SIDEBAR_LINKS,
  DASHBOARD_SIDEBAR_BOTTOM_LINKS,
} from "@lib/sidebarConfig.jsx";
import logo from "@assets/logo_without_text.png";

export default function Sidebar(props) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="hidden lg:flex h-screen border-r-2 border-gray-300/80">
      <div
        className={`rounded-none h-full p-2 pr-0 transition-all duration-300 ${
          props.openSideBar ? "w-48" : "w-20"
        }`}
      >
        <div
          className={`mb-2 relative flex p-1 pr-0 cursor-pointer items-center`}
        >
          <img
            src={logo}
            alt="logo"
            className="h-9 w-auto ml-2"
            onClick={props.toggleSideBar}
          />
          {props.openSideBar && (
            <Typography
              variant="h5"
              color="blue-gray"
              className="ml-4"
              onClick={props.toggleSideBar}
            >
              Navigation
            </Typography>
          )}
        </div>
        <div className="flex flex-col justify-between h-full">
          <List className="w-full !min-w-0 !pr-0 -mt-[5.4px]">
            {DASHBOARD_SIDEBAR_LINKS.map((item) => (
              <ListItem
                key={item.key}
                className={`p-0 rounded-none rounded-l-lg ${
                  currentPath === item.path
                    ? "bg-gray-300/80 text-cyan-800"
                    : ""
                }`}
                ripple={false}
              >
                {!props.openSideBar && (
                  <Link
                    to={item.path}
                    className="w-full h-full flex items-center justify-start m-3 my-2"
                  >
                    {item.icon}
                  </Link>
                )}
                {props.openSideBar && (
                  <Link
                    to={item.path}
                    className="w-full h-full flex items-center justify-start m-3 my-2"
                  >
                    <ListItemPrefix>{item.icon}</ListItemPrefix>
                    {item.label}
                  </Link>
                )}
              </ListItem>
            ))}
          </List>
          <List className="w-full !min-w-0 !pr-0">
            <hr className="border-blue-gray-200 mx-auto w-full" />
            {DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((item) => (
              <ListItem
                key={item.key}
                className={`p-0 rounded-none rounded-l-lg ${
                  currentPath === item.path
                    ? "bg-gray-300/80 text-cyan-800"
                    : ""
                }`}
                ripple={false}
              >
                {!props.openSideBar && (
                  <Link
                    to={item.path}
                    className="w-full h-full flex items-center justify-start m-3 my-2"
                  >
                    {item.icon}
                  </Link>
                )}
                {props.openSideBar && (
                  <Link
                    to={item.path}
                    className="w-full h-full flex items-center justify-start m-3 my-2"
                  >
                    <ListItemPrefix>{item.icon}</ListItemPrefix>
                    {item.label}
                    {item.badge && (
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
                )}
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
}
