export const CLAIM_STATUSES = ["Pending", "Approved", "Rejected", "Cancelled"];

export const claimStatusClass = (status) => {
  switch (status) {
    case "Approved":
      return "approved";
    case "Rejected":
      return "rejected";
    case "Cancelled":
      return "cancelled";
    default:
      return "pending";
  }
};
