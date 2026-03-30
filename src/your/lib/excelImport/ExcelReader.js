sap.ui.define([
  "your/lib/xlsx/xlsx.bundle"
], function () {
  "use strict";

  return {

    read(file) {

      return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (e) {

          const data = e.target.result;

          const workbook = XLSX.read(data, { type: "binary" });

          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          const json = XLSX.utils.sheet_to_row_object_array(sheet);

          resolve(json);
        };

        reader.onerror = reject;

        reader.readAsBinaryString(file);

      });
    }

  };
});