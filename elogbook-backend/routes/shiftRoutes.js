import express from "express";
import { createShift,getShifts,getShiftById,closeShift,deleteShift,submitShift,approveShift,lockShift } from "../controllers/shiftController.js";
import { helper, roleAuthorization } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createShiftSchema } from "../validations/shiftValidations.js";

const router = express.Router();

router.post("/",helper,roleAuthorization("operator", "shift_incharge", "admin"),validate(createShiftSchema),createShift);
router.get("/",helper,getShifts);

router.get("/:id",helper,getShiftById);

router.patch("/:id/close",helper,roleAuthorization("admin", "shift_incharge"),closeShift);

router.delete("/:id",helper,roleAuthorization("admin"),deleteShift);

router.put("/submit/:shiftId",helper,roleAuthorization("operator", "shift_incharge"),submitShift);

router.put("/approve/:shiftId",helper,roleAuthorization("shift_incharge", "hod", "admin"),approveShift);

router.put("/lock/:shiftId",helper,roleAuthorization("hod", "admin"),lockShift);


export default router;