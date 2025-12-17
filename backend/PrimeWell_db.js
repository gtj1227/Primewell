import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

//make a file called .env if you dont and write each process.env. as ENTRY="value", and place the file at the root - VC
const pool = mysql.createPool({
    host:     process.env.MYSQLHOST,
    port:     process.env.MYSQLPORT,
    user:     process.env.MYSQLUSER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
}).promise()

//GET DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type GET

//the 5 request below return data from our only populated tables so far - VC
export async function getPatients(id) {
    
    try {
    const [resultRows] = await pool.query(`SELECT First_Name, Last_Name FROM PatientBase WHERE Patient_ID = ?;`, [id])
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Patient Info: ", err)
        throw err
    }
}

// These endpoints are insecure but I need them for allowing user to view their profile
export async function getPatientInfo(id) {
    try {
    const [resultRows] = await pool.query(`select * from PatientBase where patient_id = ?`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Info: ", err)
        throw err
    }
}

// These endpoints are insecure but I need them for allowing user to view their profile
export async function getDoctorInfo(id) {
    try {
    const [resultRows] = await pool.query(`select * from DoctorBase where doctor_id = ?`, [id])
    return resultRows
    }
    catch (err) {  
        console.log("Error Fetching Doctor Info: ", err)
        throw err
    }
}

// These endpoints are insecure but I need them for allowing user to view their profile
export async function getPharmInfo(id) {
    try {
    const [resultRows] = await pool.query(`select * from Pharmacies where pharm_id = ?`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Pharmacy Info: ", err)
        throw err
    }
}

export async function getPatientDoc(id) { //changed for doc info
    try {
    const [resultRows] = await pool.query(`SELECT DoctorBase.doctor_id, DoctorBase.first_name, DoctorBase.last_name, 
        DoctorBase.specialty, DoctorBase.availability 
        FROM PatientBase INNER JOIN DoctorBase on DoctorBase.Doctor_ID = PatientBase.Doctor_ID 
        WHERE Patient_ID = ?;`, [id])
    console.log("PatientDoc: ", resultRows)
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Patient Doctor Info: ", err)
        throw err
    }
}

export async function getAllDoctors() {
    try {
    const [resultRows] = await pool.query('select doctor_id, first_name, last_name, specialty, availability from DoctorBase')
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching All Doctors: ", err)
        throw err
    }
}

export async function getDoctors(id) {
    try {
    const [resultRows] = await pool.query(`SELECT First_Name, Last_Name, Specialty, Availability, License_Serial FROM DoctorBase WHERE Doctor_ID = ?;`, [id]) 
    return resultRows[0]
    } 
    catch (err) {
        console.log("Error All Fetching Doctor Info: ", err)
        throw err
    }
}

export async function getDocPatients(Doctor_ID) { //patient info for doc
    try {
    const [resultRows] = await pool.query(`SELECT PatientBase.First_Name, PatientBase.Last_Name, 
    PatientBase.email, PatientBase.phone, PatientBase.Patient_ID 
    FROM DoctorBase INNER JOIN PatientBase on DoctorBase.Doctor_ID = PatientBase.Doctor_ID 
    WHERE DoctorBase.Doctor_ID = ?;`, [Doctor_ID])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Doctor Patients Info: ", err)
        throw err
    }
}

export async function getDocID(email, pw) {
    try {
    const [resultRows] = await pool.query(`SELECT Doctor_ID FROM DoctorBase WHERE Email = ? AND PW = SHA2(CONCAT(?),256);`, [email, pw])
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Doctor ID: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getDoctorSchedule(id, day, date) {
    const validDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    if (!validDays.includes(day)) {
        throw new Error("Invalid day value.");
    }

    try {
        const [slotsRow] = await pool.query(`select JSON_UNQUOTE(JSON_EXTRACT(doctor_schedule, '$.${day}')) as Slots from DoctorSchedules where doctor_id = ?;`, [id])
        console.log("Slots: ", slotsRow) 
        const [bookedRows] = await pool.query(`select appt_time from Appointments where doctor_id = ? and appt_date = ?`, [id, date])
        // Parse JSON string from MySQL
        const slotsString = slotsRow[0]?.Slots;
        if (!slotsString) {
            return []; // No available slots defined for that day
        }

        const fullSlots = JSON.parse(slotsString);
        const bookedSlots = bookedRows.map(row => row.appt_time);
        //console.log(bookedSlots)
        
        // Filter out booked slots
        const availableSlots = fullSlots.filter(slot => !bookedSlots.includes(slot));
        //console.log(availableSlots)
    
        return availableSlots
    } catch (err) {
        console.log("Error Fetching Available Slots: ", err)
        throw err
    }
}

export async function getPharmacies() {
    try {
    const [resultRows] = await pool.query(`SELECT Pharm_ID, Company_Name, Address, Zip, Work_Hours FROM Pharmacies;`)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Pharmacies: ", err)
        throw err
    }
}

export async function getPills() {
    try {
    const [resultRows] = await pool.query(`SELECT Pill_ID, Pill_Name, Cost, Dosage, Quantity, Pharm_ID FROM PillBank;`)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Pills: ", err)
        throw err
    }
}

export async function getTiers(id) {
    try {
    const [resultRows] = await pool.query(`SELECT Tier, Service, Cost FROM Tiers WHERE Doctor_ID = ?;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Tiers: ", err)
        throw err
    }
}

export async function getPillsFromPharm(id) {
    try {
    const [resultRows] = await pool.query(`SELECT Pill_ID, Cost, Pill_Name, Dosage FROM PillBank WHERE Pharm_ID = ?;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Pills: ", err)
        throw err
    }
}

export async function getExercises() {
    try {
    const [resultRows] = await pool.query(`SELECT Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps FROM ExerciseBank;`)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Exercises: ", err)
        throw err
    }
}

export async function getExerciseByClass(Exercise_Class) {
    try {
    const [resultRows] = await pool.query(`SELECT Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps FROM ExerciseBank WHERE Exercise_Class = ?;`, [Exercise_Class])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Exercises by Class: ", err)
        throw err
    }
}

export async function getRegiment(id) {
    try {
    const [resultRows] = await pool.query(`SELECT Regiment FROM Regiments WHERE Patient_ID = ?;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Regiment: ", err)
        throw err
    }   
}

export async function getForumPosts() {
    try {
    const [resultRows] = await pool.query(`SELECT FP.Forum_ID, FP.Forum_Text, FP.Patient_ID, FP.Exercise_ID, 
        Date_Posted, EB.Exercise_Name, EB.Muscle_Group, EB.Image, EB.Exercise_Class, EB.Sets, 
        EB.Reps, EB.Exercise_Description FROM Forum_Posts as FP, ExerciseBank as EB where FP.exercise_id = EB.exercise_id;`)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Forum Posts: ", err)
        throw err
    }
}

export async function getComments_id(id) { //comments for specific forum post -VC
    try {
    const [resultRows] = await pool.query(`SELECT Comments.Comment_ID, Comments.Comment_Text, Comments.Patient_ID, CONCAT(PatientBase.First_Name, ' ', PatientBase.Last_Name) AS PatientName, Comments.Date_Posted FROM Comments, PatientBase WHERE Forum_ID = ? AND Comments.Patient_ID = PatientBase.Patient_ID;`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Comments: ", err)
        throw err
    }
}

export async function getReviews() {
    try {
    const [resultRows] = await pool.query(`with numReviews as (select count(doctor_id) as cnt, doctor_id from Reviews group by doctor_id)
                select db.doctor_id, db.first_name, db.last_name, db.specialty, avg(r.rating) as rating, nr.cnt from Reviews as r, 
                DoctorBase as db, numReviews as nr where r.doctor_id = db.doctor_id and nr.doctor_id = db.doctor_id group by r.doctor_id`)

    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Reviews: ", err)
        throw err
    }
}

export async function getReviewsByID(id) {
    try {
    const [resultRows] = await pool.query(`with numReviews as (select count(doctor_id) as cnt, doctor_id from Reviews group by doctor_id)
                select db.doctor_id, db.first_name, db.last_name, db.specialty, avg(r.rating) as rating, nr.cnt from Reviews as r, 
                DoctorBase as db, numReviews as nr where r.doctor_id = db.doctor_id and nr.doctor_id = db.doctor_id and db.doctor_id = ? group by r.doctor_id`, 
            [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Reviews: ", err)
        throw err
    }
}

export async function getReviewsComments(id) {
    try {
    const [resultRows] = await pool.query(`select r.patient_id, r.review_text, r.doctor_id, pb.first_name, pb.last_name, 
        db.first_name as doctor_fname, db.last_name as doctor_lname, r.rating, r.date_posted from Reviews as r, PatientBase as pb, DoctorBase as db where 
        r.patient_id = pb.patient_id and r.doctor_id = db.doctor_id and r.doctor_id = ?`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Reviews Comments: ", err)
        throw err
    }
}

export async function getReviewsTop() { //top 3 reviews for splash page - VC
    try {
    const [resultRows] = await pool.query(`with topDoctors as (SELECT doctor_id FROM Reviews group by doctor_id ORDER BY avg(rating) DESC LIMIT 3)
                            select DB.first_name, DB.last_name, DB.specialty from 
                            DoctorBase as DB, topDoctors as TD where DB.doctor_id = TD.doctor_id;`)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Top Reviews: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getSurvey(id) { // get patient's recent surveys by recent date
    try {
    const [resultRows] = await pool.query(`SELECT Weight, Caloric_Intake, Water_Intake, Mood, Survey_Date FROM PatientDailySurvey WHERE Patient_ID = ? ORDER BY Survey_Date DESC;`, [id]) 
    console.log(resultRows)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Survey: ", err)
        throw err
    }
}

export async function getSurveyLatestDate(id){
    try {
    const [resultRows] = await pool.query(`select survey_date from PatientDailySurvey where patient_id = ? order by survey_date desc limit 1`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Survey Latest Date: ", err)
        throw err
    }
}

export async function getAuthSurvey(id) { // get patient's recent surveys by recent date
    try {
    const [resultRows] = await pool.query(`SELECT Survey_Date FROM PatientDailySurvey WHERE Patient_ID = ? ORDER BY Survey_Date DESC Limit 1;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Survey: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getAppointmentsPatient(id) {
    try {
        const [resultRows] = await pool.query(`SELECT 
            A.Appointment_ID, 
            A.Date_Scheduled, 
            A.Appt_Date, 
            A.Appt_Time, 
            A.Tier, 
            DB.first_name, 
            DB.last_name, 
            DB.specialty 
        FROM 
            Appointments AS A
        JOIN 
            DoctorBase AS DB ON DB.doctor_id = A.doctor_id
        WHERE 
            A.Patient_ID = ?
        ORDER BY 
            -- Sort upcoming appointments first
            (Appt_End = false AND Appt_Date >= CURDATE()) DESC,
            -- For upcoming: ASC Appt_Date, for past: DESC Appt_Date
            CASE 
                WHEN Appt_End = false AND Appt_Date >= CURDATE() THEN Appt_Date
                ELSE NULL
            END ASC,
            CASE 
                WHEN Appt_End = true OR Appt_Date < CURDATE() THEN Appt_Date
                ELSE NULL
            END DESC;`, [id]) 
        return resultRows
    } catch (err) {
        console.log("Failed Fetching Appointments for Patient: ", err)
        throw err
    }
}

export async function getTimeslot(Doctor_ID, Appt_Date, Appt_Time) {
    try {
    const [resultRows] = await pool.query(`
        SELECT * FROM Appointments
        WHERE Doctor_ID = ?
        AND Appt_Date = ?
        AND Appt_Time = ?;`, [Doctor_ID, Appt_Date, Appt_Time]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Timeslot: ", err)
        throw err
    }
}

export async function checkExistingRequests(patient_id, doctor_id, appt_date, appt_time) {
    try {
        const [resultRows] = await pool.query(`select * from Requests where patient_id = ? and doctor_id = ? and appt_date = ? and appt_time = ?;`, 
            [patient_id, doctor_id, appt_date, appt_time])
        return resultRows
    } catch (err) {
        console.log("error getting existing requests")
        throw err
    }
}

// joins other tables to get data - VC
export async function getApptRequest(id) {
    try {
    const [resultRows] = await pool.query(`
        SELECT PatientBase.First_name, PatientBase.last_name, Requests.Patient_ID, Requests.Doctor_ID, Requests.Appt_Date,
        Requests.Appt_Time, Requests.Tier, Requests.Request_Status FROM Requests INNER JOIN PatientBase ON PatientBase.Patient_ID = Requests.Patient_ID
        WHERE Requests.Doctor_ID = ?;`, [id]) 
        return resultRows
    }
    catch (err) {
        console.log("Error Fetching Appointment Requests: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getAppointmentsDoctor(id) {
    try {
    const [resultRows] = await pool.query(`SELECT PB.First_Name, PB.Last_Name, A.Appointment_ID, 
        A.Date_Scheduled, A.Appt_Date, A.Appt_Time, A.Tier FROM Appointments as A, PatientBase as PB 
        WHERE A.Doctor_ID = ? and PB.Patient_ID = A.Patient_ID and A.Appt_End = false 
        ORDER BY (A.Appt_End = false AND A.Appt_Date >= CURDATE()) DESC, A.Appt_Date ASC;
    `, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Doctor Appointments: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getPrescription(id) {
    try {
    const [resultRows] = await pool.query(`SELECT Prescription_ID, Pill_ID, Quantity, Doctor_ID FROM Prescription WHERE Patient_ID = ?;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Prescription: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getPrescriptionDoc(id) {
    try {
    const [resultRows] = await pool.query(`SELECT Prescription_ID, Pill_ID, Quantity, Patient_ID FROM Prescription WHERE Doctor_ID = ?;`, [id]) 
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Doctor Prescription: ", err)
        throw err
    }
}

// Make the below a POST because it is sensitive? - FI
export async function getPreliminaries(id) { //order by for most recent
    try {
    const [resultRows] = await pool.query(`SELECT patient_id, Symptoms FROM Preliminaries WHERE Patient_ID = ? ORDER BY Create_Date DESC;`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Patient Preliminaries: ", err)
        throw err
    }   
}

// Make the below a POST because it is sensitive? - FI
export async function getChatMesseges(id) { //order by for most recent
    try {
    const [resultRows] = await pool.query(`SELECT Message_ID, Message, SenderID, SenderType, Sent_At FROM messages WHERE Chatroom_ID = ? ORDER BY Sent_At DESC;`, [id])
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Chat Messages: ", err)
        throw err
    }
}

// 3 below are for pass word authentication, check what was entered compared to what is stored, could add post for attempts - VC
export async function getPatientAuth(email, pw) {
    try {
    const [resultRows] = await pool.query(`SELECT patient_id, First_Name, Last_Name, Email, Phone, Address, Zip, Doctor_ID FROM PatientBase WHERE Email = ? AND PW = SHA2(CONCAT(?),256)`,
        [email, pw]
    )
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Patient Auth: ", err)
        throw err
    }
}

export async function fetchPatient(patient_id) {
    try {
    const [resultRows] = await pool.query(`SELECT patient_id, First_Name, Last_Name, Email, Phone, Address, Zip, Doctor_ID FROM PatientBase WHERE patient_id = ?`,
        [patient_id]
    )
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Patient Auth: ", err)
        throw err
    }
}

export async function getDoctorAuth(email, pw) {
    try {
    const [resultRows] = await pool.query(`SELECT doctor_id, First_Name, Last_Name, Specialty, Availability, License_Serial, Email, Phone  FROM DoctorBase WHERE Email = ? AND PW = SHA2(CONCAT(?),256)`,
        [email, pw]
    )
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Doctor Auth: ", err)
        throw err
    }
}

export async function fetchDoctor(doctor_id) {
    try {
    const [resultRows] = await pool.query(`SELECT doctor_id, First_Name, Last_Name, Specialty, Availability, License_Serial, Email, Phone  FROM DoctorBase WHERE doctor_id = ?`,
        [doctor_id]
    )
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Doctor Auth: ", err)
        throw err
    }
}

export async function getPharmAuth(email, pw) {
    try {
    const [resultRows] = await pool.query(`SELECT pharm_id, Company_Name, Address, Zip, Work_Hours, Email FROM Pharmacies WHERE Email = ? AND PW = SHA2(CONCAT(?),256)`,
        [email, pw]
    )
    console.log(resultRows)
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Pharmacy Auth: ", err)
        throw err
    }
}

export async function fetchPharmacy(pharm_id) {
    try {
    const [resultRows] = await pool.query(`SELECT pharm_id, Company_Name, Address, Zip, Work_Hours, Email FROM Pharmacies WHERE pharm_id = ?`,
        [pharm_id]
    )
    console.log(resultRows)
    return resultRows[0]
    }
    catch (err) {
        console.log("Error Fetching Pharmacy Auth: ", err)
        throw err
    }
}

export async function getNearestPharms(zip) {
    try {
        const [resultRows] = await pool.query(`SELECT Pharm_ID, Company_Name, Zip, ABS(CAST(Zip AS SIGNED) - ?) AS ZipDistance
                FROM Pharmacies WHERE ABS(CAST(Zip AS SIGNED) - ?) <= ? ORDER BY ZipDistance ASC LIMIT 3`, [zip, zip, 3])
        return resultRows
    } catch (err) {
        console.log(err)
        throw err
    }
}

export async function getAppointmentInfo(patient_id) {
    try {
    const [resultRows] = await pool.query(`SELECT Appointments.Appt_Date, Appointments.Appt_Time, CONCAT(DoctorBase.First_Name, ' ', DoctorBase.Last_Name) AS Doctor, Appointments.Doctors_Feedback FROM Appointments, DoctorBase WHERE Appointments.Doctor_ID = DoctorBase.Doctor_ID AND Appointments.Patient_ID = ? and Appointments.Appt_End = true
        ORDER BY Appointments.Appt_Date DESC;`,
        [patient_id])
    console.log(resultRows)
    return resultRows
    }
    catch (err) {
        console.log("Error Fetching Appointment Info: ", err)
        throw err
    }
}

export async function getPaymentsForAppointments(patient_id) {
    try {
        const [resultRows] = await pool.query(`select P.Payment_ID, Concat(DB.First_Name, ' ', DB.Last_Name) as Doctor_Name, P.Payment_Type, A.Tier, T.Service, T.Cost, P.Payment_Status, P.Create_Date from Payments as P, 
            Appointments as A, DoctorBase as DB, Tiers as T where P.payment_type = "Appointment" and P.patient_id = A.patient_id and P.Related_ID = A.appointment_id 
            and A.doctor_id = DB.doctor_id and A.doctor_id = T.doctor_id and A.tier = T.tier and P.patient_id = ? order by A.Appt_Date desc;`, [patient_id])
        console.log(resultRows)
        return resultRows
    } catch (err) {
        console.log("Error Fetching Appointment Payments: ", err)
        throw err
    }
}

export async function getPaymentForPrescription(patientID) {
    try {
        const [resultRows] = await pool.query(`
            SELECT 
                P.Payment_ID,
                CONCAT(DB.First_Name, ' ', DB.Last_Name) AS Doctor_Name,
                PB.Pill_Name,
                PB.Cost,
                P.Payment_Type,
                P.Payment_Status,
                PB.Dosage,
                PR.Quantity,
                PR.Create_Date AS Create_Date
            FROM Payments AS P
            JOIN Prescription AS PR ON P.Related_ID = PR.Prescription_ID
            JOIN PillBank AS PB ON PR.Pill_ID = PB.Pill_ID
            JOIN DoctorBase AS DB ON PR.Doctor_ID = DB.Doctor_ID
            WHERE P.Payment_Type = 'Prescription' AND P.Patient_ID = ?
            ORDER BY PR.Create_Date DESC;
        `, [patientID]);

        return resultRows;
    } catch (err) {
        console.error('Error fetching prescription payments:', err);
        throw err;
    }
}

//ADD DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type POST
// Add to db via a new id, can also be done with SET @valI = (SELECT COUNT(*) FROM table);
// - VC

/*
export async function LogAttempt(User_ID, User_type, Success_Status){
    try {
    const [login] = await pool.query(`
        INSERT INTO auditlog (UserEmail, UserType, Success_Status) VALUES (?, ?, ?);`
    , [User_ID, User_type, Success_Status])
    return login
    }
    catch (err) {
        console.log("Error Logging Attempt: ", err)
        throw err
    }
}
*/

export async function LogAttempt(UserEmail, Success_Status){
    try {
    const [login] = await pool.query(`
        INSERT INTO AuthAttempts (UserEmail, Success_Status) VALUES (?, ?);`
    , [UserEmail, Success_Status])
    return login
    }
    catch (err) {
        console.log("Error Logging Auth Attempt: ", err)
        throw err
    }
}

export async function genereateAudit(User_ID, User_type, Event_Type, Event_Details){
    try {
    const [resultGenerateAudit] = await pool.query(`
        INSERT INTO AuditLog (UserID, UserType, Event_Type, Event_Details) VALUES (?, ?, ?, ?);`
    , [User_ID, User_type, Event_Type, Event_Details])
    return resultGenerateAudit
    }
    catch (err) {
        console.log("Error Generating Audit: ", err)
        throw err
    }
}

export async function createPatient(Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID) {
    try {
    const [resultPatientCreate] = await pool.query(`
        INSERT INTO PatientBase (Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID) VALUES (?, ?, ?, ?, ?, SHA2(CONCAT(?),256), ?, ?, ?);`
    , [Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID])
    const [body] = await pool.query(`select patient_id, First_Name, Last_Name from PatientBase where patient_id = ?`, [resultPatientCreate.insertId])
    console.log("Body Info: ", body)
    return body[0]
    }
    catch (err) {
        console.log("Error Creating Patient: ", err)
        throw err
    }
}

export async function createDoctor(License_Serial,First_Name,Last_Name,Specialty,Email,Phone,PW,Availability) { //add tiers with doc? - VC
    try {
    const [resultDoctorCreate] = await pool.query(`
        INSERT INTO DoctorBase (License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability) VALUES (?,?,?,?,?,?,SHA2(CONCAT(?),256),?);`
    , [License_Serial,First_Name,Last_Name,Specialty,Email,Phone,PW,Availability])
    
    console.log(resultDoctorCreate)
    const [body] = await pool.query(`select doctor_id, First_Name, Last_Name from DoctorBase where doctor_id = ?`, [resultDoctorCreate.insertId])
    console.log("Doctor: ", body)
    return body[0]
    }
    catch (err) {
        console.log("Error Creating Doctor: ", err)
        throw err
    }
}

export async function createDoctorTiers(Doctor_ID) {
    try {
    const [resultDoctorTiersCreate1] = await pool.query(`
        INSERT INTO Tiers (Doctor_ID, Tier, Service, Cost) VALUES (?, 'Basic', 'General Consulatation', 100);`, [Doctor_ID])
    const [resultDoctorTiersCreate2] = await pool.query(`
        INSERT INTO Tiers (Doctor_ID, Tier, Service, Cost) VALUES (?, 'Plus', 'Elevated Servicing', 200);`, [Doctor_ID])
    const [resultDoctorTiersCreate3] = await pool.query(` 
        INSERT INTO Tiers (Doctor_ID, Tier, Service, Cost) VALUES (?, 'Premium', 'Premium Doctor-Patient Facilities', 300);`, 
        [Doctor_ID])
    return resultDoctorTiersCreate1
    } 
    catch (err) {
        console.log("Error Creating Doctor Tiers: ", err)
        throw err
    }
}

export async function createDoctorSchedule(Doctor_ID, Doctor_Schedule) {
    try {
    const [resultDocScheduleCreate] = await pool.query(`INSERT INTO DoctorSchedules (Doctor_ID, Doctor_Schedule) VALUES (?, ?);`, [Doctor_ID, Doctor_Schedule])
    return resultDocScheduleCreate
    }
    catch (err) {
        console.log("Error Creating Doctor Schedule: ", err)
        throw err
    }
}

export async function createPharmacy(Company_Name,Address,Zip,Work_Hours,Email,PW) { //Work_Hours: req.body.Work_Hours, //json? -VC
    try {
        const workHoursString = JSON.stringify(Work_Hours);
        const [resultPharmacyCreate] = await pool.query(`
          INSERT INTO Pharmacies (Company_Name, Address, Zip, Work_Hours, Email, PW) 
          VALUES (?, ?, ?, ?, ?, SHA2(CONCAT(?),256));
        `, [Company_Name, Address, Zip, workHoursString, Email, PW]);
    
        console.log("Insert Result:", resultPharmacyCreate);
    
        const [body] = await pool.query(
          `SELECT pharm_id, Company_Name FROM Pharmacies WHERE pharm_id = ?`, 
          [resultPharmacyCreate.insertId]
        );
        console.log("Query Result:", body);
        
        return body[0];
      } catch (err) {
        console.error("Error in createPharmacy:", err);
        throw err; // Let Express catch it
      }
}

export async function createPill(Cost, Pill_Name, Pharm_ID, Dosage, Quantity) {
    try {
    const [resultPillCreate] = await pool.query(`
        INSERT INTO PillBank (Cost, Pill_Name, Pharm_ID, Dosage, Quantity) VALUES (?,?,?,?, ?);`
    , [Cost, Pill_Name, Pharm_ID, Dosage, Quantity])
    return resultPillCreate
    }
    catch (err) {
        console.log("Error Creating Pill: ", err)
        throw err
    }
}

export async function createExercise(Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps) {
    try {
    const [resultExerciseCreate] = await pool.query(`
        INSERT INTO ExerciseBank (Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps) VALUES (?,?,?,?,?,?);`
    , [Exercise_Name, Muscle_Group, Exercise_Description, Exercise_Class, Sets, Reps])
    return resultExerciseCreate
    }
    catch (err) {
        console.log("Error Creating Exercise: ", err)
        throw err
    }
}

export async function createRegiment(Patient_ID, Regiment) {
    try {
    const [resultRegimentCreate] = await pool.query(`
        INSERT INTO Regiments (Patient_ID, Regiment) VALUES (?,?);`
    , [Patient_ID, Regiment])
    return resultRegimentCreate
    }
    catch (err) {
        console.log("Error Creating Regiment: ", err)
        throw err
    }
}

export async function createForumPost(Patient_ID, Exercise_ID, Forum_Text) {
    try {
    const [resultFPostCreate] = await pool.query(`
        INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (?,?,?,CURRENT_DATE);`
    , [Patient_ID, Exercise_ID, Forum_Text])
    return resultFPostCreate
    }
    catch (err) {
        console.log("Error Creating Forum Post: ", err)
        throw err
    }
}

export async function createComment(Patient_ID, Forum_ID, Comment_Text) { //for forums above -VC
    try {
    const [resultCommentCreate] = await pool.query(`
        INSERT INTO Comments (Patient_ID, Forum_ID, Comment_Text, Date_Posted) VALUES (?, ?, ?, CURRENT_DATE);`
    , [Patient_ID, Forum_ID, Comment_Text])
    return resultCommentCreate
    }
    catch (err) {
        console.log("Error Creating Comment: ", err)
        throw err
    }
}

//same idea for chatroom and messages should apply for above - VC
export async function createChatroom(Chatroom_Name) {
    try {
    const [resultChatCreate] = await pool.query(`INSERT INTO chatrooms (Chatroom_Name) VALUES (?);`, [Chatroom_Name])
    return resultChatCreate
    }
    catch (err) {
        console.log("Error Creating Chatroom: ", err)
        throw err
    }
}

export async function createChatMsg(Appointment_ID, SenderID, SenderName, SenderType, Message) { //for chatroom above -VC
    try {
    const [resultMsgCreate] = await pool.query(`INSERT INTO Messages (Appointment_ID, SenderID, SenderName, SenderType, Message) 
        VALUES (?, ?, ?, ?, ?);`, [Appointment_ID, SenderID,  SenderName, SenderType, Message])
    return resultMsgCreate
    }
    catch (err) {
        console.log("Error Creating Message: ", err)
        throw err
    }
}

export async function fetchAppointmentMessages(Appointment_ID) {
    try {
        const [resultMessageFetch] = await pool.query(`SELECT message, senderType, senderID, senderName, sent_at FROM Messages WHERE Appointment_ID = ? ORDER BY Sent_At;`, [Appointment_ID])
        return resultMessageFetch
    }
    catch (err) {
        console.log("Error Fetching Appointment Messages: ", err)
        throw err
    }
}

export async function createAppointment(Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier) {
    try {        
        const [resultApptCreate] = await pool.query(`INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled,
            Appt_Date, Appt_Time, Tier) VALUES (?, ?, CURRENT_DATE, ?, ?, ?);`, [Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier])
        return resultApptCreate
    } catch (err) {
        console.log("Failed Creating Appointment: ", err)
        throw err
    }
}


export async function createApptRequest(Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier) {
    try {
        const [resultApptCreate] = await pool.query(`INSERT INTO Requests (Patient_ID, Doctor_ID, Request_Status, Appt_Date, Appt_Time, Tier) VALUES (?, ?, 'Pending', ?, ?, ?);`, [Patient_ID, Doctor_ID, Appt_Date, Appt_Time, Tier])
        return resultApptCreate
    } catch (err) {
        console.log("Failed Creating Appt Request: ", err)
        throw err
    }
}

export async function createPreliminary(Patient_ID, Symptoms) {
    try {
    const [resultPrelimCreate] = await pool.query(`INSERT INTO Preliminaries (Patient_ID, Symptoms) VALUES (?, ?);`, [Patient_ID, Symptoms])
    return resultPrelimCreate
    }
    catch (err) {
        console.log("Error Creating Preliminary: ", err)
        throw err
    }
}

export async function createPerscription(Patient_ID, Pill_ID, Quantity, Doctor_ID, Pharm_ID, Prescription_Status) {
    try {
    const [result] = await pool.query(`INSERT INTO Prescription (Patient_ID, Pill_ID, Quantity, Doctor_ID, Pharm_ID, Prescription_Status) 
        VALUES (?, ?, ?, ?, ?, ?);`, [Patient_ID, Pill_ID, Quantity, Doctor_ID, Pharm_ID, Prescription_Status])
    return result.insertId
    }
    catch (err) {
        console.log("Error Creating Prescription: ", err)
        throw err
    }
}

export async function fetchPrescriptions(Pharm_ID) {
    try {
        const [resultRows] = await pool.query(`
            SELECT 
                p.Prescription_ID,
                p.Patient_ID,
                CONCAT(pb.First_Name, ' ', pb.Last_Name) AS Patient_Name,
                p.Doctor_ID,
                CONCAT(db.First_Name, ' ', db.Last_Name) AS Doctor_Name,
                p.Pill_ID,
                pill.Pill_Name,
                p.Quantity,
                p.Prescription_Status,
                p.Create_Date,
                p.Last_Update
            FROM Prescription p
            JOIN PatientBase pb ON p.Patient_ID = pb.Patient_ID
            JOIN DoctorBase db ON p.Doctor_ID = db.Doctor_ID
            JOIN PillBank pill ON p.Pill_ID = pill.Pill_ID
            WHERE p.Pharm_ID = ?
            ORDER BY p.Create_Date DESC;
        `, [Pharm_ID]);

        return resultRows;
    } catch (err) {
        console.log('Error Fetching Prescriptions by pharm_id: ', err)
        throw err;
    }
}

export async function getPrescriptionWithNamesById(prescriptionId) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.Prescription_ID,
                p.Patient_ID,
                CONCAT(pb.First_Name, ' ', pb.Last_Name) AS Patient_Name,
                p.Doctor_ID,
                CONCAT(db.First_Name, ' ', db.Last_Name) AS Doctor_Name,
                p.Pill_ID,
                pill.Pill_Name,
                p.Quantity,
                p.Prescription_Status,
                p.Create_Date,
                p.Last_Update
            FROM Prescription p
            JOIN PatientBase pb ON p.Patient_ID = pb.Patient_ID
            JOIN DoctorBase db ON p.Doctor_ID = db.Doctor_ID
            JOIN PillBank pill ON p.Pill_ID = pill.Pill_ID
            WHERE p.Prescription_ID = ?
        `, [prescriptionId]);
    
        return rows[0];
    } catch (err) {
        console.log('Error Fetching Prescriptions by prescription_id: ', err)
        throw err;
    }
}

export async function fetchPrescriptionPaid(prescription_id) {
    try {
        const [resultRows] = await pool.query(`select * from Payments where payment_type = "Prescription" 
            and related_id = ? and payment_status = "paid";`, [prescription_id])
        return resultRows[0]
    } catch (err) {
        console.log('Error Fetching Prescriptions by prescription_id: ', err)
        throw err;
    }
}

export async function fetchPrescriptionAccepted(patient_id){
    try {
        const [resultRows] = await pool.query(`SELECT 
            p.Prescription_ID,
            p.Patient_ID,
            CONCAT(pb.First_Name, ' ', pb.Last_Name) AS Patient_Name,
            p.Doctor_ID,
            CONCAT(db.First_Name, ' ', db.Last_Name) AS Doctor_Name,
            p.Pill_ID,
            pill.Pill_Name,
            p.Quantity,
            p.Prescription_Status,
            p.Create_Date,
            p.Last_Update
        FROM Prescription p
        JOIN PatientBase pb ON p.Patient_ID = pb.Patient_ID
        JOIN DoctorBase db ON p.Doctor_ID = db.Doctor_ID
        JOIN PillBank pill ON p.Pill_ID = pill.Pill_ID
        WHERE pb.patient_id = ? and Prescription_Status = 'Accepted';
        ;`, [patient_id])
        return resultRows
    } catch (err) {
        console.log('Error Fetching Prescriptions by patient_id: ', err)
        throw err;
    }
}

export async function getAllPharmacyIds() {
    try {
        const result = await pool.query('SELECT pharm_id FROM Pharmacies');
        console.log(result[0])
        return result[0].map(r => r.pharm_id);
    } catch (err) {
        console.log("Error Getting all pharm ids: ", err)
        throw err
    }
}


export async function createReveiw(Patient_ID, Doctor_ID, Review_Text, Rating) {
    const [check] = await pool.query(`select patient_id from PatientBase 
        where patient_id = ? and doctor_id = ?;`, [Patient_ID, Doctor_ID])

    if (check.length === 0) {
        return null
    }
    try {
    const [resultReviewCreate] = await pool.query(`
        INSERT INTO Reviews (Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating) VALUES (?,?,?,CURRENT_DATE,?);`
    , [Patient_ID, Doctor_ID, Review_Text, Rating])
    return resultReviewCreate
    }
    catch (err) {
        console.log("Error Creating Review: ", err)
        throw err
    }
}

export async function createSurvey(Patient_ID, Weight, Caloric_Intake, Water_Intake, Mood) {
    try {
    const [resultSurveyCreate] = await pool.query(`INSERT INTO PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood)
        VALUES (?, CURRENT_DATE, ?, ?, ?, ?);`, [Patient_ID, Weight, Caloric_Intake, Water_Intake, Mood])
    return resultSurveyCreate
    }
    catch (err) {
        console.log("Error Creating Survey: ", err)
        throw err
    }
}

export async function createPayment(Patient_ID, Related_ID, Payment_Type, Payment_Status) {
    try {
    const [resultPaymentCreate] = await pool.query(`INSERT INTO Payments (Patient_ID, Related_ID, Payment_Type, Payment_Status)
        VALUES (?, ?, ?, ?);`, [Patient_ID, Related_ID, Payment_Type, Payment_Status])
    return resultPaymentCreate
    }
    catch (err) {
        console.log("Error Creating Payment: ", err)
        throw err
    }
}

//UPDATE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe PATCH
//update based on a given id - VC

export async function UpdatePatientInfo(id, entry) {
    try{
    const [returnResult] = await pool.query(`
        UPDATE PatientBase SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Patient_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Patient Info: ", err)
        throw err
    }
}

// VERIFY THIS WORKS - FI
export async function addPatientDoc(id, doc_id) {
    try {
        const [returnResult] = await pool.query(`
            UPDATE PatientBase SET \`Doctor_ID\` = ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Patient_ID = ?;`
        , [doc_id, id])
        return returnResult
    } catch (err) {
        console.log("Failed to Assign doctor to patient: ", err)
        throw err
    }
}

// VERIFY THIS WORKS - FI
export async function rmPatientDoc(id) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE PatientBase SET \`Doctor_ID\` = NULL, \`Last_Update\` = CURRENT_TIMESTAMP Where Patient_ID = ?;`
    , [id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Patient Info: ", err)
        throw err
    }
}

export async function rmPatientAppt(patient_id, doctor_id) {
    try {
        const [returnResult] = await pool.query(`delete from Appointments where Patient_ID = ? and Doctor_ID = ? 
            and Appt_End = false and (Appt_Date > CURDATE() OR (Appt_Date = CURDATE() AND Appt_Time > CURTIME()))`, [patient_id, doctor_id])
        return returnResult
    } catch (err) {
        console.log("Failed Removing Patient Appointments: ", err)
        throw err
    }
}

export async function UpdatePharmInfo(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE Pharmacies SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Pharm_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Doctor Info: ", err)
        throw err
    }
}

export async function UpdateDoctorInfo(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE DoctorBase SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Doctor_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Doctor Info: ", err)
        throw err
    }
}

export async function UpdateRequest(p_id, d_id, response, Appt_Date, Appt_Time) {
    try {
        const [returnResult] = await pool.query(`
            UPDATE Requests SET Request_Status = ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Patient_ID = ? AND Doctor_ID = ? AND Appt_Date = ? AND Appt_Time = ?;`
        , [response, p_id, d_id, Appt_Date, Appt_Time])
        console.log("Database update result:", returnResult);
        return returnResult
    } catch (err) {
        console.log("Failed Updating Request: ", err)
        throw err
    }
}

export async function startAppointment(apptID) {
    try {
        const [startApptResult] = await pool.query(`
            UPDATE Appointments SET Appt_Start = ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Appointment_ID = ?;`
        , [true, apptID])
        console.log("Database update result:", startApptResult);
        return startApptResult
    } catch (err) {
        console.log("Failed Updating Request: ", err)
        throw err
    }
}

export async function endAppointment(apptID) {
    try {
        const [endApptResult] = await pool.query(`
            UPDATE Appointments SET Appt_End = ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Appointment_ID = ?;`
        , [true, apptID])
        console.log("Database update result:", endApptResult);
        return endApptResult
    } catch (err) {
        console.log("Failed Updating Request: ", err)
        throw err
    }
}

export async function fetchApptStartStatus(apptID) {
    try {
        const [startStatusResult] = await pool.query(`SELECT Appt_Start FROM Appointments WHERE Appointment_ID = ?;`, [apptID])
        console.log("Database update result:", startStatusResult);
        return startStatusResult[0] 
    }
    catch (err) {
        console.log("Failed fetching Appt Start Status: ", err)
        throw err
    }
}

export async function fetchApptEndStatus(apptID) {
    try {
        const [startStatusResult] = await pool.query(`SELECT Appt_End FROM Appointments WHERE Appointment_ID = ?;`, [apptID])
        console.log("Database update result:", startStatusResult);
        return startStatusResult[0] 
    }
    catch (err) {
        console.log("Failed fetching Appt Start Status: ", err)
        throw err
    }
}

// THIS IS INSECURE BECAUSE ENTRY CAN MODIFY ANYTHING (only doc schedule is extracted)
export async function UpdateDoctorSchedule(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE DoctorSchedules SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Doctor_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Doctor Schedule: ", err)
        throw err
    }
}

// THIS IS INSECURE BECAUSE ENTRY CAN MODIFY ANYTHING (Fixed for IDs)
export async function UpdateApptStat(id, status) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE Requests SET Request_Status = ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Request_ID = ?;`
    , [status, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Appointment Status: ", err)
        throw err
    }
}

export async function UpdateDoctorFeedback(appointment_id, doctor_feedback) {
    try {
        const [returnedResult] = await pool.query(`Update Appointments set Doctors_Feedback = ?, \`Last_Update\` = CURRENT_TIMESTAMP where Appointment_ID = ?`, 
            [doctor_feedback, appointment_id])
        console.log("Doctor Feedback Updated Result: ", returnedResult)
        return returnedResult
    } catch (err) {
        console.log("Failed Updating Feedback: ", err)
        throw err
    }
}

// THIS IS INSECURE BECAUSE ENTRY CAN MODIFY ANYTHING (fixed for IDs)
export async function UpdatePerscriptionInfo(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE Prescription SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Prescription_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Prescription Info: ", err)
        throw err
    }
}

// THIS IS INSECURE BECAUSE ENTRY CAN MODIFY ANYTHING (almost evrything besides ID)
export async function UpdatePillInfo(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE PillBank SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Pill_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Pill Info: ", err)
        throw err
    }
}

// THIS IS INSECURE BECAUSE ENTRY CAN MODIFY ANYTHING (There's not much you can update - VC)
export async function UpdateRegiment(id, entry) {
    try {
    const [returnResult] = await pool.query(`
        UPDATE Regiments SET ?, \`Last_Update\` = CURRENT_TIMESTAMP Where Patient_ID = ?;`
    , [entry, id])
    console.log("Database update result:", returnResult);
    return returnResult
    }
    catch (err) {
        console.log("Failed Updating Regiment Info: ", err)
        throw err
    }
}

export async function appendToRegiment(patientId, newRegimentData) {
    try {
      // 1. Get existing regiment
      const [existingRows] = await pool.query(
        `SELECT Regiment FROM Regiments WHERE Patient_ID = ?`,
        [patientId]
      );
  
      if (!existingRows.length) {
        throw new Error("No existing regiment found for this patient.");
      }
  
      let existingRegiment = {};
  
      try {
        const regData = existingRows[0].Regiment;
  
        if (typeof regData === 'string') {
          existingRegiment = JSON.parse(regData || '{}');
        } else if (typeof regData === 'object' && regData !== null) {
          existingRegiment = regData;
        }
      } catch (parseErr) {
        console.error("Failed parsing Regiment from DB:", parseErr);
        throw new Error("Corrupt regiment data in database.");
      }
  
      // 2. Merge new regiment into existing
    console.log(newRegimentData)
    for (const [day, exercises] of Object.entries(newRegimentData)) {
        if (!Array.isArray(exercises)) {
        console.warn(`Skipping invalid entry for day: ${day}, expected array but got`, typeof exercises);
        continue; // Skip this day if the value isn't an array
        }
    
        if (!existingRegiment[day]) existingRegiment[day] = [];
    
        exercises.forEach(ex => {
        if (!existingRegiment[day].includes(ex)) {
            existingRegiment[day].push(ex);
        }
        });
    }
  
      // 3. Update the DB
      const [result] = await pool.query(
        `UPDATE Regiments SET Regiment = ?, Last_Update = CURRENT_TIMESTAMP WHERE Patient_ID = ?`,
        [JSON.stringify(existingRegiment), patientId]
      );
  
      return result;
    } catch (err) {
      console.error("Error in appendToRegiment:", err);
      throw err;
    }
  }

export async function clearPatientRegiment(patientID) {
    try {
        const [result] = await pool.query(
            `UPDATE Regiments SET Regiment = ?, Last_Update = CURRENT_TIMESTAMP WHERE Patient_ID = ?`,
            [JSON.stringify({}), patientID]
          );
        return result;
    } catch (err) {
        console.log("Error Clearing regiment: ", err)
        throw err
    }
}

export async function UpdatePayment(payment_id, card_number) {
    try {
        const [result] = await pool.query(`UPDATE Payments SET Card_Number = ?, Payment_Status = "Paid", Last_Update = CURRENT_TIMESTAMP where Payment_ID = ?`,
            [card_number, payment_id]
        )
        return result
    } catch (err) {
        console.log("Error Making Payment: ", err)
        throw err
    }
}

export async function AcceptPrescription(prescription_id) {
    try {
        const [result] = await pool.query(`UPDATE Prescription SET Prescription_Status = "Accepted", Last_Update = CURRENT_TIMESTAMP where Prescription_ID = ?`,
            [prescription_id])
        return result
    } catch (err) {
        console.log("Error Accepting Prescription: ", err)
        throw err
    }
}
  

//REMOVE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe DELETE
// delete based on a given id - VC

export async function deletePatient(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM PatientBase WHERE Patient_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Patient: ", err)
        throw err
    }
}

// Add Patient info to this to make secure?
export async function deleteAppointment(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM Appointments WHERE Appointment_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Appointment: ", err)
        throw err
    }
}

export async function deleteRegiment(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM Regiments WHERE Patient_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Regiment: ", err)
        throw err
    }
}

export async function deleteDoctor(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM DoctorBase WHERE Doctor_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Doctor: ", err)
        throw err
    }
}

export async function deleteDoctorTiers(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM Tiers WHERE Doctor_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Doctor Tiers: ", err)
        throw err
    }
}

export async function deleteDoctorSchedule(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM DoctorSchedules WHERE Doctor_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Doctor Schedule: ", err)
        throw err
    }
}

export async function deletePerscription(id) {
    
    try {
    const [deleteResult] = await pool.query(`DELETE FROM Prescription WHERE Prescription_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Prescription: ", err)
        throw err
    }
}

export async function deletePill(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM PillBank WHERE Pill_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Pill: ", err)
        throw err
    }
}

export async function deleteComment(id) {
    try {
    const [deleteResult] = await pool.query(`DELETE FROM Comments WHERE Comment_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Comment: ", err)
        throw err
    }
}

export async function deleteForumPost(id) {
    try {
    const [deleteResult] = await pool.query(`
        DELETE FROM Comments WHERE Forum_ID = ?;
        DELETE FROM Forum_Posts WHERE Forum_ID = ?;`
    , [id, id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
    }
    catch (err) {
        console.log("Failed Deleting Forum Post: ", err)
        throw err
    }
}
