import {Button, Flex} from "antd"
import {DownOutlined} from "@ant-design/icons"
import { useEffect, useState } from "react"
import axios from "axios"
import RequestCard from "../../components/RequestCard"

const Request = ({userInfo}) => {
    const [doctorInfo, setDoctorInfo] = useState([])
    const [patientDoctor, setPatientDoctor] = useState(null)
    const [otherDoctors, setOtherDoctors] = useState([])

    const fetchDoctorInfo = async () => {
        try {
            const res = await axios.get("http://localhost:3000/doctor/listAll")
            const allDoctors = res.data
            const res2 = await axios.get(`http://localhost:3000/patientDoc/${userInfo.patient_id}`)
            if (res2) {
                const assignedDoctor = res2.data
                setPatientDoctor(assignedDoctor)

                const remainingDoctors = allDoctors.filter((doctor) => doctor.doctor_id !== assignedDoctor.doctor_id)
                setOtherDoctors(remainingDoctors)
            } else {
                setOtherDoctors(allDoctors)
            }
        } catch (err) {
            console.log("Error Fetching Doctor: ", err)
        }
    }

    useEffect(() => {
        fetchDoctorInfo()
    }, [])

    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "33px 40px",
            width: "100%",
            overflow: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            {/* Section for Current Doctor */}
            {patientDoctor && (
                <>
                    <h1 style={{color: "#333333", marginBottom: 0}}>{userInfo?.First_Name}'s Doctor</h1>
                    <Flex vertical gap="20px" style={{
                        width: "100%",
                    }}>
                        <RequestCard info={patientDoctor} patientInfo={userInfo} dropDoctor={true} fetchDoctorInfo={fetchDoctorInfo}/>
                    </Flex>
                </>
            )}

            {/* Section for Other Doctors */}
            <h1 style={{color: "#333333", marginBottom: 0}}>List of Doctors</h1>
            <Flex vertical gap="20px" style={{
                width: "100%",
                // overflow: "auto"
            }}>
                {otherDoctors?.map((user, index) => (
                    <RequestCard key={index} info={user} patientInfo={userInfo}/>
                ))}
            </Flex>
        </Flex>
    );
};


export default Request;