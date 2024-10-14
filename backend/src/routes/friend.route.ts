import express from "express";
import protectedRoute from "../middleware/protectedRoute.js";
import { addFriend, deleteFriend, getSuggestedFriends, getAllFriends } from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllFriends);
router.get("/suggested", protectedRoute, getSuggestedFriends);
router.post("/add/:id", protectedRoute, addFriend);
router.delete("/delete/:id", protectedRoute, deleteFriend);

export default router;