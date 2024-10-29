import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
  const location = useLocation();

  // for toggling expand/collapse the main sidebar on the left
  const [openSideBar, setOpenSideBar] = useState(false);
  const toggleSideBar = () => {
    setOpenSideBar(!openSideBar);
  };

  // for the date range picker
  const [dateRange, setDateRange] = useState({
    startDate: new Date("2000-01-01"),
    endDate: new Date(),
  });
  const handleDateRangeChange = (newDateRange) => {
    console.log("newDateRange:", newDateRange);
    setDateRange(newDateRange);
  };

  // for toggling open/close the filter panel in the database page
  const [databaseFilterButton, setDatabaseFilterButton] = useState(true);
  const toggleDatabaseFilterPanel = () => {
    setDatabaseFilterButton(!databaseFilterButton);
  };

  useEffect(() => {
    // Reset dateRange when the route changes
    setDateRange({
      startDate: new Date("2000-01-01"),
      endDate: new Date(),
    });
  }, [location]);
  return (
    <div className="h-screen w-screen overflow-hidden flex">
      <Sidebar openSideBar={openSideBar} toggleSideBar={toggleSideBar} />
      <div className="flex flex-col flex-1 overflow-scroll">
        <Header
          openSideBar={openSideBar}
          toggleSideBar={toggleSideBar}
          dateRange={dateRange}
          handleDateRangeChange={handleDateRangeChange}
          toggleDatabaseFilterPanel={toggleDatabaseFilterPanel}
        />
        <div className="flex-1 min-h-0 w-full bg-gray-300/80 z-0 overflow-x-hidden">
          <Outlet
            context={{
              dateRange,
              databaseFilterButton,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Layout;
