import { useState, useEffect } from "react";
import axios from "axios";
import {Flex, Input, Button} from "antd"
import PostsCard from "../components/PostsCard";

const Posts = () => {
    const [postInfo, setPostInfo] = useState(null)
    const [searchedValue, setSearchedValue] = useState("")

    const fetchPosts = async () => {
        try {
            const res = await axios.get("http://localhost:3000/forumPosts")
            console.log("Fetched Posts: ", res.data)
            setPostInfo(res.data)
        } catch (err) {
            console.log("Error Fetching Posts: ", err)
        }
    }

    useEffect(()=> {
        fetchPosts()
    }, [])

    const handleSearch = (e) => {
        console.log(e.target.value)
        setSearchedValue(e.target.value)
    }

    const filteredPosts = postInfo?.filter((post) => {
        if (!searchedValue) return postInfo;

        return post.Exercise_Name.toLowerCase().includes(searchedValue.toLowerCase())
    })

    return (
        <>
            <Flex justify="center" align="center" style={{
            height: "auto", width: "100vw", marginTop: "180px", marginBottom: "100px"
            }}>
            <Flex vertical justify="center" align="center" gap="20px" style={{
                    background: "#ffffff", 
                    borderRadius: "12px",
                    padding: "33px 40px",
                    width: "60%",
                    maxWidth: "60%",
                    overflowY: "auto",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                }}>
                    <h1 className="title" style={{ color: "#373b41", marginBottom: "10px", marginTop: 0, fontFamily: "Poppins"}} >Exercise Posts</h1>
                    <Input placeholder="Search by Exercise Name" style={{fontSize: "24px", height: "50px", width: "50%", marginTop: "40px"}}
                        prefix={<img src="/searchIcon.svg" alt="Icon" style={{width: "24px", marginRight: "5px"}}/>} onChange={handleSearch}
                    />
                    {/* Section for Writing a new review */}
                    <Button type="primary" style={{
                        width: "40%", borderRadius: "24px", padding: "22px 0px", backgroundColor: "#f09c96", marginBottom:"40px", fontSize: "22px", fontWeight: "700", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                    }}>Start a Discussion</Button>
                <Flex vertical gap="30px" style={{
                        width: "100%",
                    }}>
                   {/* Where the Post Cards will go */}
                   {filteredPosts?.map((post, index) => (
                        <PostsCard key={index} postInfo={post} />
                   ))}
                </Flex>
            </Flex>
        </Flex>
        </>
    )
}

export default Posts