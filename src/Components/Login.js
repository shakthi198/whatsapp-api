"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  // --- STATE ---
  const [companyName, setCompanyName] = useState("");
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [wabaNumber, setWabaNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- ERROR STATES ---
  const [errors, setErrors] = useState({});

  // --- LOGIN ---
  const handleLogin = async () => {
    let tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    if (!password) tempErrors.password = "Password is required";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost/whatsapp_admin/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      const data = await res.json();
      console.log(data);

      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        navigate("/"); // redirect to home/dashboard
      } else {
        setErrors({ email: "Invalid email or password" });
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: "Failed to connect to server" });
    }
  };

  // --- REGISTER ---
  const handleRegister = async () => {
    let tempErrors = {};
    if (!companyName) tempErrors.companyName = "Company Name is required";
    if (!primaryContactName) tempErrors.primaryContactName = "Primary Contact Name is required";
    if (!wabaNumber) tempErrors.wabaNumber = "WhatsApp Number is required";
    if (!email) tempErrors.email = "Email is required";
    if (!password) tempErrors.password = "Password is required";

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await fetch("http://localhost/whatsapp_admin/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          companyName,
          primaryContactName,
          waba_number: wabaNumber,
          email,
          password,
        }),
      });

      const data = await res.json();
      console.log(data);

      if (data.status === "success") {
        setIsRegister(false);
      } else {
        setErrors({ email: data.message });
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: "Failed to connect to server" });
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-100">
      {/* Left Side Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md p-6 relative">
          <h2 className="text-3xl font-bold text-center text-yellow-600 mb-6">
            {isRegister ? "Create Account" : "Login"}
          </h2>

          {isRegister ? (
            <>
              {/* Company Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.companyName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                )}
              </div>

              {/* Primary Contact Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">
                  Primary Contact Name
                </label>
                <input
                  type="text"
                  placeholder="Enter primary contact name"
                  value={primaryContactName}
                  onChange={(e) => setPrimaryContactName(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.primaryContactName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.primaryContactName && (
                  <p className="text-red-500 text-sm mt-1">{errors.primaryContactName}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">
                  Mobile / WhatsApp Number
                </label>
                <div className="flex gap-2">
                  <select
                    className="w-1/3 border border-yellow-300 rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-600"
                    value="+91"
                    disabled
                  >
                    <option>+91</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Enter WhatsApp number"
                    value={wabaNumber}
                    onChange={(e) => setWabaNumber(e.target.value)}
                    className={`w-2/3 border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                      errors.wabaNumber
                        ? "border-red-500 focus:ring-red-500"
                        : "border-yellow-300 focus:ring-yellow-500"
                    }`}
                  />
                </div>
                {errors.wabaNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.wabaNumber}</p>
                )}
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
              >
                Sign Up
              </button>

              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <span
                  className="text-yellow-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => setIsRegister(false)}
                >
                  Login instead
                </span>
              </p>
            </>
          ) : (
            <>
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-black">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-black">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-yellow-300 focus:ring-yellow-500"
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg font-semibold hover:bg-yellow-700 transition"
              >
                Login
              </button>

              <p className="text-center text-sm mt-4">
                Don’t have an account?{" "}
                <span
                  className="text-yellow-600 font-semibold cursor-pointer hover:underline"
                  onClick={() => setIsRegister(true)}
                >
                  Sign up
                </span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right Side Image */}
      <div className="w-1/2 h-full relative hidden md:flex">
        <img src="image1.jpg" alt="Auth Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-yellow-600/50"></div>
      </div>
    </div>
  );
};

export default Login;
