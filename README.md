# UI5 Excel Import Library

Reusable Excel upload library for SAP UI5 applications.

## Install

```bash
git submodule add https://github.com/wusxo24/ui5-excel-import webapp/lib/excelImport
```

## Usage

```javascript
sap.ui.define([
  "your/lib/excelImport/ExcelImportFacade"
], function (ExcelImport) {

  const result = await ExcelImport.parseOnly({
    file,
    columns: ColumnConfig
  });

});
```

## Config

Edit files in `/template`

* ColumnConfig.js
* PayloadMapper.js
