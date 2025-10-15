import { Button, Flex, Form, message, Input } from "antd";
import IncomingRequestCard from "../../components/IncomingRequestCard";
import { useEffect, useState } from "react";
import axios from "axios";
const DoctorIncomingRequests = (props) => {
  const [form] = Form.useForm();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // const onFinish = () => {};

  // const onFail = () => {};

  const getIncomingRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/request/${props.info.doctor_id}`
      );
      // console.log(props.info.doctor_id);
      console.log("All Request: ", res.data);
      setIncomingRequests(res.data);
      const pending = res.data.filter(
        (request) => request.Request_Status === "Pending"
      );
      console.log("Filtered Requests: ", pending)
      setPendingRequests(pending);
      if (res.data.length === 0) {
        console.log("Couldn't get doctor patient data");
      } else {
        console.log("Doctor patient data retrieved successfully");
      }
    } catch (error) {
      console.error("Error fetching doctor patient data:", error);
    }
  };

  useEffect(() => {
    getIncomingRequests();
  }, []);

  return (
    <Flex
      vertical
      justify="start"
      align="center"
      gap="30px"
      fontFamily="Poppins"
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "33px 40px",
        width: "100%",
        overflowY: "auto",
        fontFamily: "Poppins",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
      }}
    >
      <h1 style={{ color: "#333333", marginBottom: 0 }}>Incoming Requests</h1>
      <h2 style={{ color: "#333333", marginBottom: 0 }}>
        Received - {pendingRequests.length}
      </h2>
      <Flex
        vertical
        gap="20px"
        style={{
          width: "50%",
        }}
      >
        {pendingRequests &&
          pendingRequests.map((patient, index) => (
            <IncomingRequestCard
              key={index}
              Fname={patient.First_name}
              Lname={patient.last_name}
              Patient_ID={patient.Patient_ID}
              Doctor_ID={patient.Doctor_ID}
              Appt_Date={(patient.Appt_Date).substring(0, 10)}
              Appt_Time={patient.Appt_Time}
              Tier={patient.Tier}
              fetchRequest={getIncomingRequests}
            />
          ))}
      </Flex>
    </Flex>
  );
};

export default DoctorIncomingRequests;