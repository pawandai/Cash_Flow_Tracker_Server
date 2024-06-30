import { model, Schema } from "mongoose";

const transactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    enum: ["cash", "card", "other"],
    required: true,
  },
  category: {
    type: String,
    enum: ["saving", "expense", "investment"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    default: "Unknown",
  },
  date: {
    type: Date,
    required: true,
  },
});

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
