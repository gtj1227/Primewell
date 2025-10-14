import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Flex, Layout, Button } from "antd";
const {Content, Sider} = Layout
import ReviewCommentCard from "./ReviewCommentCard";
import ReviewModal from "./ReviewModal";

const ReviewDetail = ({userInfo}) => {
    const { id } = useParams(); // Get the review ID from the URL
    const [reviews, setReviews] = useState(null);
    const [doctorInfo, setDoctorInfo] = useState(null)
    const [rating, setRating] = useState(0)
    const [sent, setSent] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchDoctorInfo = async () => {
        try {
            const res1 = await axios.get(`http://localhost:3000/reviews/comments/${id}`)
            setReviews(res1.data)
    
            const res2 = await axios.get(`http://localhost:3000/reviews/${id}`)
            setDoctorInfo(res2.data)
            setRating(parseFloat(res2.data[0]?.rating).toFixed(1))
        } catch (err) {
            console.log('Error getting Info: ', err)
        }
    }

    useEffect(() => {
        fetchDoctorInfo()
        setSent(false)
        console.log("Doctor Info Body")
        console.log(doctorInfo)
    }, [id, sent]);

    const showModal = () => {
        setIsModalOpen(true)
    };
    
    const handleClose = () => {
        setIsModalOpen(false)
    };


    return (
        <>
            <Flex vertical justify="center" align="center" style={{
                height: "auto", width: "100vw", marginTop: "180px", marginBottom: "100px"
            }}>
                <Flex vertical justify="center" align="center" gap="20px" style={{
                    background: "#ffffff", 
                    borderRadius: "12px",
                    padding: "33px 40px",
                    width: "60%",
                    overflowY: "auto"
                }}>
                    {/* Doctor Name with their Rating */}
                    <Flex justify="center" align="center" gap="30px" style={{width: "100%"}}>
                        <Flex vertical justify="center" align="center" gap="5px" style={{color: "#333333"}}> 
                            <Flex vertical justify="center" align="center">
                                <h2>Quality</h2> 
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
                                <p style={{fontWeight: "bold"}}>{doctorInfo?.[0]?.cnt} Ratings</p>
                            </Flex>
                        </Flex>
                        <Flex justify="center" align="center">
                            <Flex vertical gap="5px" justify="center">
                                <Flex gap="10px" align="center">
                                    <img src="/MaleDoctorIcon.svg" alt="Icon" style={{width: "48px"}} />
                                    <h1 style={{margin: 0, color: "#333333"}}>{`${doctorInfo?.[0]?.first_name} ${doctorInfo?.[0]?.last_name}`}</h1>
                                </Flex>
                                <h2 style={{margin: 0, color: "#333333"}}>{doctorInfo?.[0]?.specialty}</h2>   
                            </Flex>
                        </Flex>
                    </Flex>
                    {/* Section for Writing a new review */}
                    <Button type="primary" style={{
                        width: "40%", borderRadius: "24px", padding: "22px 0px", backgroundColor: "#f09c96", fontSize: "22px", fontWeight: "700", marginBottom: "20px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                    }} onClick={showModal}>Write a Review</Button>

                    {/* Section for comments */}
                    <Flex vertical align="center" justify="center" gap="20px">
                        {reviews?.map((review, index) => (
                            <ReviewCommentCard key={index} info={review} />
                        ))}
                    </Flex>

                </Flex>
            </Flex>

            <ReviewModal open={isModalOpen} handleClose={handleClose} userInfo={userInfo} doctorInfo={doctorInfo} sent={setSent}/>
        </>
    )
}

export default ReviewDetail;