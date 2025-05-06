import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Title from './Title';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SizeStats({ startDate, endDate }) {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchSizeStats();
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

    const fetchSizeStats = () => {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        fetch(`http://localhost:3333/allsizes?${queryParams.toString()}`)
            .then(response => response.json())
            .then(data => setStats(data))
            .catch(error => console.error('Error fetching soups:', error));
    }
    const total = stats.reduce((sum, item) => sum + item.order_count, 0);

    return (
        <Container maxWidth="sm">
            <Box sx={{ height: '250px', textAlign: 'center' }}>
                <Title>สถิติการสั่งปริมาณ</Title>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={stats}
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="order_count"
                            label={({ name, order_count }) => `${name} (${((order_count / total) * 100).toFixed(2)}%)`}
                            labelLine={true} 
                        >
                            {stats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'จำนวนการสั่ง']}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            <Box sx={{ mt: 11 }}>
                <Typography color="text.secondary" sx={{ fontSize: 13, textAlign: 'center' }}>
                    {getDateRangeText()}
                </Typography>
            </Box>
        </Container>
    );
}