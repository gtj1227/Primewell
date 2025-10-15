import { Flex, Button, Modal, Form } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

const PrescriptionCard = ({ prescription, fetchPrescriptions }) => {
    const createDate = dayjs(prescription?.Create_Date);
    const [form] = Form.useForm()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPaid, setIsPaid] = useState(false)

    console.log(prescription)

    return (
        <>

            <Flex
                vertical
                gap="10px"
                style={{
                    background: "#96cdf0",
                    padding: "20px 30px",
                    width: "100%",
                    maxWidth: "100%",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                }}
            >
                <Flex align="center" justify="space-between">
                    <Flex vertical gap="15px">
                        <Flex gap="10px" align="center">
                            <img
                                src="/prescriptionIcon.svg"
                                alt="Prescription Icon"
                                style={{
                                    width: "48px",
                                    height: "auto",
                                    borderRadius: "10px",
                                    flexShrink: 0,
                                }}
                            />
                            <h2
                                style={{
                                    color: "#ffffff",
                                    fontSize: "32px",
                                    borderRight: "3px solid #ffffff",
                                    paddingRight: "18px",
                                    margin: 0,
                                }}
                            >
                                {prescription?.Patient_Name}
                            </h2>
                            <h2
                                style={{
                                    color: "#ffffff",
                                    fontSize: "32px",
                                    paddingLeft: "9px",
                                    margin: 0,
                                }}
                            >
                                Pill {prescription?.Pill_Name} x{prescription?.Quantity}
                            </h2>
                        </Flex>
                        <Flex gap="10px" align="center">
                            <img
                                src="/firstAidIcon.svg"
                                alt="Doctor Icon"
                                style={{
                                    width: "52px",
                                    height: "auto",
                                    borderRadius: "10px",
                                    flexShrink: 0,
                                }}
                            />
                            <h2
                                style={{
                                    color: "#ffffff",
                                    fontSize: "32px",
                                    borderRight: "3px solid #ffffff",
                                    paddingRight: "18px",
                                    margin: 0,
                                }}
                            >
                                Dr. {prescription?.Doctor_Name}
                            </h2>
                            <h2
                                style={{
                                    color: "#ffffff",
                                    fontSize: "32px",
                                    paddingLeft: "9px",
                                    margin: 0,
                                }}
                            >
                                {createDate.format("MMM D, YYYY")}
                            </h2>
                        </Flex>
                    </Flex>

                    <Button
                        type="primary"
                        style={{
                            fontWeight: "700",
                            fontSize: "24px",
                            backgroundColor: "#e6f7ff",
                            color: "#333333",
                            padding: "20px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            cursor: "default"
                        }}
                        disabled={prescription?.Prescription_Status === "Accepted"}
                        onClick={async () => {
                            console.log("Clicked: ", prescription);
                            const res = await axios.get(`/fetchPrescriptionPaid/${prescription?.Prescription_ID}`)
                            
                            if (res.data.Payment_Status === "Paid"){
                                setIsPaid(true)
                            } else {
                                setIsPaid(false)
                            }

                            setIsModalOpen(true); 
                        }}
                    >
                        {prescription?.Prescription_Status}
                    </Button>
                </Flex>
            </Flex>
            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={false}
                width={700}
            >
                <Flex vertical align="center" gap="30px" style={{ padding: 30 }}>
                    <h1 style={{ fontSize: "36px", fontWeight: "bold", textAlign: "center" }}>
                    Prescription Status
                    </h1>

                    <Flex
                    vertical
                    gap="10px"
                    style={{
                        background: "#f6f6f6",
                        padding: "20px 30px",
                        borderRadius: "12px",
                        width: "100%",
                    }}
                    >
                    <p><strong>Patient:</strong> {prescription?.Patient_Name}</p>
                    <p><strong>Pill:</strong> {prescription?.Pill_Name}</p>
                    <p><strong>Quantity:</strong> {prescription?.Quantity}</p>
                    <p><strong>Doctor:</strong> Dr. {prescription?.Doctor_Name}</p>
                    <p><strong>Prescribed on:</strong> {createDate.format("MMM D, YYYY")}</p>
                    </Flex>

                    <div>
                    {isPaid ? (
                        <div style={{ color: "green", fontWeight: "bold", fontSize: "18px" }}>
                        Prescription is paid. Ready to send.
                        </div>
                    ) : (
                        <div style={{ color: "red", fontWeight: "bold", fontSize: "18px" }}>
                        Payment not yet made. Cannot send prescription.
                        </div>
                    )}
                    </div>

                    <Button
                    type="primary"
                    danger={!isPaid}
                    disabled={!isPaid}
                    onClick={async () => {
                        // Call backend to mark as sent + reduce quantity logic
                        const body = {
                            Prescription_ID: prescription?.Prescription_ID
                        }
                        const res = await axios.patch(`/acceptPrescription/`, body);
                        fetchPrescriptions()
                        setIsModalOpen(false);
                    }}
                    style={{
                        padding: "15px 40px",
                        fontSize: "18px",
                        borderRadius: "10px",
                        backgroundColor: isPaid ? "#52c41a" : "#d9d9d9",
                        color: isPaid ? "#fff" : "#999",
                        cursor: isPaid ? "pointer" : "not-allowed",
                    }}
                    >
                    Send Prescription
                    </Button>
                </Flex>
            </Modal>
        </>
    );
};

export default PrescriptionCard;