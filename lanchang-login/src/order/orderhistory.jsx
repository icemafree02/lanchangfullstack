import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const styles = {
  orderPage: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
  orderContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    padding: '1rem',
    width: '95%',
    maxWidth: '1200px',
    margin: '20px auto',
  },
  orderItem: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    color: 'inherit',
  },
  orderInfo: {
    padding: '1rem',
  },
  orderInfoH3: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  orderInfoP: {
    margin: '0.25rem 0',
    fontSize: '0.9rem',
    color: '#666',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    margin: '20px 0',
    padding: '0 1rem',
  },
  dateInput: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '1rem',
  },
  filterButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }
};

function OrderDisplay() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchOrders();
    getstatus();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://lanchangbackend-production.up.railway.app/getorders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setFilteredOrders(data); // Initially show all orders
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getstatus = async () => {
    try {
      const [statuses] = await Promise.all([
        fetch('https://lanchangbackend-production.up.railway.app/getstatus')
      ]);
      const [statusdata] = await Promise.all([
        statuses.json(),
      ]);
      setStatus(statusdata);
    } catch (error) {
      console.error('Error ', error);
    }
  };

  const filterOrdersDate = () => {
    let filtered = [...orders];
    
    if (startDate) {
      filtered = filtered.filter(order => 
        new Date(order.Order_datetime) >= new Date(startDate)
      );
    }
    
    if (endDate) {
      filtered = filtered.filter(order => 
        new Date(order.Order_datetime) <= new Date(endDate)
      );
    }
    
    setFilteredOrders(filtered);
  };

  const statusname = (statusId) => {
    const foundStatus = status.find(s => s.status_id === statusId);
    return foundStatus ? foundStatus.status_name : 'ไม่ระบุ';
  };

  return (
    <div style={styles.orderPage}>
      <Navbarow />
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>ประวัติออเดอร์</h1>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '20px 0', padding: '0 1rem', alignItems: 'center' }}>
        <TextField
          label="วันที่เริ่มต้น"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="วันที่สิ้นสุด"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          onClick={filterOrdersDate}
          sx={{ padding: '0.5rem 1rem', fontSize: '1rem', backgroundColor: '#007bff' }}
        >
          กรองข้อมูล
        </Button>
      </Box>
      
      <div style={styles.orderContainer}>
        {filteredOrders.map((order) => (
          <Link to={`/historydetail/${order.Order_id}`} key={order.Order_id} style={styles.orderItem}>
            <div style={styles.orderInfo}>
              <h3 style={styles.orderInfoH3}>เลขออเดอร์: {order.Order_id}</h3>
              <p style={styles.orderInfoP}>โต๊ะที่: {order.tables_id}</p>
              <p style={styles.orderInfoP}>เวลาสั่ง: {new Date(order.Order_datetime).toLocaleString()}</p>
              <p style={styles.orderInfoP}>สถานะ: {statusname(order.status_id)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default OrderDisplay;