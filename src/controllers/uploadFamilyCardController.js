import User from "../models/User.js"

export const familyCardUpload = async (req, res, ) => {
  try {
    if(!req.file) {
      return res.status(404).json({
        status: "failure",
        message: "Please provide a file"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      family_card_document: {
        file_name: req.file.originalname,
        file_path: req.file.path,
        updated_at: new Date()
      }
    }, { new: true });
    res.json({
      status: "success",
      message: "Family card uploaded successfully",
      data: updatedUser
    });

  } catch(err) {
    res.status(400).json({
      status: "failure",
      message: "Failed to upload family card, "+err.message
    });
  }
}