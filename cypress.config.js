const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
  projectId: "8q69kw",
  video:true,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://css-adapt.ai.devgfnl.com/",
    testIsolation: false
  },
});
