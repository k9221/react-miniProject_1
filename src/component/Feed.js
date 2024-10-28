import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Container,
  Box,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import axios from 'axios';

function Feed() {
  const [feeds, setFeeds] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await axios.get('http://localhost:3100/feed');
      if (response.data.success) {
        const feedsWithLiked = response.data.list.map(feed => ({ ...feed, liked: false }));
        setFeeds(feedsWithLiked);
      } else {
        console.error('피드 데이터 조회 실패:', response.data.message);
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
    }
  };

  const handleClickOpen = (feed) => {
    setSelectedFeed(feed);
    setOpen(true);
    setComments([]);
    setNewComment('');
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFeed(null);
    setComments([]);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      const userId = 'currentUserId';
      const commentData = {
        feed_id: selectedFeed.id,
        user_id: userId,
        content: newComment,
      };

      try {
        const response = await axios.post('http://localhost:3100/comments', commentData);
        if (response.data.success) {
          setComments([...comments, { id: userId, text: newComment }]);
          setNewComment('');
        } else {
          console.error('댓글 추가 실패:', response.data.message);
        }
      } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
      }
    }
  };

  const fnLike = async (feed) => {
    const userId = 'currentUserId';

    try {
      const response = await axios.put(`http://localhost:3100/feed/${feed.id}/like`, { userId });
      if (response.data.success) {
        setFeeds(feeds.map(f => 
          f.id === feed.id ? { ...f, likes: feed.liked ? f.likes - 1 : f.likes + 1, liked: !feed.liked } : f
        ));
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
                    닉네임
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg" sx={{ '& .MuiPaper-root': { borderRadius: '16px' } }}>
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
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="body1" paragraph>{selectedFeed?.content}</Typography>
            {selectedFeed?.image_urls && (
              selectedFeed.image_urls.split(',').map((url, index) => (
                <img
                  key={index}
                  src={`http://localhost:3100/${url}`} 
                  alt={selectedFeed.title}
                  style={{ width: '100%', marginBottom: '10px', borderRadius: '8px' }}
                />
              ))
            )}
          </Box>

          <Box sx={{ width: '300px', pl: 2 }}>
            <Typography variant="h6" gutterBottom>댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemAvatar>
                    <Avatar>{comment.id.charAt(0).toUpperCase()}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={comment.text} secondary={comment.id} />
                </ListItem>
              ))}
            </List>
            <TextField
              label="댓글을 입력하세요"
              variant="outlined"
              fullWidth
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mt: 2, mb: 1 }}
            />
            <Button variant="contained" color="primary" onClick={handleAddComment} fullWidth>
              댓글 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Feed;
