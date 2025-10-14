import { Button, Flex, Form, message, Input } from "antd";

const DoctorPillRequest = (props) => {
  const [form] = Form.useForm();

  const onFinish = () => {};

  const onFail = () => {};

  return (
    <Flex
      vertical
      justify="start"
      align="center"
      gap="60px"
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "33px 40px",
        width: "100%",
        overflowY: "auto",
      }}
    >
      <h1 style={{ color: "#333333", marginBottom: 0 }}>
        Request Prescription
      </h1>
      <Flex
        vertical
        gap="20px"
        style={{
          width: "100%",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFail}
          autoComplete="off"
        >
          <Form.Item
            name="Company_Name"
            label="Company Name"
            rules={[
              {
                required: true,
                message: "Please input Pharamcy Name!",
              },
              {
                pattern: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
                message: "Please input a valid Email!",
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input
              placeholder="Enter Pharmacy Name"
              style={{ height: "45px" }}
            />
          </Form.Item>
          <Form.Item
            name="Patient_ID"
            label="Patient ID"
            rules={[
              {
                required: true,
                message: "Please input Patient ID!",
              },
              {
                min: 5,
                message: "Password must be at least 5 characters",
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input placeholder="Enter Patient ID" style={{ height: "45px" }} />
          </Form.Item>
          <Form.Item
            name="First_Name"
            label="First Name"
            rules={[
              {
                required: true,
                message: "Please input Patient First Name!",
              },
              {
                min: 5,
                message: "Password must be at least 5 characters",
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input
              placeholder="Enter Patient First Name"
              style={{ height: "45px" }}
            />
          </Form.Item>
          <Form.Item
            name="Last_Name"
            label="Last Name"
            rules={[
              {
                required: true,
                message: "Please input Patient Last Name!",
              },
              {
                min: 5,
                message: "Password must be at least 5 characters",
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input
              placeholder="Enter Patient Last Name"
              style={{ height: "45px" }}
            />
          </Form.Item>
          <Form.Item
            name="Pill_Name"
            label="Pill Name"
            rules={[
              {
                required: true,
                message: "Please input the Medication Name!",
              },
              {
                min: 5,
                message: "Password must be at least 5 characters",
              },
            ]}
            validateTrigger="onSubmit"
          >
            <Input
              placeholder="Enter Medication Name"
              style={{ height: "45px" }}
            />
          </Form.Item>
          <Form.Item>
            <Flex justify="center" align="center">
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  width: "60%",
                  borderRadius: "18px",
                  padding: "22px 0px",
                  backgroundColor: "#f09c96",
                  color: "#333333",
                  fontSize: "20px",
                  marginTop: "20px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <strong>Request</strong>
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      </Flex>
    </Flex>
  );
};

export default DoctorPillRequest;
