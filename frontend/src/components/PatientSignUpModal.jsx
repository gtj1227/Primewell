import {
  Flex,
  Modal,
  Form,
  message,
  Button,
  Input,
  Divider,
  Select,
  Space,
  Tooltip,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { DownOutlined, MedicineBoxTwoTone } from "@ant-design/icons";
import PreliminaryFormModal from "./PreliminaryFormModal";

const PatientSignUpModal = (props) => {
  const [form] = Form.useForm();
  const [isPreliminaryFormModalOpen, setIsPreliminaryFormModalOpen] =
    useState(false);
  const [symptoms, setSymptoms] = useState({});
  const [pharmacyOptions, setPharmacyOptions] = useState([])
  const [zipCode, setZipCode] = useState("")

  const handlePreliminaryFormClick = () => {
    // handleClose();
    setIsPreliminaryFormModalOpen(true);
  };

  useEffect(() => {
    if (props.open) {
      // console.log(symptoms);
      form.resetFields();
      setSymptoms({});
      message.destroy();
    }
  }, [props.open]);

  const filterPW = (pw) => {
    return pw.replace(/"/g, '\\"');
  };

  const onFinish = async (value) => {
    // console.log(value);
    // console.log(symptoms);
    try {
      console.log("Patient Sign up info: ", value)
      const res = await axios.post("http://localhost:3000/patient", value);
      if (res.data.length === 0) {
        console.log("Couldn't create patient");
      } else {
        console.log("Patient Created");
        const prelim = await axios.post("http://localhost:3000/preliminaries", {
          Patient_ID: res.data.patient_id,
          Symptoms: JSON.stringify(symptoms),
        });
        props.info(res.data)
        props.auth(true)
        handleClose();
      }
    } catch (err) {
      console.log("Error Signing Patient Up: ", err)
    }
  };

  const onFail = () => {
    message.error("Submit Failed!");
  };

  const handleClose = () => {
    message.destroy();
    setSymptoms({});
    setZipCode("")
    props.handleClose();
  };

  const searchNearestPharmacies = async () => {
    try {
      const body = {
        Zip: zipCode
      }
      const res = await axios.post("http://localhost:3000/getPharmByZip", body)
      setPharmacyOptions(res.data)
      console.log("Fetched Nearest Pharmacies: ", res.data)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <Modal
      open={props.open}
      footer={null}
      onCancel={handleClose}
      centered
      className="style-modal"
      width={600} // Width of the Modal
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
        <h1 style={{ fontSize: "64px", color: "#333333" }}>Patient Sign Up</h1>
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
              name="First_Name"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: "Please input your First Name!",
                },
                {
                  pattern: /^[A-Z]{1}[a-z]+$/,
                  message: "Please input a valid First Name!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your first name"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Last_Name"
              label="Last Name"
              rules={[
                {
                  required: true,
                  message: "Please input your Last Name!",
                },
                {
                  pattern: /^[A-Z]{1}[a-z]+$/,
                  message: "Please input a valid Last Name!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your last name"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Email"
              label="Email"
              rules={[
                {
                  required: true,
                  message: "Please input your Email!",
                },
                {
                  pattern: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please input a valid Email!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="example@gmail.com"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please input your Phone Number!",
                },
                {
                  pattern: /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/,
                  message: "Please input a valid Phone Number!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your phone number"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Address"
              label="Address"
              rules={[
                {
                  required: true,
                  message: "Please input your Address!",
                },
                {
                  pattern: /^[0-9]+ [A-Za-z]+ [A-Za-z]+$/,
                  message: "Please input a valid Address!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your address"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="Zip"
              label="Zip Code"
              rules={[
                {
                  required: true,
                  message: "Please input your Zip Code!",
                },
                {
                  pattern: /^[0-9]{5}$/,
                  message: "Please input a valid Zip Code!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Space.Compact style={{width: "100%"}}>
                <Input
                  placeholder="Enter your zip code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  style={{ width: "60%", height: "45px" }}
                />
                <Button
                  style={{ width: "40%", height: "45px", backgroundColor: "#a2c3a4" }}
                  onClick={searchNearestPharmacies}
                  type="primary"
                >
                  Search Nearest Pharmacies
                </Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item
              name="Pharm_ID"
              label="Nearest Pharmacy (Based on zip code)"
              rules={[
                {
                  required: true,
                  message: "Please choose a Pharmacy!",
                },
              ]}
            >
              <Select placeholder="Select a pharmacy">
                {pharmacyOptions.map((pharmacy) => (
                  <Select.Option key={pharmacy.Pharm_ID} value={pharmacy.Pharm_ID}>
                    {pharmacy.Company_Name} @ Zip: {pharmacy.Zip}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="PW"
              label="Create a password"
              rules={[
                {
                  required: true,
                  message: "Please input your Password!",
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
                style={{
                  width: "100%",
                  border: "1px solid #999999",
                  borderRadius: "18px",
                  padding: "22px 0px",
                  backgroundColor: "#ffe6e2",
                  color: "#000000",
                  marginBottom: "10px",
                }}
                onClick={handlePreliminaryFormClick}
              >
                Preliminary Form
              </Button>
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
      <PreliminaryFormModal
        open={isPreliminaryFormModalOpen}
        handleClose={() => setIsPreliminaryFormModalOpen(false)}
        symptoms={symptoms}
        onSubmitSymptoms={(data) => setSymptoms(data)}
      />
    </Modal>
  );
};

export default PatientSignUpModal;
