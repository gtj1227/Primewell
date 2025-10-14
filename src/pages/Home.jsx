import { use, useEffect, useState } from "react";
import {Flex} from "antd"
import axios from "axios"
import "./../App.css"
import TopDoctorCard from "../components/TopDoctorCard";
import Footer from "../components/Footer";

const Home = () => {
    const [topDoctors, setTopDoctors] = useState([])

    const fetchTopDoctors = async () => {
        const res = await axios.get("http://localhost:3000/reviewsTop")
        setTopDoctors(res.data)
        console.log(res.data)
    }
    
    useEffect(() => {
        fetchTopDoctors()
    }, [])

    return (
        <>
            <Flex justify="center" align="center" style={{height: "70vh", width: "100vw", marginTop: "180px", marginBottom: "100px"}}>
                <div className="text-container">
                    <h1 className="title" style={{color: "#ffffff"}}>Empowering healthier lives with <span style={{color: "#f09c96", fontWeight: "900"}}>expert care </span> 
                        and <span style={{color: "#f09c96", fontWeight: "900"}}>proven results</span>. 
                        Your wellness starts <span style={{color: "#f09c96", fontWeight: "900"}}>here</span>.
                    </h1>
                </div>
            </Flex>
            {/* This is Section for Top 3 Doctors */}
            <Flex vertical className="topDoctor-container" justify="center" align="center" style={{ width: "100vw"}}>
                <Flex vertical gap="150px" justify="center" align="stretch" style={{margin: "140px"}}>
                    {topDoctors.map((user, index) => (
                        <TopDoctorCard key={index} name={user.first_name + " " + user.last_name} specialty={user.specialty} 
                            side={index % 2 === 0 ? "left" : "right"}/>
                    ))}
                </Flex>
            </Flex>
            <Flex justify="center" align="center" style={{width: "100vw", margin: "25px"}}>
                <Footer />
            </Flex>
        </>
    )
}

export default Home