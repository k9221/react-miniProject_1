import React, { useState, useEffect } from 'react';
import {
  Grid,
  AppBar,
  Toolbar,
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
import axios from 'axios'; // Axios를 사용하여 API 호출

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
      console.log('응답 데이터', response.data);
      if (response.data.success) {
        // 각 피드에 liked 속성 추가
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
      const userId = 'currentUserId'; // 현재 로그인된 사용자 ID를 가져옵니다.
      const commentData = {
        feed_id: selectedFeed.id, // 댓글이 달릴 피드 ID
        user_id: userId, // 댓글 작성자 ID
        content: newComment, // 댓글 내용
      };
  
      try {
        const response = await axios.post('http://localhost:3100/comments', commentData);
        if (response.data.success) {
          // 서버에 성공적으로 저장되면 댓글 목록 업데이트
          setComments([...comments, { id: userId, text: newComment }]);
          setNewComment(''); // 입력 필드 초기화
        } else {
          console.error('댓글 추가 실패:', response.data.message);
        }
      } catch (error) {
        console.error('댓글 추가 중 오류 발생:', error);
      }
    }
  };
  
  const fnLike = async (feed) => {
    const userId = 'currentUserId'; // 현재 로그인된 사용자 ID를 가져옵니다.
  
    if (feed.liked) {
      // 이미 좋아요를 눌렀다면 좋아요 수를 감소시키고 liked 상태를 false로 변경
      try {
        const response = await axios.put(`http://localhost:3100/feed/${feed.id}/like`, { userId });
        if (response.data.success) {
          setFeeds(feeds.map(f => 
            f.id === feed.id ? { ...f, likes: f.likes - 1, liked: false } : f
          ));
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('좋아요 제거 중 오류 발생:', error);
      }
    } else {
      // 좋아요를 눌렀다면 좋아요 수를 증가시키고 liked 상태를 true로 변경
      try {
        const response = await axios.put(`http://localhost:3100/feed/${feed.id}/like`, { userId });
        if (response.data.success) {
          setFeeds(feeds.map(f => 
            f.id === feed.id ? { ...f, likes: f.likes + 1, liked: true } : f
          ));
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('좋아요 추가 중 오류 발생:', error);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">SNS</Typography>
        </Toolbar>
      </AppBar>

      <Box mt={4}>
        <Grid container spacing={3}>
          {feeds.map((feed) => (
            <Grid item xs={12} sm={6} md={4} key={feed.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`http://localhost:3100/${feed.image_urls}`} 
                  alt={feed.title}
                  onClick={() => handleClickOpen(feed)}
                  style={{ cursor: 'pointer' }}
                />
                <CardContent>
                  <Typography variant="h6">{feed.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feed.content}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1}>
                    <Typography variant="body2" color="textSecondary" mr={2} onClick={() => fnLike(feed)}>
                      좋아요: {feed.likes}
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
        <DialogContent sx={{ display: 'flex' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1">{selectedFeed?.content}</Typography>
            {selectedFeed?.image_urls && (
              selectedFeed.image_urls.split(',').map((url, index) => (
                <img
                  key={index}
                  src={`http://localhost:3100/${url}`} 
                  alt={selectedFeed.title}
                  style={{ width: '100%', marginTop: '10px' }}
                />
              ))
            )}
          </Box>

          <Box sx={{ width: '300px', marginLeft: '20px' }}>
            <Typography variant="h6">댓글</Typography>
            <List>
              {comments.map((comment, index) => (
                <ListItem key={index}>
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
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment}
              sx={{ marginTop: 1 }}
            >
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
