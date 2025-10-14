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
  Checkbox,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { DownOutlined, MedicineBoxTwoTone } from "@ant-design/icons";

const PreliminaryFormModal = (props) => {
  const [form] = Form.useForm();
  const [symptoms, setSymptoms] = useState(props.symptoms);

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      message.destroy();
      setSymptoms(props.symptoms || {});
    }
  }, [props.open, props.symptoms]);

  const filterPW = (pw) => {
    return pw.replace(/"/g, '\\"');
  };

  const onFinish = async (value) => {
    props.onSubmitSymptoms(symptoms);
    props.handleClose();
  };

  const onFail = () => {
    message.error("Submit Failed!");
  };

  const handleClose = () => {
    message.destroy();
    setSymptoms({});
    props.handleClose();
  };

  const handleSymptomChange = (checked, label, category) => {
    setSymptoms((prev) => {
      const current = new Set(prev[category] || []);
      if (checked) current.add(label);
      else current.delete(label);
      return { ...prev, [category]: Array.from(current) };
    });
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
        <h1 style={{ fontSize: "64px", color: "#333333" }}>Preliminary Form</h1>
        <Flex vertical style={{ width: "100%" }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFail}
            autoComplete="off"
          >
            {/* <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: "Please input your First Name!",
                },
                {
                  pattern: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, // make first name regex
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
              name="lastName"
              label="Last Name"
              rules={[
                {
                  required: true,
                  message: "Please input your Last Name!",
                },
                {
                  pattern: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/, // make last name regex (probably same as first name)
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
              name="email"
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
            </Form.Item> */}
            <Form.Item>
              <div>
                <table style={{ textAlign: "left", width: "100%" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "0px 11px" }}>MUSCLE/JOINT/BONE</th>
                      <th style={{ padding: "0px 11px" }}>
                        EYES/EARS/NOSE/THROAT
                      </th>
                      <th style={{ padding: "0px 11px" }}>NEUROLOGIC</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0px 11px" }}>
                        {[
                          "Back Pain",
                          "Leg Pain",
                          "Neck Pain",
                          "Arm Pain",
                          "Joint Pain",
                        ].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Muscle/Joint/Bone"]?.includes(
                                  symptom
                                ) || false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Muscle/Joint/Bone"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "0px 11px" }}>
                        {[
                          "Blurred Vision",
                          "Loss of Hearing",
                          "Nose Bleeds",
                          "Sinus Problems",
                          "Strep Throat",
                        ].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Eyes/Ears/Nose/Throat"]?.includes(
                                  symptom
                                ) || false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Eyes/Ears/Nose/Throat"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "0px 11px" }}>
                        {[
                          "Fainting",
                          "Dizziness",
                          "Headache",
                          "Memory Loss",
                          "Depression",
                        ].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Neurologic"]?.includes(symptom) ||
                                false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Neurologic"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ padding: "0px 11px" }}>SKIN</th>
                      <th style={{ padding: "0px 11px" }}>LUNGS</th>
                      <th style={{ padding: "0px 11px" }}>CARDIOVASCULAR</th>
                    </tr>
                    <tr>
                      <td style={{ padding: "0px 11px" }}>
                        {["Itching", "Rash", "Callus"].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Skin"]?.includes(symptom) || false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Skin"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "0px 11px" }}>
                        {[
                          "Shortness of Breath",
                          "Persistent Cough",
                          "Asthma",
                          "Sleep Apnea",
                        ].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Lungs"]?.includes(symptom) || false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Lungs"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "0px 11px" }}>
                        {[
                          "Chest Pain",
                          "Irregular Heart Beat",
                          "Heart Attack",
                          "Heart Disease",
                        ].map((symptom) => (
                          <div key={symptom}>
                            <Checkbox
                              checked={
                                symptoms["Cardiovascular"]?.includes(symptom) ||
                                false
                              }
                              onChange={(e) =>
                                handleSymptomChange(
                                  e.target.checked,
                                  symptom,
                                  "Cardiovascular"
                                )
                              }
                            >
                              {symptom}
                            </Checkbox>
                            <br />
                          </div>
                        ))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
                Submit Preliminary Form
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default PreliminaryFormModal;
