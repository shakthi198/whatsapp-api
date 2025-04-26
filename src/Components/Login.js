import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg-img-2.jpg";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        // Add login logic here
        navigate("/");
    };

    const handleRegister = () => {
        // Add registration logic here
        navigate("/");
    };

    const handleForgotPassword = () => {
        // Add forgot password logic here
        navigate("/");
    };

    return (
        <div
            className="flex items-center justify-center w-full h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}>

            <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg text-white ">
                <h2 className="text-3xl font-bold text-center mb-10">
                    {isForgotPassword ? "Forgot Password" : isRegister ? "Register" : "Login"}
                </h2>

                {isForgotPassword ? (
                    <>
                        <div className="mb-6">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-transparent border border-white/30 rounded-4xl px-3 py-2 outline-none text-white placeholder-white"
                            />
                        </div>
                        <button onClick={handleForgotPassword} className="w-full bg-[#DDA853] text-white font-semibold py-2 rounded-4xl shadow-md hover:bg-gray-200 transition">
                            Send Reset Link
                        </button>
                        <p className="text-center text-sm mt-4">
                            Remembered your password? {" "}
                            <span
                                className="text-[#DDA853] hover:text-white cursor-pointer"
                                onClick={() => setIsForgotPassword(false)}
                            >
                                Back to Login
                            </span>
                        </p>
                    </>
                ) : isRegister ? (
                    <>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="First Name"
                                className="w-full bg-transparent border border-white/30 rounded-4xl px-3 py-2 outline-none text-white placeholder-white"
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="w-full bg-transparent border border-white/30 rounded-4xl px-3 py-2 outline-none text-white placeholder-white"
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-transparent border border-white/30 rounded-4xl px-3 py-2 outline-none text-white placeholder-white"
                            />
                        </div>
                        <div className="mb-6">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full bg-transparent border border-white/30 rounded-4xl px-3 py-2 outline-none text-white placeholder-white"
                            />
                        </div>
                        <button onClick={handleRegister} className="w-full bg-[#DDA853] text-white font-semibold py-2 rounded-4xl shadow-md hover:bg-gray-200 transition">
                            Register
                        </button>
                        <p className="text-center text-sm mt-4">
                            Already have an account? {" "}
                            <span
                                className="text-[#DDA853] hover:text-white cursor-pointer"
                                onClick={() => setIsRegister(false)}
                            >
                                Login
                            </span>
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center border border-white/30 rounded-4xl px-3 py-2">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full bg-transparent outline-none text-white placeholder-white pr-8"
                                />
                                <FaUser className="text-white ml-2" size={18} />
                            </div>
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center border border-white/30 rounded-4xl px-3 py-2">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-transparent outline-none text-white placeholder-white pr-8"
                                />
                                <FaLock className="text-white ml-2" size={18} />
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <label className="flex items-center">
                                <input type="checkbox" className="mr-2" />
                                Remember me
                            </label>
                            <span
                                className="text-[#DDA853] hover:text-white cursor-pointer"
                                onClick={() => setIsForgotPassword(true)}
                            >
                                Forgot password?
                            </span>
                        </div>
                        <button onClick={handleLogin} className="w-full bg-[#DDA853] text-white font-semibold py-2 rounded-4xl shadow-md hover:bg-gray-200 transition">
                            Login
                        </button>
                        <p className="text-center text-sm mt-4">
                            Don't have an account? {" "}
                            <span
                                className="text-[#DDA853] hover:text-white cursor-pointer"
                                onClick={() => setIsRegister(true)}
                            >
                                Register
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Login;
