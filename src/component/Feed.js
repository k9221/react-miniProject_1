import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Grid,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

function Feed() {
  const [feeds, setFeeds] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken.id) {
        setUserId(decodedToken.id);
      } else {
        console.error('userId가 디코딩된 토큰에 없습니다.');
      }
    }
    fetchFeeds();
  }, []);
  const fetchFeeds = async () => {
    try {
      const response = await axios.get('http://localhost:3100/feed');
      if (response.data.success) {
        const likedFeeds = JSON.parse(localStorage.getItem('likedFeeds')) || {};
        const feedsWithLiked = response.data.list.map(feed => {
          const isLiked = likedFeeds[feed.id] === userId; // 로컬 스토리지에서 좋아요 상태 확인
          return {
            ...feed,
            liked: isLiked, // 좋아요 상태 설정
          };
        });
        setFeeds(feedsWithLiked);
      } else {
        console.error('피드 데이터 조회 실패:', response.data.message);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  const fetchComments = async (feedId) => {
    try {
      const response = await axios.get(`http://localhost:3100/comments/${feedId}`);
      if (response.data.success) {
        setComments(response.data); // 댓글 목록을 설정
      } else {
        console.error('댓글 조회 실패:', response.data.message);
      }
    } catch (error) {
      console.error('댓글 조회 중 오류 발생:', error);
    }
  };

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    setComments([]);
    setNewComment('');
    fetchComments(feed.id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
  };

  const handleAddComment = async () => {
    if (!newComment) return; // 댓글 내용이 없으면 추가하지 않음

    try {
      const response = await axios.post('http://localhost:3100/comments', {
        feed_id: selectedFeed.id, // 현재 피드 ID
        user_id: userId, // 현재 사용자 ID
        content: newComment,
      });

      if (response.data.success) {
        // 댓글 추가 후 목록 갱신
        setNewComment('');
        fetchComments(selectedFeed.id); // 댓글 목록을 새로 가져오기
      } else {
        console.error('댓글 추가 실패:', response.data.message);
      }
    } catch (error) {
      console.error('댓글 추가 중 오류 발생:', error);
    }
  };

  const fnLike = async (feed) => {
    const likedFeeds = JSON.parse(localStorage.getItem('likedFeeds')) || {};
  
    if (!userId) {
      console.error('사용자 ID가 없습니다.');
      return; 
    }
  
    try {
      const response = await axios.put(`http://localhost:3100/feed/${feed.id}/like`, { userId });
  
      if (response.data.success) {
        const isLiked = response.data.message.includes('추가');
        const updatedFeeds = feeds.map(f => {
          if (f.id === feed.id) {
            return {
              ...f,
              likes: isLiked ? f.likes + 1 : f.likes - 1,
              liked: isLiked,  // 상태 업데이트
            };
          }
          return f;
        });
  
        setFeeds(updatedFeeds);
  
        // 로컬 스토리지에 상태 저장
        if (isLiked) {
          likedFeeds[feed.id] = userId; // 사용자 ID로 좋아요 추가
        } else {
          delete likedFeeds[feed.id]; // 좋아요 제거
        }
        localStorage.setItem('likedFeeds', JSON.stringify(likedFeeds));
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('좋아요 상태 변경 중 오류 발생:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box mt={4}>
        <Grid container spacing={4}>
          {feeds.map((feed) => (
            <Grid item xs={12} key={feed.id}>
              <Card sx={{ 
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)', 
                overflow: 'hidden', 
                transition: '0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                } 
              }}>
                <Box display="flex" alignItems="center" padding={2}>
                  <Avatar
                    alt="프로필 이미지"
                    src={`http://localhost:3100/${feed.profile_image}`}
                    sx={{ width: 56, height: 56, marginRight: 2 }}
                  />
                  <Typography variant="subtitle1" color="textPrimary">
                    {feed.user_id} 
                  </Typography>
                </Box>
                <CardMedia
                  component="img"
                  image={`http://localhost:3100/${feed.image_urls}`}
                  alt={feed.title}
                  onClick={() => handleClickOpen(feed)}
                  sx={{
                    cursor: 'pointer',
                    width: '100%',
                    maxHeight: '500px',
                    objectFit: 'cover',
                  }}
                />
                <CardContent>
                  <Typography variant="h6">{feed.title}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
                    {feed.content}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2}>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      onClick={() => fnLike(feed)} 
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', mr: 2 }}
                    >
                      {feed.liked ? (
                        <Favorite fontSize="small" sx={{ color: 'red', marginRight: 0.5 }} />
                      ) : (
                        <FavoriteBorder fontSize="small" sx={{ marginRight: 0.5 }} />
                        
                      )}
                      {feed.likes}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      댓글 수: {feed.comments}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          {selectedFeed?.title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.description}</Typography>
            {selectedFeed?.image_urls && (
              <img
                src={`http://localhost:3100/${selectedFeed.image_urls}`}
                alt={selectedFeed.title}
                style={{ width: '100%', marginTop: '10px' }}
              />
            )}
          </Box>
          
          <Box sx={{ width: '100%', marginTop: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>{comment.user_id.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={comment.content} secondary={comment.user_id} />
                </ListItem>
              ))}
            </List>
          </Box>
          <TextField
            label="댓글 추가"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ marginTop: 2 }}
          />
          <Button onClick={handleAddComment} variant="contained" color="primary" sx={{ marginTop: 2 }}>
            추가
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Feed;
