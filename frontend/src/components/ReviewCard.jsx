import {Button, Flex, Calendar, Select, Space, notification} from "antd"
import { useState, useEffect } from "react"
import axios from "axios";
import dayjs from 'dayjs';
import SlotCard from "./SlotCard";

const disabledDate = (current) => {
    const today = dayjs().startOf('day');
    const maxDate = today.add(28, 'day');
  
    return current.isBefore(today, 'day') || current.isAfter(maxDate, 'day');
};

const option = [
    {
        value: "Basic",
        label: "Basic"
    }, 
    {
        value: "Plus",
        label: "Plus"
    }, 
    {
        value: "Premium",
        label: "Premium"
    }, 
    
]

const RequestCard = (props) => {
    const [api, contextHolder] = notification.useNotification();
    const [btnClicked, setBtnClicked] = useState(false)
    const [selectDate, setSelectDate] = useState(() => dayjs())
    const [daySchedule, setDaySchedule] = useState(null)
    const [timeSlot, setTimeSlot] = useState("")
    const [activeIndex, setActiveIndex] = useState(null)
    const [tier, setTier] = useState("")
    const [drop, setDrop] = useState(false)
    const [requestBtnClicked, setRequestBtnClicked] = useState(false)
    const [dropBtnClicked, setDropBtnClicked] = useState(false)

    const handleSelect = (value) => {
        setSelectDate(value)
        console.log("Selected Date: ", value)
    }

    const fetchDaySchedule = async () => {
        const body = {
            doc_id: props.info.doctor_id,
            day: selectDate.format("dddd"),
            date: selectDate.format("YYYY-MM-DD")
        }
        // const res = await axios.post("http://localhost:3000/getDoctorSchedule", body)
        const res = await axios.post("/getDoctorSchedule", body)
        setDaySchedule(res.data)
    }

    useEffect(()=>{
        fetchDaySchedule()
    }, [selectDate])

    useEffect(() => {
        setTier("")
    }, [btnClicked])

    const handleClick = (slot, key) => {
        setTimeSlot(slot)
        setActiveIndex(key)
    }

    const sendRequest = async () => {
        console.log("Tier: ", tier, " Timeslot: ", timeSlot)
        if (!timeSlot || !tier) {
            api.open({
                message: 'Incomplete Request!',
                description: 'Please select both a time slot and tier before sending your request.',
            });
            return;
        }

        setRequestBtnClicked(true)
        console.log(props.info.doctor_id)
        console.log(props.info);

        const body = {
            Patient_ID: props?.patientInfo?.patient_id,
            Doctor_ID: props.info.doctor_id,
            Appt_Date: selectDate.format("YYYY-MM-DD"),
            Appt_Time: timeSlot,
            Tier: tier
        }

        try {
            // const res = await axios.post("http://localhost:3000/request", body)
            const res = await axios.post("/request", body)
            api.open({
                message: 'Request Sent!',
                description:
                  `${props.patientInfo?.First_Name}'s Successfully Sent Request, waiting for Approval from Doctor`,
              });
            console.log("Request Sent Successfully")
        } catch (err) {
            if (err.response.data?.error == "Request Taken Already") {
                api.open({
                    message: 'Request Failed!',
                    description:
                      `Request Already Made!`,
                  });
            } else {
                api.open({
                    message: 'Request Failed!',
                    description:
                      `Failed to Send Request!`,
                  });
            }
            console.log("Failed Making Request: ", err.response.data)
        } finally {
            setTimeout(() => setRequestBtnClicked(false), 3000)
        }
    }

    const dropDoctor = async () => {
        setDropBtnClicked(true)

        const body = {
            Patient_ID: props?.patientInfo?.patient_id,
            Doctor_ID: props.info.doctor_id
        }
        try {
            // const res = await axios.patch(`http://localhost:3000/patientDropDoctor/removeDoc`, body)
            const res = await axios.patch(`/patientDropDoctor/removeDoc`, body)
            api.open({
                message: "Doctor Dropped!",
                description: 
                    `Dr. ${props.info.last_name} Successfully Dropped!`
            })

            setTimeout(() => {
                props?.fetchDoctorInfo?.()
            }, 3000) // 3 seconds is usually enough
        } catch (err) {
            api.open({
                message: 'Drop Failed!',
                description:
                  `Failed to Drop Doctor!`,
              });
            console.log("Failed Dropping Doctor: ", err.response.data)
        } finally {
            setTimeout(()=> setDropBtnClicked(false), 3000)
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
                <Flex>
                    <Flex gap="10px">
                        <img src="/firstAidIcon.svg" alt="Icon" style={{ 
                            width: "52px", 
                            height: "auto", 
                            borderRadius: "10px",
                            flexShrink: 0
                        }} />
                        <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>Dr. {`${props.info.first_name} ${props.info.last_name}`}</h2>
                        <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingLeft: "9px", paddingRight: "18px", margin: 0}}>{`${props.info.specialty}`}</h2>
                    <h2 style={{color: "#ffffff", fontSize: "32px", paddingLeft: "9px", margin: 0}}>{props.info.availability === 1 ? "Available" : "Not Available"}</h2>
                    </Flex>
                </Flex>
                {props.info.availability === 1 ? (
                    <Button id="doctor-request-dropdown" type="primary" style={{
                        borderRadius: "40%",  // Fully circular shape
                        width: "50px",        // Ensures the button remains a circle
                        height: "50px",
                        display: "flex",      // Centers the image inside
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#ffe6e2",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                    }} onClick={() => setBtnClicked(!btnClicked)}>
                        <img src="/downArrow.svg" alt="Icon" style={{
                            width: "32px", // Ensures circular shape
                            height: "32px",
                        }} />
                    </Button>
                ) : null}
            </Flex>

            {/* Section for Displaying Sending Request */}
            {btnClicked && (
                <Flex gap="20px">
                    <Calendar fullscreen={false} onSelect={handleSelect} disabledDate={disabledDate} style={{width: "300px", border: "1px solid #999999", borderRadius: "9px", backgroundColor: "#ffe6e2", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"}} />
                    <Flex vertical gap="50px" justify="center" align="flex-start">
                        <Flex gap="20px" justify="center" align="flex-start">
                            {daySchedule?.map((timeSlot, index) => (
                                <SlotCard id={`slot-card-${index}`} key={index} index={index} timeSlot={timeSlot} onClick={handleClick} isActive={index === activeIndex}/>
                            ))}
                        </Flex>
                        <Flex gap="10px">
                            <Select data-testid="tier-select" placeholder="Select Tier" options={option} onChange={(value) => setTier(value)} style={{ 
                                fontWeight: "700", fontSize: "24px", color: "#333333", height: "100%", minWidth: "100px",boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                            }}/>
                            {contextHolder}
                            <Button id="send-request-button"type="primary" disabled={requestBtnClicked} style={{fontWeight: "700", fontSize: "24px", backgroundColor: "#ffe6e2", color: "#333333", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"}} onClick={sendRequest}>
                                Send Request
                            </Button>
                            {props.dropDoctor && (
                                <Button type="primary" style={{fontWeight: "700", fontSize: "24px", backgroundColor: "rgb(239, 71, 111)", color: "#ffffff", padding: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"}} onClick={dropDoctor}>
                                    Drop Doctor
                                </Button>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
            )}
        </Flex>
    )
}

export default RequestCard