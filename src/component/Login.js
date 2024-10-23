import React, { useEffect, useRef } from 'react'; 
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const idRef = useRef(); // 아이디 입력을 위한 ref
  const pwdRef = useRef(); // 비밀번호 입력을 위한 ref
  const navigate = useNavigate();

  useEffect(() => {
    idRef.current.focus(); // 처음 화면에 들어오면 id에 포커스가 맞춰짐
  }, []);

  async function fnLogin() {
    try {
      const res = await axios.post("http://localhost:3100/user", { 
        id: idRef.current.value, 
        pwd: pwdRef.current.value 
      });

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        navigate("/main"); // 로그인 성공 시 메인 페이지로 이동
      } else {
        alert("아이디/비밀번호를 확인해주세요");
      }
    } catch (err) {
      console.error("로그인 실패:", err.response ? err.response.data : err.message);
      alert("서버와의 연결에 문제가 발생했습니다."); // 사용자에게 보여줄 메시지
    }
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{ backgroundColor: '#f0f4f8', padding: 3 }}
    >
      <Box 
        sx={{ 
          width: '100%', 
          maxWidth: '400px', 
          padding: '20px',  
          backgroundColor: '#fff', 
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',  
          borderRadius: '8px' 
        }}
      >
        <Typography variant="h4" mb={3} align="center">
          로그인
        </Typography>
        <TextField 
          label="아이디" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          inputRef={idRef} 
        />
        <TextField 
          label="비밀번호" 
          variant="outlined" 
          type="password" 
          fullWidth 
          margin="normal" 
          inputRef={pwdRef} 
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 2 }} 
          onClick={fnLogin}
        >
          로그인
        </Button>
        <Typography mt={2} align="center">
          계정이 없으신가요? <a href="/join">회원가입</a>
        </Typography>
      </Box>
    </Box>
  );
}

export default Login;
