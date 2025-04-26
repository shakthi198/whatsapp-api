import React from "react";
import ReusableTable from "../Dynamic Components/ReusableTable";

const ScheduleLogo = () => {
  const columns = [
    "S.No",
    "Campaign Name",
    "Published Time",
    "Target Users",
    "Submitted",
    "Failed Users",
    "Sent",
    "Delivered",
    "Read",
    "Status",
  ];

  const data = [
    {
      "S.No": 1,
      "Campaign Name": "Summer Sale",
      "Published Time": "2025-03-13 10:00 AM",
      "Target Users": 5000,
      Submitted: 4500,
      "Failed Users": 500,
      Sent: 4300,
      Delivered: 4200,
      Read: 3900,
      Status: "Completed",
    },
    {
      "S.No": 2,
      "Campaign Name": "New Product Launch",
      "Published Time": "2025-03-12 02:00 PM",
      "Target Users": 8000,
      Submitted: 7200,
      "Failed Users": 800,
      Sent: 7000,
      Delivered: 6800,
      Read: 6500,
      Status: "In Progress",
    },
  ];

  return (
    <div >
      <ReusableTable columns={columns} data={data} />
    </div>
  );
};

export default ScheduleLogo;