const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    connectTimeout: 5000,
    reconnectStrategy(retries) {
      return Math.min(retries * 250, 3000);
    }
  }
});

client.on("error", (err) => {
  console.error(`[${new Date().toISOString()}] Redis Client Error:`, err.message || err);
});

const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
      console.log(`[${new Date().toISOString()}] Redis Connected successfully`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Redis Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  client,
  connectRedis
};
