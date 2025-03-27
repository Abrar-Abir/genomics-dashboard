import { Typography, Input, Button } from "@material-tailwind/react";
import { useState } from "react";
import { login } from "@lib/authService.js";
import bg from "@assets/logo_without_text.png";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(username, password);
			// alert("Login successful!");
		} catch (error) {
			alert("Invalid credentials");
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
					Sidra Genomics Lab Portal
				</Typography>
				<Typography variant="h4" color="blue-gray" className="mb-2">
					Sign In
				</Typography>
				<Typography color="gray" className="mb-8 font-normal">
					Enter your email and password to sign in
				</Typography>

				<form action="#" className="mx-auto max-w-[24rem] text-left">
					<div className="mb-6">
						<label htmlFor="email">
							<Typography variant="small" className="mb-2 block font-medium text-gray-900">
								Your Email
							</Typography>
						</label>
						<Input
							id="email"
							color="gray"
							size="lg"
							type="email"
							name="email"
							placeholder="username@sidra.org"
							className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
							labelProps={{
								className: "hidden",
							}}
							onChange={(e) => setUsername(e.target.value)}
						/>
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
						/>
					</div>
					<div className="flex flex-wrap items-center justify-end gap-2">
						<Typography as="a" href="#" color="gray" className="font-medium">
							Forgot password
						</Typography>
					</div>
					<Button color="gray" size="lg" className="mt-6" onClick={handleLogin} fullWidth>
						Sign In
					</Button>
				</form>
			</div>
		</section>
	);
}

export default Login;
