import React, { useRef, useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Register() {
  const token = localStorage.getItem("token"); // 로컬 스토리지에서 토큰 꺼내기
  let userId = null; // userId 초기화

  if (token) {
    try {
      const dToken = jwtDecode(token); // 디코딩
      userId = dToken.id; // 사용자 ID 추출
      console.log(dToken);
      console.log(userId);
    } catch (error) {
      console.error("토큰 디코딩 오류:", error);
    }
  } else {
    console.error("토큰이 존재하지 않습니다.");
    // 필요에 따라 로그인 페이지로 리다이렉트할 수 있습니다.
  }

  const [files, setFiles] = useState([]);
  const titleRef = useRef();
  const contentRef = useRef();
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const fnRegister = async () => {
    const title = titleRef.current.value;
    const content = contentRef.current.value;

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title);
    formData.append('content', content);
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await axios.post("http://localhost:3100/feed", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        alert("게시글 작성 성공");
        navigate("/feed");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("서버 오류 발생", error);
      alert("서버 오류 발생");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        <Typography variant="h4" gutterBottom>
          등록
        </Typography>

        <TextField
          label="제목"
          variant="outlined"
          margin="normal"
          fullWidth
          inputRef={titleRef}
        />
        <TextField
          label="내용"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={4}
          inputRef={contentRef}
        />

        <Box display="flex" alignItems="center" margin="normal">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          <Box display="flex" flexDirection="column" sx={{ marginLeft: 2 }}>
            {files.length > 0 ? (
              Array.from(files).map((file, index) => (
                <Avatar
                  key={index}
                  alt="첨부된 이미지"
                  src={URL.createObjectURL(file)}
                  sx={{ width: 56, height: 56, marginBottom: 1 }}
                />
              ))
            ) : (
              <Typography variant="body1">첨부할 파일 선택</Typography>
            )}
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
          onClick={fnRegister}
        >
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;
