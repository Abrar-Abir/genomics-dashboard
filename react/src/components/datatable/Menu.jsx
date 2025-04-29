import { Button, Dialog, DialogHeader, DialogBody, Checkbox } from "@material-tailwind/react";
import { useState } from "react";
import schema from "@lib/schema.json";

export default function MenuWithCheckbox({ cols, setCols }) {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(!open);
	const handleFlip = (idx) => {
		setCols((binaryStr) => {
			const binaryArray = binaryStr.split("");
			binaryArray[idx] = binaryArray[idx] === "0" ? "1" : "0";
			return binaryArray.join("");
		});
	};

	return (
		<>
			<Button onClick={handleOpen} variant="outlined">
				View
			</Button>
			<Dialog open={open} handler={handleOpen} className="h-[85vh]">
				<DialogHeader className="flex justify-between items-center h-[5vh]">
					<span>Select Columns to View</span>
					<Button variant="gradient" onClick={handleOpen}>
						<span>Confirm</span>
					</Button>
				</DialogHeader>
				<DialogBody className="overflow-auto h-[80vh]">
					<div className="grid grid-cols-3 gap-4 ">
						{schema.headers.map((column, index) => (
							<div key={index} className="flex items-center space-x-2">
								<Checkbox
									ripple={false}
									id={index}
									containerProps={{ className: "p-0" }}
									className="hover:before:content-none"
									checked={cols[index] === "1"}
									onChange={() => handleFlip(index)}
								/>
								<span>{column}</span>
							</div>
						))}
					</div>
				</DialogBody>
			</Dialog>
		</>
	);
}
