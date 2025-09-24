import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import apiEndpoints from "../../apiconfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiOutlineCheckCircle } from "react-icons/ai";
const PaymentDialog = ({ isOpen, onClose, addTransaction }) => {
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState(null);
  const paymentGatewayCharges = 125;

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(apiEndpoints.getProfile, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "getProfile" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") setUser(data.user);
        else console.error("Failed to fetch user:", data.message);
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, [isOpen]);

  if (!isOpen) return null;

  const enteredAmount = parseFloat(amount) || 0;
  const gstRate = 0.18;
  const gstAmount = enteredAmount * gstRate;
  const totalCharges = gstAmount + paymentGatewayCharges;
  const totalAmountPayable = enteredAmount + totalCharges;

  const handlePay = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!user) {
      alert("User info not loaded yet. Try again.");
      return;
    }

    const txnData = {
      transaction_id: "TXN" + Date.now(),
      customer_name: user.primary_contact_name,
      amount: enteredAmount,
      gst: gstAmount,
      total_amount: totalAmountPayable,
      status: "Completed",
      date_time: new Date().toLocaleString(),
    };

    fetch(apiEndpoints.transaction, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(txnData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          addTransaction(txnData); // update parent
       toast.success(
  "Transaction Completed", 
  {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    icon: <AiOutlineCheckCircle className="text-white w-5 h-5" /> // ✅ custom icon
  }
);
          onClose();
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
        <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={onClose}
          >
            <AiOutlineClose className="w-6 h-6" />
          </button>

          <h2 className="text-lg font-semibold text-gray-700 mb-4">Add Fund</h2>

          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Type of payment
              </label>
              <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100">
                <option>Online Payment - UPI, Credit Card, NetBanking</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
              />
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Entered Amount:</span>
              <span>₹ {enteredAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST 18%:</span>
              <span>₹ {gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Gateway Charges:</span>
              <span>₹ {paymentGatewayCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 font-bold text-gray-700 mt-4">
              <span>Total Charges:</span>
              <span>₹ {totalCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-lg font-bold text-gray-800">
              <span>Total Amount Payable:</span>
              <span>₹ {totalAmountPayable.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-semibold"
              onClick={handlePay}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>

      {/* Toast Container */}
     
    </>
  );
};

export default PaymentDialog;
