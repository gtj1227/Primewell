import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {Flex, Input, Layout} from "antd"
import ReviewCard from "../components/ReviewCard"
import './../App.css'
import axios from "axios"

const Reviews = () => {
    const [reviewInfo, setReviewInfo] = useState([])
    const [searchedDoctor, setSearchedDoctor] = useState("")
    const [filteredInfo, setFilteredInfo] = useState([])
    
    const fetchReviewInfo = async () => {
        const res = await axios.get("http://localhost:3000/reviews")
        setReviewInfo(res.data)
    }
    
    useEffect(() => {
        fetchReviewInfo()
    }, [])

    const handleSearch = (e) => {
        setSearchedDoctor(e.target.value)
    }

    const filteredDoctor = reviewInfo.filter((review) => {
        if ( searchedDoctor === "" ) return reviewInfo
         
        return review.first_name.toLowerCase().includes(searchedDoctor.toLowerCase())
    })

    useEffect(() => {
        //setFilteredInfo(filteredDoctor)
    }, [searchedDoctor])

    const handleReviewCardClick = (user) => {
        console.log("Body from Review Card Clicked")
        console.log(user)
    }

    return (
        <Flex justify="center" align="center" style={{
            height: "auto", width: "100vw", marginTop: "180px", marginBottom: "100px"
        }}>
            <Flex vertical justify="center" align="center" gap="60px" style={{
                    background: "#ffffff", 
                    borderRadius: "12px",
                    padding: "33px 40px",
                    width: "60%",
                    maxWidth: "60%",
                    overflowY: "auto",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                }}>
                    <h1 className="title" style={{ color: "#373b41", marginBottom: "10px", marginTop: 0, fontFamily: "Poppins"}} >List of Doctors</h1>
                    <Input placeholder="Search by Doctor" value={searchedDoctor} onChange={handleSearch} style={{fontSize: "24px", height: "50px", width: "50%"}}
                        prefix={<img src="/searchIcon.svg" alt="Icon" style={{width: "24px", marginRight: "5px"}}/>}
                    />
                <Flex vertical gap="20px" style={{
                        width: "100%",
                    }}>
                    {filteredDoctor.map((user, index) => (
                        <Link key={index} to={`/Reviews/${user?.doctor_id}`}>
                            <ReviewCard key={index} info={user} onClick={handleReviewCardClick}/>     
                        </Link>
                    ))}
                </Flex>
            </Flex>
        </Flex>
        
    )
}

export default Reviews
