import { Flex, Modal, Form, message, Button, Input, Rate, notification } from "antd"
import { FrownOutlined, MehOutlined, SmileOutlined } from '@ant-design/icons';
import axios from "axios"
import { useEffect, useState } from "react"

const desc = ['Very Sad', 'Somewhat Sad', 'Neutral', 'Somewhat Happy', 'Very Happy']
const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };

const DailySurvey = ({info, setSurveyCompleted}) => {
    const [api, contextHolder] = notification.useNotification();
    const [form] = Form.useForm()
    const date = new Date()
    const [rate, setRate] = useState(0.0)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        form.resetFields()
    }, [])

    const onFinish = async (value) => {
        try {
            const body = {
                Patient_ID: info?.patient_id,
                Weight: value.weight,
                Caloric_Intake: value.caloric_intake,
                Water_Intake: value.water_intake,
                Mood: rate
            }
    
            console.log(body)
            const res2 = await axios.post(`http://localhost:3000/patientsurvey`, body)
            setSurveyCompleted(true)
            api.open({
                message: 'Success!',
                description:
                  `${info?.First_Name}'s Daily Survey Successfully Added`,
              });
            form.resetFields()
        } catch (err) {
            if (axios.isAxiosError(err)){
                console.error("Axios error:", err.response?.status, err.message, "in DailySurvey.jsx onFinish")
                if (err.response?.status === 500) {
                    api.open({
                        message: 'Failed!',
                        description:
                          `${info?.First_Name} already completed today's Daily Survey`,
                    });
                    form.resetFields()                    
                }
            }
        }
    }

    const onFail = () => {

    }

    return (
        <>
            <Flex vertical justify="flex-start" align="center" style={{backgroundColor: "#ffffff", borderRadius: "16px", width: "100%", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"}}>
                <h1 style={{fontSize: "64px", color: "#333333", marginTop: "60px"}}>Daily Survey: {`${date.toLocaleString('en-US', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`}</h1>
                <Flex vertical style={{width: "50%", marginTop: "50px"}}>
                    <Form form={form} layout="vertical" onFinish={onFinish} onFinishFailed={onFail} autoComplete="off">
                        <Form.Item name="weight" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Weight</span>} rules={[
                            {
                                required: true,
                                message: "Please input your Weight!"
                            },
                            {
                                pattern: /^\d+(\.\d+)?$/,
                                message: "Letters aren't allowed!"
                            },
                        ]}
                        validateTrigger="onSubmit"
                        style={{fontSize: "32px"}}
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Input placeholder="Weight (lbs)" style={{width: "150px"}}/><span style={{marginLeft: "5px", fontWeight: "700"}}>lbs</span>
                            </div>
                        </Form.Item>
                        <Form.Item name="caloric_intake" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Calorie Intake</span>}  rules={[
                            {
                                required: true,
                                message: "Please input your Caloric Intake!"
                            },
                            {
                                pattern: /^\d+(\.\d+)?$/,
                                message: "Letters aren't allowed!"
                            },
                        ]}
                        validateTrigger="onSubmit"
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Input placeholder="Total calories consumed today (e.g., 2000 Cal)" style={{width: "330px"}}/><span style={{marginLeft: "5px", fontWeight: "700"}}>Calories</span>
                            </div>
                        </Form.Item>
                        <Form.Item name="water_intake" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Water Intake</span>}  rules={[
                            {
                                required: true,
                                message: "Please input your Water Intake!"
                            },
                            {
                                pattern: /^\d+(\.\d+)?$/,
                                message: "Letters aren't allowed!"
                            },
                        ]}
                        validateTrigger="onSubmit"
                        >
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <Input placeholder="Total water intake today (e.g., 64 fl oz)" style={{width: "330px"}}/><span style={{marginLeft: "5px", fontWeight: "700"}}>Fl Oz</span>
                            </div>
                        </Form.Item>
                        <Form.Item name="mood" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Mood Scale</span>}  rules={[
                            {
                                required: true,
                                message: "Please input your Mood!"
                            },
                        ]}
                        validateTrigger="onSubmit"
                        >
                            <Rate allowHalf tooltips={desc} value={rate} onChange={setRate} character={({index = 0}) => customIcons[index+1]} style={{
                                fontSize: "42px"
                            }}/>
                        </Form.Item>
                        <Form.Item name="notes" label={<span style={{ fontSize: "18px", fontWeight: "bold" }}>Notes</span>}  validateTrigger="onSubmit">
                            <Input.TextArea rows={4} placeholder="Enter any challenges or hardships you encountered today" />
                        </Form.Item>
                        <Form.Item>
                            {contextHolder}
                            <Button type="primary" htmlType="submit" 
                                style={{width: "100%", borderRadius: "18px", padding: "22px 0px", backgroundColor: "#f09c96", fontSize: "18px"}}>Submit</Button>
                        </Form.Item>
                    </Form>
                </Flex>
            </Flex>
        </>
    )
}

export default DailySurvey