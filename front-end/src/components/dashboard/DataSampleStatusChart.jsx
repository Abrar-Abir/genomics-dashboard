import { useState } from "react";
import { BarChart, Subtitle, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/solid";

export default function DataSampleStatusChart(props) {
  const [windowSize, setWindowSize] = useState(6);
  const [windowStart, setWindowStart] = useState(0); // Initial window start is 0
  const [toggleStacked, setToggleStacked] = useState(true);

  // Create a "windowed" subset of the data
  const windowedData = props.data?.slice(windowStart, windowStart + windowSize);

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

  // Function to format the numbers to be displayed in US format
  const valueFormatter = (number) =>
    `${Intl.NumberFormat("us").format(number).toString()}`;

  // Arguments to be passed to the BarChart component
  const barChartArgs = {
    categories: props.categories,
    showAnimation: true,
    animationDuration: 300,
    autoMinValue: true,
    className: props.className + " select-none",
    data: windowedData,
    index: props.index,
    colors: props.colors,
    showLegend: props.showLegend,
    yAxisWidth: props.yAxisWidth,
    xAxisLabel: props.xAxisLabel,
    valueFormatter: valueFormatter,
    stack: toggleStacked,
  };

  return (
    <div className="flex flex-col space-y-2 h-full">
      <div className="flex justify-end items-center gap-x-4 text-gray-500 hover:text-black">
        <NumberInput
          className="max-w-[5rem]"
          value={windowSize}
          icon={ComputerDesktopIcon}
          step={6}
          enableStepper={true}
          min={0}
          onValueChange={(val) => setWindowSize(val)}
        />
        <div className="flex justify-end items-center">
          <input
            type="checkbox"
            id="checkbox1"
            className="h-4 w-4 mx-2 rounded-sm"
            checked={toggleStacked}
            onChange={() => setToggleStacked(!toggleStacked)}
          />
          <Subtitle>Stacked</Subtitle>
        </div>
      </div>
      <div className="mt-4 h-full">
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
}
