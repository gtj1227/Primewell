import { Button, Flex } from "antd";
import PatientCard from "../../components/PatientCard";
import UpcomingAptsCards from "../../components/UpcomingAptsCards";
import axios from "axios";
import { useEffect, useState } from "react";

const DoctorDashboard = (props) => {
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  // console.log(props.info);

  const getDoctorPatients = async () => {
    try {
      const res = await axios.post("http://localhost:3000/doctorPatients", {
        Doctor_ID: props.info.doctor_id,
      });
      // console.log(res.data);
      setDoctorPatients(res.data);
    } catch (error) {
      console.error("Error fetching doctor patient data:", error);
    }
  };

  const getUpcomingPatients = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/appointment/doctor/${props.info.doctor_id}`
      );
      console.log(res.data);
      setUpcomingAppointments(res.data);
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
    getDoctorPatients();
    getUpcomingPatients();
  }, []);

  return (
    <Flex
      justify="start"
      align="center"
      gap="60px"
      style={{
        borderRadius: "12px",
        padding: "33px 40px",
        width: "100%",
        overflowY: "auto",
      }}
    >
      {/* Doctor's Patients */}
      <Flex
        vertical
        justify="center"
        align="center"
        gap="20px"
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "33px 40px",
          width: "100%",
        }}
      >
        <h1 style={{ color: "#333333" }}>Patients</h1>
        {doctorPatients.length > 0 ?
          doctorPatients.map((patient) => (
            <PatientCard Fname={patient.First_Name} Lname={patient.Last_Name} />
          )) : (
            <p style={{margin: 0, color: "#333333", fontSize: "24px"}}>No Patients</p>
          )}
      </Flex>
      {/* Doctor's Upcoming Appointments */}
      <Flex
        vertical
        justify="center"
        align="center"
        gap="20px"
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "33px 40px",
          width: "100%",
        }}
      >
        <h1 style={{ color: "#333333" }}>Upcoming Appointments</h1>
        {upcomingAppointments.length > 0 ? 
          upcomingAppointments.map((patient) => (
            <UpcomingAptsCards
              Fname={patient.First_Name}
              Lname={patient.Last_Name}
              Date={patient.Appt_Date}
              Time={patient.Appt_Time}
              Tier={patient.Tier}
            ></UpcomingAptsCards>
          )) : (
            <p style={{margin: 0, color: "#333333", fontSize: "24px"}}>No Upcoming Appointments</p>
          )}
        {/* <UpcomingAptsCards></UpcomingAptsCards> */}
      </Flex>
    </Flex>
  );
};

export default DoctorDashboard;
