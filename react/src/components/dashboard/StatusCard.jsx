import { useState, useEffect } from "react";
import { BarChart, Subtitle, NumberInput } from "@tremor/react";
import { IconButton } from "@material-tailwind/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { COLORS } from "@components/utils.js";
import Legend from "./Legend";
export default function StatusCard({ data }) {
	const legends = data?.legends || [];
	const chart = data?.chart || [];

	const [size, setSize] = useState(6);
	const [start, setStart] = useState(0);
	const [stacked, setStacked] = useState(true);
	const [active, setActive] = useState(legends);
	useEffect(() => {
		setActive(legends);
	}, [data]);

	const window = chart.slice(start, start + size);

	const scroll = (direction) => {
		const shift = start + direction * size;
		if (direction === 1) {
			setStart(Math.min(Math.max(chart?.length - size, 0), shift));
		} else if (direction === -1) {
			setStart(Math.max(shift, 0));
		}
	};

	return (
		<div className="flex h-full">
			<div className="flex-1 flex flex-col space-y-2">
				<div className="flex justify-between items-center ml-6 gap-x-4 text-gray-500 hover:text-black">
					<div className="flex items-center gap-x-4">
						<div className="flex justify-end items-center">
							<input
								type="checkbox"
								className="h-4 w-4 mx-2 rounded-sm"
								checked={stacked}
								onChange={() => setStacked(!stacked)}
							/>
							<Subtitle>Stacked</Subtitle>
						</div>
					</div>
					<Legend
						legends={legends}
						colors={COLORS}
						active={active}
						setActive={setActive}
						isVertical={false}
					/>
				</div>

				<div className="mt-4 h-full">
					<BarChart
						categories={legends.filter((c) => active.includes(c))}
						showAnimation={true}
						animationDuration={500}
						className="select-none"
						data={window}
						index="pi"
						colors={COLORS.filter((_, i) => active.includes(legends[i]))}
						showLegend={false}
						yAxisWidth={56}
						xAxisLabel="PI"
						stack={stacked}
					/>
					{chart && (
						<div className="flex justify-center w-full gap-x-4 ml-6 mt-2">
							<IconButton
								color={"black"}
								variant={start === 0 ? "outlined" : "filled"}
								disabled={start === 0}
								onClick={() => scroll(-1)}
							>
								<ChevronLeftIcon className="w-auto h-6" />
							</IconButton>
							<NumberInput
								className="max-w-[2rem]"
								value={size}
								step={6}
								enableStepper={true}
								min={0}
								onValueChange={(val) => setSize(val)}
							/>
							<IconButton
								color={"black"}
								variant={start + size >= chart?.length ? "outlined" : "filled"}
								disabled={start + size >= chart?.length}
								onClick={() => scroll(1)}
							>
								<ChevronRightIcon className="w-auto h-6" />
							</IconButton>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
