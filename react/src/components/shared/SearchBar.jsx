import React, { useState, useEffect } from "react";
import { Input } from "@material-tailwind/react";
import { debounce } from "lodash";

export default function SearchBar({ allSuggestions, setSearchValue }) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState(allSuggestions);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const fetchSuggestions = async (searchText) => {
		const mockSuggestions = allSuggestions.filter((item) =>
			item.toLowerCase().includes(searchText.toLowerCase())
		);
		setSuggestions(mockSuggestions);
	};

	const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

	const handleInputChange = (event) => {
		const value = event.target.value;
		setQuery(value);
		debouncedFetchSuggestions(value);
		setShowSuggestions(true);
	};

	const handleSuggestionClick = (suggestion) => {
		setQuery(suggestion);
		setSearchValue(suggestion);
		setShowSuggestions(false);
	};

	useEffect(() => {
		setShowSuggestions(false);
		const initialSuggestions = allSuggestions.filter((item) => item.toLowerCase().includes(""));
		setSuggestions(initialSuggestions);
		debouncedFetchSuggestions("");
	}, [allSuggestions]);

	return (
		<div className="relative w-80 h-[50px] max-w-md mx-auto mt-1">
			<Input
				placeholder="Type"
				variant="static"
				value={query}
				onChange={handleInputChange}
				onFocus={() => setShowSuggestions(true)}
				onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
				className="bg-white rounded shadow-md"
			/>

			{showSuggestions && suggestions.length > 0 && (
				<div className="absolute w-full mt-1 bg-white rounded shadow-lg z-10">
					<ul className="max-h-96 overflow-y-auto p-0">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								onMouseDown={() => handleSuggestionClick(suggestion)}
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
