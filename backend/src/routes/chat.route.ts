import express from "express";

const router = express.Router();

router.get("/conversations", (req, res) => {
    res.send("Testing conversation route");
});

export default router;