import {Button, Flex} from "antd"
import {DownOutlined} from "@ant-design/icons"
import { useEffect, useState } from "react"
import axios from "axios"
import RequestCard from "../../components/RequestCard"

const Request = ({userInfo}) => {
    const [doctorInfo, setDoctorInfo] = useState([])

    const fetchDoctorInfo = async () => {
        try {
            const res = await axios.get("http://localhost:3000/doctor/listAll")
            setDoctorInfo(res.data)
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
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <h1 style={{color: "#333333", marginBottom: 0}}>List of Doctors</h1>
            <Flex vertical gap="20px" style={{
                width: "100%",
            }}>
                {doctorInfo?.map((user, index) => (
                    <RequestCard key={index} info={user} patientInfo={userInfo}/>
                ))}
            </Flex>
        </Flex>
    );
};

export default Request;