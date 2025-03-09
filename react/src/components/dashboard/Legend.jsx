export default function Legend({ categories, colors, activeCategories, setActiveCategories }) {
	const handleLegendClick = (category) => {
		setActiveCategories((prev) => {
			const index = prev.indexOf(category);
			if (index !== -1) {
				return [...prev.slice(0, index), ...prev.slice(index + 1)];
			} else {
				return [...prev, category];
			}
		});
	};
	return (
		<div className="flex flex-row items-start ml-auto space-x-2">
			{categories.map((category, idx) => (
				<div
					key={category}
					className="flex items-center cursor-pointer space-x-2"
					onClick={() => handleLegendClick(category)}
				>
					<div
						className="w-4 h-4 rounded"
						style={{
							backgroundColor: activeCategories.includes(category) ? colors[idx] : "#ccc",
						}}
					/>
					<span
						className={`text-sm ${
							activeCategories.includes(category) ? "text-black" : "text-gray-400"
						}`}
					>
						{category}
					</span>
				</div>
			))}
		</div>
	);
}
