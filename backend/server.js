import express from 'express'
import { addPatientDoc, createComment, createDoctor, createExercise, createForumPost, createPatient, createPharmacy, 
    createPill, createReveiw, deleteDoctor, deletePatient, deletePill, getComments_id, getDoctorAuth, getDoctors, 
    getExercises, getForumPosts, getPatientAuth, getPatients, getPatientsByDoc, getPharmacies, getPharmAuth, getPills, getReviews, 
    getReviewsTop, getTiers, rmPatientDoc, UpdateDoctorInfo, UpdatePatientInfo, UpdatePillInfo} from './PrimeWell_db.js'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())


app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })


app.listen(3000, () => {
    console.log('Server is running on port 3000')
})

//GET DATA ----------------------------------------------------------------------------------------------

/*appointments, perscription, preliminaries, survey, regiments, chat rooms<-messages, audit logs*/

app.get("/patient", async (req, res) => {
    const rows = await getPatients()
    res.send(rows)
})

app.get("/patient/:doc_id", async (req, res) => {
    const rows = await getPatientsByDoc(req.params.doc_id)
    res.send(rows)
})

app.get("/doctor", async (req, res) => {
    const rows = await getDoctors()
    res.send(rows)
})

app.get("/pharmacies", async (req, res) => {
    const rows = await getPharmacies()
    res.send(rows)
})

app.get("/pillbank", async (req, res) => {
    const rows = await getPills()
    res.send(rows)
})

app.get("/tiers", async (req, res) => {
    const rows = await getTiers()
    res.send(rows)
})

app.get("/exercisebank", async (req, res) => {
    const rows = await getExercises()
    res.send(rows)
})

app.get("/forumPosts", async (req, res) => {
    const rows = await getForumPosts()
    res.send(rows)
})

app.get("/comments/:id", async (req, res) => {
    const rows = await getComments_id(req.params.id)
    res.send(rows)
})

app.get("/reviews", async (req, res) => {
    const rows = await getReviews()
    res.send(rows)
})

app.get("/reviews/top", async (req, res) => {
    const rows = await getReviewsTop()
    res.send(rows)
})

app.get("/passAuthPatient/:email", async (req, res) => {
    const rows = await getPatientAuth(req.params.email)
    res.send(rows)
})

app.get("/passAuthDoctor/:email", async (req, res) => {
    const rows = await getDoctorAuth(req.params.email)
    res.send(rows)
})

app.get("/passAuthPharm/:email", async (req, res) => {
    const rows = await getPharmAuth(req.params.email)
    res.send(rows)
})

//ADD DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type POST
// Add to db via a new id, can also be done with SET @valI = (SELECT COUNT(*) FROM primewell_clinic.table);
// - VC

/*appointments, perscription, preliminaries, survey, regiments, chat rooms<-messages, authattempts, payments, audit logs*/

app.post("/patient", async (req, res) => {
    const entry = {
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        Email: req.body.Email,
        Phone: req.body.Phone,
        PW: 'SHA2(CONCAT(\''+req.body.PW+'\'), 256)',
        Address: req.body.Address,
        Zip: req.body.Zip
    };
    const newPatient = await createPatient(entry, req.body.Pharm_Name)
    res.status(201).send(newPatient)
})

app.post("/doctor", async (req, res) => {
    const entry = {
        License_Serial: req.body.License_Serial,
        First_Name: req.body.First_Name,
        Last_Name: req.body.Last_Name,
        Specialty: req.body.Specialty,
        Email: req.body.Email,
        Phone: req.body.Phone,
        PW: 'SHA2(CONCAT(\''+req.body.PW+'\'), 256)',
        Avalibility: req.body.Avalibility

    };
    const newDoctor = await createDoctor(entry, req.body.Doctor_Schedule)
    res.status(201).send(newDoctor)
})

app.post("/pharmacies", async (req, res) => {
    const entry = {
        Company_Name: req.body.Company_Name,
        Address: req.body.Address,
        Phone: req.body.Phone,
        Zip: req.body.Zip,
        Work_Hours: req.body.Work_Hours,
        Email: req.body.Email,
        PW: 'SHA2(CONCAT(\''+req.body.PW+'\'), 256)',
    };
    const newPharm = await createPharmacy(entry)
    res.status(201).send(newPharm)
})

app.post("/pillbank", async (req, res) => {
    const entry = req.body
    const newPill = await createPill(entry)
    res.status(201).send(newPill)
})

app.post("/exercisebank", async (req, res) => {
    const entry = req.body
    const filename = './ExerciseBank/'+req.file.originalname
    const newExercise = await createExercise(entry, filename)
    res.status(201).send(newExercise)
})

app.post("/forumPosts", async (req, res) => {
    const entry = req.body
    const newFPost = await createForumPost(entry)
    res.status(201).send(newFPost)
})

app.post("/comments", async (req, res) => {
    const entry = req.body
    const newComment = await createComment(entry)
    res.status(201).send(newComment)
})

app.post("/comments", async (req, res) => {
    const entry = req.body
    const newComment = await createComment(entry)
    res.status(201).send(newComment)
})

app.post("/reviews", async (req, res) => {
    const entry = req.body
    const newReview = await createReveiw(entry)
    res.status(201).send(newReview)
})

//UPDATE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe PATCH
//update based on a given id - VC

/*appointments, perscription regiments, audit logs*/

app.patch('/patient/:id', async(req, res)=>{
    try {
        const entry = req.body
        const updateResult = await UpdatePatientInfo(req.params.id, entry)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).send(error).json({"message":req.body}) }
})

app.patch('/patient/addDoc/:id/:doc_id', async(req, res)=>{ //Give patient a doctor -VC
    try {
        const updateResult = await addPatientDoc(req.params.id, req.params.doc_id)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).send(error).json({"message":req.params.id}) }
})

app.patch('/patient/removeDoc/:id', async(req, res)=>{ //Remove patient doctor -VC
    try {
        const updateResult = await rmPatientDoc(req.params.id)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).send(error).json({"message":req.params.id}) }
})

app.patch('/doctor/:id', async(req, res)=>{ /*tiers and scedule*/
    try {
        const entry = req.body
        const updateResult = await UpdateDoctorInfo(req.params.id, entry)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).send(error).json({"message":req.body}) }
})

app.patch('/pillbank/:id', async(req, res)=>{
    try {
        const entry = req.body
        const updateResult = await UpdatePillInfo(req.params.id, entry)
        res.status(201).send(updateResult)
        }
    catch(error) { res.status(500).send(error).json({"message":req.body}) }
})

//REMOVE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe DELETE
// delete based on a given id - VC

/*appointments, perscription, preliminaries, survey, regiments, posts<-comments, chat rooms<-messages, audit logs*/

app.delete("/patient/:id", async(req, res) => {
    const deleteResult = await deletePatient(req.params.id)
    res.status(204).send(deleteResult)
})

app.delete("/doctor/:id", async(req, res) => { /*tiers and scedule*/
    const deleteResult = await deleteDoctor(req.params.id)
    res.status(204).send(deleteResult)
})

app.delete("/pillbank/:id", async(req, res) => {
    const deleteResult = await deletePill(req.params.id)
    res.status(204).send(deleteResult)
})