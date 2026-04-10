module.exports = {
  test: {
    environment: "node",
    fileParallelism: false,
    globals: true,
    setupFiles: ["./tests/setup.js"],
  },
};
