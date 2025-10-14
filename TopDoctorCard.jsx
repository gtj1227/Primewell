import { Flex } from "antd"

const TopDoctorCard = (props) => {

    return (
        <>
            <Flex 
                gap="120px" 
                justify="center" 
                align="center" 
                style={{
                    padding: "15px", 
                    minHeight: "250px", 
                    borderRadius: "10px",
                    width: "750px", 
                    textAlign: "center",
                    flexDirection: props.side === "left" ? "row" : "row-reverse",
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)", 
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", 
                    border: "1px solid rgba(255, 255, 255, 0.2)" 
                }}
            >
                <Flex vertical align="center" style={{ width: "50%"}}>
                    <h2 style={{ color: "#000000", fontSize: "28px", margin: "0" }}>
                        {props.name}
                    </h2>
                    <p style={{ color: "#666666", fontSize: "22px", margin: "0" }}>
                        {props.specialty}
                    </p>
                </Flex>

                <img 
                    src="/doctorImg.webp" 
                    alt="Doctor Image" 
                    style={{ 
                        width: "70%", 
                        height: "auto", 
                        objectFit: "cover", 
                        borderRadius: "10px" 
                    }} 
                />
            </Flex>
        </>
    )
}

export default TopDoctorCard