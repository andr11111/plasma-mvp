module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
      from: "0xfd02ecee62797e75d86bcff1642eb0844afb28c7"
    }
  }
};
