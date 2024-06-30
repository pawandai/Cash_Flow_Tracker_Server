import Transaction from "../models/transaction.model";
import {
  CreateTransactionInputType,
  UpdateTransactionInputType,
} from "../types";

const transactionResolver = {
  Query: {
    transactions: async (_: any, __: any, context: any) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized User");
        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId });
        return transactions;
      } catch (error) {
        console.error("Error getting transactions");
        throw new Error("Error getting transactions");
      }
    },
    transaction: async (
      _: any,
      { transactionId }: { transactionId: string },
      context: any
    ) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.log("Error getting transaction");
        throw new Error("Error getting transaction");
      }
    },
    categoryStatistics: async (_: any, __: any, context: any) => {
      if (!context.getUser()) throw new Error("Unauthorized User");

      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ userId });
      const categoryMap: any = {};

      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category])
          categoryMap[transaction.category] = 0;
        categoryMap[transaction.category] += transaction.amount;
      });

      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
  },
  Mutation: {
    createTransaction: async (
      parent: any,
      { input }: { input: CreateTransactionInputType },
      context: any
    ) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.log("Error creating transaction", error);
        throw new Error("Error creating transaction");
      }
    },
    updateTransaction: async (
      _: any,
      { input }: { input: UpdateTransactionInputType }
    ) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.error("Error updating transaction");
        throw new Error("Error updating transaction");
      }
    },
    deleteTransaction: async (
      _: any,
      { transactionId }: { transactionId: string }
    ) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (error) {
        console.error("Error deleting transaction");
        throw new Error("Error deleting transaction");
      }
    },
  },
  // user/transaction relation
  User: {
    transactions: async (parent: any) => {
      try {
        const transactions = await Transaction.find({ userId: parent._id });
        return transactions;
      } catch (error) {
        console.error("Error getting user transactions: ", error);
        throw new Error("Error getting user transactions");
      }
    },
  },
};

export default transactionResolver;
