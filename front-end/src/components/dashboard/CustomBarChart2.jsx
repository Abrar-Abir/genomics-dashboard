import { useState, useEffect } from "react";
import { BarChart, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";
import predefinedColors from "@lib/colors";

const CustomBarChart2 = (props) => {
  const [windowSize, setWindowSize] = useState(6);
  const [windowStart, setWindowStart] = useState(0);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState(predefinedColors);

  useEffect(() => {
    setWindowStart(0); // Reset the window start whenever the window size changes
  }, [windowSize]); // Only run this effect when windowSize changes

  // Create a "windowed" subset of the data
  const windowedData = props.data?.slice(windowStart, windowStart + windowSize);

  useEffect(() => {
    // Extract all project names from the windowed data
    if (props.data) {
      const allProjects = {};
      const windowedData = props.data.slice(
        windowStart,
        windowStart + windowSize
      );

      windowedData.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (key !== "pi") {
            allProjects[key] = true;
          }
        });
      });

      console.log("all projects ", allProjects);
      const allCategories = Object.keys(allProjects);
      console.log("hehe", allCategories);
      setCategories(allCategories);
      const allColors = allCategories.map(
        (_, i) => predefinedColors[i % predefinedColors.length]
      );
      setColors(allColors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowStart, windowSize]); // Run this effect when windowStart or windowSize changes

  // Update the window start index to scroll through the data
  const scrollData = (direction) => {
    if (direction === "forward") {
      const newStart = windowStart + windowSize;
      if (newStart + windowSize >= props.data?.length) {
        // If moving forward would leave fewer than windowSize items, show the last windowSize or less
        setWindowStart(
          props.data?.length - windowSize >= 0
            ? props.data?.length - windowSize
            : 0
        );
      } else {
        setWindowStart(newStart);
      }
    } else if (direction === "backward") {
      const newStart = windowStart - windowSize;
      if (newStart < 0) {
        // If moving backward would go before the start, set to 0
        setWindowStart(0);
      } else {
        setWindowStart(newStart);
      }
    }
  };

  const valueFormatter = (number) =>
    `${Intl.NumberFormat("us").format(number).toString()}`;

  // Arguments to be passed to the BarChart component
  const barChartArgs = {
    categories: categories,
    showAnimation: true,
    animationDuration: 1000,
    className: "select-none",
    data: windowedData,
    index: props.index,
    colors: colors,
    showLegend: props.showLegend,
    yAxisWidth: props.yAxisWidth,
    valueFormatter: valueFormatter,
    stack: true,
  };

  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="flex justify-end items-center gap-x-4 text-gray-500 hover:text-black h-[10%]">
        <NumberInput
          className="max-w-[5rem]"
          value={windowSize}
          icon={ComputerDesktopIcon}
          step={6}
          enableStepper={true}
          min={0}
          onValueChange={(val) => setWindowSize(val)}
        />
      </div>
      <div className="mt-4">
        <BarChart {...barChartArgs} />
        {props.data && (
          <div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
            <IconButton
              className="cursor-pointer"
              color={"black"}
              variant={windowStart === 0 ? "outlined" : "filled"}
              disabled={windowStart === 0 ? true : false}
              onClick={() => scrollData("backward")}
            >
              <ChevronLeftIcon className="w-auto h-6" />
            </IconButton>
            <IconButton
              className="cursor-pointer"
              color={"black"}
              variant={
                windowStart + windowSize >= props.data?.length
                  ? "outlined"
                  : "filled"
              }
              disabled={
                windowStart + windowSize >= props.data?.length ? true : false
              }
              onClick={() => scrollData("forward")}
            >
              <ChevronRightIcon className="w-auto h-6" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomBarChart2;
