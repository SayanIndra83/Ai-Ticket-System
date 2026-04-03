import express from "express";
import { isAuthinticated } from "../middleware/auth.middleware.js"
import { createTicket, getTicket, getTickets } from "../controllers/ticket.controllers.js";

const router = express.Router();
router.get("/",isAuthinticated, getTickets)
router.get("/:id",isAuthinticated, getTicket)
router.post("/",isAuthinticated, createTicket)
export default router;