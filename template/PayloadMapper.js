sap.ui.define([], function () {
  "use strict";

  return {

    map(data) {

      return data.map(row => ({
        bukrs: row.CompanyCode,
        hkont: row.Account,
        wrbtr: row.Amount,
        waers: row.Currency
      }));

    }

  };
});