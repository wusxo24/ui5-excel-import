sap.ui.define([
  "./ExcelReader",
  "./ColumnDetector",
  "./BatchProcessor",
  "./ApiClient"
], function (Reader, Detector, Batch, Api) {
  "use strict";

  return {

    async parseOnly({ file, columns }) {

      const rows = await Reader.read(file);

      const mapped = Detector.mapColumns(rows, columns);

      return {
        data: mapped,
        errors: []
      };
    },

    async postOnly({ data, mapper, uploadUrl, fileName, testMode }) {

      const payload = mapper.map(data);

      const batches = Batch.create(payload, 50);

      const responses = [];

      for (const batch of batches) {

        const res = await Api.post(uploadUrl, {
          fileName,
          testMode,
          data: batch
        });

        responses.push(res);
      }

      return responses;
    }

  };
});