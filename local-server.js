const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// API路由
app.use('/api/buttons', require('./api/buttons'));

// 页面路由
app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`本地开发服务器运行中：http://localhost:${PORT}`);
  console.log('数据存储位置：', path.resolve('./data.json'));
});