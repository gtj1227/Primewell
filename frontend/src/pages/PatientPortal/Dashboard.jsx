import { Button, Flex } from "antd"
import CalorieChart from "../../components/CalorieChart";
import WeightChart from "../../components/WeightChart";
import InterventionList from "../../components/InterventionList";

const Dashboard = (props) => {
    console.log(props.info)
    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "10px 40px",
            width: "100%",
            overflowY: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            // flexDirection: "row"
        }}>
            <Flex justify="center" align="center" style={{ height: "100vh", margin: "25% 0" }}>
                <h1 style={{ color: "#333333", marginBottom: 0, marginTop: 0 }}>Welcome {props.info?.First_Name} to your Dashboard!</h1>
            </Flex>
            <Flex vertical justify="center" align="center" gap="50px" style={{ marginTop: "100px", width: "100%" }}>
                <h1 style={{ color: "#333333", marginBottom: 0, marginTop: 0 }}>Daily Progress</h1>
                <Flex gap="100px" justify="center" style={{marginBottom: "100px", width: "100%"}}>

                    <Flex vertical justify="center" align="center" style={{ maxWidth: "500px" }}>
                        <h2 style={{ textAlign: "center", marginBottom: "16px" }}>Caloric Intake Trends</h2>
                        <CalorieChart info={props.info} />
                    </Flex>
                    <Flex vertical gap="25px" justify="center" align="center">
                        <Flex vertical align="center" justify="center" style={{ maxWidth: "500px" }}>
                            <h2 style={{ textAlign: "center", marginBottom: "16px" }}>Weekly Weight Trends</h2>
                            <WeightChart info={props.info} />
                        </Flex>
                        <Flex vertical style={{ width: "100%" }}>
                            <InterventionList info={props.info} />
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};

export default Dashboard;