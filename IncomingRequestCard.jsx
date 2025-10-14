import { Flex, Layout, Button } from "antd";
import { UserOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Content } = Layout;

const IncomingRequestCard = (props) => {
  const handleAccept = () => {
    console.log("Patient " + props.Fname + " " + props.Lname + " accepted");
  };

  const handleDecline = () => {
    console.log("Patient " + props.Fname + " " + props.Lname + " Declined");
  };

  const PatientName = ({ Fname, Lname }) => {
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
          {Fname} {Lname}
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
        height: "120px",
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
        <PatientName Fname={props.Fname} Lname={props.Lname} />
        <Content
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: 10,
            gap: 10,
          }}
        >
          <Button
            style={{
              backgroundColor: "#a2c3a4",
              color: "white",
              borderColor: "#a2c3a4",
              fontFamily: "Poppins",
              fontSize: 40,
              borderRadius: "100%",
              height: 60,
              width: 60,
            }}
            onClick={() => {handleAccept()}}
          >
            <CheckOutlined />
          </Button>
          <Button
            style={{
              backgroundColor: "#FFE6E2",
              color: "black",
              borderColor: "#FFE6E2",
              fontFamily: "Poppins",
              fontSize: 40,
              borderRadius: "100%",
              height: 60,
              width: 60,
            }}
            onClick={() => {handleDecline()}}
          >
            <CloseOutlined />
          </Button>
        </Content>
      </Content>
    </Layout>
  );
};

export default IncomingRequestCard;
