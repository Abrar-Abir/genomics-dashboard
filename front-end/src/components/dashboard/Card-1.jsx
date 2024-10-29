import { useState, useEffect } from "react";
import { preprocessData } from "@components/utils.js";
import {
  Card,
  Select,
  SelectItem,
  Subtitle,
  Title,
  Tab,
  TabList,
  TabGroup,
  AreaChart,
  Icon,
  NumberInput,
} from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import {
  ComputerDesktopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import { PiEyedropperSampleFill, PiTextColumnsFill } from "react-icons/pi";

// This component is a wrapper around the AreaChart component from @tremor/react
export default function Card1(props) {
  // State to keep track of the selected KPI
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedKpi = props.kpis[selectedIndex];
  const cumulativeSelectedKpi = props.kpis[selectedIndex + 2];

  // State to keep track of the selected view (monthly by default)
  const [view, setView] = useState(1);

  // State to keep track of the window size (number of days/months etc. to display in a window)
  const [windowSize, setWindowSize] = useState(30);
  const [windowStart, setWindowStart] = useState(0); // Initial window start is 0
  const [preprocessedData, setPreprocessedData] = useState(props.data);
  const [toggleCumulative, setToggleCumulative] = useState(false);

  const categories = toggleCumulative ? [cumulativeSelectedKpi] : [selectedKpi];
  const [colors, setColors] = useState([props.colors[0]]);

  // Update the preprocessed data based on the selected view
  useEffect(() => {
    if (props.data) {
      const newData = preprocessData(props.data, view);
      setPreprocessedData(newData);
    } else {
      setPreprocessedData(null);
    }
  }, [props.data, view]);

  // Update the window size based on the selected view
  useEffect(() => {
    // Calculate the initial window start index to be the last possible window after preprocessing
    if (preprocessedData) {
      const initialWindowStart = Math.max(
        0,
        preprocessedData.length - windowSize
      );
      setWindowStart(initialWindowStart);
    }
  }, [preprocessedData, windowSize]);

  // Create a "windowed" subset of the data
  const windowedData = preprocessedData?.slice(
    windowStart,
    windowStart + windowSize
  );

  // Update the window start index to scroll through the data
  const scrollData = (direction) => {
    if (direction === "forward") {
      const newStart = windowStart + windowSize;
      if (newStart + windowSize >= preprocessedData?.length) {
        // If moving forward would leave fewer than windowSize items, show the last windowSize or less
        setWindowStart(
          preprocessedData?.length - windowSize >= 0
            ? preprocessedData?.length - windowSize
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

  // Arguments to be passed to the AreaChart component
  const areaChartArgs = {
    categories: categories,
    showAnimation: true,
    animationDuration: 1000,
    autoMinValue: true,
    className: "select-none",
    data: windowedData,
    index: props.index,
    colors: toggleCumulative
      ? [props.colors[2]]
      : [props.colors[selectedIndex]],
    showLegend: props.showLegend,
    yAxisWidth: props.yAxisWidth,
    xAxisLabel: props.xAxisLabel,
    valueFormatter: valueFormatter,
  };

  return (
    <Card
      decoration="top"
      decorationColor="teal"
      className="flex flex-col space-y-2 h-full"
    >
      <div className="flex space-x-0.5 font-cabin items-center">
        <Title> {props.title} </Title>
        <Icon
          icon={InformationCircleIcon}
          variant="simple"
          className=" text-teal-600 hover:text-teal-400 cursor-pointer"
          tooltip={props.tooltip}
        />
      </div>
      <div className="select-none h-[10%] flex flex-col md:flex-row justify-between items-center">
        <TabGroup
          className="flex justify-start"
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
        >
          <TabList variant="solid" color="indigo">
            <Tab>
              <PiEyedropperSampleFill className="h-5 w-auto inline-block -mt-1" />
              <span className="ml-2">Samples</span>
            </Tab>
            <Tab>
              <PiTextColumnsFill className="h-5 w-auto inline-block rotate-90 -mt-1" />
              <span className="ml-2">Flowcells</span>
            </Tab>
          </TabList>
        </TabGroup>

        {props.data && (
          <div className="flex flex-col md:flex-row gap-y-4 md:gap-x-4 ml-4">
            <Select
              className="max-w-[14rem] justify-end text-gray-500 hover:text-black"
              value={view}
              placeholder="Select a time period"
              onValueChange={(val) => {
                setView(val);
                let newData = preprocessData(props.data, val);
                setPreprocessedData(newData);
              }}
              icon={EyeIcon}
            >
              <SelectItem value={1}>Daily</SelectItem>
              <SelectItem value={2}>Weekly</SelectItem>
              <SelectItem value={3}>Monthly</SelectItem>
              <SelectItem value={4}>Yearly</SelectItem>
            </Select>

            <div className="flex items-center text-gray-500 hover:text-black">
              <NumberInput
                value={windowSize}
                icon={ComputerDesktopIcon}
                step={6}
                enableStepper={true}
                min={0}
                onValueChange={(val) => setWindowSize(val)}
              />
            </div>

            <div className="flex items-center ">
              <input
                type="checkbox"
                id="checkbox1"
                className="h-4 w-4 mx-2 rounded-sm"
                checked={toggleCumulative}
                onChange={() => setToggleCumulative(!toggleCumulative)}
              />
              <Subtitle>Cumulative</Subtitle>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4">
        <AreaChart {...areaChartArgs} curveType="linear" />
        {preprocessedData && (
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
                windowStart + windowSize >= preprocessedData?.length
                  ? "outlined"
                  : "filled"
              }
              disabled={
                windowStart + windowSize >= preprocessedData?.length
                  ? true
                  : false
              }
              onClick={() => scrollData("forward")}
            >
              <ChevronRightIcon className="w-auto h-6" />
            </IconButton>
          </div>
        )}
      </div>
    </Card>
  );
}
