import express from 'express'
import { addPatientDoc, createAppointment, createChatMsg, createChatroom, createComment, createDoctor, createDoctorSchedule, createDoctorTiers, createExercise, createForumPost, createPatient, createPerscription, createPharmacy, 
    createPill, createPreliminary, createRegiment, createReveiw, createSurvey, deleteAppointment, deleteComment, deleteDoctor, deleteForumPost, deletePatient, deletePerscription, deletePill, deleteRegiment, genereateAudit, getAppointmentsDoctor, getAppointmentsPatient, getChatMesseges, getComments_id, getDoctorAuth, getDoctors, 
    getDoctorSchedule, 
    getExercises, getExerciseByClass, getForumPosts, getPatientAuth, getPatients, getPharmacies, getPharmAuth, getPills, getPreliminaries, getPrescription, getRegiment, getReviews, 
    getReviewsTop, getReviewsByID, 
    getReviewsComments,  getSurvey, getTiers, LogAttempt, rmPatientDoc, UpdateDoctorInfo, UpdateDoctorSchedule, UpdatePatientInfo, UpdatePerscriptionInfo, UpdatePillInfo,
    UpdateRegiment,
    getPatientDoc,
    createApptRequest,
    getApptRequest,
    UpdateApptStat,
    UpdateRequest,
    getDocPatients,
    getPrescriptionDoc,
    getAuthSurvey,
    getSurveyLatestDate,
    getAllDoctors,
    getPatientInfo,
    getDoctorInfo,
    getPharmInfo, getDocID,
    getNearestPharms, getTimeslot, 
    rmPatientAppt,
    checkExistingRequests, startAppointment, endAppointment, fetchApptStartStatus, fetchAppointmentMessages, getAppointmentInfo, appendToRegiment, 
    UpdateDoctorFeedback,
    fetchApptEndStatus, getPillsFromPharm, clearPatientRegiment,
    getPaymentsForAppointments, createPayment,
    UpdatePayment,
    fetchPrescriptions,
    getPaymentForPrescription,
    fetchPrescriptionPaid,
    AcceptPrescription, getAllPharmacyIds,
    fetchPrescriptionAccepted,
    fetchPatient,
    fetchDoctor,
    fetchPharmacy, UpdatePharmInfo} from './PrimeWell_db.js'
import { sendPrescription, consumePrescriptions, preCreatePharmacyQueue } from './rabbitmq.js';  // import the RabbitMQ helper
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swaggerSpec.js'
import http from 'http'
import { Server } from 'socket.io'
dotenv.config()

//import socket from 'socket.io'
/*
const server = http.createServer(app);
const io = new socket(server);
*/

const app = express()
app.use(express.json())
app.use(cors())

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

// app.use(
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'"],
//         imgSrc: ["'self'", "data:"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
//         connectSrc: ["'self'", "*"], 
//       },
//     })
// );
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Remove any existing Content-Security-Policy header
  
//
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "https://cs490-gp-frontend-production.up.railway.app",
        methods: ["GET", "POST"]
    }
})
// HELLO!
// Hello!
io.on("connection", (socket) => {
    console.log("User connected:", socket.id) // Prints Session ID for Client

    // Joining a Appointment
    socket.on("join_appointment", (appt_id) => {
        socket.join(appt_id)
        console.log(`User ${socket.id} joined appointment: ${appt_id}`)
    })

    // Sending Messages 
    socket.on("send_msg", async (data) => {
        console.log("Message Sent: ", data)
        // Save the message to the database
        const saveChat = await createChatMsg(data.appt_id, data.senderID, data.senderName, data.senderType, data.message)
        console.log(saveChat)
        io.to(data.appt_id).emit("receive_msg", data)
    })

    const activePharmacyConsumers = new Set();

    socket.on("join_connection", (pharm_id) => {
        socket.join(pharm_id)
        console.log(`Pharmacy ${socket.id} joined pharmacy id: ${pharm_id}`)

        if (!activePharmacyConsumers.has(pharm_id)) {
            activePharmacyConsumers.add(pharm_id);
    
            consumePrescriptions(pharm_id, (prescription) => {
                // Emit to everyone in the room
                io.to(pharm_id).emit("new_prescription", prescription);
            });
        }
    })

    socket.on("leave_connection", (pharm_id) => {
        socket.leave(pharm_id);
        console.log(`Pharmacy ${socket.id} left pharmacy room: ${pharm_id}`);
        activePharmacyConsumers.delete(pharm_id); // Optional if you're tracking
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    })
})

async function setupQueuesAtStartup() {
    try {
        const pharmacyIds = await getAllPharmacyIds(); // e.g., [101, 102, 103]
        for (const id of pharmacyIds) {
            await preCreatePharmacyQueue(String(id));
        }
        console.log("All pharmacy queues pre-created at startup.");
    } catch (err) {
        console.error("Error setting up queues:", err);
    }
}

const PORT = process.env.PORT || 3000;
setupQueuesAtStartup().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((err) => {
    console.error("Failed to set up queues. Server not started:", err);
});

const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key']; // Or req.query.apiKey if you prefer query parameters
  
    if (!apiKey) {
      return res.status(401).json({ message: 'API key required' });
    }
  
    // In real applications, validate the API key against a database or environment variable
    if (apiKey !== process.env.API_KEY) {
      return res.status(403).json({ message: 'Invalid API key' });
    }
  
    next(); // Proceed to the next middleware or route handler
};


//GET DATA ----------------------------------------------------------------------------------------------

/*ADDED: Gets for appointments, doctor schedule, perscription, preliminaries, survey, regiments, chat rooms<-messages, 
and their (1st draft of) audit log entries*/

/**
 * @swagger
 * /patient/{id}:
 *   get:
 *     summary: Retrieve patient data by ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient data retrieved successfully
 *       400:
 *         description: Invalid patient ID
 *       500:
 *         description: Internal server error
 */  
app.get("/patient/:id", async (req, res) => {
    const rows = await getPatients(req.params.id)
    console.log("Patient Fetched: ", rows)
    const event_Details = 'retrieval of patient data'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details) 
    res.send(rows)
})

/**
 * @swagger
 * /patientInfo/{id}:
 *   get:
 *     summary: Retrieve detailed patient profile
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient profile retrieved successfully
 *       400:
 *         description: Invalid patient ID
 *       500:
 *         description: Internal server error
 */  
