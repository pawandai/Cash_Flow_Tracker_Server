import "dotenv/config";
import { GraphQL } from ".";
import { connectToDB } from "./database";

const port = process.env.PORT || 7000;

async function startServer() {
  const app = await GraphQL();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  await connectToDB();
}

startServer();
