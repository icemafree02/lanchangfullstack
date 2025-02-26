import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { mainListItems, secondaryListItems } from './listItems';
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

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);


const defaultTheme = createTheme({});

export default function Dashboard() {
  const [open, setOpen] = React.useState(false); 

  const toggleDrawer = React.useCallback(() => { 
    setOpen(prev => !prev);
  }, []);

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
          <Chart />
        </Paper>
      </Grid>
  
      <Grid item xs={12} md={6} lg={4}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 380,
            width:600,
            boxShadow: (theme) => theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <NoodleTypeStats />
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
          <MeatStats />
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
          <SoupStats />
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
          <SizeStats />
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
          <TotalOrder />
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
          <TotalRevenue />
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
          <Orders />
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
          <TopNoodleMenus />
        </Paper>
      </Grid>
    </>
  ), []);
  

  return (
    <div>
      <Navbarow />
      <ThemeProvider theme={defaultTheme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Box
            component="main"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[100]
                  : theme.palette.grey[900],
              flexGrow: 1,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Toolbar />
            <Container maxWidth="xl" sx={{ mb: 4 }}>
              <Grid container spacing={3}>
                {gridItems}
              </Grid>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </div>
  );
}