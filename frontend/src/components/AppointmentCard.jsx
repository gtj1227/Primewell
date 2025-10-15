import {Button, Flex, Calendar, Select, Space, notification} from "antd"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import dayjs from 'dayjs';
import axios from "axios";

const AppointmentCard = ({apptInfo}) => {
    const [btnClicked, setBtnClicked] = useState(false)
    const [api, contextHolder] = notification.useNotification();
    const [date, setDate] = useState(() => dayjs())
    const [appt_end, setAppt_end] = useState(false)
    const navigate = useNavigate()
    const [todayDate, setTodayDate] = useState(() => dayjs())

    const fetchApptEnd = async () => {
        const body = {
            Appointment_ID: apptInfo.Appointment_ID
        }
        // const res1 = await axios.post("http://localhost:3000/fetchApptEndStatus", body)
        const res1 = await axios.post("/fetchApptEndStatus", body)
        setAppt_end(res1.data.Appt_End)
    }

    useEffect(() => {
        setDate(dayjs(apptInfo?.Appt_Date))
        fetchApptEnd()
        console.log(apptInfo)
    }, [])

    const handleClick = async () => {
        const body = {
            Appointment_ID: apptInfo.Appointment_ID
        }
        // const res = await axios.post("http://localhost:3000/fetchApptStartStatus", body)
        const res = await axios.post("/fetchApptStartStatus", body)
        console.log("Start:", res.data)        
        if (res.data.Appt_Start === 1){
            navigate("/PatientPortal/ApptChannel", {
                state: {
                    appt_id: apptInfo.Appointment_ID,
                    appt_end: appt_end
                }
            })
        } else {
            axios.open({
                message: 'Appointment Not Started!',
                description: 'Please wait for doctor to start appointment.',
            });
        }

    }

    return (
        <Flex vertical gap="10px" style={{
            background: "#f09c96", 
            padding: "20px 30px", 
            width: "100%", 
            maxWidth: "100%", 
            borderRadius: "8px",
            boxSizing: "border-box",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            {/* Section for Displaying Doctor Info and Availablilty */}
            <Flex align="center" justify="space-between">
                <Flex vertical gap="15px">
                    <Flex gap="10px">
                        <img src="/calender.svg" alt="Icon" style={{ 
                            width: "52px", 
                            height: "auto", 
                            borderRadius: "10px",
                            flexShrink: 0
                        }} />
                        <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>{date?.format('MMM D, YYYY')}</h2>
                        <h2 style={{color: "#ffffff", fontSize: "32px", paddingLeft: "9px", margin: 0}}>{`${apptInfo?.Appt_Time}`}</h2>
                    </Flex>
                    <Flex gap="10px">
                        <img src="/firstAidIcon.svg" alt="Icon" style={{ 
                            width: "52px", 
                            height: "auto", 
                            borderRadius: "10px",
                            flexShrink: 0
                        }} />
                        <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>Dr. {`${apptInfo?.first_name} ${apptInfo?.last_name}`}</h2>
                        <h2 style={{color: "#ffffff", fontSize: "32px", paddingLeft: "9px", margin: 0}}>{`${apptInfo?.specialty}`}</h2>
                    </Flex>
                </Flex>
                {contextHolder}
                <Button id="appt-btn" type="primary" style={{fontWeight: "700", fontSize: "24px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"}} onClick={handleClick}>
                    {appt_end ? "View Appointment Log" : date?.isSame(todayDate, 'day') ? "Join Appointment" : date.diff(dayjs(), 'day') === 0 ? `${date.diff(dayjs(), 'day') + 1} day till Appointment` : `${date.diff(dayjs(), 'day') + 1} days Till Appointment`}
                </Button>
            </Flex>
        </Flex>
    )
}

export default AppointmentCard