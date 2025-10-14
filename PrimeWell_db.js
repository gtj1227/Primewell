import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

//make a file called .env if you dont and write each process.env. as ENTRY="value", and place the file at the root - VC
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST, 
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true
}).promise()

//GET DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type GET

//the 5 request below return data from our only populated tables so far - VC
export async function getPatients() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.patientbase`)
    return resultRows
}

export async function getPatientsByDoc(id) {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.patientbase WHERE Doctor_id = ?`, [id])
    return resultRows
}

export async function getDoctors() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.doctorbase`)
    return resultRows
}

export async function getPharmacies() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.pharmacies`)
    return resultRows
}

export async function getPills() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.pillbank`)
    return resultRows
}

export async function getTiers() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.tiers`)
    return resultRows
}

export async function getExercises() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.exercisebank`)
    return resultRows
}

export async function getForumPosts() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.forum_posts`)
    return resultRows
}

export async function getComments_id(id) { //comments for specific forum post -VC
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.Comments WHERE Forum_ID = ?`, [id])
    return resultRows
}

export async function getReviews() {
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.reviews`)
    return resultRows
}

export async function getReviewsTop() { //top 3 revies for splash page - VC
    const [resultRows] = await pool.query(`SELECT * FROM primewell_clinic.reviews ORDER BY Rating DESC LIMIT 3`)
    return resultRows
}

// 3 below are for pass word authentication, check what was entered compared to what is stored, could add post for attempts - VC
export async function getPatientAuth(email) {
    const [resultRows] = await pool.query(`SELECT PW FROM primewell_clinic.patientbase WHERE Email = ?`,
        [email]
    )
    return resultRows
}

export async function getDoctorAuth(email) {
    const [resultRows] = await pool.query(`SELECT PW FROM primewell_clinic.doctorbase WHERE Email = ?`,
        [email]
    )
    return resultRows
}

export async function getPharmAuth(email) {
    const [resultRows] = await pool.query(`SELECT PW FROM primewell_clinic.pharmacies WHERE Email = ?`,
        [email]
    )
    return resultRows
}

//ADD DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with type POST
// Add to db via a new id, can also be done with SET @valI = (SELECT COUNT(*) FROM primewell_clinic.table);
// - VC

export async function createPatient(entry, pharm) {
    let timeStamp = new Date();
    const [resultPatientCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.patientbase);
        SET @valP = (SELECT Pharm_ID FROM primewell_clinic.pharmacies WHERE Company_Name = '`+pharm+`');
        INSERT INTO primewell_clinic.patientbase SET \`Patient_ID\` = @valI+1, \`Pharm_ID\` = @valP, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultPatientCreate
}

export async function createDoctor(entry, schedule) { //tiers and schedule too - VC
    let timeStamp = new Date();
    const [resultDoctorCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.doctorbase);
        INSERT INTO primewell_clinic.doctorbase SET \`Doctor_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;
        INSERT INTO primewell_clinic.doctorschedules SET \`Doctor_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;
        SET @valT = (SELECT COUNT(*) FROM primewell_clinic.tiers);
        INSERT INTO primewell_clinic.tiers SET \`Tier_ID\` = @valT+1 \`Doctor_ID\` = @valI+1, Tier = 'Basic', 
        Service = 'General Consultation', Cost = 98.04 \`Last_update\` = ?, \`Create_Date\` = ?;
        INSERT INTO primewell_clinic.tiers SET \`Tier_ID\` = @valT+2 \`Doctor_ID\` = @valI+1, Tier = 'Plus', 
        Service = 'Elevated Servicing', Cost = 397.20 \`Last_update\` = ?, \`Create_Date\` = ?;
        INSERT INTO primewell_clinic.tiers SET \`Tier_ID\` = @valT+3 \`Doctor_ID\` = @valI+1, Tier = 'Premium', 
        Service = 'Premium Doctor-Patient Facilities', Cost = 566.20 \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp, schedule, timeStamp, timeStamp, timeStamp, timeStamp, timeStamp, timeStamp, timeStamp, timeStamp])
    return resultDoctorCreate
}

export async function createPharmacy(entry) { //Work_Hours: req.body.Work_Hours, //json? -VC
    let timeStamp = new Date();
    const [resultPharmacyCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.pharmacies);
        INSERT INTO primewell_clinic.pharmacies SET \`Pharm_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultPharmacyCreate
}

export async function createPill(entry) {
    let timeStamp = new Date();
    const [resultPillCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.pillbank);
        INSERT INTO primewell_clinic.pillbank SET \`Pill_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultPilltCreate
}

export async function createExercise(entry, filename) {
    let timeStamp = new Date();
    const [resultExerciseCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.exercisebank);
        INSERT INTO primewell_clinic.exercisebank SET \`Exercise_ID\` = @valI+1, ?, Image = ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, filename, timeStamp, timeStamp])
    return resultExerciseCreate
}

export async function createForumPost(entry) {
    let timeStamp = new Date();
    const [resultFPostCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.forum_posts);
        INSERT INTO primewell_clinic.forum_posts SET \`Forum_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultFPostCreate
}

export async function createComment(entry) { //for forums above -VC
    let timeStamp = new Date();
    const [resultCommentCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.comments);
        INSERT INTO primewell_clinic.comments SET \`Comment_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultCommentCreate
}
//same idea for chatroom and messages should apply for above - VC

export async function createReveiw(entry) {
    let timeStamp = new Date();
    const [resultReviewCreate] = await pool.query(`
        SET @valI = (SELECT COUNT(*) FROM primewell_clinic.reviews);
        INSERT INTO primewell_clinic.reviews SET \`Review_ID\` = @valI+1, ?, \`Last_update\` = ?, \`Create_Date\` = ?;`
    , [entry, timeStamp, timeStamp])
    return resultReviewCreate
}

