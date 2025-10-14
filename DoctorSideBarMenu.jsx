import { Link, Outlet } from "react-router-dom";
import { Flex, Button, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const DoctorSideBarMenu = ({info}) => {
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
                        <Link to="/DoctorPortal"><strong>Dashboard</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/DoctorPortal/Request"><strong>Incoming Requests</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="/DoctorPortal/Appointment"><strong>Appointments</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Link to="/DoctorPortal/PillRequest"><strong>Pill Request</strong></Link>
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

export default DoctorSideBarMenu;
