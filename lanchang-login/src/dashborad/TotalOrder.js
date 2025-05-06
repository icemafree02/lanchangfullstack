import * as React from 'react';
import Typography from '@mui/material/Typography';
import Title from './Title';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';

export default function TotalOrder({ startDate, endDate }) {
  const [totalOrders, setTotalOrders] = React.useState(0);
  
  React.useEffect(() => {
    fetchTotalOrders();
  }, [startDate, endDate]);

  const getDateRangeText = () => {
    if (!startDate && !endDate) return "ทุกช่วงเวลา";
    if (startDate && !endDate) {
      const formattedDate = new Date(startDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return `ตั้งแต่วันที่ ${formattedDate}`;
    }
    if (!startDate && endDate) {
      const formattedDate = new Date(endDate).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      return `จนถึงวันที่ ${formattedDate}`;
    }
    
    const startFormatted = new Date(startDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    const endFormatted = new Date(endDate).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  const fetchTotalOrders = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      const response = await fetch(`http://localhost:3333/getordertotal?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('ไม่สามารถเชื่อมต่อได้');
      }
      const data = await response.json();
      setTotalOrders(data.total || 0);
    } catch (error) {
      console.error('ไม่สามารถรับข้อมูลได้', error);
      setTotalOrders('Error');
    }
  };

  return (
    <div>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Title>ออเดอร์ทั้งหมด</Title>
          <Typography component="p" variant="h4">
            {typeof totalOrders === 'number' ? `${totalOrders.toLocaleString()} ออเดอร์` : totalOrders}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            {getDateRangeText()}
          </Typography>
        </Box>
      </Container>
    </div>
  );
}