import { Button, Flex, Modal, Form, Input, message } from "antd";
import dayjs from 'dayjs';
import { useEffect, useState, useRef } from "react";
import axios from "axios";

const PaymentCard = ({ paymentInfo, fetchPayments, userName, isAppt }) => {
    const createDate = dayjs(paymentInfo?.Create_Date);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = Form.useForm()
    const expDateRef = useRef(null)

    useEffect(() => {
        form.resetFields()
        message.destroy()
    }, [isModalOpen])

    const onFinish = async (value) => {
        console.log(value)
        
        const body = {
            Payment_ID: paymentInfo?.Payment_ID,
            Card_Number: value.cardNumber
        }
        await axios.patch("/makePayment", body)
        fetchPayments()
        setIsModalOpen(false)
        
    }

    const onFail = () => {

    }

    return (
        <>

            <Flex vertical gap="10px" style={{
                background: "#f09c96", 
                padding: "20px 30px", 
                width: "100%", 
                maxWidth: "100%", 
                borderRadius: "8px",
                boxSizing: "border-box",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
            }}>
                <Flex align="center" justify="space-between">
                    <Flex vertical gap="15px">
                        <Flex gap="10px" align="center">
                            <img src="/payment.svg" alt="Payment Icon" style={{ 
                                width: "52px", 
                                height: "auto", 
                                borderRadius: "10px",
                                flexShrink: 0
                            }} />
                            <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>
                                {createDate.format('MMM D, YYYY')}
                            </h2>
                            <h2 style={{color: "#ffffff", fontSize: "32px", paddingLeft: "9px", margin: 0}}>
                                ${paymentInfo?.Cost}
                            </h2>
                        </Flex>
                        <Flex gap="10px" align="center">
                            <img src="/firstAidIcon.svg" alt="Doctor Icon" style={{ 
                                width: "52px", 
                                height: "auto", 
                                borderRadius: "10px",
                                flexShrink: 0
                            }} />
                            <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>
                                Dr. {paymentInfo?.Doctor_Name}
                            </h2>
                            {!isAppt ? (
                                <h2 style={{color: "#ffffff", fontSize: "32px", borderRight: "3px solid #ffffff", paddingRight: "18px", margin: 0}}>
                                    Pill: {paymentInfo?.Pill_Name}
                                </h2>
                            ): null}
                            <h2 style={{color: "#ffffff", fontSize: "32px", paddingLeft: "9px", margin: 0}}>
                                {isAppt? paymentInfo?.Service : paymentInfo?.Quantity + "x" + paymentInfo?.Dosage}
                            </h2>
                        </Flex>
                    </Flex>

                    <Button 
                        type="primary" 
                        style={{
                            fontWeight: "700",
                            fontSize: "24px",
                            backgroundColor: "#ffe6e2",
                            color: "#333333",
                            padding: "20px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                        }}
                        disabled={paymentInfo?.Payment_Status === "Paid"}
                        onClick={() => setIsModalOpen(true)}
                    >
                        {paymentInfo?.Payment_Status}
                    </Button>
                </Flex>
            </Flex>
            <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={false} width={650}>
                <Flex vertical justify="center" align="center" style={{border: "1px solid #999999", borderRadius: "16px", padding: "25px"}}>
                    <h1 style={{fontSize: "48px", color: "#333333", marginBottom: "20px"}}>Make Payment</h1>
                    <Flex vertical style={{width: "100%"}}>
                        <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFail} autoComplete="off" initialValues={{cardName: userName}}>
                            
                            {/* Card Number */}
                            <Form.Item
                                name="cardNumber"
                                label="Card Number"
                                rules={[
                                    { required: true, message: "Please input your Card Number!" },
                                    { pattern: /^(\d{4}\s?){4}$/, message: "Card number must be 16 digits" }
                                ]}
                                validateTrigger="onSubmit"
                            >
                                <Input
                                    placeholder="1234 5678 9012 3456"
                                    style={{height: "45px"}}
                                    maxLength={19} // 16 digits + 3 spaces
                                    onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
                                        value = value.slice(0, 16); // Limit to 16 digits
                                        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 '); // Add space every 4 digits
                                        form.setFieldsValue({ cardNumber: formattedValue });

                                        if (value.length === 16) {
                                            expDateRef.current?.focus();
                                        }
                                    }}
                                />
                            </Form.Item>

                            {/* Name on Card */}
                            <Form.Item
                                name="cardName"
                                label="Name on Card"
                                rules={[
                                    { required: true, message: "Please input the Name on Card!" },
                                ]}
                                validateTrigger="onSubmit"
                            >
                                <Input placeholder="John Doe" style={{height: "45px"}} />
                            </Form.Item>

                            {/* Expiration Date and CVV */}
                            <Flex gap="20px">
                                <Form.Item
                                    name="expiry"
                                    label="Expiry Date"
                                    rules={[
                                        { required: true, message: "Please input the Expiration Date!" },
                                        { pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: "Format MM/YY" }
                                    ]}
                                    style={{flex: 1}}
                                    validateTrigger="onSubmit"
                                >
                                    <Input placeholder="MM/YY" ref={expDateRef} style={{height: "45px"}} maxLength={5} onChange={(e) => {
                                        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                        if (value.length > 2) {
                                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                                        }
                                        form.setFieldsValue({ expiry: value });
                                    }}/>
                                </Form.Item>

                                <Form.Item
                                    name="cvv"
                                    label="CVV"
                                    rules={[
                                        { required: true, message: "Please input the CVV!" },
                                        { pattern: /^[0-9]{3,4}$/, message: "CVV must be 3 or 4 digits" }
                                    ]}
                                    style={{flex: 1}}
                                    validateTrigger="onSubmit"
                                >
                                    <Input placeholder="123" style={{height: "45px"}} maxLength={4}/>
                                </Form.Item>
                            </Flex>

                            {/* Submit Button */}
                            <Form.Item>
                                <Button type="primary" htmlType="submit" 
                                    style={{width: "100%", borderRadius: "18px", padding: "22px 0px", backgroundColor: "#f09c96", fontSize: "18px"}}>
                                    Pay Now
                                </Button>
                            </Form.Item>

                        </Form>
                    </Flex>
                </Flex>           
            </Modal>

        </>
    );
}

export default PaymentCard;