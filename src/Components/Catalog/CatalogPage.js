import { Truck } from "lucide-react";
import React from "react";
import { HiChevronRight } from "react-icons/hi";

const CatalogPage = ({ catalogs, onAddClick, onAddShippingClick }) => {

 /*   return (
       <div className="max-w-7xl mx-auto p-4 md:p-6" style={{ fontFamily: "'Montserrat'" }}>
    
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center mb-3 md:mb-0">
          <h2 className="text-xl md:text-2xl font-medium mb-2 md:mb-0 md:mr-4">Catalog</h2>
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <span className="mr-2 hidden md:inline">|</span>
            <span className="text-yellow-600">Home</span>
            <span className="mx-1 md:mx-2">›</span>
            <span className="text-yellow-600">Catalog</span>
          </div>
        </div>
      </div>


            <div className=" mx-auto bg-white shadow-md p-4 rounded-lg">

                
                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm"
                        onClick={onAddClick}> + Add Catalog
                    </button>
                    <button
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm flex items-center"
                        onClick={onAddShippingClick}
                    >
                        <Truck size={18} className="mr-2" /> Add Shipping Price
                    </button>
                </div>


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
    );*/
};

export default CatalogPage;