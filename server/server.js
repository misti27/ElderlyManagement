const express = require("express");
const cors = require("cors");
const app = express();

// 加载环境变量
require('dotenv').config();

var corsOptions = {
  origin: "*" // 在生产环境中建议设置为具体的域名
};

app.use(cors(corsOptions));

// 解析 JSON 请求体
app.use(express.json());

// 解析 urlencoded 请求体
app.use(express.urlencoded({ extended: true }));

// 简单路由测试
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Elderly Guardian API." });
});

// 引入路由
const apiRoutes = require("./routes/api.routes");
app.use("/api", apiRoutes);
// require("./routes/elderly.routes")(app);

// 设置端口并启动监听
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
