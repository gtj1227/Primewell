import { Link, useNavigate } from "react-router-dom";
import "./../App.css";
import { Layout, Dropdown, Menu, Typography, Button } from "antd";
import { useEffect, useState } from "react";
import UserTypeModal from "./UserTypeModal";
const { Title } = Typography;
const { Header } = Layout;

const Navbar = (props) => {
  const [isUserTypeModalOpen, setIsUserTypeModalOpen] = useState(false);
  const [auth, setAuth] = useState(false)
  const [userType, setUserType] = useState("")
  const [isPharm, setIsPharm] = useState(false)
  const [name, setName] = useState("")
  const navigate = useNavigate();


  const showModal = (name) => {
    setName(name)
    setIsUserTypeModalOpen(true)
  };

  const handleClose = () => {
   setIsUserTypeModalOpen(false)
  };

  const items = [
    {
      key: '1',
      label: userType === "Pharmacist" ? props?.userInfo?.Company_Name : props?.userInfo?.First_Name + " " + props?.userInfo?.Last_Name,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: '2',
      label: 'View Profile',
    },
    {
      key: '3',
      label: 'Sign Out',
    },
  ]

  const handleMenuClick = (e) => {
    switch (e.key) {
      case '2':
        console.log('Navigating to profile');
        navigate("/viewProfile")
        // navigate('/profile'); // if using react-router-dom's useNavigate
        break;
      case '3':
        console.log('Signing out...');
        setAuth(false);
        if (userType === "Pharmacist"){
          setIsPharm(false)
        }
        setUserType('');
        navigate("/")
        break;
      default:
        break;
    }
  };
  

    return (    
        <>
            <Header
                style={{
                display: "flex",
                alignItems: "center",
                width: "100vw",
                padding: "0",
                position: "fixed",
                top: "0",
                zIndex: "1000",
                }}
            >
                <div>
                    <Title
                        style={{
                        color: "#ffffff",
                        margin: "0 35px",
                        fontWeight: "900",
                        fontSize: "48px",
                        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                        }}
                    >
                        {isPharm ? props?.userInfo?.Company_Name : "PrimeWell Clinic"}
                    </Title>
                </div>

                <Menu theme="dark" mode="horizontal" style={{ 
                  marginLeft: "auto", 
                  display: "flex",  // Ensures items align properly
                  flexGrow: 1,      // Allows items to expand dynamically
                  justifyContent: "flex-end", // Align items to the right
                  minWidth: "500px", // Prevents shrinking
                  width: "auto", // Ensures the menu expands to fit items
                  marginRight: "5px"
                  }}>
                  {!isPharm && (
                    <>
                    <Menu.Item key="1">
                        <Link to="/" style={{ color: "#ffffff" }}>
                        <strong>HOME</strong>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <Link to="/Posts" style={{ color: "#ffffff" }}>
                        <strong>POSTS</strong>
                        </Link>
                    </Menu.Item>
                    </>
                  )}
                    {auth ? (
                      <>
                      {userType === "Patient" ? (
                        <Menu.Item key="4">
                          <Link to="/PatientPortal" style={{ color: "#ffffff" }}>
                          <strong>PATIENT PORTAL</strong>
                          </Link>
                        </Menu.Item>
                      ) : userType === "Doctor" ? (
                        <Menu.Item key="4">
                          <Link to="/DoctorPortal" style={{ color: "#ffffff" }}>
                          <strong>DOCTOR PORTAL</strong>
                          </Link>
                        </Menu.Item>
                      ) : userType == "Pharmacist" ? (
                        <Menu.Item key="4">
                          <Link to="/PharmacistPortal" style={{ color: "#ffffff" }}>
                          <strong>PHARMACIST PORTAL</strong>
                          </Link>
                        </Menu.Item>
                      ) : null}
                      {!isPharm && (
                        <Menu.Item key="5">
                          <Link to="/Exercise" style={{ color: "#ffffff" }}>
                          <strong>EXERCISES</strong>
                          </Link>
                        </Menu.Item>
                      )}
                      </>
                    ) : null}
                    {!isPharm && (
                      <Menu.Item key="3">
                          <Link to="/Reviews" style={{ color: "#ffffff" }}>
                          <strong>REVIEWS</strong>
                          </Link>
                      </Menu.Item>
                    )}
                </Menu>
                {!auth ? (
                  <>
                    <Button
                      className="custom-btn"
                      // style={{ marginLeft: "5px" }}
                      onClick={() => {
                          showModal("Login");
                      }}
                      >
                      Login
                    </Button>
                    <Button
                      className="custom-btn"
                      style={{ margin: "0 25px 0 10px", backgroundColor: "#f09c96" }}
                      onClick={() => {
                          showModal("Sign up");
                      }}
                      >
                      Create Account
                    </Button>
                  </>
                ) : (
                <Dropdown menu={{ items, onClick: handleMenuClick }} placement="bottomRight" trigger={['click']}>
                  <Button style={{ 
                    width: "48px", 
                    height: "48px",
                    padding: 0,         
                    border: "none",     
                    overflow: "hidden", 
                    display: "flex",    
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    marginRight: "20px"
                  }}>
                    <img src="/userIcon.svg" alt="Icon" style={{ 
                          width: "100%", 
                          height: "auto", 
                          objectFit: "cover", 
                          borderRadius: "10px" 
                      }}/>
                  </Button>
                </Dropdown>)}
            </Header>

            <UserTypeModal
                open={isUserTypeModalOpen}
                name={name}
                auth={setAuth}
                userType={userType}
                setUserType={setUserType}
                info={props.info}
                setIsPharm={setIsPharm}
                handleClose={() => handleClose("SignUp")}
            />
        </>
  );
};

export default Navbar;