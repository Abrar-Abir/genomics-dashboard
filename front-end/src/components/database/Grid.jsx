import {
  Typography,
  Card} from "@material-tailwind/react";

// const bgColors = ['bg-blue-','bg-red-', 'bg-blue-'];


function Grid(props) {

  const data = Array.isArray(props.data) ? props.data : [];
  const tableHeaders = Array.isArray(props.tableHeaders) ? props.tableHeaders : [];

  return (
		<section className="flex-1 overflow-x-auto overflow-y-hidden h-full">
		<Card className="w-full h-full flex flex-col !rounded-none">
			<div className="flex-1 overflow-auto">
			<table className="min-w-max table-auto text-left">
				<thead className="sticky top-0 bg-white z-10">
              <tr>
                {tableHeaders.map(( head ) => {
					return (
                  <th key={head} className="border-b border-gray-300 !p-4" style={ head === "sample_name" ? {} : { writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
				  >
					 <div className="flex items-center space-x-2">
                    <Typography
                      color="blue-gray"
                      variant="small"
                      className="!font-bold"
                    >
                    </Typography>
					{head === "sample_name" ? "Sample Name" :
					 head === 'count' ? "Count" : head}
					</div>
                  </th>
				  
                )})}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
				<tr key={rowIndex} className="even:bg-blue-gray-50/50">
                  {tableHeaders.map(( head ) => {
					 
					 const bgColor = 'bg-blue-50'; 
					 return (
                    <td key={head} className={ 
						row[head] === 1 ? `!p-4 bg-teal-50` : row[head] === 2 ? `!p-4 bg-teal-100` : `!p-4`}>
                      <Typography
                        variant="small"
                        color={"blue-gray"}
                      >
                        {row[head]}
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
      </Card>
    </section>
  );
}

export default Grid;
