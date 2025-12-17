import axios from "axios";
import { useState, useEffect } from "react";
import { Flex, Table } from "antd";
import "./../../App.css"

const Regiment = ({ info }) => {
    const [regimentData, setRegimentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(info)
        const fetchRegimentInfo = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/regiment/${info.patient_id}`);

                const regiment = res.data[0]?.Regiment;

                const weekdayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

                const formattedData = Object.entries(regiment)
                    .map(([day, exercises]) => ({
                        key: day,
                        day,
                        exercises: exercises.join(', ') || 'Rest',
                    }))
                    .sort((a, b) => weekdayOrder.indexOf(a.day) - weekdayOrder.indexOf(b.day));
                console.log("Patient Regiment: ", formattedData)
                setRegimentData(formattedData)
            } catch (err) {
                console.error("Error Fetching Regiment: ", err);
            } finally {
                setLoading(false);
            }
        };

        if (info?.patient_id) {
            fetchRegimentInfo();
        }
    }, [info]);

    const columns = [
        {
          title: 'Day',
          dataIndex: 'day',
          key: 'day',
        },
        {
          title: 'Exercises',
          dataIndex: 'exercises',
          key: 'exercises',
        },
    ];

    return (
        <Flex vertical justify="start" align="center" gap="60px" style={{
            background: "#ffffff", 
            borderRadius: "12px",
            padding: "33px 40px",
            width: "100%",
            // overflow: "auto",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
        }}>
            <h1 style={{color: "#333333", marginBottom: 0}}>Regiment</h1>
             <Table dataSource={regimentData} columns={columns} pagination={false} bordered style={{width: "100%", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)", borderRadius: "8px"}}/>

        </Flex>
    );
};

export default Regiment;