import {Button, Flex} from "antd"
import { useEffect, useState } from "react"
import axios from "axios"
import socket from "./../../Socket";
import PrescriptionCard from "../../components/PrescriptionCard";

const PrescriptionRequests = ({info}) => {
    const [prescriptions, setPrescriptions] = useState([]);

    const fetchPrescriptions = async () => {
        try {
            const res = await axios.get(`/fetchPrescriptions/${info?.pharm_id}`)
            console.log('Fetched prescriptions: ', res.data)
            setPrescriptions(res.data)
        } catch (err) {
            console.log("Error Fetching Prescriptions: ", err)
        }
    }

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
        socket.emit("join_connection", String(info?.pharm_id)); 
        fetchPrescriptions()

        const handleNewPrescription = (prescription) => {
            console.log("New prescription received:", prescription);
            setPrescriptions(prev => [prescription, ...prev]);
        };
    
        socket.on("new_prescription", handleNewPrescription);
    
        return () => {
            socket.off("new_prescription", handleNewPrescription); 
        }
    }, [info.pharm_id]);

    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "33px 40px",
            width: "100%",
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <h1 style={{color: "#333333", marginBottom: 0}}>Incoming Prescription Requests</h1>
            <Flex vertical gap="20px" style={{
                width: "100%",
                // overflow: "auto"
            }}>
                {prescriptions?.map((prescription, index) => (
                    <PrescriptionCard key={index} prescription={prescription} fetchPrescriptions={fetchPrescriptions}/>
                ))}
            </Flex>
        </Flex>
    )
}

export default PrescriptionRequests