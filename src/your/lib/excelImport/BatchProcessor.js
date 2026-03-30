sap.ui.define([], function () {
  "use strict";

  return {

    create(data, size) {

      const batches = [];

      for (let i = 0; i < data.length; i += size) {
        batches.push(data.slice(i, i + size));
      }

      return batches;
    }

  };
});