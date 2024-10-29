import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import config, { sampleData } from "@lib/dashboardConfig.cjs";
import { formatJsDate } from "@components/utils";

// charts
import Card1 from "@components/dashboard/Card-1";
import Card2 from "@components/dashboard/Card-2";
import CustomDonutChart from "@components/dashboard/CustomDonutChart";

export default function Dashboard(props) {
  const { dateRange } = useOutletContext();
//   console.log("DateRange:", dateRange);
  const [data, setData] = useState({
    data1: null,
    data2a: null,
    data2b: null,
    data2c: null,
    data3: null,
    data4: null,
    data5: null,
    data6: null,
  });

  const baseURL =
    process.env.NODE_ENV === "production"
    //   ? "http://172.32.79.51:5001"
	  ? "https://genomics-dashboard-flask.onrender.com"
      : "https://genomics-dashboard-flask.onrender.com";

  // Function to asynchronously fetch data for all the cards in the dashboard page
  useEffect(() => {
    if (config.useSampleData) {
      setData({
        ...sampleData,
      });
    } else {
      async function fetchData() {
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        // Check if startDate and endDate are not null
        if (dateRange.startDate && dateRange.endDate) {
          const startDate = formatJsDate(dateRange.startDate, "YYYYMMDD");
          const endDate = formatJsDate(dateRange.endDate, "YYYYMMDD");

          // for card 1
          await delay(5);
          const response1 = await fetch(
            `${baseURL}/data1/${startDate}-${endDate}`
          );
          if (!response1.ok) {
            // Handle error
            console.error("Server error:", response1);
          } else {
            const data = await response1.json();
            setData((prevState) => ({
              ...prevState,
              data1: data,
            }));
          }

          // for card 2, DataSampleStatus chart
          await delay(5);
          const response2a = await fetch(
            `${baseURL}/data2a/${startDate}-${endDate}`
          );
          if (!response2a.ok) {
            // Handle error
            console.error("Server error:", response2a);
          } else {
            const data = await response2a.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data2a: data,
            }));
          }

          // for card 2, Projects chart
          await delay(5);
          const response2b = await fetch(
            `${baseURL}/data2b/${startDate}-${endDate}`
          );
          if (!response2b.ok) {
            // Handle error
            console.error("Server error:", response2b);
          } else {
            const data = await response2b.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data2b: data,
            }));
          }

          await delay(5);
          const response2c = await fetch(
            `${baseURL}/data2c/${startDate}-${endDate}`
          );
          if (!response2c.ok) {
            // Handle error
            console.error("Server error:", response2c);
          } else {
            const data = await response2c.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data2c: data, // Replace newValue with the new value for data1
            }));
          }

          // for card 3
          await delay(5);
          const response3 = await fetch(
            `${baseURL}/data3/${startDate}-${endDate}`
          );
          if (!response3.ok) {
            // Handle error
            console.error("Server error:", response3);
          } else {
            const data = await response3.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data3: data, // Replace newValue with the new value for data1
            }));
          }

          // for card 4
          await delay(5);
          const response4 = await fetch(
            `${baseURL}/data4/${startDate}-${endDate}`
          );
          if (!response4.ok) {
            // Handle error
            console.error("Server error:", response4);
          } else {
            const data = await response4.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data4: data, // Replace newValue with the new value for data1
            }));
          }

          // for card 5
          await delay(5);
          const response5 = await fetch(
            `${baseURL}/data5/${startDate}-${endDate}`
          );
          if (!response5.ok) {
            // Handle error
            console.error("Server error:", response5);
          } else {
            const data = await response5.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data5: data, // Replace newValue with the new value for data1
            }));
          }

          // for card 6
          await delay(5);
          const response6 = await fetch(
            `${baseURL}/data6/${startDate}-${endDate}`
          );
          if (!response6.ok) {
            // Handle error
            console.error("Server error:", response6);
          } else {
            const data = await response6.json();
            // Update the state with the fetched data
            setData((prevState) => ({
              ...prevState,
              data6: data, // Replace newValue with the new value for data1
            }));
          }
        }
      }

      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  return (
    <section className="flex w-full flex-col items-center lg:items-start px-8 pb-8">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-10 md:grid-rows-2 mt-3 h-full">
        <div className="md:col-span-7 md:row-span-2">
          <Card1
            title="1. Quantity processed over time"
            tooltip="Overview of the no. of samples/flowcells processed along with the cumulative no. of units in a daily/weekly/monthly/yearly view, over the specified date range. This is the Demultiplex Date"
            data={data.data1}
            index="date"
            colors={["blue", "amber", "red"]}
            showLegend={true}
            xAxisLabel="Demultiplex Date"
            yAxisWidth={56}
            kpis={["Samples", "Flowcells", "SamplesTotal", "FlowcellsTotal"]}
          />
        </div>
        <div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
          <CustomDonutChart
            title="3. Flowcell - Type distribution"
            tooltip="Overview of the usage of different types of flowcells over the specified date range"
            data={data.data3}
            index="type"
            category="quantity"
            variant="donut"
            label=" FCs"
          />
          <CustomDonutChart
            title="4. Services distribution"
            tooltip="Overview of the different types of services requested among samples over the specified date range"
            data={data.data4}
            index="type"
            category="quantity"
            label=" smpls"
          />
        </div>
        <div className="md:col-span-7 md:row-span-2">
          <Card2
            title="2. P.I. Overview"
            tooltip="Overview of the distribution of sample requests per PI over the specified date range in different parameters"
            data2a={data.data2a == [] ? null : data.data2a}
            data2b={data.data2b}
            data2c={data.data2c}
          />
        </div>
        <div className="md:col-span-3 md:row-span-2 grid grid-rows-2 gap-4">
          <CustomDonutChart
            title="5. Sequencer distribution"
            tooltip="Overview of the usage of sequencers over the specified date range"
            data={data.data5}
            index="type"
            category="quantity"
            label=" FCs"
          />
          <CustomDonutChart
            title="6. Reference Genome distribution"
            tooltip="Overview of the different types of reference genomes among samples over the specified date range"
            data={data.data6}
            index="type"
            category="quantity"
            label=" smpls"
          />
        </div>
      </div>
    </section>
  );
}
