import { Button, Flex, Form, message, Input } from "antd";
import IncomingRequestCard from "../../components/IncomingRequestCard";
import { useEffect, useState } from "react";
import axios from "axios";

const DoctorPillRequest = (props) => {
  const [form] = Form.useForm();
  const [incomingRequests, setIncomingRequests] = useState([]);

  // const onFinish = () => {};

  // const onFail = () => {};

  const getIncomingRequests = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/request/${props.info.doctor_id}`
      );
      // console.log(props.info.doctor_id);
      // console.log(res.data);
      setIncomingRequests(res.data);
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
      }}
    >
      <h1 style={{ color: "#333333", marginBottom: 0 }}>Incoming Requests</h1>
      <h2 style={{ color: "#333333", marginBottom: 0 }}>
        Received - {incomingRequests.length}
      </h2>
      <Flex
        vertical
        gap="20px"
        style={{
          width: "50%",
        }}
      >
        {incomingRequests &&
          incomingRequests.map((patient, index) => (
            <IncomingRequestCard
              key={index}
              Fname={patient.First_name}
              Lname={patient.last_name}
            />
          ))}
      </Flex>
    </Flex>
  );
};

export default DoctorPillRequest;
