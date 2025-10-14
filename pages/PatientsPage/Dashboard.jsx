import {Button, Flex} from "antd"

const Dashboard = (props) => {
    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "10px 40px",
            width: "100%",
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <Flex justify="center" align="center" style={{height: "100vh"}}>
                <h1 style={{color: "#333333", marginBottom: 0, marginTop: 0}}>Welcome {props.info?.First_Name} to your Dashboard!</h1>
            </Flex>
        </Flex>
    );
};

export default Dashboard;