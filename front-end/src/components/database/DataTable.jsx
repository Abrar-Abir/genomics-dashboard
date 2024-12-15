import {
  Button,
  ButtonGroup,
  Typography,
  Card,
  CardFooter,
} from "@material-tailwind/react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import schema from "@lib/schema.json";

const tableHeadersAlias = Object.keys(schema.table).reduce((acc, table) => {
	Object.keys(schema.table[table].entity).forEach((key) => {
	  acc[key] = schema.table[table].entity[key].alias; 
	});
	return acc;
  }, {});
  
const tableHeadersGroups = Object.keys(schema.table).reduce((acc, table) => {
	Object.keys(schema.table[table].entity).forEach((key) => {
	  acc[key] = schema.table[table].entity[key].group; 
	});
	return acc;
  }, {});

const bgColors = ['bg-blue-','bg-teal-', 'bg-blue-'];

function DataTable(props) {
  const data = Array.isArray(props.data) ? props.data : [];
  const countTrueLanes = (row) => {
    return Object.keys(row)
      .filter((key) => key.startsWith('lane_') && row[key] === true)
      .length;
  };
//   console.log("props.tableHeaders", props.tableHeaders);
//   console.log("alias", tableHeadersAlias);
  return (
    <section className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      <Card className="w-full h-full flex flex-col !rounded-none">
        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-max table-auto text-left">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {props.tableHeaders.map(( head ) => {
					return (
                  <th key={head} className="border-b border-gray-300 !p-4">
                    <Typography
                      color="blue-gray"
                      variant="small"
                      className="!font-bold"
                    >
                      {tableHeadersAlias[head]}
                    </Typography>
                  </th>
                )})}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
				<tr key={rowIndex}>
                  {props.tableHeaders.map(( head ) => {
					 
					 const bgColor = bgColors[tableHeadersGroups[head]] + String((1 + rowIndex % 2)*50); 
					//  === 1 ? "bg-teal-50" : tableHeadersGroups[head] === 2 ?"bg-cyan-50" : "bg-blue-50";
					 return (
                    <td key={head} className={`!p-4 ${bgColor}`}>
                      <Typography
                        variant="small"
                        color={
                        //   head === "position" && typeof row[head] === "boolean"
                        //     ? row[head]
                        //       ? "indigo"
                        //       : "orange"
                        //     : 
							// typeof row[head] === "boolean"
                            // ? row[head]
                            //   ? "green"
                            //   : "red"
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
