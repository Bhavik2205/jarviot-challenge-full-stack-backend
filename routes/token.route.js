import express from "express";
import { Auth, Redirect, RevokeAccess} from "../controllers/token.controller.js";

const router = express.Router();

router.get("/auth/google", Auth);
router.get("/google/redirect", Redirect);
router.get("/revoke/:email", RevokeAccess);

export default router;