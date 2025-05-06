import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Title from './Title';

export default function TotalRevenue({startDate, endDate }) {
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchTotalRevenue();
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

  const fetchTotalRevenue = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      const response = await fetch(`http://localhost:3333/getTotalRevenue?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setTotalRevenue(data.total_revenue || 0); 
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }
  };

  const formatToThaiCurrency = (amount) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Title>รายได้รวมทั้งหมด</Title>
        <Typography component="p" variant="h4">
          {formatToThaiCurrency(totalRevenue)}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {getDateRangeText()}
        </Typography>
      </Box>
    </Container>
  );
}
