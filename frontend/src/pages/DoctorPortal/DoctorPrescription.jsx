import { Button, Flex, Form, Input, Select, InputNumber } from "antd"
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
const {Option} = Select

const DoctorPrescription = ({userInfo}) => {
    const location = useLocation()
    const [form] = Form.useForm()
    const [patientName, setPatientName] = useState(null)
    const [pharmInfo, setPharmInfo] = useState(null)
    const navigate = useNavigate()


    useEffect(() => {
        form.resetFields()
    }, [])

    const fecthPatientName = async () => {
        const res = await axios.get(`/patientInfo/${location.state.patient_id}`)
        console.log("Fetched Patient Info for Prescription: ", res.data)
        setPatientName(res.data[0])
        const res2 = await axios.get(`/pharmacyPills/${res.data[0].Pharm_ID}`)
        console.log("Fetched Pharm Pills by Patient's: ", res2.data)
        setPharmInfo(res2.data)

    }

    useEffect(() => {
        if (location.state){
            fecthPatientName()
        }
    }, [location.state])

    const onFinish = async (values) => {
        const pillId = values.prescription;
        const quantity = values.quantity;

        const body = {
            Patient_ID: location.state.patient_id,
            Doctor_ID: userInfo.doctor_id,
            Pill_ID: pillId,
            Quantity: quantity,
            Pharm_ID: patientName.Pharm_ID
        }
        console.log(body)
        await axios.post("/sendPrescription", body)
        navigate("/DoctorPortal/")
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
            <h1>Select Prescription for {`${patientName?.First_Name} ${patientName?.Last_Name}`}</h1>
            <Form form={form} layout="vertical" autoComplete="off" style={{width: "90%"}} onFinish={onFinish}>
                <Form.Item name="prescription" label="Prescriptions" rules={[
                    {
                        required: true,
                        message: "Please select a Prescription!"
                    }
                ]}>
                    <Select
                        id="prescription"
                        showSearch
                        placeholder="Select a prescription"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.label.toLowerCase().includes(input.toLowerCase())
                        }
                        style={{height: "auto"}}
                    >
                        {pharmInfo?.map((pill) => (
                            <Option key={pill.Pill_ID} value={pill.Pill_ID} label={`${pill.Pill_Name} ${pill.Dosage}mg $${pill.Cost}`}>
                                <div>
                                    <strong>{pill.Pill_Name}</strong>
                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                        Dosage: {pill.Dosage}mg · Cost: ${pill.Cost}
                                    </div>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item name="quantity" label="Quantity" rules={[
                    {
                        required: true,
                        message: "Please select a Quantity!"
                    }
                ]}>
                    <InputNumber id="quantity" min={1} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item>
                    <Button id="submit-prescription" type="primary" htmlType="submit" 
                                style={{width: "100%", borderRadius: "18px", padding: "22px 0px", backgroundColor: "#f09c96", fontSize: "18px"}}>Submit</Button>
                </Form.Item>
            </Form>
        </Flex>
    )
}

export default DoctorPrescription