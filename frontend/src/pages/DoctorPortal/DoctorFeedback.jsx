import { Button, Flex, Form, Input } from "antd"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const {TextArea} = Input

const DoctorFeedback = ({userInfo}) => {
    const location = useLocation()
    const [form] = Form.useForm()
    const [patientName, setPatientName] = useState("")
    const navigate = useNavigate()


    useEffect(() => {
        form.resetFields()
    }, [])

    const fecthPatientName = async () => {
        const res = await axios.get(`/patient/${location.state.patient_id}`)
        console.log("Fetched Patient Name for Feedback: ", res.data)
        setPatientName(res.data)
    }

    useEffect(() => {
        fecthPatientName()
    }, [location.state])

    const onFinish = async (value) => {
        const trimmedFeedback = value.doctor_feedback.trim()
        const body = {
            appointment_id: location.state.appt_id,
            doctor_feedback: trimmedFeedback,
            doctor_id: userInfo.doctor_id
        }
        await axios.patch('/giveFeedback', body)
        navigate("/DoctorPortal/DoctorPrescription", {
            state: {
              patient_id: location.state.patient_id,
              appt_id: location.state.appt_id
            }
        })
    }


    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "33px 40px",
            width: "100%",
            overflow: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <h1>Give Feedback to {`${patientName.First_Name} ${patientName.Last_Name}`}</h1>
            <Form form={form} layout="vertical" autoComplete="off" style={{width: "90%"}} onFinish={onFinish}>
                <Form.Item name="doctor_feedback" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Feedback</span>} rules={[
                    {
                        required: true,
                        message: "Please input your Feedback!"
                    } 
                ]} validateTrigger="onSubmit">
                    <TextArea id="doctor_feedback_text" rows={4} placeholder="Enter any feedback you have for the Patient!"/>
                </Form.Item>
                <Form.Item>
                    <Button id="send-feedback" type="primary" htmlType="submit" 
                                style={{width: "100%", borderRadius: "18px", padding: "22px 0px", backgroundColor: "#f09c96", fontSize: "18px"}}>Submit</Button>
                </Form.Item>
            </Form>
        </Flex>
    )
}

export default DoctorFeedback