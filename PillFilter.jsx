import React, { useState, useEffect } from 'react';
import { Flex, Table, Input, Button, Tooltip, message } from 'antd';
import axios from 'axios';
import { PlusOutlined } from '@ant-design/icons';
import CreatePillModal from './CreatePillModal';

const PillFilter = ({info}) => {
  console.log("📦 info in PillFilter:", info);

  const [pillsInfo, setPillsInfo] = useState([]);
  const [searchedPill, setSearchedPill] = useState("");

  const [sent, setSent] = useState(false)
  

  useEffect(() => {
    const fetchPillsInfo = async () => {
      try {
        const res = await axios.get("http://localhost:3000/pillbank");
        setPillsInfo(res.data);
      } catch (error) {
        console.error("Error fetching pill data:", error);
      }
    };
    fetchPillsInfo();
    setSent(false)
  }, [sent]);


  const handleSearch = (e) => {
    setSearchedPill(e.target.value);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

 
  const filteredPills = pillsInfo
  .filter((pill) => !info || pill.Pharm_ID === info.pharm_id)
  .filter((pill) =>
    pill.Pill_Name.toLowerCase().includes(searchedPill.toLowerCase())
  );
 
  const [createPillModalVisible, setCreatePillModalVisible] = useState(false);
  const showCreatePillModal = () => {
    setCreatePillModalVisible(true);
  };

  const handleCreatePillCancel = () => {
    setCreatePillModalVisible(false);
  };

  const deletePill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Pill?")) return;
  
    try {
      const res = await axios.delete("http://localhost:3000/pillbank", {
        headers: {
          "Content-Type": "application/json",
        },
        data: { Pill_ID: id }, // Axios allows `data` in DELETE request, but must be explicitly set
      });
  
      if (res.status === 204) { // 204 No Content is expected
        message.success("Pill deleted successfully");
        setPillsInfo((prevPills) => prevPills.filter((pill) => pill.Pill_ID !== id));
      } else {
        throw new Error("Failed to delete pill");
      }
    } catch (err) {
      console.error("Error deleting Pill:", err);
      message.error("Error deleting Pill. Please try again.");
    }
  };
  

  const columns = [
    {
      title: 'Medicine Name',
      dataIndex: 'Pill_Name',
      sorter: (a, b) => a.Pill_Name.localeCompare(b.Pill_Name),
      width: 150,
    },
    {
      title: 'ID',
      dataIndex: 'Pill_ID',
      sorter: (a, b) => a.Pill_ID - b.Pill_ID,
      width: 150,
    },
    {
      title: 'Dosage',
      dataIndex: 'Dosage',
      sorter: (a, b) => a.Dosage - b.Dosage,
      width: 150,
    },
    {
      title: 'Cost',
      dataIndex: 'Cost',
      sorter: (a, b) => parseFloat(a.Cost) - parseFloat(b.Cost),
      width: 150,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 150,
      render: (_, record) => (
        <Button danger onClick={() => deletePill(record.Pill_ID)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <Flex>
      <Input         
        placeholder="Search by Medicine Name" 
        value={searchedPill} 
        onChange={handleSearch} 
        style={{ marginBottom: 20, width: 300, justify:"center" }}
        prefix={<img src="/searchIcon.svg" alt="Icon" style={{width: "15px", marginRight: "5px"}}
      />}
      />
      <Tooltip title="Add Medicine">
        <Button 
          style={{marginLeft:"5px"}} 
          backgroundcolor="red" 
          icon={<PlusOutlined />}
          onClick={() => {showCreatePillModal()}} />
      </Tooltip> 
      <CreatePillModal 
        open={createPillModalVisible} 
        handleClose={handleCreatePillCancel} 
        info={info}
        sent={setSent}
      />      
    </Flex>
      <Table
        columns={columns}
        dataSource={filteredPills}
        onChange={onChange}
        bordered
        size="middle"
        pagination={{ pageSize: 10 }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        rowKey="Pill_ID"
      />
      <style>
        {`
          .table-row-light {
            background-color: #fafafa;
          }
          .table-row-dark {
            background-color: #ffffff;
          }
          .ant-table-thead > tr > th {
            background-color: #f0f2f5 !important;
            font-weight: bold;
          }
        `}
      </style>
    </div>
  );
};

export default PillFilter;

