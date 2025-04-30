import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Title from './Title';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function NoodleTypeStats({ startDate, endDate }) {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchNoodletypeStats();
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

    const fetchNoodletypeStats = () => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        fetch(`https://lanchangbackend-production.up.railway.app/allnoodletypes?${queryParams.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error('ไม่มีการตอบสนอง');
                return response.json();
            })
            .then(data => {
                setStats(data);
            })
            .catch(error => {
                console.error('ไม่สามารถโหลดข้อมูลได้:', error);
            });
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ height: '400px', textAlign: 'center' }}>
                <Title>สถิติการสั่งเส้น</Title>
                <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={stats} margin={{ top: 5, left: 5, right: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis label={{ angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="order_count" fill="#FFA500" name="จำนวนการสั่ง" />
                    </BarChart>
                </ResponsiveContainer>
                <Typography color="text.secondary" sx={{ fontSize: 13, mt: 2 }}>
                    {getDateRangeText()}
                </Typography>
            </Box>
        </Container>
    );
}