import axios from "axios";
import { useState, useEffect } from "react";
import { Flex, Table, Spin, Typography } from "antd";
import "./../../App.css";

const { Title, Text } = Typography;

const PatientPrescription = ({ userInfo }) => {
  const [prescriptionData, setPrescriptionData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch prescription data
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(`/fetchPrescriptionAccepted/${userInfo?.patient_id}`);
        console.log("Patient Prescription: ", res.data)
        setPrescriptionData(res.data);
      } catch (error) {
        console.error("Failed to fetch prescription data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.patient_id) {
      fetchPrescriptions();
    }
  }, [userInfo?.patient_id]);

  const columns = [
    {
      title: "Pill Name",
      dataIndex: "Pill_Name",
      key: "Pill_Name",
    },
    {
      title: "Quantity",
      dataIndex: "Quantity",
      key: "Quantity",
    },
    {
      title: "Doctor",
      dataIndex: "Doctor_Name",
      key: "Doctor_Name",
      render: (text) => `Dr. ${text}`,
    },
    {
      title: "Date",
      dataIndex: "Create_Date",
      key: "Create_Date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Status",
      dataIndex: "Prescription_Status",
      key: "Prescription_Status",
      render: (status) => (
        <Text strong style={{ color: status === "Accepted" ? "green" : "#d46b08" }}>
          {status}
        </Text>
      ),
    },
  ];

  return (
    <Flex
      vertical
      justify="start"
      align="center"
      gap="40px"
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "33px 40px",
        width: "100%",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Title level={2} style={{ color: "#333333", marginBottom: 0 }}>
        Your Prescriptions
      </Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={prescriptionData}
          columns={columns}
          pagination={false}
          bordered
          rowKey={(record) => record.Prescription_ID}
          style={{
            width: "100%",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        />
      )}
    </Flex>
  );
};

export default PatientPrescription;