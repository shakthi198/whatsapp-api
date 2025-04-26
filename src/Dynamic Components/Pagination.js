import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  onNextClick,
  onPrevClick,
}) => {
  const handleNext = () => {
    setCurrentPage(currentPage < totalPages ? currentPage + 1 : 1); // Loops to first page after last
    onNextClick();
  };

  const handlePrev = () => {
    setCurrentPage(currentPage > 1 ? currentPage - 1 : totalPages); // Loops to last page after first
    onPrevClick();
  };

  return (
    <div className="flex justify-center mt-4 gap-2">
      {/* Previous Button */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
        onClick={handlePrev}
      >
        Previous
      </button>

      {/* Next Button */}
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;