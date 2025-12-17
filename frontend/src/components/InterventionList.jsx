import { Button, Flex } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const InterventionList = ({ info }) => {
    const [interventions, setInterventions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        const fetchInterventionInfo = async () => {
            try {
                console.log("Passed info: ", info);
                const res = await axios.get(`http://localhost:3000/appointmentInfo/${info?.patient_id}`);
                setInterventions(Array.isArray(res.data) ? res.data : [res.data]);
                setCurrentIndex(0); //for shifting through feedbacks
                console.log("API info: ", res.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchInterventionInfo();
    }, []);
    const current = interventions[currentIndex];
    if (!current) return null;
    const formattedDate = dayjs(current.Appt_Date).format("MMMM D");
    return (
        <Flex
            vertical
            style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "12px 12px",
                width: "550px",
                height: "500px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Flex
                justify="center"
                align="center"
                style={{
                    width: "100%",
                    height: "auto",
                    fontWeight: "bold",
                    fontSize: "32px",
                    // padding: "5px",
                    background: "#F09C96",
                    color: "#ffffff",
                    borderRadius: "2px",
                    marginBottom: "5px",
                }}
            >
                Intervention List
            </Flex>
            <Flex vertical style={{ fontWeight: "bold", fontSize: "21px", marginTop: "10px", paddingLeft: "5px" }} gap="5px">
                <p style={{margin: 0}}>Appointment Date: {formattedDate}</p>
                <p style={{margin: 0}}>Doctor: {current.Doctor}</p>
                <p style={{margin: 0}}>{current.Doctors_Feedback}</p>
            </Flex>
            {/* <Flex style={{ fontWeight: "bold", }}>
            </Flex>
            <Flex style={{ fontWeight: "bold", flex: 1 }}>
            </Flex> */}
    
            <Flex
                justify="end"
                align="center"
                style={{
                    width: "50%",
                    alignSelf: "center",
                    gap: "10px",
                    marginTop: "auto",
                }}
            >
                <Button
                    id="next-button"
                    style={{
                        background: "#F09C96",
                        color: "#ffffff",
                        fontWeight: "bold",
                        width: "50%",
                        height: "35px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    }}
                    icon={<LeftOutlined />}
                    onClick={() => {
                        if (currentIndex === 0){
                            return
                        }
                        setCurrentIndex((i) => i - 1)
                    }}
                />
    
                <Button
                    style={{
                        background: "#F09C96",
                        color: "#ffffff",
                        fontWeight: "bold",
                        width: "50%",
                        height: "35px",
                        borderRadius: "8px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    }}
                    icon={<RightOutlined />}
                    disabled={currentIndex === interventions.length - 1}
                    onClick={() => {
                        if (currentIndex > interventions.length) {
                            return
                        }
                        setCurrentIndex((i) => i + 1)}
                    }
                />
            </Flex>
        </Flex>
    );
};
export default InterventionList;    