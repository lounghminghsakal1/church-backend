import { failureResponse } from "../utils/generalHelpers.js";

export const validateFamilyCardMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new Error("User not found, make sure this middleware is called after authUser middleware then only you can get req.user");
    }
    if(!req.user.family_card_document) {
      return res.status(422).json(failureResponse("Family card is not uploaded yet, so please upload family card"));
    }
    if(req.user.family_card_document && !req.user.family_card_document.file_path) {
      return res.status(400).json(failureResponse("Family card was not found in the server, so please upload again"));
    }
    next();
  } catch(err) {
    res.status(400).json(failureResponse("Failed to validate family card, "+err.message));
  }
}