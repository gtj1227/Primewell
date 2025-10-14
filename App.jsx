import { useState, useEffect } from 'react'
import {Routes, Route} from 'react-router-dom'
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

function App() {
  const [userInfo, setUserInfo] = useState([]) // This will store the user Info for future queries
  const [surveyCompleted, setSurveyCompleted] = useState(false); // shared state
  useEffect(() => {
    document.title = "PrimeWell Clinic";
  }, []);

  useEffect(() => {
    // This is to just verify their info is being stored
    console.log("UserInfo in App.jsx");
    console.log(userInfo);
  }, [userInfo]);

  return (
    <>
      <div className='App'>
        <Navbar userInfo={userInfo} info={setUserInfo}/>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/Posts' element={<Posts />}/>
          <Route path='/PharmacistPortal' element={<PharmacistPortal />}/>
          <Route path='/Exercise' element={<Exercise info={userInfo}/>} />
          <Route path='/viewProfile' element={<Profile userInfo={userInfo}/>} />
          {/* Patient Portal with Nested Routes */}
          <Route path="/PatientPortal" element={<SideBarMenu info={userInfo} surveyCompleted={surveyCompleted}/>}>
            <Route index element={<Dashboard info={userInfo} />} />
            <Route path="Request" element={<Request userInfo={userInfo} />} />
            <Route path="Appointment" element={<div>Appointments Page</div>} />
            <Route path="Regiment" element={<div>Regiment Page</div>} />
            <Route path="Daily-Survey" element={<DailySurvey info={userInfo} setSurveyCompleted={setSurveyCompleted}/>} />
            <Route path="Prescription" element={<div>Prescription Page</div>} />
            <Route path="Payment" element={<div>Payment Page</div>} />
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
              path="/DoctorPortal/Appointment"
              element={<div>Appointments Page</div>}
            />
            <Route
              path="/DoctorPortal/PillRequest"
              element={<DoctorPillRequest />}
            />
          </Route>
           {/* Pharmacist Portal with Nested Routes */}
          <Route path="/PharmacistPortal/" element={<PharmaSideBarMenu info={userInfo} />}>
            <Route path="PharmacyPortal/Request" element={<div>Request</div>} />
            <Route path="PharmacyPortal/Pickups" element={<div>Pending Pick-ups Page</div>} />
            <Route index element={<PillPage info={userInfo} />} />
            <Route path="PharmacyPortal/AccountInfo" element={<div>Account Info Page</div>} />
          </Route>
          {/* Reviews with Nested Routes */}
          <Route path='/Reviews' element={<Reviews />} />
          <Route path='/Reviews/:id' element={<ReviewDetail userInfo={userInfo}/>} />

        </Routes>
      </div>
    </>
  );
}

export default App;
