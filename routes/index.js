const express = require('express');
const router = express.Router();

// Rota principal
router.get('/', function(req, res) {
  res.render('index'); // Renderiza o arquivo index.ejs
});

module.exports = router;