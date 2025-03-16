export default function Legend({ legends = [], colors, active, setActive, isVertical }) {
	const handleClick = (legend) => {
		setActive((prev) => {
			const index = prev.indexOf(legend);
			if (index !== -1) {
				return [...prev.slice(0, index), ...prev.slice(index + 1)];
			} else {
				return [...prev, legend];
			}
		});
	};

	return (
		<div
			className={`flex ${isVertical ? "flex-col" : "flex-row"} items-start  ${
				isVertical ? "space-y-2 overflow-auto" : "ml-auto space-x-2"
			}`}
		>
			{legends.map((legend, idx) => (
				<div
					key={legend}
					className="flex items-center cursor-pointer space-x-2"
					onClick={() => handleClick(legend)}
				>
					<div
						className="w-4 h-4 rounded"
						style={{
							backgroundColor: active.includes(legend) ? colors[idx] : "#ccc",
						}}
					/>
					<span className={`text-sm ${active.includes(legend) ? "text-black" : "text-gray-400"}`}>
						{legend}
					</span>
				</div>
			))}
		</div>
	);
}
