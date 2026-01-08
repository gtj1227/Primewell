DROP DATABASE primewell_clinic;
CREATE DATABASE primewell_clinic;
USE primewell_clinic;
-- current working name --

-- For users who are doctors
CREATE TABLE DoctorBase (
    Doctor_ID INT AUTO_INCREMENT PRIMARY KEY,
    License_Serial VARCHAR(13) UNIQUE NOT NULL,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Specialty VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    PW VARCHAR(255) NOT NULL,
    Availability BOOL NOT NULL, -- for scheduling
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- For the pharmacy providers and super admin
CREATE TABLE Pharmacies (
	Pharm_ID INT AUTO_INCREMENT PRIMARY KEY, -- super admin will have id 0
    Company_Name VARCHAR(50) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Zip INT NOT NULL,
    Work_Hours JSON NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PW VARCHAR(255) NOT NULL,
    CHECK (Zip > 10000 AND Zip < 99999),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- for users who are paitents
CREATE TABLE PatientBase (
    Patient_ID INT AUTO_INCREMENT PRIMARY KEY,
    Pharm_ID INT NOT NULL,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    PW VARCHAR(255) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    Zip INT NOT NULL,
    Doctor_ID INT,
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    FOREIGN KEY (Pharm_ID) REFERENCES Pharmacies(Pharm_ID),
    CHECK (Zip > 10000 AND Zip < 99999),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Surevy results used to denote patient progress
CREATE TABLE PatientDailySurvey (
    Patient_ID INT NOT NULL,
    Survey_Date DATE NOT NULL,
    PRIMARY KEY (Patient_ID, Survey_Date), -- composite key to find current metrics and the patient it belongs to
    Weight FLOAT NOT NULL,
    Caloric_Intake INT NOT NULL, 
    Water_Intake INT NOT NULL,
    Mood INT NOT NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    CHECK (Mood > 0 AND Mood < 6),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- For doctor pricing
CREATE TABLE Tiers (
	Tier_ID INT AUTO_INCREMENT PRIMARY KEY,
	Doctor_ID INT NOT NULL,
    Tier ENUM('Basic','Plus','Premium') NOT NULL,
    Service TEXT NOT NULL,
    Cost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A record of all appointments made
CREATE TABLE Appointments (
    Appointment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Doctor_ID INT NOT NULL,
    Date_Scheduled DATE NOT NULL,
    Appt_Date DATE NOT NULL,
    Appt_Time VARCHAR(255) NOT NULL,
    Doctors_Feedback TEXT,
    Tier ENUM('Basic','Plus','Premium') NOT NULL,
    Appt_Start Bool default false,
    Appt_End Bool default false,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Doctor avalibility
CREATE TABLE DoctorSchedules (
	Doctor_ID INT PRIMARY KEY,
    Doctor_Schedule JSON NOT NULL,
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- record for preliminary forms
CREATE TABLE Preliminaries (
    Patient_ID INT NOT NULL,
    Symptoms JSON NOT NULL, -- list of symptoms for preliminary
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- storage for currently exercises
CREATE TABLE ExerciseBank (
	Exercise_ID INT AUTO_INCREMENT PRIMARY KEY,
    Exercise_Name VARCHAR(50) NOT NULL,
    Muscle_Group VARCHAR(50) NOT NULL,
    Image VARCHAR(255), 				-- will be changed to account for multer
    Exercise_Description TEXT NOT NULL,
    Exercise_Class ENUM('Upper Body', 'Lower Body', 'Core', 'Full-Body & HIIT', 
    'Endurance & Cardio', 'Flexibility & Yoga') NOT NULL,
    Sets INT NOT NULL,
    Reps INT NOT NULL,
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A weekly exercise plan for patients
CREATE TABLE Regiments (
	Patient_ID INT NOT NULL PRIMARY KEY,
    Regiment JSON NOT NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Basic fourm that holds new exercises to be inserted to the exercise bank
CREATE TABLE Forum_Posts (
	Forum_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Exercise_ID INT NOT NULL,
    Forum_Text TEXT NOT NULL,
    Date_Posted DATE NOT NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Exercise_ID) REFERENCES ExerciseBank(Exercise_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- comments for fourm post above
CREATE TABLE Comments (
	Comment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Forum_ID INT NOT NULL,
    Comment_Text TEXT NOT NULL,
    Date_Posted DATE NOT NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Forum_ID) REFERENCES Forum_Posts(Forum_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Basic reviews sent by paitents to note doctors
CREATE TABLE Reviews (
	Review_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Doctor_ID INT NOT NULL,
    Review_Text TEXT NOT NULL,
    Date_Posted DATE NOT NULL, -- will be the same for create_date
    Rating INT NOT NULL,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    CHECK (Rating >= 0 AND Rating < 6),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- storage for any and all pills perscribable
CREATE TABLE PillBank (
	Pill_ID INT AUTO_INCREMENT PRIMARY KEY,
    Cost DECIMAL(10,2) NOT NULL,
    Pill_Name VARCHAR(255) NOT NULL,
    Pharm_ID INT NOT NULL,
    Dosage INT NOT NULL,
    FOREIGN KEY (Pharm_ID) REFERENCES Pharmacies(Pharm_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- record for all patient prescriptions
CREATE TABLE Prescription (
	Prescription_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Pill_ID INT NOT NULL,
    Quantity INT NOT NULL,
    Doctor_ID INT NOT NULL,
    FOREIGN KEY (Pill_ID) REFERENCES PillBank(Pill_ID),
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- record for all payments for doctor's appointments and pills
CREATE TABLE Payments (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
    Card_Number VARCHAR(255) NOT NULL,
    Related_ID INT NOT NULL, -- Can be an Appointment_ID or Prescription_ID
    Payment_Type ENUM('Appointment', 'Prescription') NOT NULL, 		-- denotes if a paitent is billed for the appointment or their pills
    Payment_Status ENUM('Pending', 'Paid', 'Failed') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- record for all logins for any kind of user
CREATE TABLE AuthAttempts (
    Login_ID INT AUTO_INCREMENT PRIMARY KEY,
	UserEmail varchar(255) NOT NULL,  -- Email from Patient, Doctor, or Pharmacist table    UserType ENUM('Patient', 'Doctor', 'Pharmacist') NOT NULL,  -- Identifies the table source
    Login_Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Success_Status BOOL NOT NULL,
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- record for any changes madeby users
CREATE TABLE AuditLog (
	Event_ID INT AUTO_INCREMENT PRIMARY KEY, 
    UserID INT NOT NULL,
    UserType ENUM('Patient', 'Doctor', 'Pharmacist') NOT NULL,
    Event_Type VARCHAR(50) NOT NULL,
    Event_Details TEXT,
    Event_Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Messages for chatroom, can be used for doctor feedback
CREATE TABLE Messages (
    Message_ID INT AUTO_INCREMENT PRIMARY KEY,
    Appointment_ID INT,
    SenderID INT NOT NULL,
    SenderName varchar(255) Not Null,
    SenderType ENUM('Patient', 'Doctor') NOT NULL,
    Message TEXT NOT NULL,
    Sent_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Appointment_ID) REFERENCES Appointments(Appointment_ID) ON DELETE CASCADE
);

CREATE TABLE Requests ( -- for appointments 
    Request_ID INT AUTO_INCREMENT PRIMARY KEY,
    Patient_ID INT NOT NULL,
	Doctor_ID INT NOT NULL,
    Request_Status ENUM('Pending', 'Accepted', 'Rejected') NOT NULL,
    Appt_Date DATE NOT NULL,
    Appt_Time VARCHAR(255) NOT NULL,
    Tier ENUM('Basic','Plus','Premium') NOT NULL,
    Last_Update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Create_Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Patient_ID) REFERENCES PatientBase(Patient_ID),
    FOREIGN KEY (Doctor_ID) REFERENCES DoctorBase(Doctor_ID)
);

-- Base Mock data --
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (1, '969-27-063938', 'Welch', 'Gouldbourn', 'Bariatric Surgeon', 'wgouldbourn0@facebook.com', '825-866-4212', SHA2(CONCAT('dU0/Ib46m#9d'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (2, '277-31-716244', 'Myrvyn', 'Rubroe', 'Dietitian', 'mrubroe1@state.gov', '154-748-2473', SHA2(CONCAT('nG5,.0O7'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (3, '930-98-425492', 'Jerome', 'Garie', 'Dietitian', 'jgarie2@wisc.edu', '655-939-2965', SHA2(CONCAT('xF1/&9i.'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (4, '181-07-647192', 'Emmit', 'Gillani', 'Dietitian', 'egillani3@yelp.com', '960-224-6083', SHA2(CONCAT('nC6,lMWe?=CI7/C+'), 256), false, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (5, '611-29-457421', 'Puff', 'Golagley', 'Nutritionist', 'pgolagley4@msn.com', '507-282-0477', SHA2(CONCAT('bG4&JuL!'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (6, '127-25-734148', 'Osbourn', 'Guynemer', 'Nutritionist', 'oguynemer5@wix.com', '792-447-7545', SHA2(CONCAT('sB4?sL#O9_lIoU,g'), 256), false, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (7, '106-06-016894', 'Peggie', 'Okroy', 'Bariatric Surgeon', 'pokroy6@aol.com', '289-643-0140', SHA2(CONCAT('lS7./|.Wvr1*4/qX'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (8, '853-70-731531', 'Ashli', 'Campbell-Dunlop', 'Bariatric Surgeon', 'acampbelldunlop7@oakley.com', '944-328-7026', SHA2(CONCAT('wH2''4rSE'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (9, '489-05-676201', 'Herschel', 'Knath', 'Endocrinologist', 'hknath8@foxnews.com', '639-535-1991', SHA2(CONCAT('sF6(#ehzE7'), 256), true, current_timestamp(), current_timestamp());
insert into DoctorBase (Doctor_ID, License_Serial, First_Name, Last_Name, Specialty, Email, Phone, PW, Availability, Last_Update, Create_Date) values (10, '194-33-719161', 'Lianna', 'Lannon', 'Dietitian', 'llannon9@abc.net.au', '633-125-1827', SHA2(CONCAT('eE5=0#_W_ulD7E8,'), 256), false, current_timestamp(), current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (1, 'Sandoz Inc', '65181 Upham Court', '88010', '{"Monday": ["09:00-12:00", "14:00-17:00"],"Tuesday": ["10:00-13:00"],"Wednesday": ["08:00-12:00", "13:00-15:00"],"Thursday": ["09:00-11:00"],"Friday": ["10:00-16:00"],"Saturday": [],"Sunday": []}', 'droeby0@hugedomains.com', SHA2(CONCAT('cA0''YI/%{9%R>z59'), 256), current_timestamp(), current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (2, 'Hyland''s', '05 Spohn Center', '88010', '{"Monday": ["08:00-11:00", "13:00-16:00"], "Tuesday": ["09:00-12:00", "14:00-17:00"], "Wednesday": ["10:00-13:00"], "Thursday": ["08:00-12:00", "13:00-15:00"], "Friday": ["09:00-11:00", "12:00-14:00"], "Saturday": [], "Sunday": []}', 'nmacgeaney1@sun.com', SHA2(CONCAT('sP2,G0%E/j!c!'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (3, 'A-S Medication Solutions LLC', '84 Porter Plaza', '88011', '{"Monday": ["07:00-10:00", "12:00-15:00"], "Tuesday": ["08:00-11:00", "13:00-16:00"], "Wednesday": ["09:00-12:00", "14:00-17:00"], "Thursday": ["10:00-13:00"], "Friday": ["11:00-14:00", "15:00-18:00"], "Saturday": [], "Sunday": []}', 'mcoopey2@businesswire.com', SHA2(CONCAT('dG8~`SOx/j=N/`Z'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (4, 'WOONSOCKET PRESCRIPTION CENTER,INCORPORATED', '0 Jenna Pass', '88012', '{"Monday": ["06:00-09:00", "11:00-14:00"], "Tuesday": ["07:00-10:00", "12:00-15:00"], "Wednesday": ["08:00-11:00", "13:00-16:00"], "Thursday": ["09:00-12:00", "14:00-17:00"], "Friday": ["10:00-13:00"], "Saturday": [], "Sunday": []}', 'yculshew3@yelp.com', SHA2(CONCAT('rF9>3EQPc,Y4(HUF'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (5, 'Allure Labs, Inc.', '92506 Forest Run Avenue', '88013', '{"Monday": ["10:00-13:00", "15:00-18:00"], "Tuesday": ["11:00-14:00", "16:00-19:00"], "Wednesday": ["12:00-15:00"], "Thursday": ["13:00-16:00", "17:00-20:00"], "Friday": ["14:00-17:00"], "Saturday": [], "Sunday": []}', 'tswyre4@typepad.com', SHA2(CONCAT('oT0)/N"mx9/Hr'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (6, 'Preferred Pharmaceuticals, Inc.', '8430 Esker Parkway', '88014', '{"Monday": ["09:00-12:00"], "Tuesday": ["10:00-13:00"], "Wednesday": ["08:00-12:00", "14:00-16:00"], "Thursday": ["09:00-11:00"], "Friday": ["10:00-15:00"], "Saturday": [], "Sunday": []}', 'bgiacomuzzi5@opensource.org', SHA2(CONCAT('nX8_UPtSut4~~brL'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (7, 'CarePluss Pharma S.A. de C.V.', '364 Mayfield Way', '88015', '{"Monday": ["07:00-10:00", "12:00-14:00"], "Tuesday": ["08:00-11:00", "13:00-15:00"], "Wednesday": ["09:00-12:00"], "Thursday": ["10:00-13:00", "14:00-16:00"], "Friday": ["11:00-14:00"], "Saturday": [], "Sunday": []}', SHA2(CONCAT('lphilipard6@npr.org'), 256), 'qZ9}$Y`7"', current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (8, 'Reckitt Benckiser LLC', '57 Barby Circle', '88016', '{"Monday": ["08:00-11:00", "13:00-15:00"], "Tuesday": ["09:00-12:00", "14:00-16:00"], "Wednesday": ["10:00-13:00"], "Thursday": ["11:00-14:00"], "Friday": ["12:00-15:00"], "Saturday": [], "Sunday": []}', 'dhatherall7@ameblo.jp', SHA2(CONCAT('gD9$Dw=4`k>z'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (9, 'Amerisource Bergen', '8942 Golf View Terrace', '88017', '{"Monday": ["09:00-12:00", "14:00-17:00"], "Tuesday": ["10:00-13:00"], "Wednesday": ["08:00-12:00", "13:00-15:00"], "Thursday": ["09:00-11:00"], "Friday": ["10:00-16:00"], "Saturday": [], "Sunday": []}', 'tborwick8@histats.com', SHA2(CONCAT('vF1!\\~T{eOU'), 256), current_timestamp(),current_timestamp());

insert into Pharmacies (Pharm_ID, Company_Name, Address, Zip, Work_Hours, Email, PW, Last_Update, Create_Date) 
values (10, 'HAMSOA PHARMACEUTICAL CO., LTD.', '872 Menomonie Center', '88018', '{"Monday": ["08:00-10:00", "12:00-14:00"], "Tuesday": ["09:00-11:00", "13:00-15:00"], "Wednesday": ["10:00-12:00"], "Thursday": ["11:00-13:00"], "Friday": ["12:00-14:00"], "Saturday": [], "Sunday": []}', 'gpope9@washingtonpost.com', SHA2(CONCAT('AD4$Zw=4`!>z'), 256), current_timestamp(),current_timestamp());

insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (1, 7, 'Chadwick', 'Dignum', 'cdignum0@ucla.edu', '574-676-0090', SHA2(CONCAT('cP0"},1la&q'), 256), '48 Artisan Alley', '88012', 9, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (2, 2, 'Crystal', 'Nunnery', 'cnunnery1@so-net.ne.jp', '468-327-9664', SHA2(CONCAT('kK2$HMPb'''), 256), '9 Loeprich Pass', '88017', 5, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (3, 9, 'Dollie', 'Driscoll', 'ddriscoll2@whitehouse.gov', '793-840-9734', SHA2(CONCAT('gK4,E)S`|nvBkrY|'), 256), '1418 Welch Street', '88018', 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (4, 2, 'Abraham', 'Banbridge', 'abanbridge3@unicef.org', '770-598-3527', SHA2(CONCAT('hT4#A>iu)'), 256), '6998 8th Lane', '88016', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (5, 4, 'Olly', 'De''Ath', 'odeath4@google.it', '708-749-1823', SHA2(CONCAT('kS9+YB(6(+'), 256), '25874 Anzinger Point', '88019', 4, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (6, 7, 'Jilleen', 'Crevagh', 'jcrevagh5@businessinsider.com', '925-283-0784', SHA2(CONCAT('nG8/?zyI+z&x{'), 256), '89894 Bunker Hill Avenue', '88019', 9, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (7, 8, 'Saree', 'O''Kieran', 'sokieran6@ask.com', '724-472-9153', SHA2(CONCAT('mZ8$/''iNK'), 256), '58548 Mallory Crossing', '88017', 7, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (8, 10, 'Carlynne', 'Jellicorse', 'cjellicorse7@webs.com', '662-608-0259', SHA2(CONCAT('bY8.w$&W6J'), 256), '497 Dixon Avenue', '88016', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (9, 7, 'Krishna', 'Camfield', 'kcamfield8@tripod.com', '438-646-7923', SHA2(CONCAT('dI8?5RAh|0UA)tf'), 256), '0269 Goodland Center', '88018', 4, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (10, 3, 'Billi', 'Pottberry', 'bpottberry9@phoca.cz', '193-172-1402', SHA2(CONCAT('zE6#ZSDoFPSaZ'), 256), '3 Lyons Point', '88017', 7, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (11, 4, 'Kalie', 'Riply', 'kriplya@google.nl', '733-127-6875', SHA2(CONCAT('iE2$!d&Pbk'), 256), '34177 La Follette Place', '88019', 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (12, 1, 'Hermie', 'Softley', 'hsoftleyb@etsy.com', '901-472-4249', SHA2(CONCAT('sC6@lG<cBVK+z4y'), 256), '982 Harbort Circle', '88016', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (13, 8, 'Eve', 'Foker', 'efokerc@weather.com', '197-736-8390', SHA2(CONCAT('kL7{N0nr"k'), 256), '29 Dryden Park', '88019', 10, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (14, 6, 'Poppy', 'Seaborn', 'pseabornd@cocolog-nifty.com', '128-315-0583', SHA2(CONCAT('yY7@JJ~?Nm*k~'), 256), '329 Spohn Park', '88014', 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (15, 2, 'Nollie', 'Cristoforetti', 'ncristoforettie@weibo.com', '355-371-5165', SHA2(CONCAT('sS6>7iLCH}$''H5S9'), 256), '735 Warner Parkway', '88014', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (16, 1, 'Harriett', 'Brownsea', 'hbrownseaf@washington.edu', '969-246-1953', SHA2(CONCAT('eK5){uBQ8L5yeXl'), 256), '32240 Prairieview Junction', '88019', 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (17, 2, 'Richard', 'Fair', 'rfairg@msu.edu', '533-722-9139', SHA2(CONCAT('xX0)Q3!Y7W60~?n'), 256), '9474 West Crossing', '88010', 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (18, 4, 'Kendell', 'Domaschke', 'kdomaschkeh@newsvine.com', '439-952-9894', SHA2(CONCAT('fZ7#l/en'), 256), '6 Meadow Ridge Park', '88014', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (19, 4, 'Celka', 'Gianetti', 'cgianettii@hc360.com', '458-950-3479', SHA2(CONCAT('rU8\}4v5*r?/ZzA<'), 256), '75765 Maple Parkway', '88014', NULL, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PatientBase (Patient_ID, Pharm_ID, First_Name, Last_Name, Email, Phone, PW, Address, Zip, Doctor_ID, Last_Update, Create_Date) values (20, 8, 'Eleanore', 'Trammel', 'etrammelj@vimeo.com', '557-126-1709', SHA2(CONCAT('zG7~Vp,UQHJl'), 256), '26266 Nova Place', '88012', 8, '2025-03-11 00:00:00', '2025-03-11 00:00:00');

insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (1, 529.69, 'Ozempill (semaglutide)', 1, 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (2, 585.3, 'trifluoperazine hydrochloride', 1, 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (3, 919.76, 'Diphenhydramine HCl', 9, 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (4, 763.44, 'Witch hazel', 2, 3, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (5, 462.13, 'Dimethicone, Allantoin', 8, 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (6, 361.31, 'Oxygen', 10, 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (7, 548.45, 'Guaifenesin', 7, 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (8, 593.34, 'norethindrone acetate and ethinyl estradiol and ferrous fumarate', 9, 3, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (9, 711.48, 'potassium chloride', 4, 2, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into PillBank (Pill_ID, Cost, Pill_Name, Pharm_ID, Dosage, Last_Update, Create_Date) values (10, 552.36, 'Levofloxacin', 9, 1, '2025-03-11 00:00:00', '2025-03-11 00:00:00');

insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (1, 1, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (2, 1, 'Plus', 'Elevated Servicing',200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (3, 1, 'Premium', 'Premium Doctor-Patient Facilities', 300.0, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (4, 2, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (5, 2, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (6, 2, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (7, 3, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (8, 3, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (9, 3, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (10, 4, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (11, 4, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (12, 4, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (13, 5, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (14, 5, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (15, 5, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (16, 6, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (17, 6, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (18, 6, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (19, 7, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (20, 7, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (21, 7, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (22, 8, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (23, 8, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (24, 8, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (25, 9, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (26, 9, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (27, 9, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (28, 10, 'Basic', 'General Consultation', 100.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (29, 10, 'Plus', 'Elevated Servicing', 200.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into Tiers (Tier_ID, Doctor_ID, Tier, Service, Cost, Last_Update, Create_Date) values (30, 10, 'Premium', 'Premium Doctor-Patient Facilities', 300.00, '2025-03-11 00:00:00', '2025-03-11 00:00:00');

-- 'Upper Body', 'Lower Body', 'Core', 'Full-Body & HIIT', 'Endurance & Cardio', 'Flexibility & Yoga'
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (1, 'Battle ropes', 'Full Body', NULL, 'Alternate swinging up and down of ropes to stimulate heartrate', 4, 30, 'Full-Body & HIIT', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (2, 'Pull-ups', 'Back and Biceps', NULL, 'Use a pronated grip an a suspended bar, and pull up', 3, 5, 'Upper Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (3, 'Calf raises', 'Calves', NULL, 'Perform seated or standing calf raises', 2, 30, 'Lower Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (4, 'Mountain climbers', 'Abdominals', NULL, 'In quadrupedal stance, alternate bringing each knee to the abdoment to stimulate heartrate', 5, 60, 'core', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (5, 'Leg press', 'Quadruceps, Hamstrings, Glutes', NULL, 'Load leg press, and execute by lowering the weight and pressing hard', 3,6, 'Lower Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (6, 'Lateral Raises', 'Deltoids', NULL, 'User dumbbells or cables, raise weights to the side', 4,15, 'Upper Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (7, 'Cable Row', 'Latissimus Dorsi', NULL, 'Use a neutral grip, load a weight stack and pull cable tight to the body',2,8, 'core', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (8, 'Bench Press', 'Pectorals', NULL, 'Use a barbell, or dumbbells, press by lowering the weights on a flat bench, and pressing elbows together', 4,4, 'Upper Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (9, 'Bicycle crunches', 'Abdominals', NULL, 'In a lying position, alternate raising each knee to the abdomen to stimulate heartrate', 2,60, 'Endurance & Cardio', '2025-03-11 00:00:00', '2025-03-11 00:00:00');
insert into ExerciseBank (Exercise_ID, Exercise_Name, Muscle_Group, Image, Exercise_Description, Sets, Reps, Exercise_Class, Last_Update, Create_Date) values (10, 'Rope Pushdown', 'Triceps', NULL, 'Using a cross cable stack, or ropes, load the machine and extend the elbow to contract the tricep', 3,10, 'Upper Body', '2025-03-11 00:00:00', '2025-03-11 00:00:00');

insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (1, 1, 2, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 3, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (2, 6, 4, 'I had a great experience with this doctor and would highly recommend them.', '2025-03-21 00:00:00', 4, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (3, 2, 3, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 3, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (4, 7, 6, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 3, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (5, 6, 1, 'I had a great experience with this doctor and would highly recommend them.', '2025-03-21 00:00:00', 3, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (6, 10, 5, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 1, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (7, 7, 5, 'I had a great experience with this doctor and would highly recommend them.', '2025-03-21 00:00:00', 3, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (8, 4, 9, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 4, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (9, 8, 2, 'I had a great experience with this doctor and would highly recommend them.', '2025-03-21 00:00:00', 2, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (10, 2, 1, 'The doctor was very knowledgeable and caring.', '2025-03-21 00:00:00', 4, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (11, 9, 8, 'The doctor was very knowledgeable and caring.', '2025-03-21 00:00:00', 5, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (12, 4, 3, 'The doctor was very knowledgeable and caring.', '2025-03-21 00:00:00', 4, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (13, 7, 2, 'The doctor was very knowledgeable and caring.', '2025-03-21 00:00:00', 2, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (14, 3, 7, 'The staff was friendly and the doctor took the time to listen to my concerns.', '2025-03-21 00:00:00', 4, '2025-03-21 00:00:00', '2025-03-21 00:00:00');
insert into Reviews (Review_ID, Patient_ID, Doctor_ID, Review_Text, Date_Posted, Rating, Last_Update, Create_Date) values (15, 8, 3, 'The doctor was very knowledgeable and caring.', '2025-03-21 00:00:00', 5, '2025-03-21 00:00:00', '2025-03-21 00:00:00');

INSERT INTO DoctorSchedules (Doctor_ID, Doctor_Schedule) VALUES 
(1, '{
    "Sunday": [],
    "Monday": ["8:30-9:30", "9:30-10:30", "10:30-11:30", "1:00-2:00", "3:00-4:00"],
    "Tuesday": ["9:00-10:00", "11:00-12:00", "1:00-2:00", "2:00-3:00", "4:00-5:00"],
    "Wednesday": ["9:00-10:00", "10:00-11:00", "12:00-1:00", "1:00-2:00", "3:00-4:00"],
    "Thursday": ["10:00-11:00", "11:00-12:00", "1:00-2:00", "2:00-3:00", "4:00-5:00"],
    "Friday": ["9:00-10:00", "10:00-11:00", "11:00-12:00"],
    "Saturday": []
}'),
(2, '{
    "Sunday": [],
    "Monday": ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00"],
    "Tuesday": ["8:30-9:30", "9:30-10:30", "10:30-11:30", "1:00-2:00", "3:00-4:00"],
    "Wednesday": ["9:30-10:30", "10:30-11:30", "11:30-12:30", "2:00-3:00"],
    "Thursday": ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "4:00-5:00"],
    "Friday": ["10:00-11:00", "11:00-12:00"],
    "Saturday": []
}'),
(3, '{
    "Sunday": [],
    "Monday": ["8:00-9:00", "9:00-10:00", "11:00-12:00", "1:00-2:00"],
    "Tuesday": ["10:00-11:00", "11:00-12:00", "1:00-2:00", "2:00-3:00"],
    "Wednesday": ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00"],
    "Thursday": ["8:30-9:30", "9:30-10:30", "1:30-2:30", "3:30-4:30"],
    "Friday": ["9:00-10:00"],
    "Saturday": []
}'),
(4, '{
    "Sunday": [],
    "Monday": ["9:00-10:00", "10:00-11:00", "12:00-1:00", "1:00-2:00"],
    "Tuesday": ["8:00-9:00", "9:00-10:00", "10:00-11:00", "1:00-2:00"],
    "Wednesday": ["10:00-11:00", "11:00-12:00", "2:00-3:00"],
    "Thursday": ["9:30-10:30", "10:30-11:30", "11:30-12:30", "1:30-2:30"],
    "Friday": [],
    "Saturday": []
}'),
(5, '{
    "Sunday": [],
    "Monday": ["10:00-11:00", "11:00-12:00", "1:00-2:00", "3:00-4:00"],
    "Tuesday": ["9:30-10:30", "10:30-11:30", "2:00-3:00", "3:00-4:00"],
    "Wednesday": ["9:00-10:00", "11:00-12:00", "12:00-1:00", "1:00-2:00"],
    "Thursday": ["8:30-9:30", "9:30-10:30", "11:30-12:30", "3:30-4:30"],
    "Friday": ["9:00-10:00"],
    "Saturday": []
}'),
(6, '{
    "Sunday": [],
    "Monday": ["8:00-9:00", "9:00-10:00", "11:00-12:00", "12:00-1:00"],
    "Tuesday": ["9:30-10:30", "10:30-11:30", "1:30-2:30"],
    "Wednesday": ["9:00-10:00", "10:00-11:00", "2:00-3:00"],
    "Thursday": ["10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00"],
    "Friday": [],
    "Saturday": []
}'),
(7, '{
    "Sunday": [],
    "Monday": ["9:30-10:30", "10:30-11:30", "1:00-2:00", "3:00-4:00"],
    "Tuesday": ["8:00-9:00", "9:00-10:00", "11:00-12:00", "2:00-3:00"],
    "Wednesday": ["9:00-10:00", "10:00-11:00", "12:00-1:00", "2:00-3:00"],
    "Thursday": ["8:30-9:30", "9:30-10:30", "10:30-11:30", "1:30-2:30"],
    "Friday": [],
    "Saturday": []
}'),
(8, '{
    "Sunday": [],
    "Monday": ["8:30-9:30", "9:30-10:30", "10:30-11:30", "12:30-1:30"],
    "Tuesday": ["10:00-11:00", "11:00-12:00", "2:00-3:00"],
    "Wednesday": ["8:30-9:30", "9:30-10:30", "11:00-12:00"],
    "Thursday": ["9:00-10:00", "10:00-11:00", "12:00-1:00"],
    "Friday": ["8:00-9:00"],
    "Saturday": []
}'),
(9, '{
    "Sunday": [],
    "Monday": ["9:00-10:00", "10:00-11:00", "12:00-1:00", "1:00-2:00"],
    "Tuesday": ["8:30-9:30", "9:30-10:30", "11:00-12:00", "2:00-3:00"],
    "Wednesday": ["10:00-11:00", "11:00-12:00", "1:00-2:00", "3:00-4:00"],
    "Thursday": ["9:30-10:30", "10:30-11:30", "11:30-12:30", "1:30-2:30"],
    "Friday": [],
    "Saturday": []
}'),
(10, '{
    "Sunday": [],
    "Monday": ["8:00-9:00", "9:00-10:00", "10:00-11:00", "1:00-2:00"],
    "Tuesday": ["9:30-10:30", "10:30-11:30", "1:30-2:30"],
    "Wednesday": ["9:00-10:00", "10:00-11:00", "11:00-12:00", "2:00-3:00"],
    "Thursday": ["10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00"],
    "Friday": ["9:00-10:00"],
    "Saturday": []
}');

INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (2, 2, 'This is my favorite upper body movement, the Pull-Up. It builds the entire back. From the rhomboids to the lats, you feel the burn the whole time.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (3, 1, 'TBattle ropes have built my endurance and helped me lose so much body fat!', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (4, 4, 'Mountain climbers really push me to build my abs, and the whole time I feel like Im doing cardio, give it a try!', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (5, 3, 'Hate training calves, but gotta do em, Lol - Here are calf raises.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (6, 6, 'Lo-and-behold the king of building a wide body frame, lateral raises. Do them in a higher rep range for a crazy pump, and use a light weight!', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (7, 5, 'The leg press is a great exercise for lower body hypertrophy if you havent learned how to squat yet, or even just to switch up things on leg day, give it a shot.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (8, 8, 'Chest day every day baby, the barbell Bench Press is the golden strength standard.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (9, 7, 'The cable row targets the lower and middle lats, but be sure to use a heavy weight and maintain a straight back posture.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (10, 10, 'The tricep makes up 2/3 of the arm, if you want big arms, do these tricep pushdowns.', CURRENT_DATE);
INSERT INTO Forum_Posts (Patient_ID, Exercise_ID, Forum_Text, Date_Posted) VALUES (1, 9, 'Bicycle crunches are a great way to train the core, from novice to advanced, try them out.', CURRENT_DATE);

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (1,
'{
    "Sunday":[],
    "Monday": ["Bench Press", "Rope Pushdown"],
    "Tuesday": ["Leg Press", "Bicycle crunches", "Calf raises"],
    "Wednesday": ["Cable Row", "Lateral Raises"],
    "Thursday": ["Battle ropes", "Mountain climbers"],
    "Friday": ["Pull-ups"],
    "Saturday":[]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (2,
'{
    "Sunday":["Bench Press", "Calf raises"],
    "Monday":[],
    "Tuesday": ["Battle ropes", "Mountain climbers"],
    "Wednesday": ["Lateral Raises"],
    "Thursday": ["Leg press", "Bicycle crunches"],
    "Friday": ["Pull-ups", "Cable Row"],
    "Saturday":["Rope Pushdown"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (3,
'{
    "Sunday":["Mountain climbers", "Bicycle crunches"],
    "Monday":["Cable Row"],
    "Tuesday": [],
    "Wednesday": ["Battle ropes", "Lateral Raises"],
    "Thursday": ["Pull-ups"],
    "Friday": ["Bench Press", "Rope Pushdown"],
    "Saturday":["Leg press"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (4,
'{
    "Sunday":[],
    "Monday":["Bench Press", "Cable Row"],
    "Tuesday": ["Leg press", "Calf raises"],
    "Wednesday": [],
    "Thursday": ["Bicycle crunches", "Mountain climbers"],
    "Friday": ["Lateral Raises"],
    "Saturday":["Pull-ups", "Battle ropes"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (5,
'{
    "Sunday":["Lateral Raises"],
    "Monday":[],
    "Tuesday": ["Bench Press", "Pull-ups"],
    "Wednesday": ["Leg press"],
    "Thursday": ["Cable Row"],
    "Friday": ["Rope Pushdown", "Battle ropes"],
    "Saturday":["Mountain climbers", "Bicycle crunches"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (6,
'{
    "Sunday":["Pull-ups"],
    "Monday":["Battle ropes"],
    "Tuesday": [],
    "Wednesday": ["Calf raises", "Leg press"],
    "Thursday": ["Cable Row", "Bicycle crunches"],
    "Friday": ["Lateral Raises"],
    "Saturday":["Bench Press"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (7,
'{
    "Sunday":["Bench Press", "Battle ropes"],
    "Monday":["Mountain climbers"],
    "Tuesday": ["Cable Row"],
    "Wednesday": [],
    "Thursday": ["Pull-ups", "Rope Pushdown"],
    "Friday": ["Leg press", "Bicycle crunches"],
    "Saturday":["Calf raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (8,
'{
    "Sunday":[],
    "Monday":["Calf raises"],
    "Tuesday": ["Mountain climbers", "Bench Press"],
    "Wednesday": ["Rope Pushdown"],
    "Thursday": ["Battle ropes"],
    "Friday": ["Bicycle crunches", "Lateral Raises"],
    "Saturday":["Pull-ups"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (9,
'{
    "Sunday":["Leg press", "Cable Row"],
    "Monday":["Bench Press"],
    "Tuesday": ["Pull-ups"],
    "Wednesday": [],
    "Thursday": ["Mountain climbers", "Calf raises"],
    "Friday": ["Rope Pushdown"],
    "Saturday":["Battle ropes", "Lateral Raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (10,
'{
    "Sunday":["Cable Row"],
    "Monday":["Mountain climbers", "Bench Press"],
    "Tuesday": [],
    "Wednesday": ["Pull-ups", "Calf raises"],
    "Thursday": ["Bicycle crunches", "Battle ropes"],
    "Friday": ["Rope Pushdown"],
    "Saturday":["Leg press", "Lateral Raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (11,
'{
    "Sunday":[],
    "Monday":["Bench Press", "Cable Row"],
    "Tuesday": ["Bicycle crunches", "Lateral Raises"],
    "Wednesday": ["Mountain climbers"],
    "Thursday": ["Pull-ups", "Battle ropes"],
    "Friday": ["Rope Pushdown"],
    "Saturday":["Calf raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (12,
'{
    "Sunday":["Battle ropes"],
    "Monday":[],
    "Tuesday": ["Mountain climbers", "Calf raises"],
    "Wednesday": ["Pull-ups", "Bicycle crunches"],
    "Thursday": ["Bench Press"],
    "Friday": ["Cable Row"],
    "Saturday":["Leg press", "Lateral Raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (13,
'{
    "Sunday":["Lateral Raises"],
    "Monday":["Bicycle crunches", "Pull-ups"],
    "Tuesday": [],
    "Wednesday": ["Leg press", "Calf raises"],
    "Thursday": ["Mountain climbers"],
    "Friday": ["Battle ropes", "Rope Pushdown"],
    "Saturday":["Bench Press"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (14,
'{
    "Sunday":["Cable Row", "Pull-ups"],
    "Monday":["Bench Press"],
    "Tuesday": ["Battle ropes"],
    "Wednesday": [],
    "Thursday": ["Bicycle crunches", "Calf raises"],
    "Friday": ["Mountain climbers"],
    "Saturday":["Leg press", "Lateral Raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (15,
'{
    "Sunday":[],
    "Monday":["Leg press", "Rope Pushdown"],
    "Tuesday": ["Cable Row"],
    "Wednesday": ["Mountain climbers", "Bicycle crunches"],
    "Thursday": ["Pull-ups"],
    "Friday": ["Calf raises", "Lateral Raises"],
    "Saturday":["Bench Press"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (16,
'{
    "Sunday":["Rope Pushdown", "Battle ropes"],
    "Monday":["Bicycle crunches"],
    "Tuesday": [],
    "Wednesday": ["Leg press"],
    "Thursday": ["Pull-ups", "Bench Press"],
    "Friday": ["Mountain climbers", "Cable Row"],
    "Saturday":["Calf raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (17,
'{
    "Sunday":["Lateral Raises", "Pull-ups"],
    "Monday":[],
    "Tuesday": ["Bench Press"],
    "Wednesday": ["Bicycle crunches", "Mountain climbers"],
    "Thursday": ["Battle ropes", "Calf raises"],
    "Friday": ["Cable Row"],
    "Saturday":["Leg press", "Rope Pushdown"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (18,
'{
    "Sunday":[],
    "Monday":["Bench Press", "Leg press"],
    "Tuesday": ["Calf raises"],
    "Wednesday": ["Battle ropes"],
    "Thursday": ["Cable Row", "Lateral Raises"],
    "Friday": ["Mountain climbers", "Bicycle crunches"],
    "Saturday":["Pull-ups"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (19,
'{
    "Sunday":["Bench Press", "Bicycle crunches"],
    "Monday":["Mountain climbers"],
    "Tuesday": [],
    "Wednesday": ["Pull-ups"],
    "Thursday": ["Battle ropes", "Cable Row"],
    "Friday": ["Leg press", "Calf raises"],
    "Saturday":["Lateral Raises"]
}');

INSERT INTO Regiments (Patient_ID, Regiment) VALUES (20,
'{
    "Sunday":[],
    "Monday":["Battle ropes", "Pull-ups"],
    "Tuesday": ["Rope Pushdown"],
    "Wednesday": ["Bench Press", "Lateral Raises"],
    "Thursday": ["Calf raises", "Bicycle crunches"],
    "Friday": ["Leg press"],
    "Saturday":["Mountain climbers", "Cable Row"]
}');

INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (2, 5, CURRENT_DATE, '2025-03-28', '9:00-10:00', 'Basic', 'Cut back on the late night pies', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (11, 2, CURRENT_DATE, '2025-04-28', '12:00-1:00', 'Basic', 'Make sure to do cardio 2x a week', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier)  VALUES (5, 4, CURRENT_DATE, '2025-05-25', '1:00-2:00', 'Premium');
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier)  VALUES (7, 7, CURRENT_DATE, '2025-07-18', '2:00-3:00', 'Plus');
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier)  VALUES (5, 4, CURRENT_DATE, '2025-12-13', '5:00-6:00', 'Premium');
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (9, 4, CURRENT_DATE, '2025-04-05', '4:00-5:00', 'Basic', 'Stick to your regiment', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (17, 1, CURRENT_DATE, '2025-04-06', '1:00-2:00', 'Plus', 'Drink more fluids', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier)  VALUES (20, 8, CURRENT_DATE, '2025-07-15', '8:00-9:00', 'Basic');
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier)  VALUES (11, 2, CURRENT_DATE, '2025-06-09', '7:00-8:00', 'Plus');
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (13, 10, CURRENT_DATE, '2025-03-12', '11:00-12:00', 'Premium', 'Take your medication with some water', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (1, 9, CURRENT_DATE, '2025-03-12', '11:00-12:00', 'Premium', 'Take your medication with some water', 1, 1);
INSERT INTO Appointments (Patient_ID, Doctor_ID, Date_Scheduled, Appt_Date, Appt_Time, Tier, Doctors_Feedback, Appt_Start, Appt_End)  VALUES (1, 9, CURRENT_DATE, '2025-03-20', '1:00-2:00', 'Premium', 'Continue to Take your medication with some water', 1, 1);


insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (1, '2025-04-15', 178, 3123, 190, 3.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (2, '2025-04-07', 225, 3440, 110, 2.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (3, '2025-04-13', 238, 2758, 26, 2.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (4, '2025-04-04', 175, 5114, 56, 4.8);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (5, '2025-04-09', 227, 934, 173, 3.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (6, '2025-04-09', 227, 4415, 10, 3.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (7, '2025-04-09', 139, 1638, 0, 3.7);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (8, '2025-04-11', 104, 5949, 24, 3.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (9, '2025-04-14', 242, 4350, 135, 2.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (10, '2025-04-01', 212, 2153, 27, 4.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (11, '2025-04-08', 238, 5398, 116, 4.2);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (12, '2025-04-03', 101, 3500, 157, 4.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (13, '2025-04-11', 224, 5686, 2, 4.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (14, '2025-04-14', 141, 1543, 152, 4.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (15, '2025-04-10', 126, 4362, 11, 1.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (16, '2025-04-07', 201, 4817, 213, 1.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (17, '2025-04-11', 244, 3814, 239, 3.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (18, '2025-04-11', 147, 5976, 68, 0.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (19, '2025-04-02', 184, 5889, 83, 3.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (20, '2025-04-02', 113, 3407, 175, 1.4);

insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (1, '2025-04-03', 195, 3885, 185, 4.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (2, '2025-04-09', 109, 3628, 23, 3.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (3, '2025-04-16', 244, 3089, 48, 2.8);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (4, '2025-04-15', 148, 5071, 223, 3.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (5, '2025-04-07', 220, 5803, 44, 1.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (6, '2025-04-16', 207, 2448, 146, 1.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (7, '2025-04-02', 132, 1750, 180, 3.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (8, '2025-04-13', 134, 5182, 2, 4.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (9, '2025-04-11', 235, 5677, 198, 0.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (10, '2025-04-14', 113, 890, 2, 3.4);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (11, '2025-04-15', 231, 3133, 93, 3.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (12, '2025-04-06', 213, 1433, 60, 4.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (13, '2025-04-12', 230, 4058, 58, 1.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (14, '2025-04-12', 153, 4972, 96, 2.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (15, '2025-04-03', 213, 4854, 224, 2.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (16, '2025-04-06', 118, 1371, 8, 1.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (17, '2025-04-14', 144, 5684, 40, 0.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (18, '2025-04-03', 172, 1027, 84, 2.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (19, '2025-04-04', 154, 5342, 98, 2.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (20, '2025-04-14', 188, 3022, 137, 4.7);

insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (1, '2025-04-02', 244, 1450, 32, 3.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (2, '2025-04-16', 211, 4730, 223, 4.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (3, '2025-04-09', 167, 2721, 189, 2.5);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (4, '2025-04-05', 160, 3828, 70, 2.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (5, '2025-04-05', 191, 5049, 97, 2.9);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (6, '2025-04-01', 200, 5930, 119, 2.1);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (7, '2025-04-10', 135, 4510, 157, 4.3);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (8, '2025-04-01', 228, 3780, 205, 3.0);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (9, '2025-04-08', 229, 2747, 186, 3.7);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (10, '2025-04-05', 100, 3303, 162, 0.7);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (11, '2025-04-06', 217, 2426, 253, 1.7);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (12, '2025-04-13', 121, 1219, 121, 3.7);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (13, '2025-04-10', 146, 2740, 56, 1.4);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (14, '2025-04-15', 161, 1208, 203, 2.4);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (15, '2025-04-11', 126, 2868, 227, 0.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (16, '2025-04-04', 148, 4469, 134, 4.2);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (17, '2025-04-10', 133, 4068, 143, 4.4);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (18, '2025-04-04', 198, 1555, 238, 3.6);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (19, '2025-04-15', 246, 1992, 17, 1.4);
insert into PatientDailySurvey (Patient_ID, Survey_Date, Weight, Caloric_Intake, Water_Intake, Mood) values (20, '2025-04-03', 181, 5726, 187, 3.3);

INSERT INTO Payments (Patient_ID, Card_Number, Related_ID, Payment_Type, Payment_Status) VALUES (2, '4111 1111 1111 1111', 1, 'Appointment', 'Paid');
INSERT INTO Payments (Patient_ID, Card_Number, Related_ID, Payment_Type, Payment_Status) VALUES (11, '5555 5555 5555 4444', 2, 'Appointment', 'Paid');
INSERT INTO Payments (Patient_ID, Card_Number, Related_ID, Payment_Type, Payment_Status) VALUES (9, '3782 822463 10005', 6, 'Appointment', 'Paid');
INSERT INTO Payments (Patient_ID, Card_Number, Related_ID, Payment_Type, Payment_Status) VALUES (17, '6011 0009 9013 9424', 7, 'Appointment', 'Paid');
INSERT INTO Payments (Patient_ID, Card_Number, Related_ID, Payment_Type, Payment_Status) VALUES (13, '3530 1113 3330 0000', 10, 'Appointment', 'Paid');
