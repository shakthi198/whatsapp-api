import React, { useState } from "react";
import { ChevronDown, Upload, X } from "lucide-react"; // Import the Upload icon

const AddCatalogPopup = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({ name: "", type: "", image: "" });
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const catalogTypes = [
        "Adoptable Pets",
        "Automotive Models",
        "Avatar",
        "Bookable",
        "Commerce",
        "Destinations",
        "Flights",
        "Home Listings",
        "Hotels",
        "Jobs",
        "Local Delivery Shipping Profiles",
        "Local Service Businesses",
        "Location Based Items",
        "Media Titles",
        "Offer Items",
        "Offline Commerce",
    ];

    // Handle Form Input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle Image Upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, image: reader.result });
        };
        if (file) reader.readAsDataURL(file);
    };

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.type) return;
        onSubmit(formData);
        setFormData({ name: "", type: "", image: "" });
    };

    if (!isOpen) return null;

  /*  return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center transition-opacity duration-300"
        style={{ fontFamily: "Montserrat"}}>
            <div className="bg-white p-6 w-150 shadow-lg">
                <div className="flex justify-between">
                    <h2 className="text-xl font-semibold mb-4">Create New Catalog</h2>
                    <button onClick={onClose} className="text-gray-500 text-lg">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
          
                    <div>
                        <label className="text-gray-700 font-semibold">Catalog Name*</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter Catalog Name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border mt-1"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 font-semibold">Catalog Type*</label>
                        <div className="relative">
                            <input
                                type="text"
                                name="type"
                                placeholder=""
                                value={formData.type}
                                readOnly
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full p-2 border  mt-1 cursor-pointer"
                                required
                            />
                            <span className="absolute right-2 top-4 cursor-pointer">
                                <ChevronDown size={16} />
                            </span>
                            {dropdownOpen && (
                                <ul className="absolute bg-white border mt-1 w-full max-h-40 overflow-y-auto shadow-lg z-10">
                                    {catalogTypes.map((type) => (
                                        <li
                                            key={type}
                                            onClick={() => { setFormData({ ...formData, type }); setDropdownOpen(false); }}
                                            className="p-2 hover:bg-gray-200 cursor-pointer"
                                        >
                                            {type}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                

                    <div>
                        <label className="text-gray-700 font-semibold">
                            Upload Image<span className="text-red-500">*</span>
                        </label>
                        <label className="flex items-center justify-between w-full border p-2 mt-1 cursor-pointer bg-white">
                            <span className="text-gray-500 flex items-center justify-center gap-2 w-full">
                                <Upload size={16} />
                                Upload
                            </span>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                        {formData.image && (
                            <img src={formData.image} alt="Preview" className="mt-2 w-full h-20 object-cover rounded-md" />
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-30 bg-[#C5A76E] text-white py-2  mt-3 hover:bg-[#b1925c] transition"
                    >
                        Submit
                    </button>

                </form>

            </div>
        </div>
    );*/
};

export default AddCatalogPopup;