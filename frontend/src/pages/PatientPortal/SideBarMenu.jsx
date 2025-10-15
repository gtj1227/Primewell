import { Link, Outlet } from "react-router-dom";
import { Flex, Button, Menu, Badge } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import "./../../App.css"
import axios from "axios";

const SideBarMenu = ({info, surveyCompleted}) => {
    const [surveyNeeded, setSurveyNeeded] = useState(false)

    const fetchDate = async () => {
        const body = {
            patient_id: info?.patient_id,
        }
        
        const res = await axios.post("http://localhost:3000/patientsurvey/date", body)
        if (res.data === false){
            setSurveyNeeded(true)
        } else {
            setSurveyNeeded(false)
        }
    }

    useEffect(() => {
        fetchDate()
    }, [])

    useEffect(() => {
        if (surveyCompleted) {
            setSurveyNeeded(false)
        }
    }, [surveyCompleted])


    return (
        <Flex style={{
            height: "90vh",
            width: "98vw",
            background: "#ffe6e2",
            margin: "80px 20px 20px",
            borderRadius: "20px"
        }}>
            {/* Sidebar (Hamburger Menu + Menu Items) */}
            <Flex vertical gap="3px" style={{
                margin: "15px 15px 10px 15px",
                paddingRight: "20px",
                borderRight: "2px solid #333333"
            }}>
                <Button style={{
                    width: "25px",
                    marginLeft: "14px",
                    padding: 0,
                    border: "none",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent"
                }}>
                    <MenuOutlined />
                </Button>

                {/* Menu Navigation */}
                <Menu className="menu">
                    <Menu.Item key="1">
                        <Link to="/PatientPortal"><strong>Dashboard</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/PatientPortal/Request"><strong>Request</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/PatientPortal/Appointment"><strong>Appointments</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Link to="/PatientPortal/Regiment"><strong>Regiment</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                        <Link to="/PatientPortal/Daily-Survey">
                            <Badge dot={surveyNeeded} offset={[10,0]}>
                                <strong>Daily Survey</strong>
                            </Badge>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="7">
                        <Link to="/PatientPortal/Prescription"><strong>Prescription</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="8">
                        <Link to="/PatientPortal/Payment"><strong>Payment</strong></Link>
                    </Menu.Item>
                </Menu>
            </Flex>

            {/* Main Content Area (Updates when menu item is clicked) */}
            <Flex style={{
                flex: 1,
                padding: "20px",
                overflow: "auto",
            }}>
                <Outlet /> {/* This allows nested routes to be rendered here */}
            </Flex>
        </Flex>
    );
};

export default SideBarMenu;