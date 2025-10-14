import { Flex, Layout, Button } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";

const { Content } = Layout;

const UpcomingAptsCards = (props) => {
  const PatientData = ({ name }) => {
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
          color: "white",
        }}
      >
        <Flex style={{ flexDirection: "column" }}>
          <Flex>
            <CalendarOutlined style={{ fontSize: "30px", color: "white" }} />
            <p fontSize="30px">
              {" "}
              {props.Date.substring(0, 10)} | {props.Time}
            </p>
          </Flex>
          <Flex>
            <UserOutlined style={{ fontSize: "30px", color: "white" }} />
            <p fontSize="30px">
              {" "}
              {props.Fname} {props.Lname} | {props.Tier}
            </p>
          </Flex>
        </Flex>
        <Content
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingLeft: 350,
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button
            style={{
              backgroundColor: "#FFE6E2",
              color: "black",
              borderColor: "#FFE6E2",
              justifyContent: "flex-end",
              fontFamily: "Poppins",
              fontSize: 10,
            }}
          >
            <h2>Start Appointment</h2>
          </Button>
        </Content>
      </Content>
    </Layout>
  );
};

export default UpcomingAptsCards;
