import { AiOutlineClose } from "react-icons/ai";

const ModalReplica = ({ isOpen,onClose }) => {
    
    if (!isOpen) return null; // Hide modal when isOpen is false

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <div className="bg-white w-3/4 h-3/4 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-semibold">Test PUBLISHED</h2>
           <button className="top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer" onClick={onClose}>
                    <AiOutlineClose className="w-6 h-6" />
                  </button>
        </div>
        <div className="flex mt-4">
          {/* Screens Section */}
          <div className="w-1/3 border-r p-4">
            <h3 className="text-md font-medium">Screens</h3>
            <div className="mt-3 border rounded flex items-center p-2 bg-gray-100">
              <span className="pr-2">⋮⋮</span>
              <span>First screen</span>
            </div>
          </div>
          
          {/* Screen Title Section */}
          <div className="w-2/3 p-4">
            <h3 className="text-md font-medium">Screen title</h3>
          </div>
          
          {/* Mobile Preview Section */}
          <div className="w-1/4 p-4 h-full">
          <div className="w-60 h-80 bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center">
              <h3 className="text-md font-medium text-center h-full">Mobile Preview</h3>
              <div className="mt-4 flex justify-center">
                <button className="px-4 py-2 border rounded-lg mb-28">Preview</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalReplica;