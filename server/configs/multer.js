import multer from "multer";

export const storage = multer.diskStorage({});

const upload = multer({ storage });

export default upload;