import { Router } from "express"
import loadDocuments from "../controllers/LoadDocumnet.controller.js";
import multer from "multer";

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

const router = Router();

router.post('/upload', upload.array('documents', 2), loadDocuments);


export default router;