import React, { useState } from 'react';
import { Accordion, AccordionHeader, AccordionBody, Tooltip, Badge } from '@material-tailwind/react';

const AccordionTable = ({ data, tableHeaders }) => {
  const [openPi, setOpenPi] = useState({});
  const handleTogglePi = (pi) => {
    setOpenPi((prevState) => ({
      ...prevState,
      [pi]: !prevState[pi],
    }));
  };
  const [openProject, setOpenProject] = useState({});
  const handleToggleProject = (project) => {
    setOpenProject((prevState) => ({
      ...prevState,
      [project]: !prevState[project],
    }));
  };

//   return (
// 	<div className=" overflow-x-auto  h-full">
// 		 <table className=" table-fixed" >
// 			<thead className="bg-white sticky top-0 z-10 ">
//                     <tr >
//                       {tableHeaders.map((key) => (
//                         <th key={key} className="px-4 py-2 text-center " style={ key === "Entity" ? {width: '20rem'} : { writingMode: 'vertical-rl', transform: 'rotate(180deg)', width: '5rem'}}>{key === 'count' ? 'Count' : key}</th>
//                       ))}
//                     </tr>
//                   </thead>
// 				  {/* </table> */}
//       {Object.keys(data).map((pi) => {
//         const piData = data[pi];
//         return (
//           <div key={pi}>
//             <Accordion open={openPi[pi]} className='rounded-lg border border-white bg-indigo-300'>
//               <AccordionHeader onClick={() => handleTogglePi(pi)} className='!py-0 border-white'>
// 				<table>
//                   <thead >
//                     <tr >
//                       {tableHeaders.map((key) => (
//                         <th key={key} className= { key === "Entity" ? "px-4 text-right text-white font-normal" 
// 												: key === 'count' ? "px-4 text-center bg-blue-300 text-white font-normal" 
// 												: piData.header[key] > 0 ? "px-4 text-center bg-teal-300 text-white font-normal" 
// 												: "px-4 text-center text-white"} 
// 										style={ key === "Entity" ? {width: '20rem', borderLeft: '0.20rem solid white'} : { width: '5rem', borderLeft: '0.20rem solid white'}}>
// 						{ key === 'Entity' ? pi : piData.header[key] || ''}
// 						</th>
//                       ))}
//                     </tr>
//                   </thead>
// 				  </table>
//               </AccordionHeader>
//               <AccordionBody>
// 				{Object.keys(piData.projects).map((project) => {
// 				const projectData = piData.projects[project];
// 				return (
// 			  <Accordion open={openProject[project]} className=' bg-blue-gray-300'>
//               <AccordionHeader onClick={() => handleToggleProject(project)} className='!py-0'>
// 				<table>
//                   <thead>
//                     <tr>
//                       {tableHeaders.map((key) => (
//                         <th key={key} className= { key === "Entity" ? "px-4 text-right text-white" 
// 												 : key === 'count' ? "px-4 text-center bg-blue-300 text-white" 
// 												 : projectData.header[key] > 0 ? "px-4 text-center bg-teal-300 text-white" 
// 												 : "px-4 text-center"} 
// 									style={ key === "Entity" ? {width: '20rem', border: '0.20rem solid white'} : { width: '5rem', border: '0.20rem solid white'}}>
// 						{ key === 'Entity' ? project : projectData.header[key] || ''}
// 						</th>
//                       ))}
//                     </tr>
//                   </thead>
// 				  </table>
//               </AccordionHeader>
// 			  <AccordionBody>
// 				<table>
//                   <tbody className=''>
//                     {Object.keys(projectData.samples).map((sample, index) => (
//                       <tr key={index} className="bg-white ">
//                         {tableHeaders.map((key) => (
//                           <td key={key} className={ key === "Entity" ? "px-4 py-2 text-right font-bold text-black " 
// 													: key === "count" ? "px-4 py-2 text-center bg-blue-300  text-white"
// 						  							: projectData.samples[sample][key] > 0 ? "px-4 py-2 text-center bg-teal-300  text-white"
// 													: "px-4 py-2 text-center bg-teal-50"} 
// 										style={ key === "Entity" ? {width: '20rem', border: '0.20rem solid white'} : { width: '5rem', border: '0.20rem solid white'}}>
//                             {key === 'Entity' ? sample : projectData.samples[sample][key] || ''}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
// 				  </table>
// 				  </AccordionBody>
// 				  </Accordion>
// 	  )})}
//               </AccordionBody>
//             </Accordion>
// 			{/* </table> */}
//           </div>
//         );
//       })}
// 	  </table>
// 	</div>
//   );
// };
return (
<div className="overflow-x-auto h-full">
  <table className="table-fixed">
    {/* Table Header */}
    <thead className="bg-white sticky top-0 z-10">
      <tr>
        {tableHeaders.map((key) => (
          <th
            key={key}
            className="px-4 py-2 text-center"
            style={
              key === "Entity"
                ? { width: "20rem" }
                : { writingMode: "vertical-rl", transform: "rotate(180deg)", width: "5rem" }
            }
          >
            {key === "count" ? "Count" : key}
          </th>
        ))}
      </tr>
    </thead>

    {/* Table Body */}
    <tbody>
      {Object.keys(data).map((pi) => {
        const piData = data[pi];
        return (
          <>
            {/* Row for PI Accordion Header */}
            <tr key={pi} className="bg-indigo-300" onClick={() => handleTogglePi(pi)}>
              {tableHeaders.map((key) => (
                <td
                  key={key}
                  className={
                    key === "Entity"
                      ? "px-4 text-right text-white font-normal"
                      : key === "count"
                      ? "px-4 text-center bg-blue-300 text-white font-normal"
                      : piData.header[key] > 0
                      ? "px-4 text-center bg-teal-300 text-white font-normal"
                      : "px-4 text-center text-white"
                  }
                  style={key === "Entity" ? { width: "20rem", border: "0.20rem solid white" } : { width: "5rem", border: "0.20rem solid white" }}
                >
                  {key === "Entity" ? pi : piData.header[key] || ""}
                </td>
              ))}
            </tr>

            {/* Rows for Projects within PI */}
            { openPi[pi] &&
			 Object.keys(piData.projects).map((project) => {
              const projectData = piData.projects[project];
              return (
                <>
                  {/* Row for Project Accordion Header */}
                  <tr key={project} className="bg-blue-gray-300" onClick={() => handleToggleProject(project)}>
                    {tableHeaders.map((key) => (
                      <td
                        key={key}
                        className={
                          key === "Entity"
                            ? "px-4 text-right text-white"
                            : key === "count"
                            ? "px-4 text-center bg-blue-300 text-white"
                            : projectData.header[key] > 0
                            ? "px-4 text-center bg-teal-300 text-white"
                            : "px-4 text-center"
                        }
                        style={key === "Entity" ? { width: "20rem", border: "0.20rem solid white" } : { width: "5rem", border: "0.20rem solid white" }}
                      >
                        {key === "Entity" ? project : projectData.header[key] || ""}
                      </td>
                    ))}
                  </tr>

                  {/* Rows for Samples within Project */}
                  {openProject[project] && Object.keys(projectData.samples).map((sample, index) => (
                    <tr key={index} className="bg-white">
                      {tableHeaders.map((key) => (
                        <td
                          key={key}
                          className={
                            key === "Entity"
                              ? "px-4 py-2 text-right font-bold text-black"
                              : key === "count"
                              ? "px-4 py-2 text-center bg-blue-300 text-white"
                              : projectData.samples[sample][key] > 0
                              ? "px-4 py-2 text-center bg-teal-300 text-white"
                              : "px-4 py-2 text-center bg-teal-50"
                          }
                          style={key === "Entity" ? { width: "20rem", border: "0.20rem solid white" } : { width: "5rem", border: "0.20rem solid white" }}
                        >
                          {key === "Entity" ? sample : projectData.samples[sample][key] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              );
            })}
          </>
        );
      })}
    </tbody>
  </table>
</div>
)
}

export default AccordionTable;
