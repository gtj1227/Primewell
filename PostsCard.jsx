import { useEffect, useState } from "react";
import {Flex, Typography, Button} from "antd"
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const PostsCard = ({postInfo}) => {
    const [userInfo, setUserInfo] = useState(null)

    const fetchUserName = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/patient/${postInfo?.Patient_ID}`)
            const info = res.data
            console.log("Fetched UserName: ", res.data)
            setUserInfo(info)
        } catch (err) {
            console.log("Error Fetching UserName: ", err)
        }
    }

    useEffect(() => {
        fetchUserName()
    }, [])


    return (
        <Flex vertical gap="10px" style={{
            background: "#ffe6e2", 
            borderRadius: "12px",
            padding: "33px 40px",
            overflowY: "auto",
            //width: "100%",
            maxWidth: "100%", 
            overflow: "hidden", 
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            {/* Top: User & Date */}
            <Flex justify="space-between" align="center">
                <Flex gap="12px" align="center">
                <img
                    src="/clientIcon.png"
                    alt="Icon"
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                />
                <Text strong style={{ fontSize: "20px" }}>
                    {`${userInfo?.First_Name} ${userInfo?.Last_Name}`}
                </Text>
                </Flex>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                {postInfo?.Date_Posted.split("T")[0]}
                </Text>
            </Flex>
            <Flex vertical gap="30px">
                <Flex gap="50px" justify="flex-start" align="flex-start">
                    {/* Exercise Info */}
                    <Flex vertical gap="10px" style={{maxWidth: "400px", flex:1}}>
                        <Title level={4} style={{ margin: 0 }}>{postInfo?.Exercise_Name}</Title>
                        <Flex justify="space-between" align="center">
                        <Text type="secondary">Muscle Group:</Text>
                        <Text>{postInfo?.Muscle_Group}</Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                        <Text type="secondary">Exercise Class:</Text>
                        <Text>{postInfo?.Exercise_Class}</Text>
                        </Flex>
                        <Flex justify="space-between" align="center">
                        <Text type="secondary">Sets & Reps:</Text>
                        <Text>{postInfo?.Sets} Sets @ {postInfo?.Reps} Reps</Text>
                        </Flex>
                        <Flex vertical style={{ marginTop: "8px" }}>
                        <Text type="secondary">Description:</Text>
                        <Paragraph style={{ marginBottom: 0 }}>{postInfo?.Exercise_Description}</Paragraph>
                        </Flex>
                    </Flex>

                    {/* Feedback */}
                    <Flex vertical gap="10px" style={{maxWidth: "500px", flex:1}}>
                        <Title level={4} style={{ marginBottom: "4px" }}>{`${userInfo?.First_Name} ${userInfo?.Last_Name}`}'s Feedback</Title>
                        <Paragraph style={{ fontSize: "16px", margin: 0 }}>
                        {postInfo?.Forum_Text}
                        </Paragraph>
                    </Flex>

                </Flex>
                {/* Post Comment */}
                <Flex>
                    <Button type="primary" style={{
                            width: "auto", borderRadius: "24px", padding: "22px 22px", backgroundColor: "#A2C3A4", fontSize: "16px", fontWeight: "700", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                        }}>Add a Comment</Button>
                </Flex>
            </Flex>
        </Flex>
    )
}

export default PostsCard