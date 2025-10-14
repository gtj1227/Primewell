import { useEffect, useState } from "react";
import {Flex, Layout} from "antd"
const {Content, Sider} = Layout


const ReviewCommentCard = ({info}) => {
    const [rating, setRating] = useState(0)

    useEffect(() => {
        setRating(parseFloat(info?.rating).toFixed(1))
    }, [info])

    return (
        <>
            <Flex gap="50px" style={{
                background: "#ffe6e2", 
                borderRadius: "12px",
                padding: "33px 40px",
                overflowY: "auto",
                width: "100%", 
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
            }}>
                {/* Rating Section */}
                <Flex vertical style={{minWidth: "141px"}}>
                    <Flex vertical justify="center" align="center" style={{color: "#333333"}}>
                        <h2 style={{marginTop: 0}}>Quality</h2> 
                        <Flex justify="center" align="center"
                            style={{
                                width: 'auto',
                                borderRadius: "8px",
                                backgroundColor: rating >= 4 ? '#80ed99' : rating >= 3 ? "#fee440" : "#ef476f",
                                color: "#333333",
                            }}
                        >     
                                <p style={{ fontSize: '50px', fontWeight: 'bold', margin: 0, padding: "15px" }}>{rating}<span style={{ fontSize: '25px', verticalAlign: 'super', marginLeft: '2px' }}> /5</span></p>
                        </Flex>
                    </Flex>
                </Flex>
                {/* Patient Info and Review Section */}
                <Flex vertical justify="center" gap="10px" style={{color: "#333333", width: "100%"}}>
                    <Flex justify="space-between" align="center" style={{ width: "100%" }}>
                        <Flex gap="10px" align="center" style={{color: "#333333"}}>
                            <img src="/clientIcon.png" alt="Icon" style={{width: "42px"}} />
                            <h3 style={{margin: 0, fontSize: "22px"}}>{`${info?.first_name} ${info?.last_name}`}</h3>
                        </Flex>
                        <h3 style={{margin: 0, fontSize: "22px"}}>{info?.date_posted.split("T")[0]}</h3>
                    </Flex>
                    <p>{info?.review_text}</p>
                </Flex>
            </Flex>
        </>
    )
}

export default ReviewCommentCard