import * as React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Chart from './Chart';
import TotalOrder from './TotalOrder';
import Orders from './Orders';
import TotalRevenue from './Revenue';
import TopNoodleMenus from './NoodleOrder';
import NoodleTypeStats from './OrderNoodleType';
import SoupStats from './OrderSoup';
import MeatStats from './OrderMeat';
import SizeStats from './OrderSize';
import { Navbarow } from '../owner/Navbarowcomponent/navbarow/index-ow';

const defaultTheme = createTheme({});

export default function Dashboard() {
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [tempStartDate, setTempStartDate] = React.useState(null);
  const [tempEndDate, setTempEndDate] = React.useState(null);

  const FilterDate = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
  };

  const gridItems = React.useMemo(() => (
    <>
      <Grid item xs={12} md={6} lg={7}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <Chart startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <NoodleTypeStats startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <MeatStats startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <SoupStats startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <SizeStats startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={6}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 200,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <TotalOrder startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={6}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 200,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <TotalRevenue startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 300,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <Orders startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 300,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <TopNoodleMenus startDate={startDate} endDate={endDate} />
        </Paper>
      </Grid>
    </>
  ), [startDate, endDate]);

  return (
    <div>
      <Navbarow />
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '100vh',
            pb: 4
          }}
        >
          <h1
            style={{
              color: 'orange',
              textShadow: '1px 1.5px 1px rgba(0, 0, 0, 0.5)',
              fontFamily: 'Kanit, sans-serif',
              fontSize: '2.5rem',
              textAlign: 'center',
              padding: '15px 0',
              margin: '15px 0',
              letterSpacing: '1px'
            }}
          >
            รายงานสรุปข้อมูลเตี๋ยวเรือล้านช้าง
          </h1>

          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                m: '0 auto',
                mb: 4,
                gap: 2,
                backgroundColor: 'white',
                padding: 3,
                width: 'fit-content',
                borderRadius: 2,
              }}
            >
              <TextField
                label="วันที่เริ่มต้น"
                type="date"
                value={tempStartDate || ''}
                onChange={(e) => setTempStartDate(e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="วันที่สิ้นสุด"
                type="date"
                value={tempEndDate || ''}
                onChange={(e) => setTempEndDate(e.target.value || null)}
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={FilterDate}
              >
                กรองข้อมูล
              </Button>
            </Box>
            <Grid container spacing={3}>
              {gridItems}
            </Grid>
          </Container>
        </Box>
      </ThemeProvider>
    </div>
  );
}