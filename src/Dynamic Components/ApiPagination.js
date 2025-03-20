import React from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
    return (
        <div className="flex justify-center items-center mt-6 space-x-4">
            <button
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition duration-300"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            >
                <FaChevronLeft size={20} /> Prev
            </button>
            <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        className={`px-3 py-1 border rounded-md transition duration-300 ${currentPage === page ? "bg-blue-500 text-white border-blue-500" : "text-gray-600 border-gray-400 hover:bg-gray-200"}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300 ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : " text-blue-700 hover:text-blue-900"}`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            >
                Next <FaChevronRight size={20} />
            </button>
        </div>
    );
};
export default Pagination;