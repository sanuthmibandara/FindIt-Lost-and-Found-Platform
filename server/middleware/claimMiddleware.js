import Claim from "../models/Claim.js";

export const authorizeClaimOwner = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only the post owner can manage this claim" });
    }

    req.claim = claim;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authorizeClaimer = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    if (claim.claimer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own claims" });
    }

    req.claim = claim;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
