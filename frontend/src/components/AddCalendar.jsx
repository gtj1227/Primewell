import { Modal, Flex, Button } from "antd";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const AddCalendar = ({ open, handleClose, selectedRows, exerciseInfo, patientInfo }) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const [selectedDays, setSelectedDays] = useState([]);

    console.log("Received props in AddCalendar:", { selectedRows, exerciseInfo, patientInfo })
    useEffect(() => {
        console.log("Selected days:", selectedDays);
    }, [selectedDays]);

    const handleDayClick = useCallback((day) => {
        setSelectedDays((prevDays) =>
            prevDays.includes(day)
                ? prevDays.filter((d) => d !== day)
                : [...prevDays, day]
        );
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const Regiment = selectedRows.map((exerciseId) => {
            const exercise = exerciseInfo.find(ex => ex.Exercise_ID === exerciseId);
            return {
                exerciseName: exercise?.Exercise_Name,
                id: exerciseId,
                days: selectedDays,
                reps: exercise?.Reps,
                sets: exercise?.Sets,
                muscleGroup: exercise?.Muscle_Group,
                description: exercise?.Exercise_Description
            };
        });

        console.log("Regiment:", Regiment);
        console.log("Patient ID for Regiment:", patientInfo.patient_id);

        try {
            await axios.post(`http://localhost:3000/regiment`, { Patient_ID: patientInfo, Regiment });
            console.log("Submitted:", Regiment);
        } catch (error) {
            console.error("Error submitting regiment:", error);
        }

        if (handleClose) {
            handleClose();
        }
    };

    return (
        <Modal
            open={open}
            footer={null}
            onCancel={handleClose}
            centered
            className="style-modal"
            width={1000}
            style={{ padding: '20px' }}
        >
            <form onSubmit={handleSubmit}>
                <Flex justify="center" align="center" style={{ marginBottom: '20px' }}>
                    Select what day(s) to schedule your exercise
                </Flex>

                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ccc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {days.map((day, index) => (
                            <div key={index} style={{ width: '14.28%', textAlign: 'center' }}>
                                {day}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {days.map((day, index) => (
                            <div
                                key={index}
                                style={{
                                    width: '14.28%',
                                    height: '50px',
                                    border: '1px solid #ccc',
                                    backgroundColor: selectedDays.includes(day) ? '#FFE4E1' : '#fff',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleDayClick(day)}
                            >
                                {selectedDays.includes(day) && (
                                    <p style={{ fontSize: '12px', textAlign: 'center' }}>Selected</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                {selectedDays.length > 0 && (
                    <Flex justify="center" style={{ marginTop: '30px' }}>
                        <Button htmlType="submit" type="primary" style={{ backgroundColor: "#A8C4A2" }}>
                            Submit Schedule
                        </Button>
                    </Flex>
                )}
            </form>
        </Modal>
    );
};

export default AddCalendar;
