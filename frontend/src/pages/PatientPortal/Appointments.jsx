import {Button, Flex, Spin, Alert} from "antd"
import { useEffect, useState } from "react"
import axios from "axios"
import RequestCard from "../../components/RequestCard"
import AppointmentCard from "../../components/AppointmentCard";

const Appointments = ({userInfo}) => {
    const [appointmentInfo, setAppointmentInfo] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchDoctorInfo = async () => {
        if (!userInfo?.patient_id) {
            setError("No patient ID found.");
            setAppointmentInfo([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`/appointment/patient/${userInfo.patient_id}`)
            console.log(res.data)
            setAppointmentInfo(Array.isArray(res.data) ? res.data : [])
        } catch (err) {
            setError("Error fetching appointments.");
            setAppointmentInfo([])
            console.log("Error Fetching Doctor: ", err)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDoctorInfo()
        // eslint-disable-next-line
    }, [userInfo?.patient_id])

    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "33px 40px",
            width: "100%",
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <h1 style={{color: "#333333", marginBottom: 0}}>Appointments</h1>
            {loading ? (
                <Spin size="large" style={{marginTop: 40}} />
            ) : error ? (
                <Alert type="error" message={error} style={{marginTop: 40}} />
            ) : (
                <Flex vertical gap="20px" style={{
                    width: "100%",
                }}>
                    {appointmentInfo && appointmentInfo.length > 0 ? (
                        appointmentInfo.map((user, index) => (
                            <AppointmentCard key={index} apptInfo={user}/>
                        ))
                    ) : (
                        <div style={{color: '#888', fontSize: 20, textAlign: 'center', marginTop: 40}}>
                            No appointments found.
                        </div>
                    )}
                </Flex>
            )}
        </Flex>
    );
};

export default Appointments;