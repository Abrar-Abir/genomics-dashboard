import {
	Button,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Checkbox,
  } from "@material-tailwind/react";
  import React from 'react'; 

  const MenuWithCheckbox = (props) => {
    const [open, setOpen] = React.useState(false);
 
	const handleOpen = () => setOpen(!open);
	 const flipBit = (binaryStr, idx) => {
		const binaryArray = binaryStr.split('');
		binaryArray[idx] = binaryArray[idx] === '0' ? '1' : '0';
		return binaryArray.join('');
	  };
	  const handleFlip = (index) => {
		props.setSelectedColumns(prevBinary => flipBit(prevBinary, index));
		props.setToggleColumn(index);
	  };
	

	return (
		<>
		  <Button onClick={handleOpen} variant="outlined">View</Button>
		<Dialog open={open} handler={handleOpen}>
        <DialogHeader>Select Columns to View</DialogHeader>
        <DialogBody>
		<div className="grid grid-cols-3 gap-4">
			{props.columns.map((column, index) => 
			<div key={index} className="flex items-center space-x-2">
			  <Checkbox
				ripple={false}
				id={index}
				containerProps={{ className: "p-0" }}
				className="hover:before:content-none"
				checked={props.selectedColumns[index] === '1'}
                onChange={() => handleFlip(index)}
			  />
			  <span>{column}</span>
			  </div>
		  )}
		</div>
		</DialogBody>
		<DialogFooter>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
		</>
	);
  }

  export default MenuWithCheckbox;