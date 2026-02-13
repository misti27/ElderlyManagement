module.exports = app => {
  const router = require("express").Router();

  // 获取所有老人
  router.get("/", (req, res) => {
    res.json([
      { id: 'u001', name: '张建国', status: '正常' },
      { id: 'u002', name: '李秀英', status: '静止' }
    ]);
  });

  // 其他接口...
  
  app.use('/api/elderly', router);
};
