import { Flex, Modal, message, Button, Input, Rate, notification } from "antd"
import axios from "axios"
import { useEffect, useState } from "react"
import PaymentCard from "../../components/PaymentCard"

const Payment = ({userInfo}) => {
    const [paymentApptInfo, setPaymentApptInfo] = useState(null)
    const [paymentPrescInfo, setPaymentPrescInfo] = useState(null)

    const fetchApptPayments = async () => {
        const res = await axios.get(`/paymentAppointments/${userInfo?.patient_id}`)
        console.log("Appt PaymentInfo: ", res.data)
        setPaymentApptInfo(res.data)
    }

    const fetchPrescriptionPayments = async () => {
        const res = await axios.get(`/paymentPrescriptions/${userInfo?.patient_id}`)
        console.log("Prescription PaymentInfo: ", res.data)
        setPaymentPrescInfo(res.data)
    }


    useEffect(() => {
        fetchApptPayments()
        fetchPrescriptionPayments()
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
            <h1 style={{color: "#333333", marginBottom: 0}}>Payment Portal</h1>
            <Flex vertical gap="40px" style={{ padding: "40px", width: "100%"}}>

                {/* Appointment Payments Section */}
                <Flex vertical gap="20px" style={{ background: "#fef0ef", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <h2 style={{ fontSize: "28px", color: "#e2624d" }}>Appointment Payments</h2>
                    <Flex vertical gap="15px" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                        {paymentApptInfo?.length > 0 ? (
                            paymentApptInfo?.map((payment, index) => (
                                <PaymentCard
                                    key={`appt-${index}`}
                                    paymentInfo={payment}
                                    fetchPayments={fetchApptPayments}
                                    userName={`${userInfo.First_Name} ${userInfo.Last_Name}`}
                                    isAppt={true}
                                />
                            ))
                        ) : (
                            <p style={{ color: "#888" }}>No appointment payments found.</p>
                        )}
                    </Flex>
                </Flex>

                {/* Prescription Payments Section */}
                <Flex vertical gap="20px" style={{ background: "#f2f9f9", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    <h2 style={{ fontSize: "28px", color: "#408080" }}>Prescription Payments</h2>
                    <Flex vertical gap="15px" style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "10px" }}>
                        {paymentPrescInfo?.length > 0 ? (
                            paymentPrescInfo?.map((payment, index) => (
                                <PaymentCard
                                    key={`presc-${index}`}
                                    paymentInfo={payment}
                                    fetchPayments={fetchPrescriptionPayments}
                                    userName={`${userInfo.First_Name} ${userInfo.Last_Name}`}
                                    isAppt={false}
                                />
                            ))
                        ) : (
                            <p style={{ color: "#888" }}>No prescription payments found.</p>
                        )}
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
}

export default Payment;