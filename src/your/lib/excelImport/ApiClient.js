sap.ui.define([], function () {
  "use strict";

  return {

    async post(url, payload) {

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      return response.json();
    }

  };
});