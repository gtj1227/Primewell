import {Button, Flex} from "antd"
import { useState, useEffect } from "react"
import axios from "axios"

const Profile = ({userInfo}) => {
    const [userProfile, setUserProfile] = useState(null)
    const [userType, setUserType] = useState("")
    const [assignedPharm, setAssignedPharm] = useState(null)
    const [assignedDoct, setAssignedDoct] = useState(null)

    const fetchUserProfile = async () => {
        try {
            let endpoint = ""
            let type = ""

            if (!userInfo) return 
            console.log("Fetch Profile: ", userInfo)
            if (userInfo.patient_id){
                endpoint = `http://localhost:3000/patientInfo/${userInfo.patient_id}`
                type = "Patient"
                setUserType('Patient')
            } else if (userInfo.doctor_id) {
                endpoint = `http://localhost:3000/doctorInfo/${userInfo.doctor_id}`
                type = "Doctor"
                setUserType('Doctor')
            } else if (userInfo.pharm_id) {
                endpoint = `http://localhost:3000/pharmInfo/${userInfo.pharm_id}`
                type = "Pharmacy"
                setUserType('Pharmacy')
            } else {
                console.warn("No Valid User ID Found for Profile")
            }

            const res = await axios.get(endpoint)
            const info = res.data
            setUserProfile(info[0])
            if (type === "Patient") {
                const pharmRes = await axios.get(`http://localhost:3000/pharmInfo/${info[0]?.Pharm_ID}`)
                console.log("Pharm Fetched Data: ", pharmRes.data)
                setAssignedPharm(pharmRes.data)
                if (info[0].Doctor_ID) {
                    const doctRes = await axios.get(`http://localhost:3000/doctorInfo/${info[0]?.Doctor_ID}`)
                    setAssignedDoct(doctRes.data)
                    console.log("Doctor Fetched Data:", doctRes.data)
                }
            }
            console.log("Fetched Data: ", info)
        } catch (err){
            console.error(err)
        }
        //const res = await axios.get('"http://localhost:3000/pati')
    }

    useEffect(()=>{
        fetchUserProfile()
    }, [userInfo])


    return (
        <>
        <Flex justify="center" align="center" style={{
            height: "auto", width: "100vw", marginTop: "180px", marginBottom: "100px"
            }}>
            <Flex vertical gap="20px" style={{
                    background: "#ffffff", 
                    borderRadius: "12px",
                    padding: "33px 40px",
                    width: "60%",
                    maxWidth: "60%",
                    overflowY: "auto",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
                }}>
                    <Flex justify="center" align="center">
                        {userType === 'Patient' && (
                            <h1 className="title" style={{ color: "#373b41", marginBottom: "10px", marginTop: 0, fontFamily: "Poppins"}}>{userProfile?.First_Name + " " + userProfile?.Last_Name}'s Profile</h1>
                        )}
                        {userType === 'Doctor' && (
                            <h1 className="title" style={{ color: "#373b41", marginBottom: "10px", marginTop: 0, fontFamily: "Poppins"}}>{userProfile?.First_Name + " " + userProfile?.Last_Name}'s Profile</h1>
                        )}
                        {userType === 'Pharmacy' && (
                            <h1 className="title" style={{ color: "#373b41", marginBottom: "10px", marginTop: 0, fontFamily: "Poppins"}}>{userProfile?.Company_Name} Profile</h1>
                        )}
                    </Flex>
                    <Flex vertical style={{color: "#333333", fontSize: "18px"}}>
                        {userType === 'Patient' && (
                            <>
                                <p>First Name: {userProfile?.First_Name}</p>
                                <p>First Name: {userProfile?.Last_Name}</p>
                                <p>Email: {userProfile?.Email}</p>
                                <p>Phone: {userProfile?.Phone}</p>
                                <p>Address: {userProfile?.Address}</p>
                                <p>Zip: {userProfile?.Zip}</p>
                                <p>Assigned Phamracy: {assignedPharm?.[0]?.Company_Name} at {assignedPharm?.[0]?.Address}, {assignedPharm?.[0]?.Zip}</p>
                                <p>Assigned Doctor: { assignedDoct ? assignedDoct?.[0]?.First_Name + " " + assignedDoct?.[0]?.Last_Name : "No Doctor Requested Yet"}</p>
                            </>
                        )}
                        {userType === 'Doctor' && (
                            <>
                                <p>First Name: {userProfile?.First_Name}</p>
                                <p>Last Name: {userProfile?.Last_Name}</p>
                                <p>Specialy: {userProfile?.Specialty}</p>
                                <p>Email: {userProfile?.Email}</p>
                                <p>Phone: {userProfile?.Phone}</p>
                                <p>Doctor License ID: {userProfile?.License_Serial}</p>
                                <p>Availablilty: {userProfile?.Availability === 1 ? "Accepting Request" : "Not Accepting Requests"}</p>
                            </>
                        )}
                        {userType === "Pharmacy" && (
                            <>
                                <p>Pharmacy Name: {userProfile?.Company_Name}</p>
                                <p>Address: {userProfile?.Address}</p>
                                <p>Zip Code: {userProfile?.Zip}</p>
                            </>
                        )}
                    </Flex>
            </Flex>
        </Flex>
        </>
    )
}

export default Profile