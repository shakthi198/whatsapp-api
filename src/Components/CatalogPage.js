import { Truck } from "lucide-react";
import React from "react";
import { HiChevronRight } from "react-icons/hi";

const CatalogPage = ({ catalogs, onAddClick, onAddShippingClick }) => {

    return (
        <div className=" bg-gray-100 p-6" style={{ fontFamily: "Montserrat"}}>
            <div className="flex items-center mb-4">
                <h2 className="text-3xl font-semibold text-gray-700">Catalog</h2>
                <div className="h-5 w-[2px] bg-gray-300 mx-2"></div>
                <div className="text-yellow-600 text-md flex items-center">
                    <span>Home</span>
                    <HiChevronRight className="mx-1 text-black text-md" />
                    <span className="text-yellow-600">Catalog</span>
                </div>
            </div>
            <div className=" mx-auto bg-white shadow-md p-6 rounded-lg">

                {/* Top Section */}
                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-[#C5A76E] text-white px-4 py-2 rounded-md shadow-sm"
                        onClick={onAddClick}> + Add Catalog
                    </button>
                    <button
                        className="bg-[#C5A76E] text-white px-4 py-2 rounded-md shadow-sm flex items-center"
                        onClick={onAddShippingClick}
                    >
                        <Truck size={18} className="mr-2" /> Add Shipping Price
                    </button>
                </div>


                {/* Catalog List */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg min-h-[150px] flex items-center justify-center">
                    {catalogs.length === 0 ? (
                        <p className="text-gray-400 italic">No catalogs added yet</p>
                    ) : (
                        <div className="w-full">
                            {catalogs.map((catalog, index) => (
                                <div key={index} className="p-4 shadow-sm bg-white">
                                    {catalog.image && (
                                        <img
                                            src={catalog.image}
                                            alt={catalog.name}
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    )}
                                    <h3 className="mt-2 text-lg font-semibold">{catalog.name}</h3>
                                    <p className="text-gray-500">{catalog.type}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;