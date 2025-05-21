import dotenv from "dotenv";

dotenv.config();
const prerenderToken = process.env.PRERENDER_TOKEN; // Your prerender.io API token
console.log("Using prerender token:", prerenderToken);
