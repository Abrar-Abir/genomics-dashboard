import {
  Button,
  ButtonGroup,
  Typography,
  Card,
  CardFooter,
  Tooltip
} from "@material-tailwind/react";
import { ArrowsUpDownIcon, ArrowDownIcon, ArrowUpIcon} from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import schema from "@lib/schema.json";
import {useState, useEffect } from "react";
// import { Tooltip} from "@material-tailwind/react";
import JsonPng from "@assets/json.png";
// import HtmlPng from "@assets/html.png";
import MultiQCLogo from "@assets/multiqc_logo_color.png";

const baseURL =
process.env.NODE_ENV === "production"
  ? "http://172.32.79.51:5001"
  : "http://127.0.0.1:5001";

const JsonIcon = ({sample_id}) => (
	<img
	src={JsonPng} onClick={() => window.open(`${baseURL}/raw/${sample_id}`, "_blank")} className="ml-2 w-4 h-4 text-blue-500">
	</img>
  );
  const HtmlIcon = ({flowcell_id}) => (
	<img
	src={MultiQCLogo} onClick={() => window.open(`https://pme.sidra.org/qc/home?path=sapipe/MultiQC/Flowcell/${flowcell_id}/${flowcell_id}.html`, "_blank")} className="ml-2 h-2 text-blue-500">
	</img>
  );

  const tableHeadersProperties = Object.keys(schema.table).reduce((acc, table) => {
	Object.keys(schema.table[table].entity).forEach((key) => {
	  if (!acc[key]) {
		acc[key] = {};
	  }
  
	  acc[key].alias = schema.table[table].entity[key].alias;
	  acc[key].group = schema.table[table].entity[key].group;
	  acc[key].source = schema.table[table].entity[key].source;
	  acc[key].order = schema.table[table].entity[key].order;
	});
	return acc;
  }, {});

const bgColors = ['bg-blue-','bg-teal-', 'bg-blue-'];


