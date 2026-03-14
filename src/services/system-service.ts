export const SystemService = {
  async getVersion(): Promise<string> {
    // Mocking a backend call
    return new Promise((resolve) => {
      setTimeout(() => resolve("v1.2.4-beta"), 300);
    });
  }
};
