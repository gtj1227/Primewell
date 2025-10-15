import { Flex, Layout, Button, notification } from "antd";
import { UserOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Content } = Layout;

const IncomingRequestCard = (props) => {
  const [api, contextHolder] = notification.useNotification();
  const [date, setDate] = useState(() => dayjs())
  const [btnClicked, setBtnClicked] = useState(false)
  // const [rejectedBtnClicked, setRejectedBtnClicked] = useState(false)

  useEffect(() => {
    setDate(dayjs(props.Appt_Date))
  }, [])
  

  const handleAccept = async () => {
    setBtnClicked(true)

    try {
      console.log("Patient " + props.Fname + " " + props.Lname + " accepted");
      // props.Appt_Date = props.Appt_Date.substring(0, 10);
      // const response = await axios.post('http://localhost:3000/appointment', {
      const response = await axios.post('http://localhost:3000/appointment', {
        Patient_ID: props.Patient_ID,
        Doctor_ID: props.Doctor_ID,
        Appt_Date: props.Appt_Date,
        Appt_Time: props.Appt_Time,
        Tier: props.Tier
      });

      api.open({
        message: "Request Accepted!",
        description: 
            `Appointment made with ${props.Fname} ${props.Lname} Successfully!`
      })

      setTimeout(() => {
        props?.fetchRequest?.()
      }, 3000) // 3 seconds is usually enough
      // console.log(props.Appt_Date);
      console.log('Patient accepted:', response.data);
    } catch (error) {
      console.error('Error accepting request:', error.response?.data || error.message);
    } finally {
      setTimeout(() => setBtnClicked(false), 3000)
    }
  };

  const handleDecline = async () => {
    setBtnClicked(true)

    try {
      console.log("Patient " + props.Fname + " " + props.Lname + " Declined");
      console.log("Props info: ", props?.Patient_ID, props.Doctor_ID, props.Appt_Date, props.Appt_Time);
      // const response = await axios.patch('http://localhost:3000/rejectRequest', {
      const response = await axios.patch('http://localhost:3000/rejectRequest', {
        Patient_ID: props.Patient_ID,
        Doctor_ID: props.Doctor_ID,
        Appt_Date: props.Appt_Date,
        Appt_Time: props.Appt_Time
      });

      api.open({
        message: "Request Rejected!",
        description: 
            `No appointment made with ${props.Fname} ${props.Lname}!`
      })

      setTimeout(() => {
        props?.fetchRequest?.()
      }, 3000) // 3 seconds is usually enough

      console.log('Request declined: ', response.data);
    } catch (error) {
      console.error('Error declining request:', error.response?.data || error.message);
    } finally {
      setTimeout(() => setBtnClicked(false), 3000)
    }
  };

  const PatientName = ({ Fname, Lname }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center", // Vertically centers text
          height: "100%", // Takes full height of the parent
          paddingLeft: 10, // Ensures left alignment
        }}
      > 
        <Flex gap="10px" align="center">
          <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>
            {Fname} {Lname}
          </h2>
          <Flex vertical style={{ paddingLeft: "9px" }}>
            <h2 style={{color: "#ffffff", fontSize: "18px", margin: 0}}>{date?.format('MMM D, YYYY')} @ {props.Appt_Time}</h2>
            <h2 style={{color: "#ffffff", fontSize: "18px", margin: 0}}>Tier: {props.Tier}</h2>
          </Flex>
        </Flex>
      </div>
    );
  };

  return (
    <Layout
      style={{
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
        height: "180px",
        backgroundColor: "#f09c96",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
      }}
    >
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          width: "100%",
          height: "100%",
        }}
      >
        <Flex gap="10px">
          <UserOutlined style={{ fontSize: "40px", color: "white" }} />
          <PatientName Fname={props.Fname} Lname={props.Lname} />
        </Flex>
        <Flex gap="10px">
        {contextHolder}
          <Button id="accept-button"disabled={btnClicked}
            style={{
              backgroundColor: "#a2c3a4",
              color: "white",
              borderColor: "#a2c3a4",
              fontFamily: "Poppins",
              fontSize: 40,
              borderRadius: "100%",
              height: 60,
              width: 60,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
            }}
            onClick={() => { handleAccept() }}
          >
            <CheckOutlined />
          </Button>
          <Button disabled={btnClicked}
            style={{
              backgroundColor: "#FFE6E2",
              color: "black",
              borderColor: "#FFE6E2",
              fontFamily: "Poppins",
              fontSize: 40,
              borderRadius: "100%",
              height: 60,
              width: 60,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
            }}
            onClick={() => { handleDecline() }}
          >
            <CloseOutlined />
          </Button>
        </Flex>
      </Content>
    </Layout>
  );
};

export default IncomingRequestCard;
