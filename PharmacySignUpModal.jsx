import {
  Flex,
  Modal,
  Form,
  message,
  Button,
  Input,
  Divider,
  Dropdown,
  Space,
  Tooltip,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { DownOutlined, MedicineBoxTwoTone } from "@ant-design/icons";

const PharmacySignUpModal = (props) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      message.destroy();
    }
  }, [props.open]);

  const filterPW = (pw) => {
    return pw.replace(/"/g, '\\"');
  };

  const onFinish = async (value) => {
    try {
      value.Address = JSON.stringify(value.Address);
      console.log(value.Address);
      console.log(value);
      const res = await axios.post("http://localhost:3000/pharmacies", value);
      if (res.data.length === 0) {
        console.log("Couldn't create pharmacy");
      } else {
        props.info(res.data)
        props.auth(true)
        console.log("Pharmacy Created");
        handleClose();
      }
    } catch (err) {
      console.log("Error Signing Pharmacy: ", err)
    }
  };

  const onFail = () => {
    message.error("Submit Failed!");
  };

  const handleClose = () => {
    message.destroy();
    props.handleClose();
  };

  return (
    <Modal
      open={props.open}
      footer={null}
      onCancel={handleClose}
      centered
      className="style-modal"
      width={650} // Width of the Modal
    >
      <Flex
        vertical
        justify="center"
        align="center"
        style={{
          border: "1px solid #999999",
          borderRadius: "16px",
          padding: "25px",
        }}
      >
        <h1 style={{ fontSize: "64px", color: "#333333" }}>Pharmacy Sign Up</h1>
        <Flex vertical style={{ width: "100%" }}>
          <Form
            form={form}
            name="patientsignupform"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFail}
            autoComplete="off"
          >
            <Form.Item
              name="Company_Name"
              label="Pharmacy Name"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Name!",
                },
                {
                  pattern: /^([a-zA-Z'](\s)?)+$/,
                  message: "Please input a valid Pharmacy Name!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your Pharmacy's Name"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Email"
              label="Pharmacy Email"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Email!",
                },
                {
                  pattern: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please input a valid Pharmacy Email!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your Pharmacy's Email"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Address"
              label="Pharmacy Address"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Address!",
                },
                {
                  pattern: /^[0-9]+ [A-Za-z]+ [A-Za-z]+$/,
                  message: "Please input a valid Pharmacy Address!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your Pharmacy's Address"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Zip"
              label="Pharmacy Zip Code"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Zip Code!",
                },
                {
                  pattern: /^[0-9]{5}$/,
                  message: "Please input a valid Pharmacy Zip Code!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your Pharmacy's Zip Code"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Work_Hours"
              label="Pharmacy Work Hours"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Work Hours!",
                },
                {
                  pattern:
                    /^([0-9]|1[0-9]|2[0-3]):([0-5][0-9])-([0-9]|1[0-9]|2[0-3]):\2$/,
                  message: "Please input a valid Pharmacy Work Hours!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Example: X:XX-Y:YY"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="PW"
              label="Create a Pharmacy password"
              rules={[
                {
                  required: true,
                  message: "Please input your Pharmacy Password!",
                },
                {
                  min: 5,
                  message: "Password must be at least 5 characters",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input.Password
                placeholder="Enter a password"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "100%",
                  border: "1px solid #999999",
                  borderRadius: "18px",
                  padding: "22px 0px",
                  backgroundColor: "#f09c96",
                }}
              >
                Create an account
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default PharmacySignUpModal;
