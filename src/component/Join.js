import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';

function Join() {
  const [idError, setIdError] = useState('');
  const [idAvailable, setIdAvailable] = useState(''); // State for ID availability message
  const [pwdError, setPwdError] = useState('');
  const [pwdCheckError, setPwdCheckError] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const idRef = useRef();
  const pwdRef = useRef();
  const pwdCheckRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    idRef.current.focus();
  }, []);

  const handleCheckId = async () => {
    const id = idRef.current.value;

    // ID 유효성 검사
    const hasLetter = /[a-zA-Z]/.test(id);
    const hasNumber = /[0-9]/.test(id);
    const hasSpecialChar = /[!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(id);

    if (id.length < 6) {
      setIdError('아이디는 6자 이상이어야 합니다.');
      setIdAvailable('');
      return;
    }
    if (hasSpecialChar) {
      setIdError('특수문자는 포함할 수 없습니다.');
      setIdAvailable('');
      return;
    }
    if (!hasLetter || !hasNumber) {
      setIdError('영어와 숫자를 조합해야 합니다');
      setIdAvailable('');
      return;
    }

    // ID가 유효한 경우 중복 체크
    try {
      const response = await axios.post("http://localhost:3100/user/checkId", { id });
      const exists = response.data.exists;

      if (exists) {
        setIdError('이미 사용 중인 아이디입니다.');
        setIdAvailable('');
      } else {
        setIdError('');
        setIdAvailable('사용 가능한 아이디입니다.'); // Set availability message
      }
    } catch (error) {
      console.error("ID 중복 체크 오류:", error);
      setIdError('서버 오류 발생');
      setIdAvailable('');
    }
  };

  const validatePwd = (pwd) => {
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(pwd);
    if (!pwd) {
      return false; 
    } else if (pwd.length < 6) {
      setPwdError('비밀번호는 6자 이상이어야 합니다.');
    } else if (!hasLetter || !hasNumber || !hasSpecialChar) {
      setPwdError('영어와 숫자, 특수문자를 조합해야 합니다');
    } else {
      setPwdError('사용 가능한 비밀번호입니다.');
    }
  };

  const validatePwdCheck = (pwdCheck) => {
    if (pwdRef.current.value !== pwdCheck) {
      setPwdCheckError('비밀번호가 일치하지 않습니다.');
    } else {
      setPwdCheckError('');
    }
  };

  const validateName = (name) => {
    const hasNumber = /[0-9]/.test(name);
    const hasSpecialChar = /[!@#$%^&*()_+=[\]{};':"\\|,.<>?]/.test(name);
    
    if (name.length < 2) {
      setNameError('이름은 2자 이상이어야 합니다.');
    } else if (hasNumber || hasSpecialChar) {
      setNameError('이름에는 숫자와 특수문자가 포함될 수 없습니다.');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (email) => {
    const regex = /^\S+@\S+\.\S+$/;
    if (!regex.test(email)) {
      setEmailError('유효한 이메일 형식이 아닙니다.');
    } else {
      setEmailError('');
    }
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10,11}$/;
    if (!regex.test(phone)) {
      setPhoneError('-를 제외한 번호만 입력해주세요');
    } else {
      setPhoneError('');
    }
  };

  async function fnJoin() {
    const id = idRef.current.value;
    const pwd = pwdRef.current.value;
    const pwdCheck = pwdCheckRef.current.value;
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const phone = phoneRef.current.value;

    try {
      const res = await axios.post("http://localhost:3100/user/insert", {
        id,
        pwd,
        name,
        email,
        phone,
        pwdCheck
      });
      console.log(res.data);
      if (res.data.success) {
        alert("회원가입 성공");
        navigate("/main");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("서버 오류 발생", error);
      alert("서버 오류 발생");
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
          maxWidth: '450px', 
          padding: '30px',  
          backgroundColor: '#ffffff', 
          boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)', 
          borderRadius: '12px'  
        }}
      >
        <Typography variant="h4" mb={3} align="center" sx={{ color: '#1976d2' }}>
          회원가입
        </Typography>
        <div>
          <Stack spacing={2} direction="row">
            <TextField 
              inputRef={idRef} 
              label="아이디" 
              variant="outlined" 
              fullWidth 
              margin="normal" 
              sx={{ width: '80%' }} 
              onChange={() => setIdAvailable('')} // Clear availability message on input
              inputProps={{ maxLength: 16 }}
            />
            <Button variant="contained" sx={{ width: '20%' }} size='small' onClick={handleCheckId}>중복체크</Button>
          </Stack>
          {idError && <Typography color="error">{idError}</Typography>}
          {idAvailable && <Typography color="green">{idAvailable}</Typography>} {/* Show availability message */}
        </div>
        <TextField 
          inputRef={pwdRef} 
          label="비밀번호" 
          variant="outlined" 
          type="password" 
          fullWidth 
          margin="normal" 
          onChange={(e) => {
            validatePwd(e.target.value);
            validatePwdCheck(pwdCheckRef.current.value);
          }} 
          inputProps={{ maxLength: 20 }}
        />
        {pwdError && <Typography color={pwdError.includes('사용 가능한') ? 'green' : 'error'}>{pwdError}</Typography>}
        <TextField 
          inputRef={pwdCheckRef} 
          label="비밀번호 확인" 
          variant="outlined" 
          type="password" 
          fullWidth 
          margin="normal"
          inputProps={{ maxLength: 20 }} 
          onChange={(e) => validatePwdCheck(e.target.value)} 
        />
        {pwdCheckError && <Typography color="error">{pwdCheckError}</Typography>}
        <TextField 
          inputRef={nameRef} 
          label="이름" 
          variant="outlined" 
          fullWidth 
          margin="normal"
          inputProps={{ maxLength: 15 }} 
          onChange={(e) => validateName(e.target.value)} 
        />
        {nameError && <Typography color="error">{nameError}</Typography>}
        <TextField 
          inputRef={emailRef} 
          label="이메일" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 23 }}
          onChange={(e) => validateEmail(e.target.value)} 
        />
        {emailError && <Typography color="error">{emailError}</Typography>}
        <TextField 
          inputRef={phoneRef} 
          label="휴대폰 번호" 
          variant="outlined" 
          fullWidth 
          margin="normal" 
          inputProps={{ maxLength: 14 }}
          onChange={(e) => validatePhone(e.target.value)} 
        />
        {phoneError && <Typography color="error">{phoneError}</Typography>}
        
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ mt: 3, p: 1.5, borderRadius: '8px' }} 
          onClick={fnJoin}
        >
          회원가입
        </Button>
        <Typography mt={3} align="center" sx={{ color: '#555' }}>
          이미 계정이 있으신가요? <a href="/login" style={{ color: '#1976d2', textDecoration: 'underline' }}>로그인</a>
        </Typography>
      </Box>
    </Box>
  );
}

export default Join;
