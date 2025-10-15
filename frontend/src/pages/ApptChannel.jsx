import { useEffect, useState, } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { Flex, Input, Button, Popover, Modal, Form, Checkbox, message, Table } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import socket from "../Socket";

const ApptChannel = ({ userInfo }) => {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [appt_id, setAppt_ID] = useState("")
  const [appt_end, setAppt_end] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm();
  const [symptoms, setSymptoms] = useState({});
  const [patientID, setPatientID] = useState("")
  const [patientRegiment, setPatientRegiment] = useState(null)
  const [isRegimentModalOpen, setIsRegimentModalOpen] = useState(false)

  const fetchMessages = async () => {
    const body = {
      Appointment_ID: location.state.appt_id
    }

    const res = await axios.post("/fetchApptMessages", body)

    setChatLog(res.data)
    console.log("Message Sent to DB: ", res.data)
  }

  useEffect(() => {
    if (location.state?.appt_id) {
      socket.connect()
      setAppt_ID(location.state.appt_id)
      console.log("Joining room:", location.state.appt_id); // <- check this
      setAppt_end(location.state.appt_end)
      fetchMessages()

      socket.emit("join_appointment", location.state.appt_id);


      socket.on("receive_msg", (data) => {
        setChatLog((prev) => [...prev, data]);
      });

      return () => {
        socket.off("receive_msg");
      };
    }
  }, [location.state]);

  useEffect(() => {
    const patientMessage = chatLog.find(msg => msg.senderType === "Patient");
    if (patientMessage) {
      setPatientID(patientMessage.senderID);
    }
  }, [chatLog])

  const sendMessage = () => {
    const messageData = {
      appt_id,
      message,
      senderName: userInfo.First_Name + " " + userInfo.Last_Name,
      senderID: userInfo?.patient_id ? userInfo.patient_id : userInfo.doctor_id,
      senderType: userInfo.userType
    };
    console.log(userInfo, messageData)
    socket.emit("send_msg", messageData);
    setMessage("");
  };

  const endAppointment = async () => {
    const paymentBody = {
      Patient_ID: patientID,
      Related_ID: appt_id,
      Payment_Type: "Appointment",
      Payment_Status: 'Pending'
    }
    console.log(paymentBody)
    await axios.post("/payment", paymentBody)
    const body = {
      Appointment_ID: appt_id,
      Doctor_ID: userInfo.doctor_id
    }
    await axios.patch("/endAppointment", body)
    navigate("/DoctorPortal/DoctorFeedback", {
      state: {
        patient_id: patientID,
        appt_id: appt_id
      }
    })

  }

  const openModal = async () => {
    const res = await axios.get(`/preliminaries/${patientID}`)
    console.log("Preliminary Data: ", res.data)
    const patientData = res.data[0]; // since the data is in an array
    setSymptoms(patientData?.Symptoms || {});
    setIsModalOpen(true)
  }

  const fetchRegiment = async () => {
    try {
      const res = await axios.get(`/regiment/${patientID}`);
      const regiment = res.data[0]?.Regiment;

      const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const formattedData = Object.entries(regiment)
        .map(([day, exercises]) => ({
          key: day,
          day,
          exercises: exercises.join(', ') || 'Rest',
        }))
        .sort((a, b) => weekdayOrder.indexOf(a.day) - weekdayOrder.indexOf(b.day));
      console.log("Patient Regiment: ", formattedData)
      setPatientRegiment(formattedData);
      setIsRegimentModalOpen(true)
    } catch (err) {
      console.error("Error fetching regiment:", err);
    }
  };

  const makeNewPatientRegiment = async () => {
    navigate("/Exercise", {
      state: {
        patient_id: patientID,
        appt_id: appt_id
      }
    })
  }


  const content = (
    <Flex vertical gap="10px">
      <Button type="primary" style={{ fontWeight: "700", fontSize: "18px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }} onClick={openModal}>Patient Forum</Button>
      {userInfo?.doctor_id && (<Button type="primary" style={{ fontWeight: "700", fontSize: "18px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }} onClick={fetchRegiment}>View Regiment</Button>)}
    </Flex>
  )

  const columns = [
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
    },
    {
      title: 'Exercises',
      dataIndex: 'exercises',
      key: 'exercises',
    },
  ];

  return (
    <>

      <div style={{ display: "flex", flexDirection: "column", width: "100%", backgroundColor: "#ffffff", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", borderRadius: "12px", padding: "33px 40px" }}>
        <h2>Room: {appt_id}</h2>
        <div style={{ overflowY: "scroll", width: "100%", height: "90%", display: "flex", flexDirection: "column", justifyContent: "flex-start", gap: "10px", marginTop: "20px" }}>
          {chatLog.map((msg, index) => {
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.senderType === "Patient" ? "flex-start" : "flex-end",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", flexDirection: msg.senderType === "Patient" ? "row" : "row-reverse", alignItems: "flex-end", gap: "10px" }}>
                  {msg.senderType === "Patient" ? (
                    <Popover content={content} title="View Patient Info">
                      <img
                        src={msg.senderType === "Patient" ? `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=random&color=fff&size=42` : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=random&color=fff&size=42`}
                        alt="Message Icon"
                        title={msg.senderName}
                        style={{
                          width: "42px",
                          height: "auto",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    </Popover>
                  ) : (
                    <img
                      src={msg.senderType === "Patient" ? `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=random&color=fff&size=42` : `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName)}&background=random&color=fff&size=42`}
                      alt="Message Icon"
                      title={msg.senderName}
                      style={{
                        width: "42px",
                        height: "auto",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />

                  )}
                  <div
                    style={{
                      backgroundColor: msg.senderType === "Patient" ? "#f0f0f0" : "#d9f7be",
                      borderRadius: "12px",
                      padding: msg.senderType === "Patient" ? "10px 10px 10px 20px" : "10px 20px 10px 10px",
                      width: "400px",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "24px", textAlign: msg.senderType === "Patient" ? "left" : "right" }}>{msg.message}</p>
                    <p style={{ fontSize: "11px", margin: 0, textAlign: msg.senderType === "Patient" ? "left" : "right" }}>
                      <strong>{dayjs(msg.sent_at).format("h:mm A")}</strong>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Flex justify="center" align="center" gap="15px" style={{ marginTop: "30px" }}>
          <Input
            id="message"
            disabled={appt_end}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
            style={{ fontSize: "24px", width: "700px", }}
          />
          <Button id="send-btn" disabled={appt_end} type="primary" style={{ fontWeight: "700", fontSize: "24px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }} onClick={sendMessage}>Send</Button>
          {userInfo?.doctor_id && (<Button id="end-appt-btn" type="primary" style={{ fontWeight: "700", fontSize: "24px", backgroundColor: "rgb(239, 71, 111)", color: "#ffffff", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }} onClick={endAppointment}>End Appointment</Button>)}
        </Flex>
      </div>

      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={false} centered className="style-modal" width={650}>
        <Flex
          vertical
          justify="center"
          align="center"
          style={{
            border: "1px solid #999999",
            borderRadius: "16px",
            padding: "25px",
          }}
        >
          <h1 style={{ fontSize: "64px", color: "#333333" }}>Preliminary Form</h1>
          <Flex vertical style={{ width: "100%" }}>
            <Form
              form={form}
              layout="vertical"
              autoComplete="off"
            >
              <Form.Item>
                <div>
                  <table style={{ textAlign: "left", width: "100%" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "0px 11px" }}>MUSCLE/JOINT/BONE</th>
                        <th style={{ padding: "0px 11px" }}>
                          EYES/EARS/NOSE/THROAT
                        </th>
                        <th style={{ padding: "0px 11px" }}>NEUROLOGIC</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "0px 11px" }}>
                          {[
                            "Back Pain",
                            "Leg Pain",
                            "Neck Pain",
                            "Arm Pain",
                            "Joint Pain",
                          ].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Muscle/Joint/Bone"]?.includes(
                                    symptom
                                  ) || false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "0px 11px" }}>
                          {[
                            "Blurred Vision",
                            "Loss of Hearing",
                            "Nose Bleeds",
                            "Sinus Problems",
                            "Strep Throat",
                          ].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Eyes/Ears/Nose/Throat"]?.includes(
                                    symptom
                                  ) || false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "0px 11px" }}>
                          {[
                            "Fainting",
                            "Dizziness",
                            "Headache",
                            "Memory Loss",
                            "Depression",
                          ].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Neurologic"]?.includes(symptom) ||
                                  false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ padding: "0px 11px" }}>SKIN</th>
                        <th style={{ padding: "0px 11px" }}>LUNGS</th>
                        <th style={{ padding: "0px 11px" }}>CARDIOVASCULAR</th>
                      </tr>
                      <tr>
                        <td style={{ padding: "0px 11px", paddingBottom: "20px" }}>
                          {["Itching", "Rash", "Callus"].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Skin"]?.includes(symptom) || false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "0px 11px" }}>
                          {[
                            "Shortness of Breath",
                            "Persistent Cough",
                            "Asthma",
                            "Sleep Apnea",
                          ].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Lungs"]?.includes(symptom) || false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                        <td style={{ padding: "0px 11px" }}>
                          {[
                            "Chest Pain",
                            "Irregular Heart Beat",
                            "Heart Attack",
                            "Heart Disease",
                          ].map((symptom) => (
                            <div key={symptom}>
                              <Checkbox
                                disabled
                                checked={
                                  symptoms["Cardiovascular"]?.includes(symptom) ||
                                  false
                                }

                              >
                                {symptom}
                              </Checkbox>
                              <br />
                            </div>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Form.Item>
            </Form>
          </Flex>
        </Flex>
      </Modal>
      <Modal open={isRegimentModalOpen} onCancel={() => setIsRegimentModalOpen(false)} footer={false} centered className="style-modal" width={650}>
        <Table columns={columns} dataSource={patientRegiment} pagination={false} bordered />
        <Flex justify="center" align="center" style={{ marginTop: "25px" }}>
          <Button type="primary" style={{ fontWeight: "700", fontSize: "24px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)" }} onClick={makeNewPatientRegiment}>Make New Regiment</Button>
        </Flex>
      </Modal>
    </>
  );
};

export default ApptChannel;