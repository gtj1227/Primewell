import { useEffect, useState } from "react";
import {Flex, Layout} from "antd"
import {  UserOutlined } from '@ant-design/icons'

const {Content, Sider} = Layout
const ReviewCard = ({info, onClick}) => {
  const [rating, setRating] = useState(0)

  useEffect(() => {
    setRating(parseFloat(info?.rating).toFixed(1))
  }, [info])
  
  return (
    <>
      {/*Format of the review cards*/}
    <div className="review-card" onClick={() => onClick(info)}>
      <Layout style={{
          borderRadius: 8,
          overflow: 'hidden',
          width: '100%',
          height: "100%",
          backgroundColor: "#FFE6E2",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)"
      }}>
        {/*Where 'Quality', squarebox containing rating, and no. of ratings will go*/}
        <Sider width="25%" style={{backgroundColor: '#FFE6E2'}}>
          <Flex vertical justify="center" align="center" gap="5px" style={{color: "#333333"}}> 
              <h2>Quality</h2> 
              <Flex justify="center" align="center"
                  style={{
                      width: 'auto',
                      borderRadius: "8px",
                      backgroundColor: rating >= 4 ? '#80ed99' : rating >= 3 ? "#fee440" : "#ef476f",
                      color: "#333333",
                      }}
                  >     
                    <p style={{ fontSize: '50px', fontWeight: 'bold', margin: 0, padding: "15px" }}>{rating}</p>
                  </Flex>
                  <p style={{fontWeight: "bold"}}>{info?.cnt} Ratings</p>
              </Flex>
          </Sider>
          <Content style={{background: "#ffe6e2", flex: 1, display: "flex", flexDirection: "column" }}>
              <Flex vertical gap="5px" justify="center" style={{margin: "20px", height:"100%"}}>
                <Flex gap="10px" align="center">
                  <img src="/MaleDoctorIcon.svg" alt="Icon" style={{width: "48px"}} />
                  <h1 style={{margin: 0, color: "#333333"}}>{`${info?.first_name} ${info?.last_name}`}</h1>
                </Flex>
                <h2 style={{margin: 0, color: "#333333"}}>{info?.specialty}</h2>   
              </Flex>
          </Content>
        </Layout>
      </div>
    </>
  )
}

export default ReviewCard;
