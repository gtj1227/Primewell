import { Flex, Layout, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Content } = Layout;

const PatientCard = () => {
  const PatientName = ({ name }) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center", // Vertically centers text
          height: "100%", // Takes full height of the parent
          paddingLeft: 10, // Ensures left alignment
        }}
      >
        <h2
          style={{
            color: "white",
            backgroundColor: "#f09c96",
            fontSize: 36,
            fontFamily: "Poppins",
            margin: 0,
          }}
        >
          {name}
        </h2>
      </div>
    );
  };

  return (
    <Layout
      style={{
        borderRadius: 8,
        overflow: "hidden",
        width: "100%",
        height: "150px",
        backgroundColor: "#f09c96",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          paddingLeft: 10,
          width: "100%",
          height: "100%",
        }}
      >
        <UserOutlined style={{ fontSize: "40px", color: "white" }} />
        <PatientName name="Patient Name" />
        {/* <Flex>
          <Content
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingLeft: 50,
              flexDirection: "column",
              gap: 10,
            }}
          ></Content>
        </Flex> */}

        <Content
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingLeft: 150,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button
            style={{
              backgroundColor: "#FFE6E2",
              color: "black",
              borderColor: "#FFE6E2",
              fontFamily: "Poppins",
              fontSize: 10,
            }}
          >
            <h2>View Dashboard</h2>
          </Button>
          <Button
            style={{
              backgroundColor: "#a2c3a4",
              color: "white",
              borderColor: "#a2c3a4",
              fontFamily: "Poppins",
              fontSize: 10,
            }}
          >
            <h2>View forum</h2>
          </Button>
        </Content>
      </Content>
    </Layout>
  );
};

export default PatientCard;
