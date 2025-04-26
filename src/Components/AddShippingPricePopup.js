import React, { useState } from "react";
import { X, Trash2, Save } from "lucide-react";

const AddShippingPricePopup = ({ isOpen, onClose, onSubmit }) => {
    const [shippingPrice, setShippingPrice] = useState("");
    const [currentPrice, setCurrentPrice] = useState("Not Set"); // Stores the current shipping price
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!shippingPrice || isNaN(shippingPrice) || shippingPrice <= 0) {
            setError("Please enter a valid shipping price.");
            return;
        }

        setCurrentPrice(`₹ ${shippingPrice}`); // Update current price
        onSubmit(shippingPrice);
        setShippingPrice("");
        setError("");
        onClose();
    };

    const handleReset = () => {
        setShippingPrice("");
        setCurrentPrice("Not Set"); // Reset current price to "Not Set"
        setError("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center" style={{ fontFamily: "Montserrat"}}>
            <div className="bg-white p-6 w-105 shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Set Shipping Price</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Current Shipping Price */}
                <div className="flex items-center justify-between bg-gray-100 h-16 pr-4">
                    <div className="flex items-center border-l-4 border-blue-500 pl-4 py-5">
                        <span className="text-gray-900 font-semibold">Current Shipping Price:</span>
                    </div>
                    <span className="text-blue-600 font-semibold text-lg">{currentPrice}</span>
                </div>


                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Shipping Price Input */}
                    <div>
                        <label className="text-gray-700 font-semibold">New Shipping Price</label>
                        <div className="relative mt-1"><input
                            type="text" // Change from "number" to "text" to remove the spinner
                            name="shippingPrice"
                            placeholder="₹ Enter shipping price"
                            onChange={(e) => {
                                setShippingPrice(e.target.value);
                                setError("");
                            }}
                            className="w-full p-2 border mt-1 text-gray-700"
                            inputMode="numeric" // Allows only numbers but keeps it as text
                            pattern="[0-9]*" // Ensures only numeric input
                        />
                        </div>
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>


                    {/* Info Text */}
                    <p className="text-gray-500 text-sm">This price will be applied to all catalog items.</p>

                    {/* Buttons */}
                    <div className="flex justify-end items-center mt-4 gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center border border-gray-400 px-4 py-2 hover:bg-gray-200 transition "
                        >
                            <X className="w-5 h-5 mr-2" /> Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center border border-red-500 text-red-500 px-4 py-2 hover:bg-red-100 transition"
                        >
                            <Trash2 size={16} className="mr-1" /> Reset
                        </button>
                        <button
                            type="submit"
                            className={`flex items-center px-4 py-2 ${shippingPrice ? "bg-[#C5A76E] text-white hover:bg-[#C5A76E]" : "bg-[#C5A76E] text-white cursor-not-allowed"
                                } transition`}
                            disabled={!shippingPrice}
                        >
                            <Save size={16} className="mr-1" /> Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddShippingPricePopup;