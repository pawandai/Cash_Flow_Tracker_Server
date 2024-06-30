const transactionType = `#graphql
    type Transaction {
        _id: ID!
        userId: ID!
        description: String!
        paymentType: String!
        category: String!
        amount: String!
        location: String!
        date: String!
    }

    type CategoryStatistics {
        category: String!
        totalAmount: Float!
    }

    type Query {
        transactions: [Transaction!]
        transaction(transactionId: ID!): Transaction
        categoryStatistics: [CategoryStatistics!]
    }

    input CreateTransactionInput {
        description: String!
        paymentType: String!
        category: String!
        amount: String!
        location: String!
        date: String!
    }

    input UpdateTransactionInput {
        transactionId: ID!
        description: String
        paymentType: String
        category: String
        amount: String
        location: String
        date: String
    }

    type Mutation {
        createTransaction(input: CreateTransactionInput!): Transaction!
        updateTransaction(input: UpdateTransactionInput!): Transaction!
        deleteTransaction(transactionId: ID!): Transaction!
    }
`;

export default transactionType;
