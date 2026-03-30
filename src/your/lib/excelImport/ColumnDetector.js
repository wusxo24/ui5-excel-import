sap.ui.define([], function () {
  "use strict";

  return {

    mapColumns(rows, config) {

      if (!rows.length) {
        return [];
      }

      const headers = Object.keys(rows[0]);

      return rows.map(row => {

        const mapped = {};

        Object.keys(config).forEach(key => {

          const aliases = config[key];

          const match = headers.find(h =>
            aliases.includes(h)
          );

          mapped[key] = match ? row[match] : null;

        });

        return mapped;
      });
    }

  };
});