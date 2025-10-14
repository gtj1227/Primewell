import { Link, Outlet } from "react-router-dom";
import { Flex, Button, Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const PharmaSideBarMenu = ({info}) => {
    console.log("From PharmaSideBarMenu.jsx: ", info?.pharm_id)
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
                    <Menu.Item key="2">
                        <Link to="PharmacyPortal/Request"><strong>Requests</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <Link to="PharmacyPortal/Pickups"><strong>Pending Pick-ups</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <Link to="/PharmacistPortal"><strong>Pill Page</strong></Link>
                    </Menu.Item>
                    <Menu.Item key="5">
                        <Link to="PharmacyPortal/AccountInfo"><strong>Account Info</strong></Link>
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
    )
}

export default PharmaSideBarMenu