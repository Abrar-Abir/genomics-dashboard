import React, { useState, useEffect } from "react";
import { Input } from "@material-tailwind/react";
import { debounce } from "lodash";

export default function SearchBar({ allSuggestions, setValue }) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState(allSuggestions);
	const [show, setShow] = useState(false);

	const fetch = async (text) => {
		setSuggestions(
			allSuggestions.filter((item) => item.toLowerCase().includes(text.toLowerCase()))
		);
		// setSuggestions(mockSuggestions);
	};

	const debouncedFetch = debounce(fetch, 500);

	const handleInput = (event) => {
		// const value = event.target.value;
		setQuery(event.target.value);
		debouncedFetch(event.target.value);
		setShow(true);
	};

	const handleClick = (suggestion) => {
		setQuery(suggestion);
		setValue(suggestion);
		setShow(false);
	};

	useEffect(() => {
		setShow(false);
		const initialSuggestions = allSuggestions.filter((item) => item.toLowerCase().includes(""));
		setSuggestions(initialSuggestions);
		debouncedFetch("");
	}, [allSuggestions]);

	return (
		<div className="relative w-80 h-[50px] max-w-md mx-auto mt-1">
			<Input
				placeholder="Type"
				variant="static"
				value={query}
				onChange={handleInput}
				onFocus={() => setShow(true)}
				onBlur={() => setTimeout(() => setShow(false), 500)}
				className="bg-white rounded shadow-md"
			/>

			{show && suggestions.length > 0 && (
				<div className="absolute w-full mt-1 bg-white rounded shadow-lg z-10">
					<ul className="max-h-96 overflow-y-auto p-0">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								onMouseDown={() => handleClick(suggestion)}
								className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
							>
								{suggestion}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
