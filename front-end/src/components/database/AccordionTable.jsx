import React, { useState } from 'react';
import { Accordion, AccordionHeader, AccordionBody } from '@material-tailwind/react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const AccordionTable = ({ data, tableHeaders }) => {
  const [open, setOpen] = useState({});
  const handleToggle = (group) => {
    setOpen((prevState) => ({
      ...prevState,
      [group]: !prevState[group],
    }));
  };

  return (
	<section className="flex-1 overflow-x-auto overflow-y-auto h-full">
		 <div className="table-container" style={{ width: '100%' }}>
		<table className="min-w-full table-auto border-collapse" >
			<Accordion>
				<AccordionHeader>
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      {tableHeaders.map((key) => (
                        <th key={key} className="px-4 py-2 text-center" style={ key === "Entity" ? {width: '20rem'} : { writingMode: 'vertical-rl', transform: 'rotate(180deg)', width: '5rem'}}>{key}</th>
                      ))}
                    </tr>
                  </thead>
				  </AccordionHeader>
				  </Accordion>
				  </table>

      {Object.keys(data).map((group) => {
        const groupData = data[group];
        return (
          <div key={group}>
			<table className="min-w-full table-auto border-collapse">
            <Accordion open={open[group]} >
              <AccordionHeader onClick={() => handleToggle(group)}>
                  <thead className="bg-gray-100">
                    <tr>
                      {tableHeaders.map((key) => (
                        <th key={key} className= { key === "Entity" ? "px-4 py-2 text-right" : "px-4 py-2 text-center"} style={ key === "Entity" ? {width: '20rem'} : { width: '5rem'}}>{ key === 'Entity' ? group : groupData.header[key]}</th>
                      ))}
                    </tr>
                  </thead>
              </AccordionHeader>
              <AccordionBody>
                  <tbody>
                    {groupData.rows.map((row, index) => (
                      <tr key={index} className="border-b">
                        {tableHeaders.map((key) => (
                          <td key={key} className={ key === "Entity" ? "px-4 py-2 text-right" : "px-4 py-2 text-center"} style={ key === "Entity" ? {width: '20rem'} : { width: '5rem'}}>
                            {key === 'Entity' ? row['Sample Name'] : row[key] || '0'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
              </AccordionBody>
            </Accordion>
			</table>
          </div>
        );
      })}
    </div>
	{/* // </div> */}
	</section>
  );
};

export default AccordionTable;
