import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Flex } from 'antd'
import axios from 'axios'
import './App.css'
import Home from './pages/Home'
import Posts from './pages/Posts'
import Reviews from './pages/Reviews'
import Navbar from './components/Navbar'
import SideBarMenu from './pages/PatientPortal/SideBarMenu'
import PharmacistPortal from './pages/PharmacistPortal/PharmacistPortal'
import Dashboard from './pages/PatientPortal/Dashboard'
import Request from './pages/PatientPortal/Request'
import DoctorSideBarMenu from './pages/DoctorPortal/DoctorSideBarMenu'
import DoctorDashboard from './pages/DoctorPortal/DoctorDashboard'
import DoctorIncomingRequests from "./pages/DoctorPortal/DoctorIncomingRequests";
import DoctorPillRequest from './pages/DoctorPortal/DoctorPillRequest'
import Exercise from './pages/Exercise'
import ReviewDetail from './components/ReviewDetail'
import DailySurvey from './pages/PatientPortal/DailySurvey'
import Profile from './pages/Profile'
import PharmaSideBarMenu from './pages/PharmacistPortal/PharmaSideBarMenu'
import PillPage from './pages/PharmacistPortal/PillPage'
import Appointments from './pages/PatientPortal/Appointments'
import Regiment from './pages/PatientPortal/Regiment'
import ApptChannel from './pages/ApptChannel'
import DoctorFeedback from './pages/DoctorPortal/DoctorFeedback'
import DoctorPrescription from './pages/DoctorPortal/DoctorPrescription'
import Payment from './pages/PatientPortal/Payment'
import PrescriptionRequests from './pages/PharmacistPortal/PrescriptionRequests'
import PatientPrescription from './pages/PatientPortal/PatientPrescription'

function App() {
  const [userInfo, setUserInfo] = useState([]) // This will store the user Info for future queries
  const [surveyCompleted, setSurveyCompleted] = useState(false); // shared state
  const [isUserInfoLoaded, setIsUserInfoLoaded] = useState(false);

  useEffect(() => {
    document.title = "PrimeWell Clinic";
  }, []);

  useEffect(() => {
    const storedUserInfo = sessionStorage.getItem("userInfo")
    const storedAuth = sessionStorage.getItem("auth")

    if (storedUserInfo && storedAuth === "true"){
      setUserInfo(JSON.parse(storedUserInfo))
      console.log("Stored UserInfo: ", JSON.parse(storedUserInfo))
    }
    setIsUserInfoLoaded(true)
  }, [])
  console.log("Info from App.jsx: ", userInfo)

  const fetchUserInfo = async () => {
    if (userInfo.patient_id){
      const res = await axios.get(`/fetchPatient/${userInfo.patient_id}`)
      const enrichedData = {
        ...res.data,
        userType: "Patient",
      };
      setUserInfo(enrichedData)
      console.log("Updated Data: ", enrichedData)
      
      sessionStorage.setItem("userInfo", JSON.stringify(enrichedData));

    } else if (userInfo.doctor_id) {
      const res = await axios.get(`/fetchDoctor/${userInfo.doctor_id}`)
      const enrichedData = {
        ...res.data,
        userType: "Doctor",
      };
      setUserInfo(enrichedData)
      console.log("Updated Data: ", enrichedData)

      
      sessionStorage.setItem("userInfo", JSON.stringify(enrichedData));
    } else if (userInfo.pharm_id) {
      const res = await axios.get(`/fetchPharmacy/${userInfo.pharm_id}`)
      const enrichedData = {
        ...res.data,
        userType: "Pharmacist",
      };
      setUserInfo(enrichedData)
      console.log("Updated Data: ", enrichedData)
      
      sessionStorage.setItem("userInfo", JSON.stringify(enrichedData));  
    }
  }

  if (!isUserInfoLoaded) return <Flex justify='center' align='center' style={{color: "#ffffff", width: "100vw", fontSize: "48px"}}>Loading...</Flex>;

  return (
    <>
      <div className='App'>
        <Navbar userInfo={userInfo} info={setUserInfo} />
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/Posts' element={<Posts info={userInfo}/>}/>
          <Route path='/PharmacistPortal' element={<PharmacistPortal />}/>
          <Route path='/Exercise' element={<Exercise info={userInfo}/>} />
          <Route path='/viewProfile' element={<Profile userInfo={userInfo} fetchUserInfo={fetchUserInfo}/>}/>
          {/* Patient Portal with Nested Routes */}
          <Route path="/PatientPortal" element={<SideBarMenu info={userInfo} surveyCompleted={surveyCompleted} />}>
            <Route index element={<Dashboard info={userInfo} />} />
            <Route path="Request" element={<Request userInfo={userInfo} />} />
            <Route path="Appointment" element={<Appointments userInfo={userInfo}/>} />
            <Route path="Regiment" element={<Regiment info={userInfo}/>} />
            <Route path="Daily-Survey" element={<DailySurvey info={userInfo} setSurveyCompleted={setSurveyCompleted}/>} />
            <Route path="Prescription" element={<PatientPrescription userInfo={userInfo} />} />
            <Route path="Payment" element={<Payment userInfo={userInfo} />} />
            <Route path="ApptChannel" element={<ApptChannel userInfo={userInfo} />} />
          </Route>
          {/* Doctor Portal with Nested Routes */}
          <Route
            path="/DoctorPortal/"
            element={<DoctorSideBarMenu landing={true} info={userInfo} />}
          >
            <Route
              index
              element={<DoctorDashboard info={userInfo} />}
            />
            <Route
              path="/DoctorPortal/Request"
              element={<DoctorIncomingRequests info={userInfo} />}
            />
            <Route
              path="/DoctorPortal/PillRequest"
              element={<DoctorPillRequest />}
            />
            <Route 
              path="ApptChannel" 
              element={<ApptChannel userInfo={userInfo}/>} 
            />
            <Route 
              path="DoctorFeedback" 
              element={<DoctorFeedback userInfo={userInfo}/>} 
            />
            <Route 
              path="DoctorPrescription" 
              element={<DoctorPrescription userInfo={userInfo}/>} 
            />

          </Route>
          {/* Pharmacist Portal with Nested Routes */}
          <Route path="/PharmacistPortal/" element={<PharmaSideBarMenu info={userInfo} />}>
            <Route path="PharmacyPortal/Request" element={<PrescriptionRequests info={userInfo} />} />
            <Route path="PharmacyPortal/Pickups" element={<div>Pending Pick-ups Page</div>} />
            <Route index element={<PillPage info={userInfo} />} />
            <Route path="PharmacyPortal/AccountInfo" element={<div>Account Info Page</div>} />
          </Route>
          {/* Reviews with Nested Routes */}
          <Route path='/Reviews' element={<Reviews />} />
          <Route path='/Reviews/:id' element={<ReviewDetail userInfo={userInfo} />} />

        </Routes>
      </div>
    </>
  );
}

export default App;