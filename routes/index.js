const express = require("express");
const router = express.Router();

// GET: 루트 url API
router.get('/', (req, res) => {
    res.send('Hello, this is Voyage Blog');
});

module.exports = router;