function DataTable(props) {
// handle 'view' functionalities for show/hide-ing columns
const resetTableHeaders = (binaryStr) => {
	const columnsSelected = props.columnsSorted.filter((col, index) => binaryStr[index] === '1');
	return columnsSelected.sort((col1, col2) => (tableHeadersProperties[col1].group*100 + tableHeadersProperties[col1].order) - (tableHeadersProperties[col2].group*100 + tableHeadersProperties[col2].order));
}

const [tableHeaders, setTableHeaders] =  useState(() => resetTableHeaders(props.selectedColumns));
useEffect(() => {
	setTableHeaders(resetTableHeaders(props.selectedColumns));
}, [props.selectedColumns]);

//   console.log(tableHeaders);
  const data = Array.isArray(props.data) ? props.data : [];

//   lanes for mean_qscore manual processing
  const countTrueLanes = (row) => {
    return Object.keys(row)
      .filter((key) => key.startsWith('lane_') && row[key] === true)
      .length;
  };

//   handle sorting
  function getId(head) {
	const array = props.columnsSorted;
	for (let i = 0; i < array.length; i++) {
	  if (array[i] === head) {
		return i;
	  }
	}
	return -1;
  }

  const sortBit = (trinaryStr, idx) => {
	const trinaryArray = trinaryStr.split('');
	trinaryArray[idx] = trinaryArray[idx] === '0' ? '1' : trinaryArray[idx] === '1' ? '2' : '0';
	return trinaryArray.join('');
  };
  const handleSort = (index) => {
	props.setSortedColumns(prevTrinary => sortBit(prevTrinary, index));
	props.setColumnToSort(index);
  };


const getArrowIcon = (head) => {
	const id = getId(head)
    if (props.sortedColumns[id] === '0') {
      return (<ArrowsUpDownIcon onClick={() => handleSort(id)} className="w-4 h-4 text-blue-500" />)
  };
  if (props.sortedColumns[id] === '1') {
	return (<ArrowDownIcon onClick={() => handleSort(id)} className="w-4 h-4 text-blue-500" />)
};
if (props.sortedColumns[id] === '2') {
	return (<ArrowUpIcon onClick={() => handleSort(id)} className="w-4 h-4 text-blue-500" />)
};
 return null;
}


  return (
    <section className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      <Card className="w-full h-full flex flex-col !rounded-none">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {tableHeaders.map(( head ) => {
					return (
                  <th key={head} className="border-b border-gray-300 !p-4">
					<Tooltip content={tableHeadersProperties[head].source}>
					 <div className="flex items-center space-x-2">
                    <Typography
                      color="blue-gray"
                      variant="small"
                      className="!font-bold"
                    >
                    </Typography>
					{tableHeadersProperties[head].alias}  {getArrowIcon(head)} 
					</div>
					</Tooltip>
                  </th>
				  
                )})}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
				<tr key={rowIndex}>
                  {tableHeaders.map(( head ) => {
					 
					 const bgColor = bgColors[tableHeadersProperties[head].group] + String((1 + rowIndex % 2)*50); 
					 return (
                    <td key={head} className={`!p-4 ${bgColor}`}>
                      <Typography
                        variant="small"
                        color={
							row[head] === "" ? "red"
                            : "blue-gray"
                        }
                        className={
                          typeof row[head] === "boolean" ? "font-semibold" : ""
                        }
                      >
                        {head === "position" 
                          ? row[head] === "true"
                            ? "A"
                            : "B"
                          : typeof row[head] === "boolean"
                          ? row[head]
                            ? "True"
                            : "False"
                          : head === "yieldq30" ?  (row[head] / Math.pow(10, 9)).toFixed(3)
						  : head === "mean_qscore" ? (row[head] / (2*countTrueLanes(row))).toFixed(2)
						  : head === "flowcell_id" ?
						  (<><div className="flex items-center space-x-4">{row[head]} <HtmlIcon flowcell_id={row[head]} /></div></>) 
						//   <a
						// 	href={`https://pme.sidra.org/qc/home?path=sapipe/MultiQC/Flowcell/${row[head]}/${row[head]}.html`}
						// 	target="_blank"
						// 	className="inline-block px-4 py-2 bg-blue-200 text-black rounded-md hover:bg-blue-600"
						//   >
						// 	{row[head]} </a>
						  : head === "sample_id" ?  (<><div className="flex items-center space-x-4">{row[head]} <JsonIcon sample_id={row[head]} /></div></>) 
						  : row[head] || "N/A"}
                      </Typography>
                    </td>
					 );
					})}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="flex justify-center items-center h-full w-full">
              No data
            </div>
          )}
        </div>
        <CardFooter className="flex justify-between items-center flex-shrink-0 bg-white">
          <Typography variant="h6" color="blue-gray">
            Page {props.page}{" "}
            <span className="font-normal text-gray-600">
              of {props.totalPages} (Total {props.totalCount} rows)
            </span>
          </Typography>
          <Typography
            variant="h6"
            className="flex space-x-2 font-normal text-gray-600"
          >
            <span>Showing</span>
            <ButtonGroup variant="outlined" size="sm" className="-mt-1">
              <Button
                className={props.limit === 25 ? "bg-black text-white" : ""}
                onClick={() => props.handleLimit(25)}
              >
                25
              </Button>
              <Button
                className={props.limit === 50 ? "bg-black text-white" : ""}
                onClick={() => props.handleLimit(50)}
              >
                50
              </Button>
              <Button
                className={props.limit === 100 ? "bg-black text-white" : ""}
                onClick={() => props.handleLimit(100)}
              >
                100
              </Button>
              <Button
                className={props.limit === 200 ? "bg-black text-white" : ""}
                onClick={() => props.handleLimit(200)}
              >
                200
              </Button>
            </ButtonGroup>
            <span>items per page</span>
          </Typography>
          <div className="flex gap-4">
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center gap-1"
              onClick={props.handlePrev}
              disabled={props.page === 1}
            >
              <ChevronLeftIcon strokeWidth={3} className="h-3 w-3" />
              prev
            </Button>
            <Button
              variant="outlined"
              className="flex items-center gap-1"
              onClick={props.handleNext}
              disabled={props.page === props.totalPages}
            >
              next
              <ChevronRightIcon strokeWidth={3} className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

export default DataTable;
