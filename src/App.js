import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline, Drawer, Toolbar, AppBar, Typography } from '@mui/material';
import Login from './component/Login';
import Join from './component/Join';
import Main from './component/Main';
import Menu from './component/Menu';
import MyPage from './component/MyPage';
import { Feed } from '@mui/icons-material';
import Register from './component/Register';


const drawerWidth = 240;

const Layout = ({ children }) => {
  const location = useLocation();
  const hideMenu = location.pathname === '/login' || location.pathname === '/join';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />     
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              SNS 시스템
            </Typography>
          </Toolbar>
        </AppBar>              
      {!hideMenu && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Menu />
        </Drawer>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          ml: hideMenu ? 0 : `${drawerWidth}px`,
          maxWidth: 'lg', 
          margin: 'auto', 
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};


const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/main" element={<Main />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/feed" element={<Feed />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
