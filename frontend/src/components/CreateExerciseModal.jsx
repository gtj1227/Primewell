import { Flex, Modal, Form, message, Button, Input} from "antd"
import { useEffect, useState } from "react"
import EIModal from "./Exercise_ImageUpload"
const CreateExerciseModal = (props) => {
    const [form] = Form.useForm()

    useEffect(() => {
        if (props.open) {
            form.resetFields()
            message.destroy()
        }
    }, [props.open])

    const onFinish = () => {
        message.success("New Exercise Added!")
    }

    const onFail = () => {
        message.error("Unable to Add Exercise")
    }

    const handleClose = () => {
        message.destroy()
        props.handleClose()
    }

    return (
        <Modal open={props.open} footer={null} onCancel={handleClose} centered className="style-modal" >
            <Flex 
            vertical justify="center" 
            align="center" 
            style={{
                border: "1px solid #999999", 
                borderRadius: "16px", 
                padding: "25px"
            }}
            >
                <h1 style={{fontSize: "50px", color: "#333333"}}>Create Exercise</h1>
                <Flex 
                vertical style={{width: "100%"}}
                >
                    <Form 
                    form={form} layout="vertical" 
                    onFinish={onFinish} 
                    onFinishFailed={onFail} 
                    autoComplete="off"
                    >
                        <Form.Item name="Exercise Name" label="Exercise Name" rules={[
                            {
                                required: true,
                                message: "Exercise Name Required"
                            },
                        ]}
                        >
                            <Input placeholder="Exercise Name" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Muscle Group" label="Muscle Group" rules={[
                            {
                                required: true,
                                message: "Muscle Group Required"
                            },
                        ]}
                        >
                            <Input placeholder="Muscle Group" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Exercise Class" label="Exercise Class" rules={[
                            {
                                required: true,
                                message: "Exercise Class Required"
                            },
                        ]}
                        >
                            <Input placeholder="Exercise Class" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Sets" label="Sets" rules={[
                            {
                                required: true,
                                message: "Sets Required "
                            },
                        ]}
                        >
                            <Input placeholder="# of Sets" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Reps" label="Reps" rules={[
                            {
                                required: true,
                                message: "Reps Required"
                            },
                        ]}
                        >
                            <Input placeholder="# of Reps" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item name="Description" label="Description" rules={[
                            {
                                required: true,
                                message: "Description Required"
                            },
                        ]}
                        >
                            <Input placeholder="Description" style={{height: "45px"}}/>
                        </Form.Item>
                        <Form.Item>
                            <EIModal />
                            <Button 
                            type="primary" 
                            htmlType="submit" 
                            style={{
                                width: "100%", 
                                borderRadius: "18px", 
                                padding: "22px 0px", 
                                backgroundColor: "#A3C3A4"
                                }}
                            >
                            Submit new exercise entry
                            </Button>
                        </Form.Item>
                    </Form>
                </Flex>
            </Flex>
        </Modal>
    )
}

export default CreateExerciseModal