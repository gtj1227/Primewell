import { Flex, Modal, message, Button, Input, Form} from "antd"
import { useEffect, useState } from "react"
import axios from "axios"

{/* Discuss how to properly add new Pill back to database 
        Currently backend has Pharm_ID: 339
        Currently frontend has Pill_ID
    */}


const CreatePillModal = (props) => {
    const [form] = Form.useForm()
    const [pillsInfo, setPillsInfo] = useState([]);
    
    useEffect(() => {
        if (props.open) {
            form.resetFields()
            message.destroy()
        }
    }, [props.open])

    useEffect(() => {
        const fetchPillsInfo = async () => {
          try {
            const res = await axios.get("http://localhost:3000/pillbank");
            setPillsInfo(res.data);
          } catch (error) {
            console.error("Error fetching pill data:", error);
          }
        };
        fetchPillsInfo();
      }, []);

      const onFinish = async (values) => {
        try {
          const formattedValues = {
            ...values,
            Pill_ID: Number(values.Pill_ID),
            Dosage: Number(values.Dosage),
            Cost: Number(values.Cost),
            Pharm_ID: props.info?.pharm_id  
          };
      
          await axios.post("http://localhost:3000/pillbank", formattedValues);
          message.success("New Pill Added!");
          props.sent(true)
          form.resetFields();
          props.handleClose();  
        } catch (error) {
          console.error("Error adding Pill:", error.response?.data || error.message);
          message.error("Error:", error.response?.data?.message || "Unable to Add Pill");
        } 
      };
    

    const onFail = () => {
        message.error("Unable to Add Pill")
    }

    const handleClose = () => {
        message.destroy()
        props.handleClose()
    }

    return (
        <Modal 
            open={props.open}
            footer={null} 
            onCancel={handleClose} 
            centered className="style-modal"
            >
            <Flex 
            vertical justify="center" 
            align="center" 
            style={{
                borderRadius: "16px", 
                padding: "25px",
                backgroundColor:"#FFE6E2",
                margin: "-25px"
            }}
            >
                <h1 style={{fontSize: "35px", color: "#333333"}}>Enter Pill Details</h1>
                <Flex 
                vertical style={{width: "100%"}}
                >
                    <Form 
                    form={form} layout="vertical" 
                    onFinish={onFinish} 
                    onFinishFailed={onFail} 
                    autoComplete="off"
                    >
                        <Form.Item name="Pill_Name" label="Pill Name" rules={[
                            {
                                required: true,
                                message: "Pill Name Required"
                            },
                        ]}
                        >
                            <Input placeholder="Pill Name" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Pill_ID" label="Pill ID" rules={[
                            {
                                required: true,
                                message: "Pill ID Required"
                            },
                        ]}
                        >
                            <Input placeholder="Pill ID" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Dosage" label="Dosage" rules={[
                            {
                                required: true,
                                message: "Dosage Required"
                            },
                        ]}
                        >
                            <Input placeholder="Dosage" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Cost" label="Cost" rules={[
                            {
                                required: true,
                                message: "Cost Required "
                            },
                        ]}
                        >
                            <Input placeholder="Cost" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item>
                            <Flex justify="center">
                            <Button
                            type="primary" 
                            htmlType="submit" 
                            justify="center" 
                            align="center"
                            style={{ backgroundColor: "#A8C4A2" }}>
                            Submit new Pill entry
                            </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Flex>
            </Flex>
        </Modal>
    )
}

export default CreatePillModal