app.get("/patientInfo/:id", async (req, res) => {
    const rows = await getPatientInfo(req.params.id)
    const event_Details = 'retrieval of patient profile'
    const audit = await genereateAudit(req.params.id, 'Patient', 'Get', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /doctorInfo/{id}:
 *   get:
 *     summary: Retrieve detailed doctor profile
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the doctor
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor profile retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       500:
 *         description: Internal server error
 */  
app.get("/doctorInfo/:id", async (req, res) => {
    const rows = await getDoctorInfo(req.params.id)
    const event_Details = 'retrieval of patient profile'
    const audit = await genereateAudit(req.params.id, 'Doctor', 'Get', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /pharmInfo/{id}:
 *   get:
 *     summary: Retrieve detailed pharmacy profile
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the pharmacy
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pharmacy profile retrieved successfully
 *       400:
 *         description: Invalid pharmacy ID
 *       500:
 *         description: Internal server error
 */  
app.get("/pharmInfo/:id", async (req, res) => {
    const rows = await getPharmInfo(req.params.id)
    const event_Details = 'retrieval of patient profile'
    const audit = await genereateAudit(req.params.id, 'Pharmacist', 'Get', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /patientDoc/{id}:
 *   post:
 *     summary: Retrieve a patient's doctor
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient's doctor retrieved successfully
 *       400:
 *         description: Invalid patient ID
 *       500:
 *         description: Internal server error
 */  
// MAKE THIS A POST REQUEST BECAUSE IT IS SENSITIVE - FI
app.get("/patientDoc/:id", async (req, res) => {
    const rows = await getPatientDoc(req.params.id)
    const event_Details = 'retrieval of patient\'s doctor'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details) 
    res.send(rows)
})

/**
 * @swagger
 * /doctor/listAll:
 *   get:
 *     summary: Retrieve a list of all doctors
 *     tags: [Doctor]
 *     responses:
 *       200:
 *         description: List of all doctors retrieved successfully
 *       500:
 *         description: Internal server error
 */  
app.get("/doctor/listAll", async (req, res) => {
    const rows = await getAllDoctors()
    res.send(rows)
})

/**
 * @swagger
 * /doctor/{id}:
 *   get:
 *     summary: Retrieve doctor data by ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the doctor
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor data retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       500:
 *         description: Internal server error
 */  
app.get("/doctor/:id", async (req, res) => {
    const rows = await getDoctors(req.params.id)
    console.log("Doctor Fetched: ", rows)
    const event_Details = 'retrieval of doctor data'
    const audit = await genereateAudit(req.params.id, 'Doctor', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /doctorPatients:
 *   post:
 *     summary: Retrieve a doctor's patients
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Doctor's patients retrieved successfully
 *       400:
 *         description: Invalid Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.post("/doctorPatients", async (req, res) => {
    const {Doctor_ID} = req.body;
    if (!Doctor_ID) {
        return res.status(400).json({ error: "Doctor_ID required" });
    }
    try {
        const rows = await getDocPatients(Doctor_ID)
        const event_Details = 'retrieval of doctor\'s patients'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'GET', event_Details)
        res.send(rows)
    } 
    catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" })
    }
})

/**
 * @swagger
 * /pharmacies:
 *   get:
 *     summary: Retrieve a list of all pharmacies
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: List of pharmacies retrieved successfully
 *       500:
 *         description: Internal server error
 */  
app.get("/pharmacies", async (req, res) => {
    const rows = await getPharmacies()
    const event_Details = 'retrieval of pharmacy data'
    const audit = await genereateAudit(0, 'Pharmacist', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /pillbank:
 *   get:
 *     summary: Retrieve a list of pills from the pill bank
 *     tags: [Pharmacy]
 *     responses:
 *       200:
 *         description: List of pills retrieved successfully
 *       500:
 *         description: Internal server error
 */  
app.get("/pillbank", async (req, res) => {
    const rows = await getPills()
    const event_Details = 'retrieval of pill data'
    const audit = await genereateAudit(0, 'Pharmacist', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /tiers/{id}:
 *   get:
 *     summary: Retrieve tiers for a doctor
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the doctor
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tiers data retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       500:
 *         description: Internal server error
 */  
app.get("/tiers/:id", async (req, res) => { //tiers by doctor - VC
    const rows = await getTiers(req.params.id)
    res.send(rows)
})

/**
 * @swagger
 * /exercisebank:
 *   get:
 *     summary: Retrieve a list of all exercises
 *     tags: [Exercise]
 *     responses:
 *       200:
 *         description: List of exercises retrieved successfully
 *       500:
 *         description: Internal server error
 */  
app.get("/exercisebank", async (req, res) => {
    const rows = await getExercises()
    res.send(rows)
})

/**
 * @swagger
 * /exerciseByClass:
 *   post:
 *     summary: Retrieve exercises by class
 *     tags: [Exercise]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Exercise_Class:
 *                 type: string
 *     responses:
 *       200:
 *         description: Exercises by class retrieved successfully
 *       400:
 *         description: Invalid Exercise_Class
 *       500:
 *         description: Internal server error
 */  
app.post("/exerciseByClass", async (req, res) => {
    try {
        const { Exercise_Class } = req.body
        const rows = await getExerciseByClass(Exercise_Class)
        res.send(rows)
    }
    catch (error) {
        es.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /regiment/{id}:
 *   get:
 *     summary: Retrieve regiment data for a patient
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the patient
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Regiment data retrieved successfully
 *       400:
 *         description: Invalid patient ID
 *       500:
 *         description: Internal server error
 */  
app.get("/regiment/:id", async (req, res) => { //based on patient -VC
    const rows = await getRegiment(req.params.id)
    const event_Details = 'retrieval of patient regiment'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /forumPosts:
 *   get:
 *     summary: Get all forum posts
 *     tags: [Forum]
 *     responses:
 *       200:
 *         description: List of all forum posts
 */
app.get("/forumPosts", async (req, res) => {
    try {
        const rows = await getForumPosts()
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch top reviews" });
    }
})


/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get comments for a specific forum post
 *     tags: [Forum]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Forum post ID
 *     responses:
 *       200:
 *         description: List of comments for the post
 */
app.get("/comments/:id", async (req, res) => { //by post - VC
    const rows = await getComments_id(req.params.id)
    res.send(rows)
})

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: List of all reviews
 */
app.get("/reviews", async (req, res) => {
    const rows = await getReviews()
    res.send(rows)
})

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get reviews by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review data
 */
app.get("/reviews/:id", async (req, res) => {
    const rows = await getReviewsByID(req.params.id)
    res.send(rows)
})
    
/**
 * @swagger
 * /appointment/patient/{id}:
 *   get:
 *     summary: Get all appointments for a patient
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of appointments for the patient
 */
app.get("/appointment/patient/:id", async (req, res) => {
    try {
        const rows = await getAppointmentsPatient(req.params.id)
        const event_Details = 'retrieval of appointment data'
        const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details)
        res.send(rows)
    } catch (err) {
        console.log("Failed Fetching Appointments for Patient: ", err)
    }
})

/**
 * @swagger
 * /appointment/doctor/{id}:
 *   get:
 *     summary: Get all appointments for a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of appointments for the Doctor
 * 
 */
app.get("/appointment/doctor/:id", async (req, res) => {
    const rows = await getAppointmentsDoctor(req.params.id)
    const event_Details = 'retrieval of appointment data'
    const audit = await genereateAudit(req.params.id, 'Doctor', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /request/{id}:
 *   get:
 *     summary: Retrieve appointment requests for a doctor
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Appointment requests for the doctor
 */
app.get("/request/:id", async (req, res) => { // Used for retrieving a given doctor's appointments, using their Doctor_ID
    const rows = await getApptRequest(req.params.id)
    const event_Details = 'retrieval of appointment requests'
    const audit = await genereateAudit(req.params.id, 'Doctor', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /prescription/{id}:
 *   get:
 *     summary: Get all prescriptions for a patient
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: List of prescriptions for the patient
 */
app.get("/prescription/:id", async (req, res) => { //based on patient -VC
    const rows = await getPrescription(req.params.id)
    const event_Details = 'retrieval of perscription'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /prescriptionDoc/{id}:
 *   get:
 *     summary: Get all prescriptions written by a doctor
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: List of prescriptions from the doctor
 */
app.get("/prescriptionDoc/:id", async (req, res) => { //based on doctor -VC
    const rows = await getPrescriptionDoc(req.params.id)
    const event_Details = 'retrieval of perscription'
    const audit = await genereateAudit(req.params.id, 'Doctor', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /preliminaries/{id}:
 *   get:
 *     summary: Retrieve preliminary patient data (Sensitive - consider POST)
 *     tags: [Preliminaries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Preliminary data for the patient
 */
app.get("/preliminaries/:id", async (req, res) => {
    try {
        const rows = await getPreliminaries(req.params.id)
        console.log(rows)
        res.send(rows)
    }
    catch (err) {
        console.log("Failed Fetching Preliminaries: ", err)
    }
})

/**
 * @swagger
 * /chatroomMsgs/{id}:
 *   get:
 *     summary: Get chatroom messages by Chatroom ID (Sensitive - consider POST)
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Chatroom ID
 *     responses:
 *       200:
 *         description: List of messages in the chatroom
 */
app.get("/chatroomMsgs/:id", async (req, res) => { //by chatroom_id - VC
    const rows = await getChatMesseges(req.params.id)
    res.send(rows)
})

/**
 * @swagger
 * /reviewsTop:
 *   get:
 *     summary: Get top-rated reviews (API Key required)
 *     tags: [Reviews]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Top reviews
 */
app.get("/reviewsTop", async (req, res) => {
    try {
        const rows = await getReviewsTop();
        res.send(rows);
    } catch (err) {
        console.error("Error in /reviewsTop:", err);
        res.status(500).json({ error: "Failed to fetch top reviews" });
    }
});

/**
 * @swagger
 * /reviews/comments/{id}:
 *   get:
 *     summary: Get comments for a specific review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Review ID
 *     responses:
 *       200:
 *         description: List of comments for the review
 */
app.get("/reviews/comments/:id", async (req, res) => {
    const rows = await getReviewsComments(req.params.id)
    res.send(rows)
})

/**
 * @swagger
 * /patientsurvey/{id}:
 *   get:
 *     summary: Retrieve patient survey data (Sensitive - consider POST)
 *     tags: [Surveys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Survey data for graphing
 */
app.get("/patientsurvey/:id", async (req, res) => {
    const rows = await getSurvey(req.params.id)
    const event_Details = 'retrieval of Patient data for graph'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details)
    res.send(rows)
})

/**
 * @swagger
 * /patientsurveyAuth/{id}:
 *   get:
 *     summary: Check if patient is allowed to post a survey
 *     tags: [Surveys]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Date string if allowed, "false" otherwise
 */
app.get("/patientsurveyAuth/:id", async (req, res) => {  //returns true (if posting is ok) or false
    const rows = await getAuthSurvey(req.params.id)
    const event_Details = 'check to see if patient can post survey'
    const audit = await genereateAudit(req.params.id, 'Patient', 'GET', event_Details)
    const tday = new Date();
    if (tday.toISOString().substring(0, 10) != rows[0]?.Survey_Date.toISOString().substring(0, 10)) res.send(tday)
        else res.send('false')
    //res.send(rows)
})

/**
 * @swagger
 * /appointmentInfo/{id}:
 *   get:
 *     summary: Get detailed information for a specific appointment
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Detailed information about the appointment
 */
app.get("/appointmentInfo/:id", async (req, res) => {  
    try {
    const rows = await getAppointmentInfo(req.params.id)
    res.send(rows)
    }
    catch (err) {
        console.log("Failed Fetching Appointment Info: ", err)
    }
})

/**
 * @swagger
 * /pharmacyPills/{id}:
 *   get:
 *     summary: Get pill inventory or data from pharmacy by ID
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pharmacy or request ID
 *     responses:
 *       200:
 *         description: List of pills from the pharmacy
 */
app.get("/pharmacyPills/:id", async (req, res) => {  
    try {
    const rows = await getPillsFromPharm(req.params.id)
    res.send(rows)
    }
    catch (err) {
        console.log("Failed Fetching Pharmacy Pills: ", err)
    }
})

/**
 * @swagger
 * /paymentAppointments/{id}:
 *   get:
 *     summary: Get payment records for a specific appointment
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment payment information
 */
app.get("/paymentAppointments/:id", async (req, res) => {
    try {
        const rows = await getPaymentsForAppointments(req.params.id)
        res.send(rows)
    } catch (err) {
        console.log('Failed Fetching Apointment payments: ', err)
    }
})

/**
 * @swagger
 * /paymentPrescriptions/{id}:
 *   get:
 *     summary: Get payment records for a specific prescription
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription payment information
 */
app.get("/paymentPrescriptions/:id", async (req, res) => {
    try {
        const rows = await getPaymentForPrescription(req.params.id)
        res.send(rows)
    } catch (err) {
        console.log('Failed Fetching Prescription Payments: ', err)
    }
})

/**
 * @swagger
 * /fetchPrescriptions/{id}:
 *   get:
 *     summary: Fetch all prescriptions related to an entity (e.g., patient or doctor)
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entity ID (Patient or Doctor)
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
app.get("/fetchPrescriptions/:id", async (req, res) => {
    try {
        const rows = await fetchPrescriptions(req.params.id)
        res.send(rows)
    } catch (err) {
        console.log("Failed Fetching prescriptions: ", err)
    }
})

/**
 * @swagger
 * /fetchPrescriptionPaid/{id}:
 *   get:
 *     summary: Fetch all prescriptions that have been paid
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entity ID (Patient or Doctor)
 *     responses:
 *       200:
 *         description: List of paid prescriptions
 */
app.get("/fetchPrescriptionPaid/:id", async (req, res) => {
    try {
        const rows = await fetchPrescriptionPaid(req.params.id)
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchPrescriptionAccepted/{id}:
 *   get:
 *     summary: Fetch all prescriptions that have been accepted
 *     tags: [Prescriptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Entity ID (Patient or Doctor)
 *     responses:
 *       200:
 *         description: List of accepted prescriptions
 */
app.get("/fetchPrescriptionAccepted/:id", async (req, res) => {
    try {
        const rows = await fetchPrescriptionAccepted(req.params.id)
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /passAuthPatient:
 *   post:
 *     summary: Authenticate a patient by email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pw
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               pw:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful authentication
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
app.post("/passAuthPatient", async (req, res) => {
    const { email, pw } = req.body;
    if (!email || !pw) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const rows = await getPatientAuth(email, pw);
       if (rows === undefined) { // If the credentials are not authenticated
        const log_status = await LogAttempt(email, false)
        return res.status(401).json({ error: "Invalid credentials" });
       }
       else {
        const log_status = await LogAttempt(email, true)
        res.send(rows);
       }
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

/**
 * @swagger
 * /fetchPatient/{id}:
 *   get:
 *     summary: Fetch patient information by ID
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient data
 *       500:
 *         description: Internal server error
 */
app.get("/fetchPatient/:id", async (req, res) => {
    try {
        const rows = await fetchPatient(req.params.id)
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /passAuthDoctor:
 *   post:
 *     summary: Authenticate a doctor by email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pw
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               pw:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful authentication
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
app.post("/passAuthDoctor", async (req, res) => {
    const { email, pw } = req.body;
    if (!email || !pw) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const rows = await getDoctorAuth(email, pw);
        if (rows === undefined) { // If the credentials are not authenticated
            const log_status = await LogAttempt(email, false)
            return res.status(401).json({ error: "Invalid credentials" });
        }
        else {
            const log_status = await LogAttempt(email, true)
            res.send(rows);
        }
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchDoctor/{id}:
 *   get:
 *     summary: Fetch doctor information by ID
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     responses:
 *       200:
 *         description: Doctor data
 *       500:
 *         description: Internal server error
 */
app.get("/fetchDoctor/:id", async (req, res) => {
    try {
        const rows = await fetchDoctor(req.params.id)
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /passAuthPharm:
 *   post:
 *     summary: Authenticate a pharmacy by email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - pw
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               pw:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful authentication
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
app.post("/passAuthPharm", async (req, res) => {
    const { email, pw } = req.body;
    console.log(req.body)
    if (!email || !pw) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const rows = await getPharmAuth(email, pw);
        if (rows === undefined) { // If the credentials are not authenticated
            const log_status = await LogAttempt(email, false)
            return res.status(401).json({ error: "Invalid credentials" });
        }
        else {
            const log_status = await LogAttempt(email, true)
            res.send(rows);
        }
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchPharmacy/{id}:
 *   get:
 *     summary: Fetch pharmacy information by ID
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pharmacy ID
 *     responses:
 *       200:
 *         description: Pharmacy data
 *       500:
 *         description: Internal server error
 */
app.get("/fetchPharmacy/:id", async (req, res) => {
    try {
        const rows = await fetchPharmacy(req.params.id)
        res.send(rows)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchApptMessages:
 *   post:
 *     summary: Fetch messages associated with a specific appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Appointment_ID
 *             properties:
 *               Appointment_ID:
 *                 type: integer
 *                 description: ID of the appointment
 *     responses:
 *       200:
 *         description: List of appointment messages
 *       400:
 *         description: Missing Appointment ID
 *       500:
 *         description: Internal server error
 */
app.post("/fetchApptMessages", async (req, res) => {
    const { Appointment_ID } = req.body;
    if (!Appointment_ID) {
        return res.status(400).json({ error: "Missing Appointment ID" });
    }

    try {
        const rows = await fetchAppointmentMessages(Appointment_ID)
        res.send(rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

//ADD DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type POST
// - VC

// Ensure that the ZIP code passed in the Zip field of the request body is an INTEGER between 10000 and 99999 TO SATISFY THE DB CONSTRAINT - FI
// Modify the DB such that the check ensures that Zip codes must be between 88011 and 88019 to match the geographical constraints of the system? ^ - FI
// Ensure that the Pharm_ID passed in the Pharm_ID field of the request body is an EXISTING Pharm_ID in the Pharmacies table } via frontend? - FI
// Ensure that Email holds the form of an email address, Phone holds the form of a phone number, and Address holds the form of a Street address } via frontend? - FI 


/**
 * @swagger
 * /patient:
 *   post:
 *     summary: Create new patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Patient
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/patient", async (req, res) => {
    const { Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID } = req.body
    const docId = Doctor_ID !== undefined ? Doctor_ID : null; // Inserts null if Doctor_ID is not provided

    if (!Pharm_ID || !First_Name || !Last_Name || !Email || !Phone || !PW || !Address || !Zip) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
    const newPatient = await createPatient(Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, docId)
    const event_Details = 'Created new Patient'
    const audit = await genereateAudit(newPatient['patient_id'], 'Patient', 'POST', event_Details)
    console.log(newPatient)
    const newRegiment = await createRegiment(newPatient['patient_id'], JSON.stringify({
        "Sunday":[],
        "Monday":[],
        "Tuesday": [],
        "Wednesday": [],
        "Thursday": [],
        "Friday": [],
        "Saturday":[]
        }))
    console.log(newRegiment)
    const event_Details2 = 'Created new Regiment'
    const audit2 = await genereateAudit(newPatient['patient_id'], 'Patient', 'POST', event_Details2)
    res.status(201).send(newPatient)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /doctor:
 *   post:
 *     summary: Create new Doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Doctor
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that Email holds the form of an email address, Phone holds the form of a phone number } via frontend? - FI 
app.post("/doctor", async (req, res) => {
    const { License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability } = req.body

    if (!License_Serial || !First_Name || !Last_Name || !Specialty || !Email || !Phone || !PW || Availability === undefined) { // JS checks for falsy values, since Availability can be 0, we check for undefined rather than falsy
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newDoctor = await createDoctor(License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability)
        console.log("Doctor Info: ", newDoctor)
        const event_Details = 'Created new Doctor'
        const audit = await genereateAudit(newDoctor['doctor_id'], 'Doctor', 'POST', event_Details)
        const tiers = await createDoctorTiers(newDoctor['doctor_id'])
        console.log(tiers)
        res.status(201).send(newDoctor)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /doctorSchedule:
 *   post:
 *     summary: Create new Doctor Schedule
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Doctor Schedule
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/doctorSchedule", async (req, res) => {
    const {Doctor_ID, Doctor_Schedule} = req.body
    console.log(Doctor_Schedule)
    if (!Doctor_ID || !Doctor_Schedule) {
        return res.status(400).json({ error: "Missing required information" });
    }
    try {
        const newDoctor = await createDoctorSchedule(Doctor_ID, Doctor_Schedule)
        const event_Details = 'Created new Doctor Schedule'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'POST', event_Details)
        res.status(201).send(newDoctor)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /doctor:
 *   post:
 *     summary: Get Doctor Schedule
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: retrieval of doctor schedule data
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/getDoctorSchedule", async (req, res) => {
    const {doc_id, day, date} = req.body

    if (!doc_id || !day || !date) {
        return res.status(400).json({ error: "Missing required information" });
    }
    try {
        //console.log(req.body)
        const rows = await getDoctorSchedule(doc_id, day, date)
        const event_Details = 'retrieval of doctor schedule data'
        const audit = await genereateAudit(doc_id, 'Doctor', 'POST', event_Details)
        res.status(200).send(rows)
    } catch (err) {
        res.status(500).json({message: "Failed to Fetch Doctor Schedule by Day"})
    }
})

/**
 * @swagger
 * /pharmacies:
 *   post:
 *     summary: Create new Pharmacy
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Pharmacy
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that the ZIP code passed in the Zip field of the request body is an INTEGER between 10000 and 99999 TO SATISFY THE DB CONSTRAINT - FI
// Modify the DB such that the check ensures that Zip codes must be between 88011 and 88019 to match the geographical constraints of the system? ^ - FI
// Ensure that Email holds the form of an email address, Phone holds the form of a phone number, and Address holds the form of a Street address } via frontend? - FI 
app.post("/pharmacies", async (req, res) => {
    const { Company_Name, Address, Zip, Work_Hours, Email, PW } = req.body
    if (!Company_Name || !Address || !Zip || !Work_Hours || !Email || !PW) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newPharm = await createPharmacy(Company_Name, Address, Zip, Work_Hours, Email, PW)
        const event_Details = 'Created new Pharmacy'
        const audit = await genereateAudit(newPharm["pharm_id"], 'Pharmacist', 'POST', event_Details)
        res.status(201).send(newPharm)
    } catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /getPharmByZip:
 *   get:
 *     summary: Get pharmacy by Zip
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         schema:
 *           type: string
 *         description: Zip
 *     responses:
 *       200:
 *         description: Get pharmacies based on zip code
 */
app.post("/getPharmByZip", async (req, res) => {
    const {Zip} = req.body
    if (!Zip) {
        return res.status(400).json({message: "Missing Zip!"})
    }

    try {
        const nearestPharms = await getNearestPharms(Zip)
        res.status(200).send(nearestPharms)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /pillbank:
 *   post:
 *     summary: Create new Pill for pharmacy
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Pill
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that Pharm_ID passed into Pharm_ID field is an existing Pharmacy ID in the Pharmacies table } via frontend? - FI
app.post("/pillbank", async (req, res) => {
    const { Cost, Pill_Name, Pharm_ID, Dosage, Quantity } = req.body
    if (!Cost || !Pill_Name || !Pharm_ID || !Dosage || !Quantity) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newPill = await createPill(Cost, Pill_Name, Pharm_ID, Dosage, Quantity)
        const event_Details = 'Created new Pill'
        const audit = await genereateAudit(0, 'Pharmacist', 'POST', event_Details)
        res.status(201).send(newPill)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchApptStartStatus:
 *   get:
 *     summary: Get start status for appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Get start status for appointment
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/fetchApptStartStatus", async (req, res) => {
    const {Appointment_ID} = req.body
    if (!Appointment_ID) {
        return res.status(400).json({ error: "Missing Appt ID information" });
    }

    try {
        const fetchStartStatus = await fetchApptStartStatus(Appointment_ID)
        res.status(201).send(fetchStartStatus)
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /fetchApptEndStatus:
 *   get:
 *     summary: Get end status for appointment
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Get end status for appointment
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/fetchApptEndStatus", async (req, res) => {
    const {Appointment_ID} = req.body
    if (!Appointment_ID) {
        return res.status(400).json({ error: "Missing Appt ID information" });
    }

    try {
        const fetchEndStatus = await fetchApptEndStatus(Appointment_ID)
        res.status(201).send(fetchEndStatus)
    }
    catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /forumPosts:
 *   post:
 *     summary: Create forum post
 *     tags: [ForumPosts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new post
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that the Patient_ID passed into the Patient_ID field is an existing Patient ID in the PatientBase table } via frontend? - FI
app.post("/forumPosts", async (req, res) => {
    const { Patient_ID, Forum_Text, Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps } = req.body
    if (!Patient_ID || !Forum_Text || !Exercise_Name || !Muscle_Group || !Exercise_Description || !Exercise_Class || !Sets || !Reps) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newExercise = await createExercise(Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps)
        const event_Details1 = 'Created new exercise'
        const audit1 = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details1)

        const newFPost = await createForumPost(Patient_ID, newExercise.insertId, Forum_Text)
        const event_Details = 'Created new post'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newFPost)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /exercisebank:
 *   post:
 *     summary: Create exercise for exercise bank
 *     tags: [ForumPosts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new exercise
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/exercisebank", async (req, res) => { //User created exercise from post - VC
    const { Patient_ID, Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps } = req.body
    if (!Patient_ID || !Exercise_Name || !Muscle_Group || !Exercise_Description || !Exercise_Class || !Sets || !Reps) {
        return res.status(400).json({ error: "Missing required information" });
    }
    try {
        const newExercise = await createExercise(Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps)
        const event_Details = 'Created new exercise'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newExercise)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create comment for forum post
 *     tags: [ForumPosts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Comment
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that the Patient_ID passed into the Patient_ID field is an existing Patient ID in the PatientBase table } via frontend? - FI
// Ensure that the Forum_ID passed into the Forum_ID field is an existing Forum ID in the ForumPosts table } via frontend? - FI
app.post("/comments", async (req, res) => {
    const { Patient_ID, Forum_ID, Comment_Text } = req.body
    if (!Patient_ID || !Forum_ID | !Comment_Text) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try{
    const newComment = createComment(Patient_ID, Forum_ID, Comment_Text)  
    const event_Details = 'Created new comment'
    const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
    res.status(201).send(newComment)
    }catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /regiment:
 *   post:
 *     summary: Create regiment for patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new regiment
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/regiment", async (req, res) => {
    const { Patient_ID, Regiment } = req.body
    if (!Patient_ID || !Regiment) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try{
    const newRegiment = await createRegiment(Patient_ID, Regiment)
    console.log(newRegiment)
    const event_Details = 'Created new Regiment'
    const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
    res.status(201).send(newRegiment)
    }catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /appointment:
 *   post:
 *     summary: Create forum post
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Appointment & accepted request
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that the Patient_ID passed into the Patient_ID field is an existing Patient ID in the PatientBase table } via frontend? - FI
// Ensure that the Doctor_ID passed into the Doctor_ID field is an existing Doctor ID in the DoctorBase table } via frontend? - FI
// Doctor Accepts the Patient's Request
app.post("/appointment", async (req, res) => {
    const {Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier} = req.body
    if (!Patient_ID || !Doctor_ID || !Appt_Date || !Appt_Time || !Tier) {
        return res.status(400).json({ error: "Missing required information" });
    }
    
    try {
        const patientsDoctor = await getPatientDoc(Patient_ID)
        // check if the patient has a doctor, if not - assign them the doctor they've requested in this appointment (Doctor_ID above)
        if (patientsDoctor === undefined) {
            const newDoctor = await addPatientDoc(Patient_ID, Doctor_ID) // give them this new doctor
            const event_Details = "Assigned Doctor to Patient"
            const auditDoc = await genereateAudit(Patient_ID, 'Patient', 'PATCH', event_Details)
        }

        const newAppt = await createAppointment(Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier)
        const accept = await UpdateRequest(Patient_ID, Doctor_ID, 'Accepted', Appt_Date, Appt_Time)
        const event_Details = 'Created new Appointment & accepted request'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newAppt)
    } catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Create request to doctor
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Request for an appointment
 *       400:
 *         description: Missing required information
 *       409:
 *         description: Patient already has a different doctor
 *       410:
 *         description: Timeslot taken
 *       500:
 *         description: Internal server error
 */
app.post("/request", async (req, res) => { // We might not need this since it's in appointments - VC
    const {Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier} = req.body
    if (!Patient_ID || !Doctor_ID) {
        return res.status(400).json({ error: "Missing required information" });
    }

    console.log(req.body)
    try {
        const patientsDoctor = await getPatientDoc(Patient_ID)
        console.log("Patient Info: ", patientsDoctor?.doctor_id, "DoctorID: ", Doctor_ID)
        //check if correct doctor
        if (patientsDoctor !== undefined && patientsDoctor?.doctor_id !== Doctor_ID) {
            return res.status(400).json({ error: "Patient already has a different doctor"});
        }

        //check to see if appointment time is taken, so sense in giving them the doctor if so
        const timeTaken =  await getTimeslot(Doctor_ID, Appt_Date, Appt_Time);
        // console.log("Time Slot Booked: ", timeTaken)
        if(timeTaken.length > 0){
            return res.status(410).json({ error: "Timeslot taken"});    
        }

        const requestTaken = await checkExistingRequests(Patient_ID, Doctor_ID, Appt_Date, Appt_Time)
        if (requestTaken.length > 0) {
            return res.status(400).json({error: "Request Taken Already"})
        }
        // Generate an audit for assigning a doctor to this patient
        const newAppt = await createApptRequest(Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier)
        const event_Details = 'Created new Request for an appointment'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newAppt)

    } catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /preliminaries:
 *   post:
 *     summary: Create preliminary for patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new Preliminary
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/preliminaries", async (req, res) => {
    const {Patient_ID, Symptoms} = req.body
    if (!Patient_ID | !Symptoms) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newAppt = await createPreliminary(Patient_ID, Symptoms)
        const event_Details = 'Created new Preliminary'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newAppt)
    } catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /sendPrescription:
 *   post:
 *     summary: Create and send presciption to pharmacy
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Prescription sent to pharmacy
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// ENDPOINT USED WITH RABBITMQ, SO DOCTOR CAN CREATE AND SEND PRESCRIPTION TO QUEUE
app.post('/sendPrescription', async (req, res) => {
    const {Patient_ID, Doctor_ID, Pill_ID, Quantity, Pharm_ID} = req.body
    console.log("Sending Prescription Info: ", req.body)
    if (!Patient_ID || !Doctor_ID || !Pill_ID || !Quantity || !Pharm_ID) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {      
        // Create new prescription
        // const newPrescription = await createPerscription(Patient_ID, Doctor_ID, Pill_ID, Quantity, Pharm_ID)
        // console.log(newPrescription)
        // const event_Details = 'Created new Prescription'
        // const audit = await genereateAudit(Doctor_ID, 'Doctor', 'POST', event_Details)

        // Then send to the appropriate pharmacy queue
        const prescription = {
            Patient_ID,
            Doctor_ID,
            Pill_ID,
            Quantity, 
            Pharm_ID
        };
        await sendPrescription(Pharm_ID.toString(), prescription);
        res.status(200).json({ message: `Prescription sent to pharmacy ${Pharm_ID}!` });
    } 
    catch (error) 
    {
        console.error('Error sending prescription:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create review of a doctor
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new review
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
// Ensure that Patient_ID and Doctor_ID are existing IDs in the PatientBase and DoctorBase tables, respectively } via frontend? - FI
app.post("/reviews", async (req, res) => {
    const {Patient_ID, Doctor_ID, Review_Text, Rating} = req.body
    if(!Patient_ID | !Doctor_ID | !Review_Text | !Rating){
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
    const newReview = await createReveiw(Patient_ID, Doctor_ID, Review_Text, Rating)
    if (!newReview) {
        return res.status(403).json({message: "Patient isn't assigned that doctor!"})
    }
    const event_Details = 'Created new review'
    const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
    res.status(201).send(newReview)
    }catch (error) { 
        console.log(newReview) 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /patientsurvey:
 *   post:
 *     summary: Create review of a doctor
 *     tags: [Surveys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new survey
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/patientsurvey", apiKeyMiddleware, async (req, res) => {
    const {Patient_ID, Weight, Caloric_Intake, Water_Intake, Mood} = req.body
    if (!Patient_ID | !Weight | !Caloric_Intake | !Water_Intake| !Mood) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const newSurvey = await createSurvey(Patient_ID, Weight, Caloric_Intake, Water_Intake, Mood)
        const event_Details = 'Created new Survey results'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
        res.status(201).send(newSurvey)
    } catch (error) {  
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /patientsurvey/date:
 *   get:
 *     summary: retrieve recent date for survey
 *     tags: [Surveys]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description:
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/patientsurvey/date/", async (req, res) => {
    const {patient_id} = req.body
    if (!patient_id) {
        return res.status(400).json({ error: "Missing required information" });
    }
    const rows = await getSurveyLatestDate(patient_id)
    const today = new Date().toISOString().split('T')[0]
    if (rows[0]?.survey_date.toISOString().split('T')[0] != today) {
        return res.send('false')
    } 
    return res.send('true')
})

/**
 * @swagger
 * /payment:
 *   post:
 *     summary: Create payment info for patient
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created new payment
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */
app.post("/payment", async (req, res) => {
    const {Patient_ID, Related_ID, Payment_Type, Payment_Status} = req.body
    if (!Patient_ID || !Related_ID || !Payment_Type || !Payment_Status) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
    const newPayment = await createPayment(Patient_ID, Related_ID, Payment_Type, Payment_Status)
    const event_Details = 'Patient has made a payment'
    const audit = await genereateAudit(Patient_ID, 'Patient', 'POST', event_Details)
    res.status(201).send(newPayment)
    } catch (error) {
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

//UPDATE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe PATCH
//update based on a given id - VC

/*ADDED: regiment, appointments, perscription, audit logs*/


// FIX ALL USAGES OF req.body AND req.params BELOW - FI

// BELOW IS CORRECTED
// ONLY MAKE VISIBLE FROM PATIENT PORTAL VIA FRONTEND OR ADD AUTHENTICATION - FI
/**
 * @swagger
 * /patient/{id}:
 *   patch:
 *     summary: Update patient details
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: false
 *      
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Pharm_ID:
 *                 type: integer
 *               First_Name:
 *                 type: string
 *               Last_Name:
 *                 type: string
 *               Email:
 *                 type: string
 *                 format: email
 *               Phone:
 *                 type: string
 *               PW:
 *                 type: string
 *               Address:
 *                 type: string
 *               Zip:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Patient updated
 *       400:
 *         description: Invalid input or missing required information
 *       404:
 *         description: Patient not found
 *       500:
 *         description: Internal server error
 */
app.patch('/patient/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let entry = req.body;

        // Fields that are NOT allowed to be updated
        const restrictedFields = ['PW', 'Patient_ID, Doctor_ID', 'Last_Update', 'Create_Date'];

        // Remove restricted fields from the entry object
        entry = Object.fromEntries(
            Object.entries(entry).filter(([key]) => !restrictedFields.includes(key))
        );

        if (Object.keys(entry).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const updateResult = await UpdatePatientInfo(id, entry);
        const event_Details = 'Edited Patient info';
        const audit = await genereateAudit(id, 'Patient', 'PATCH', event_Details);
        
        console.log(audit);
        res.status(200).json(updateResult);
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

/**
 * @swagger
 * /patient/{id}/addDoc:
 *   patch:
 *     summary: Add a doctor to a patient's profile
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Doctor added to patient info
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */  
// ONLY MAKE VISIBLE FROM Patient Portal VIA FRONTEND OR ADD AUTHENTICATION - FI
app.patch('/patient/:id/addDoc', async(req, res)=>{ //Give patient a doctor -VC
    try {
        const {Doctor_ID} = req.body
        const Patient_ID = req.params.id
        const updateResult = await addPatientDoc(Patient_ID, Doctor_ID)
        const event_Details = 'Added Doctor to Patient info'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'PATCH', event_Details)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).json({ error: error.message || "Internal server error" }) }
})

/**
 * @swagger
 * /patientDropDoctor/removeDoc:
 *   patch:
 *     summary: Remove a doctor from a patient's profile
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Patient_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Doctor removed from patient info
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */  
// ONLY MAKE VISIBLE FROM PATIENT PORTAL VIA FRONTEND OR ADD AUTHENTICATION - FI
app.patch('/patientDropDoctor/removeDoc', async(req, res)=>{ //Remove patient doctor -VC
    try {
        const {Patient_ID, Doctor_ID} = req.body
        const updateResult = await rmPatientDoc(Patient_ID)
        const event_Details = 'removed Doctor to Patient info'
        const audit = await genereateAudit(Patient_ID, 'Patient', 'PATCH', event_Details)

        const removeAppts = await rmPatientAppt(Patient_ID, Doctor_ID)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).json({ error: error.message || "Internal server error" }) }
})

/**
 * @swagger
 * /pharmacies/{id}:
 *   patch:
 *     summary: Update pharmacy details
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pharmacy ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Company_Name:
 *                 type: string
 *               Address:
 *                 type: string
 *               Zip:
 *                 type: integer
 *               Work_Hours:
 *                 type: string
 *               Email:
 *                 type: string
 *                 format: email
 *               PW:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pharmacy updated
 *       400:
 *         description: Invalid input or missing required information
 *       404:
 *         description: Pharmacy not found
 *       500:
 *         description: Internal server error
 */
app.patch('/pharmacy/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let entry = req.body;

        // Fields that are NOT allowed to be updated
        const restrictedFields = ['PW', 'Email', 'Work_Hours', 'Last_Update', 'Create_Date'];

        // // Remove restricted fields from the entry object
        entry = Object.fromEntries(
            Object.entries(entry).filter(([key]) => !restrictedFields.includes(key))
        );

        if (Object.keys(entry).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const updateResult = await UpdatePharmInfo(id, entry);
        const event_Details = 'Edited Pharmacy info';
        const audit = await genereateAudit(id, 'Pharmacist', 'PATCH', event_Details);
        
        console.log(audit);
        res.status(200).json(updateResult);
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /doctor/{id}:
 *   patch:
 *     summary: Update doctor details
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               License_Serial:
 *                 type: string
 *               First_Name:
 *                 type: string
 *               Last_Name:
 *                 type: string
 *               Specialty:
 *                 type: string
 *               Email:
 *                 type: string
 *                 format: email
 *               Phone:
 *                 type: string
 *               PW:
 *                 type: string
 *               Availability:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Doctor updated
 *       400:
 *         description: Invalid input or missing required information
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
// ONLY MAKE VISIBLE FROM DOCTOR PORTAL VIA FRONTEND OR ADD AUTHENTICATION- FI
app.patch('/doctor/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let entry = req.body;
        console.log("New Body for Doctor: ", req.body)
        // Fields that are NOT allowed to be updated
        const restrictedFields = ['PW', 'Doctor_ID', 'License_Serial', 'Specialty', 'Last_Update', 'Create_Date'];

        // // Remove restricted fields from the entry object
        entry = Object.fromEntries(
            Object.entries(entry).filter(([key]) => !restrictedFields.includes(key))
        );

        if (Object.keys(entry).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }
        console.log("Doctor ID: ", id, " new info: ", entry)
        const updateResult = await UpdateDoctorInfo(id, entry);
        const event_Details = 'Edited Doctor info';
        const audit = await genereateAudit(id, 'Doctor', 'PATCH', event_Details);
        
        console.log(audit);
        res.status(200).json(updateResult);
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
});

/**
 * @swagger
 * /doctorSchedule/{id}:
 *   patch:
 *     summary: Update a doctor's schedule
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_Schedule:
 *                 type: string
 *     responses:
 *       201:
 *         description: Doctor schedule updated
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */  
// MAKE ONLY AVAILABLE TO A DOCTOR FROM THEIR OWN PORTAL VIA FRONTEND OR ADD AUTHENTICATION - FI
app.patch('/doctorSchedule/:id', async(req, res)=>{
    try {
        const { Doctor_Schedule } = req.body
        const Doctor_ID = req.params.id
        const updateResult = await UpdateDoctorSchedule(Doctor_ID, Doctor_Schedule)
        const event_Details = 'Edited Doctor Schedule info'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).json({ error: error.message || "Internal server error" }) }
})

// MAKE ONLY AVAILABLE TO A DOCTOR FROM THEIR OWN PORTAL VIA FRONTEND OR ADD AUTHENTICATION - FI
/**
 * @swagger
 * /prescription/{doctor_id}:
 *   patch:
 *     summary: Update prescription information by doctor
 *     tags: [Doctor]
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Perscription_ID:
 *                 type: integer
 *               Patient_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *               Other_Field:
 *                 type: string
 *     responses:
 *       201:
 *         description: Prescription updated
 *       400:
 *         description: Invalid input or missing required information
 *       500:
 *         description: Internal server error
 */  
app.patch('/prescription/:doctor_id', async(req, res)=>{ //Doctor's can change this - VC
    try {
        const id = req.body.Perscription_ID
        const entry = req.body

        // Fields that are NOT allowed to be updated
        const restrictedFields = ['Perscription_ID', 'Patient_ID', 'Doctor_ID'];

        // Remove restricted fields from the entry object
        entry = Object.fromEntries(
            Object.entries(entry).filter(([key]) => !restrictedFields.includes(key))
        );

        if (Object.keys(entry).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const updateResult = await UpdatePerscriptionInfo(id, entry)
        const event_Details = 'Edited perscription info'
        const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).json({ error: error.message || "Internal server error" }) }
})

/**
 * @swagger
 * /pillbank/{pill_id}:
 *   patch:
 *     summary: Update pill information by super admin
 *     tags: [Pharmacy]
 *     parameters:
 *       - in: path
 *         name: pill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Pill_Name:
 *                 type: string
 *               Cost:
 *                 type: number
 *               Pharmacy:
 *                 type: string
 *               Dosage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pill information updated
 *       400:
 *         description: Invalid input or missing required information
 *       500:
 *         description: Internal server error
 */  
// MAKE ONLY AVAILABLE TO SUPER ADMIN FROM THEIR OWN PORTAL VIA FRONTEND OR ADD AUTHENTICATION - FI
app.patch('/pillbank/:pill_id', async(req, res)=>{
    try {
        const Pill_ID = req.params.pill_id
        const entry = req.body
        
        // Fields that are NOT allowed to be updated
        const restrictedFields = ['Pill_ID', 'Last_Update', 'Create_Date']; // Allows Super Admin to change Pill Name, Cost, Pharmacy, Dosage
        
        // Remove restricted fields from the entry object
        entry = Object.fromEntries(
            Object.entries(entry).filter(([key]) => !restrictedFields.includes(key))
        );

        if (Object.keys(entry).length === 0) {
            return res.status(400).json({ error: "No valid fields to update." });
        }

        const updateResult = await UpdatePillInfo(Pill_ID, entry)
        const event_Details = 'Edited Pill info'
        const audit = await genereateAudit(0, 'Pharmacist', 'PATCH', event_Details)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).json({ error: error.message || "Internal server error" }) }
})

/**
 * @swagger
 * /regiments/{id}:
 *   patch:
 *     summary: Update a patient's regiment
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Regiment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Regiment updated
 *       400:
 *         description: Invalid input or missing required information
 *       500:
 *         description: Internal server error
 */  
app.patch('/regiments/:id', async (req, res) => {
    try {
      const Patient_ID = req.params.id;
      const newRegimentData = req.body.Regiment;
  
      const updateResult = await appendToRegiment(Patient_ID, newRegimentData);
      const event_Details = 'Edited Regiment';
      await genereateAudit(Patient_ID, 'Patient', 'PATCH', event_Details);
  
      res.status(200).send(updateResult);
    } catch (error) {
      console.error("PATCH error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
});

/**
 * @swagger
 * /regimentClear/{id}:
 *   patch:
 *     summary: Clear a patient's regiment
 *     tags: [Patient]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Regiment cleared
 *       500:
 *         description: Internal server error
 */  
app.patch('/regimentClear/:id', async (req, res) => {
    try {
        const Patient_ID = req.params.id

        const clearRegiment = await clearPatientRegiment(Patient_ID)

        res.status(200).send(clearRegiment)
    } catch (err) {
        console.error("PATCH error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /rejectRequest:
 *   patch:
 *     summary: Reject appointment request
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Patient_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *               Appt_Date:
 *                 type: string
 *               Appt_Time:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment request rejected
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */  
app.patch('/rejectRequest', async(req, res) => {
    const {Patient_ID, Doctor_ID, Appt_Date, Appt_Time} = req.body
    if (!Patient_ID || !Doctor_ID || !Appt_Date || !Appt_Time) {
        return res.status(400).json({ error: "Missing required information" });
    }

    try {
        const updateResult = await UpdateRequest(Patient_ID, Doctor_ID, 'Rejected', Appt_Date, Appt_Time)
        const event_Details = 'Rejected appointment request'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(updateResult)
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /startAppointment:
 *   patch:
 *     summary: Start an appointment
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Appointment_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Appointment started
 *       400:
 *         description: Missing Appointment ID and/or Doctor ID
 *       500:
 *         description: Internal server error
 */  
// MODIFY BELOW ST APPOINTMENT ACTUALLY EXISTS, AND DOCTOR IS THE ACTUAL DOCTOR FOR THE APPT
app.patch('/startAppointment', async(req, res) => {
    const {Appointment_ID, Doctor_ID} = req.body
    if (!Appointment_ID || !Doctor_ID) {
        return res.status(400).json({ error: "Missing Appointment ID and/or Doctor_ID" });
    }    
    
    try {
        const startApptResult = await startAppointment(Appointment_ID)
        const event_Details = 'Started appointment'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(startApptResult)
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /endAppointment:
 *   patch:
 *     summary: End an appointment
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Appointment_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Appointment ended
 *       400:
 *         description: Missing Appointment ID and/or Doctor ID
 *       500:
 *         description: Internal server error
 */  
// MODIFY BELOW ST APPOINTMENT ACTUALLY EXISTS, AND DOCTOR IS THE ACTUAL DOCTOR FOR THE APPT
app.patch('/endAppointment', async(req, res) => {
    const {Appointment_ID, Doctor_ID} = req.body
    if (!Appointment_ID || !Doctor_ID) {
        return res.status(400).json({ error: "Missing Appointment ID and/or Doctor_ID" });
    }    
    
    try {
        const endApptResult = await endAppointment(Appointment_ID)
        const event_Details = 'Ended appointment'
        const audit = await genereateAudit(Doctor_ID, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(endApptResult)
    } catch (error) { 
        res.status(500).json({ error: error.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /giveFeedback:
 *   patch:
 *     summary: Give feedback for a doctor's appointment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointment_id:
 *                 type: integer
 *               doctor_feedback:
 *                 type: string
 *               doctor_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Feedback given
 *       400:
 *         description: Missing required information
 *       500:
 *         description: Internal server error
 */  
app.patch('/giveFeedback', async (req, res) => {
    const {appointment_id, doctor_feedback, doctor_id} = req.body
    if (!doctor_feedback || !appointment_id) {
        return res.status(400).json({ error: "Missing Appointment ID and/or Doctor_Feedback"});
    }

    try {
        const addFeedback = await UpdateDoctorFeedback(appointment_id, doctor_feedback)
        const event_Details = 'Ended appointment'
        const audit = await genereateAudit(doctor_id, 'Doctor', 'PATCH', event_Details)
        res.status(201).send(addFeedback)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });

    }
})

/**
 * @swagger
 * /makePayment:
 *   patch:
 *     summary: Make a payment for an appointment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Payment_ID:
 *                 type: integer
 *               Card_Number:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment made
 *       400:
 *         description: Missing Payment ID or Card Number
 *       500:
 *         description: Internal server error
 */  
app.patch("/makePayment", async (req, res) => {
    const {Payment_ID, Card_Number} = req.body
    if (!Payment_ID || !Card_Number) {
        return res.status(400).json({ error: "Missing Payment ID and/or Card_Number"});
    }

    try {
        const makePayment = await UpdatePayment(Payment_ID, Card_Number)
        res.status(201).send(makePayment)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

/**
 * @swagger
 * /acceptPrescription:
 *   patch:
 *     summary: Accept a prescription
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Prescription_ID:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Prescription accepted
 *       400:
 *         description: Missing Prescription ID
 *       500:
 *         description: Internal server error
 */  
app.patch("/acceptPrescription", async (req, res) => {
    const {Prescription_ID} = req.body
    if (!Prescription_ID) {
        return res.status(400).json({ error: "Missing Prescription ID"});
    }

    try {
        const accept = await AcceptPrescription(Prescription_ID)
        res.status(201).send(accept)
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
})

//REMOVE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type DELETE
// delete based on a given id - VC

/*ADDED: appointments, Doctorschedules, perscription, regiments, posts<-comments, audit logs*/

/**
 * @swagger
 * /patient:
 *   delete:
 *     summary: Delete a patient and associated data
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Patient_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Patient deleted successfully
 *       400:
 *         description: Missing Patient_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/patient", async(req, res) => {
    const { Patient_ID } = req.body
    const deleteResult = await deletePatient(Patient_ID)
    const event_Details = 'Patient has been deleted'
    const audit = await genereateAudit(req.body.Patient_ID, 'Patient', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})// delete any ties to first patient (regiments and appointments)

/**
 * @swagger
 * /appointment/patient:
 *   delete:
 *     summary: Patient cancels an appointment
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Appointment_ID:
 *                 type: integer
 *               Patient_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Missing Appointment_ID or Patient_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/appointment/patient", async(req, res) => { //Patient cancels appointment (appt_ID) - VC
    const deleteResult = await deleteAppointment(req.body.Appointment_ID)
    const event_Details = 'An appointment has been deleted'
    const audit = await genereateAudit(req.body.Patient_ID, 'Patient', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /appointment/doctor:
 *   delete:
 *     summary: Doctor cancels an appointment
 *     tags: [Appointment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Appointment_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Appointment deleted successfully
 *       400:
 *         description: Missing Appointment_ID or Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/appointment/doctor", async(req, res) => { //Doctor cancels appointment (appt_ID) - VC
    const deleteResult = await deleteAppointment(req.body.Appointment_ID)
    const event_Details = 'An appointment has been deleted'
    const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /regiment:
 *   delete:
 *     summary: Delete a regiment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Regiment_ID:
 *                 type: integer
 *               Patient_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Regiment deleted successfully
 *       400:
 *         description: Missing Regiment_ID or Patient_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/regiment", async(req, res) => {
    const deleteResult = await deleteRegiment(req.body.Regiment_ID)
    const event_Details = 'A regiment has been deleted'
    const audit = await genereateAudit(req.body.Patient_ID, 'Patient', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /doctor:
 *   delete:
 *     summary: Delete a doctor
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Doctor deleted successfully
 *       400:
 *         description: Missing Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/doctor", async(req, res) => {
    const deleteResult = await deleteDoctor(req.body.Doctor_ID)
    const event_Details = 'Doctor has been deleted'
    const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /tiers:
 *   delete:
 *     summary: Delete doctor tiers
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Doctor tiers deleted successfully
 *       400:
 *         description: Missing Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/tiers", async(req, res) => {
    const deleteResult = await deleteDoctor(req.body.Doctor_ID)
    const event_Details = 'Doctor Tiers has been deleted'
    const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /doctorSchedule:
 *   delete:
 *     summary: Delete a doctor's schedule
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Doctor schedule deleted successfully
 *       400:
 *         description: Missing Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/doctorSchedule", async(req, res) => {
    const deleteResult = await deleteDoctor(req.body.Doctor_ID)
    const event_Details = 'Doctor Schedule has been deleted'
    const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /perscription:
 *   delete:
 *     summary: Delete a prescription
 *     tags: [Doctor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Patient_ID:
 *                 type: integer
 *               Doctor_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Prescription deleted successfully
 *       400:
 *         description: Missing Patient_ID or Doctor_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/perscription", async(req, res) => { //Doctor should manage perscriptions - VC
    const deleteResult = await deletePerscription(req.body.Patient_ID)
    const event_Details = 'Doctor has been deleted'
    const audit = await genereateAudit(req.body.Doctor_ID, 'Doctor', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /pillbank:
 *   delete:
 *     summary: Delete a pill from the pill bank
 *     tags: [Pharmacy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Pill_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Pill deleted successfully
 *       400:
 *         description: Missing Pill_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/pillbank", async(req, res) => {
    const deleteResult = await deletePill(req.body.Pill_ID)
    const event_Details = 'Pill has been deleted'
    const audit = await genereateAudit(0, 'Pharmacist', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /comments:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Comment_ID:
 *                 type: integer
 *               Patient_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       400:
 *         description: Missing Comment_ID or Patient_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/comments", async(req, res) => {
    const deleteResult = await deleteComment(req.body.Comment_ID)
    const event_Details = 'Comment has been deleted'
    const audit = await genereateAudit(req.body.Patient_ID, 'Patient', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})

/**
 * @swagger
 * /forumPost:
 *   delete:
 *     summary: Delete a forum post and its comments
 *     tags: [Forum]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Forum_ID:
 *                 type: integer
 *               Patient_ID:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Post and its comments deleted successfully
 *       400:
 *         description: Missing Forum_ID or Patient_ID
 *       500:
 *         description: Internal server error
 */  
app.delete("/forumPost", async(req, res) => { //delete all comment rows with this id (Fourm_ID) - VC
    const deleteResult = await deleteForumPost(req.body.Forum_ID)
    const event_Details = 'Post and its comments have been deleted'
    const audit = await genereateAudit(req.body.Patient_ID, 'Patient', 'DELETE', event_Details)
    res.status(204).send(deleteResult)
})
console.log("Hello brochacho")
export default app