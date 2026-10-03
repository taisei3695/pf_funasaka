import dns from "node:dns";

// Some Windows DNS configurations support OS lookup but reject Node's DNS queries.
// Only use public resolvers when the configured resolver cannot resolve WordPress.
try {
  await dns.promises.resolve("wordpress.org");
} catch {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}
