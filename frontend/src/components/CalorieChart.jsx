import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    Chart as ChartJS,
    BarElement,
    BarController,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip, Legend);

const CalorieChart = (props) => {
    const [patientSurveyData, setPatientSurveyData] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    const getPatientSurveyData = async () => {
        console.log(props)
        try {
            const res = await axios.get(
                `http://localhost:3000/patientsurvey/${props.info.patient_id}`
            );
            console.log("Survey Data: ", res.data);
            setPatientSurveyData(res.data);
        } catch (error) {
            console.error("Error fetching patient survey data:", error);
        }
    };

    useEffect(() => {
        getPatientSurveyData();
    }, []);

    useEffect(() => {
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Initialize sum and count arrays
        const calorieSums = new Array(7).fill(0);
        const calorieCounts = new Array(7).fill(0);

        // Calculate sums and counts per weekday
        patientSurveyData.forEach((entry) => {
            const date = new Date(entry.Survey_Date);
            const dayIndex = (date.getDay() + 6) % 7; // Shift so week starts on Monday
            calorieSums[dayIndex] += entry.Caloric_Intake;
            calorieCounts[dayIndex] += 1;
        });

        // Calculate averages
        const calorieAverages = calorieSums.map((sum, index) =>
            calorieCounts[index] > 0 ? sum / calorieCounts[index] : null
        );

        if (chartRef.current) {
            chartInstanceRef.current = new ChartJS(chartRef.current, {
                type: 'bar',
                data: {
                    labels: ["Mon", "Tue", "Wed", "Thurs", "Fri", "Sat", "Sun"],
                    datasets: [
                        {
                            label: "Caloric Intake",
                            data: calorieAverages,
                            backgroundColor: [
                                "#a78bfa",
                                "#f87171",
                                "#67e8f9",
                                "#fbbf24",
                                "#4ade80",
                                "#c084fc",
                                "#60a5fa",
                            ],
                            borderRadius: 6,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 500,
                            max: 6000,
                            ticks: {
                                stepSize: 200,
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [patientSurveyData]);

    return (
        <div
            style={{
                background: "#ffe6e6",
                borderRadius: "12px",
                padding: "33px 40px",
                width: "100%",
                height: "500px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
        >
            <canvas ref={chartRef} />
        </div>
    );
};

export default CalorieChart;