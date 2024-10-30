import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Card, CardContent, CardMedia, CircularProgress, Toolbar, Button, Divider } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function MyPage() {
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [viewType, setViewType] = useState("myPosts"); // 초기값은 'myPosts'
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const dToken = jwtDecode(token);

      const fetchData = async () => {
        try {
          const followResponse = await axios.get(`http://localhost:3100/user/${dToken.id}/follows`);
          if (followResponse.data.success) {
            setFollowerCount(followResponse.data.followers.length);
            setFollowingCount(followResponse.data.following.length);
          }

          const postResponse = await axios.get(`http://localhost:3100/feed/${dToken.id}/feeds/count`);
          if (postResponse.data.success) {
            setPostCount(postResponse.data.postCount);
          }

          fetchMyPosts(); // 초기 로딩 시 내 게시글 가져오기
        } catch (error) {
          console.error('데이터 조회 오류:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [token]);

  const fetchMyPosts = async () => {
    const dToken = jwtDecode(token);
    try {
      const response = await axios.get(`http://localhost:3100/feed/${dToken.id}/myPosts`);
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error('나의 게시글 가져오기 오류:', error);
    }
  };

  const fetchLikedPosts = async () => {
    const dToken = jwtDecode(token);
    try {
      const response = await axios.get(`http://localhost:3100/feed/${dToken.id}/likedPosts`);
      if (response.data.success) {
        console.log('좋아요한 게시글:', response.data.posts); // 추가된 코드
        setPosts(response.data.posts);
      } else {
        console.error('좋아요한 게시글 가져오기 오류:', response.data.message); // 에러 메시지 확인
      }
    } catch (error) {
      console.error('좋아요한 게시글 가져오기 오류:', error); // 에러 확인
    }
  };
  const handleViewChange = (type) => {
    setViewType(type);
    if (type === "myPosts") {
      fetchMyPosts();
    } else {
      fetchLikedPosts(); // 좋아요한 게시글을 가져오는 함수 호출
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  const dToken = jwtDecode(token);

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '30px' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 3, mb: 2 }}>
          <Avatar
            alt="프로필 이미지"
            src="https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"
            sx={{ width: 100, height: 100, marginRight: 2, border: '3px solid #4a90e2' }}
          />
          <Box>
            <Typography variant="h5" fontWeight="bold" color="#1a237e">{dToken.name}</Typography>
            <Typography variant="body1" sx={{ display: 'flex', gap: 1, color: 'text.secondary' }}>
              <span>게시물: <strong>{postCount}</strong></span>
              <span>팔로워: <strong>{followerCount}</strong></span>
              <span>팔로잉: <strong>{followingCount}</strong></span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ marginTop: 1 }}>
              {dToken.email || '이메일 없음'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ width: '100%', marginBottom: 3 }} />

        <Box sx={{ marginTop: 3, textAlign: 'center', backgroundColor: '#e3f2fd', padding: 3, borderRadius: 2, color: '#1a237e' }}>
          <Typography variant="h6" fontWeight="bold">내 소개</Typography>
          <Typography variant="body1" color="text.secondary">
            안녕하세요! SNS를 통해 친구들과 소통하고 있습니다. 사진과 일상을 공유하는 것을 좋아해요.
          </Typography>
        </Box>

        <Toolbar sx={{ justifyContent: 'center', marginTop: 3 }}>
          <Button
            variant={viewType === "myPosts" ? "contained" : "outlined"}
            onClick={() => handleViewChange("myPosts")}
            sx={{
              marginRight: 2,
              color: viewType === "myPosts" ? 'white' : 'primary',
              backgroundColor: viewType === "myPosts" ? '#4a90e2' : 'transparent',
              '&:hover': { backgroundColor: viewType === "myPosts" ? '#3367d6' : '#f4f6f8' }
            }}
          >
            나의 게시글
          </Button>
          <Button
            variant={viewType === "likedPosts" ? "contained" : "outlined"}
            onClick={() => handleViewChange("likedPosts")}
            sx={{
              color: viewType === "likedPosts" ? 'white' : 'primary',
              backgroundColor: viewType === "likedPosts" ? '#4a90e2' : 'transparent',
              '&:hover': { backgroundColor: viewType === "likedPosts" ? '#3367d6' : '#f4f6f8' }
            }}
          >
            좋아요한 게시글
          </Button>
        </Toolbar>

        <Box sx={{ marginTop: 3, width: '100%' }}>
          {posts.length > 0 ? (
            <Grid container spacing={4}>
              {posts.map((post, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                    transition: '0.3s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}>
                    <CardMedia
                      component="img"
                      image={`http://localhost:3100/${post.image_urls?.split(',')[0] || 'default-image-url.jpg'}`}
                      alt={`Post image ${index}`}
                      sx={{
                        cursor: 'pointer',
                        width: '100%',
                        maxHeight: '500px',
                        objectFit: 'cover',
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6" color="primary">{post.content}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ padding: 2 }}>
              게시글이 없습니다.
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
}

export default MyPage;