//UPDATE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe PATCH
//update based on a given id - VC

export async function UpdatePatientInfo(id, entry) {
    let timeStamp = new Date();
    const [returnResult] = await pool.query(`
        UPDATE primewell_clinic.patientbase SET ?, \`Last_Update\` = ? Where Patient_ID = ?;`
    , [entry, timeStamp, id])
    console.log("Database update result:", returnResult);
    return returnResult
}

export async function addPatientDoc(id, doc_id) {
    let timeStamp = new Date();
    const [returnResult] = await pool.query(`
        UPDATE primewell_clinic.patientbase SET \`Doctor_ID\` = ?, \`Last_Update\` = ? Where Patient_ID = ?;`
    , [doc_id, timeStamp, id])
    console.log("Database update result:", returnResult);
    return returnResult
}

export async function rmPatientDoc(id) {
    let timeStamp = new Date();
    const [returnResult] = await pool.query(`
        UPDATE primewell_clinic.patientbase SET \`Doctor_ID\` = NULL, \`Last_Update\` = ? Where Patient_ID = ?;`
    , [timeStamp, id])
    console.log("Database update result:", returnResult);
    return returnResult
}

export async function UpdateDoctorInfo(id, entry) {
    let timeStamp = new Date();
    const [returnResult] = await pool.query(`
        UPDATE primewell_clinic.doctorbase SET ?, \`Last_Update\` = ? Where Doctor_ID = ?;`
    , [entry, timeStamp, id])
    console.log("Database update result:", returnResult);
    return returnResult
}

export async function UpdatePillInfo(id, entry) {
    let timeStamp = new Date();
    const [returnResult] = await pool.query(`
        UPDATE primewell_clinic.pillbank SET ?, \`Last_Update\` = ? Where Pill_ID = ?;`
    , [entry, timeStamp, id])
    console.log("Database update result:", returnResult);
    return returnResult
}

//REMOVE DATA ----------------------------------------------------------------------------------------------
// All below should have an addtional query to auditlog with tyoe DELETE
// delete based on a given id - VC

export async function deletePatient(id) {
    const [deleteResult] = await pool.query(`DELETE FROM primewell_clinic.patientbase WHERE Patient_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
}

export async function deleteDoctor(id) {
    const [deleteResult] = await pool.query(`DELETE FROM primewell_clinic.doctorbase WHERE Doctor_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
}

export async function deletePill(id) {
    const [deleteResult] = await pool.query(`DELETE FROM primewell_clinic.pillbank WHERE Pill_ID = ?;`
    , [id])
    console.log("Database delete result:", deleteResult);
    return deleteResult
}