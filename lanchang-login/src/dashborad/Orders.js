import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';

export default function Orders({  startDate, endDate }) {
  const [topMenus, setTopMenus] = React.useState([]);

  React.useEffect(() => {
    fetchTopMenus();
  }, [startDate, endDate]);

  const fetchTopMenus = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (startDate) queryParams.append('startDate', startDate);
        if (endDate) queryParams.append('endDate', endDate);
        const response = await fetch(`https://lanchangbackend-production.up.railway.app/getTopOrderedMenus?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTopMenus(data);
      } catch (error) {
        console.error('Error fetching top menus:', error);
      }
    };

  return (
    <React.Fragment>
      <Title>เมนูที่สั่งมากที่สุด</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{fontSize:20, color:"#FF4D00" }} >ชื่อเมนู</TableCell>
            <TableCell align="right">จำนวน</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topMenus.map((menu, index) => (
            <TableRow key={index}>
              <TableCell>{menu.name}</TableCell>
              <TableCell align="right">{menu.total_quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
