import { Typography, Input, Button } from "@material-tailwind/react";
import { useState } from "react";
import { login } from "@lib/authService.js";
import bg from "@assets/logo_without_text.png";

export default function Login() {
	localStorage.removeItem("token");

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(`${username}@smrc.sidra.org`, password);
		} catch (error) {
			alert("Invalid credentials");
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			handleLogin(event);
		}
	};

	return (
		<section className="grid h-screen items-center">
			<div className="my-auto p-8 text-center">
				<img
					src={bg}
					alt="Sidra Logo background"
					className="h-24 lg::h-32 object-cover lg:block mx-auto mb-4"
				/>
				<Typography variant="h3" color="teal" className="mb-20">
					Sidra Genomics Core Portal
				</Typography>
				<Typography variant="h4" color="blue-gray" className="mb-2">
					Sign In
				</Typography>
				<Typography color="gray" className="mb-8 font-normal">
					Enter your username and password to sign in
				</Typography>

				<form action="#" className="mx-auto max-w-[24rem] text-left">
					<div className="mb-6">
						<label htmlFor="email">
							<Typography variant="small" className="mb-2 block font-medium text-gray-900">
								Your Username
							</Typography>
						</label>
						<div className="flex items-center">
							<Input
								id="email"
								color="gray"
								size="lg"
								type="email"
								name="email"
								placeholder="username"
								className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
								labelProps={{
									className: "hidden",
								}}
								onChange={(e) => setUsername(e.target.value)}
							/>
							<span className="ml-2 text-gray-700 text-md">@smrc.sidra.org</span>
						</div>
					</div>
					<div className="mb-6">
						<label htmlFor="password">
							<Typography variant="small" className="mb-2 block font-medium text-gray-900">
								Password
							</Typography>
						</label>
						<Input
							id="password"
							color="gray"
							size="lg"
							type="password"
							name="password"
							placeholder=""
							className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
							labelProps={{
								className: "hidden",
							}}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={handleKeyDown}
						/>
					</div>
					<Button color="gray" size="lg" className="mt-6" onClick={handleLogin} fullWidth>
						Sign In
					</Button>
				</form>
			</div>
		</section>
	);
}
