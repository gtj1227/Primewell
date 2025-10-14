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
import WorkHoursFormModal from "./WorkHoursFormModal";

const DoctorSignUpModal = (props) => {
  const [form] = Form.useForm();
  const [isPreliminaryFormModalOpen, setIsPreliminaryFormModalOpen] =
    useState(false);
  const [schedule, setSchedule] = useState({});
  const [days, setDays] = useState({
    Sun: "false",
    Mon: "false",
    Tue: "false",
    Wed: "false",
    Thu: "false",
    Fri: "false",
    Sat: "false",
  });
  const [shift1, setShift1] = useState();
  const [shift2, setShift2] = useState();

  const handleWorkHoursFormClick = () => {
    // handleClose();
    setIsPreliminaryFormModalOpen(true);
  };
  // console.log(days);
  useEffect(() => {
    if (props.open) {
      form.resetFields();
      setSchedule({});
      setDays({
        Sun: "false",
        Mon: "false",
        Tue: "false",
        Wed: "false",
        Thu: "false",
        Fri: "false",
        Sat: "false",
      });
      message.destroy();
    }
  }, [props.open]);

  const filterPW = (pw) => {
    return pw.replace(/"/g, '\\"');
  };
  // console.log(shift1);
  const onFinish = async (value) => {
    value = { ...value, Availability: "1" };
    // console.log(value);

    // console.log(schedule);
    try {
      const res = await axios.post("http://localhost:3000/doctor", value);
      if (res.data.length === 0) {
        console.log("Couldn't create doctor");
      } else {
        console.log("Doctor Created: ", res.data);
        // console.log(res.data.insertId);
        const prelim = await axios.post("http://localhost:3000/doctorSchedule", {
          Doctor_ID: res.data.doctor_id,
          Doctor_Schedule: JSON.stringify(schedule),
        });
        props.info(res.data)
        props.auth(true)
        handleClose();
      }
    } catch (err) {
      console.log('Signing Doctor Failed: ', err)
    }

    // handleClose();
  };

  const onFail = () => {
    message.error("Submit Failed!");
  };

  const handleClose = () => {
    message.destroy();
    console.log(days);
    setDays({
      Sun: "false",
      Mon: "false",
      Tue: "false",
      Wed: "false",
      Thu: "false",
      Fri: "false",
      Sat: "false",
    });
    // console.log(shift1);

    setShift1();
    setShift2();
    // console.log(shift1);
    props.handleClose();
  };

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
        <h1 style={{ fontSize: "64px", color: "#333333" }}>Doctor Sign Up</h1>
        <Flex vertical style={{ width: "100%" }}>
          <Form
            form={form}
            name="doctorsignupform"
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
              name="Specialty"
              label="Specialty"
              rules={[
                {
                  required: true,
                  message: "Please input your Specialty!",
                },
                {
                  pattern: /^([a-zA-Z](\s){0,1}){1,}$/,
                  message: "Please input a valid Specialty!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your specialty"
                style={{ height: "45px" }}
              />
            </Form.Item>
            <Form.Item
              name="License_Serial"
              label="Doctor License Number"
              rules={[
                {
                  required: true,
                  message: "Please input your Doctor License Number!",
                },
                {
                  pattern: /^[0-9]{3}-[0-9]{2}-[0-9]{6}$/,
                  message: "Please input a valid Doctor License Number!",
                },
              ]}
              validateTrigger="onSubmit"
            >
              <Input
                placeholder="Enter your doctor license number"
                style={{ height: "45px" }}
              />
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
                onClick={handleWorkHoursFormClick}
              >
                Work Hours Form
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
      <WorkHoursFormModal
        open={isPreliminaryFormModalOpen}
        handleClose={() => setIsPreliminaryFormModalOpen(false)}
        schedule={schedule}
        onSubmitSchedule={(data) => setSchedule(data)}
        days={days}
        onSubmitDays={(data) => setDays(data)}
        shift1={shift1}
        onSubmitShift1={(data) => setShift1(data)}
        shift2={shift2}
        onSubmitShift2={(data) => setShift2(data)}
      />
    </Modal>
  );
};

export default DoctorSignUpModal;
