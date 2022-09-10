const fs = require("fs");
const request = require("request");
let outputRows = [];

const writeFile = () => {
  let fileContents = "";
  for (let row of outputRows) {
    row = row.trimEnd(",");
    fileContents += `${row}\n`;
  }

  fs.writeFileSync("./base64contents.csv", fileContents);
};

request(
  {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
    qs: { output: "csv" },
  },
  (_err, response) => {
    const rows = response.body.split("\n");
    const total = rows.length - 1;
    let counter = 0;
    const header = rows[0];
    for (let row of rows.slice(1)) {
      const columns = row
        .split(",")
        .map((i) => i.trim())
        .map((i) => i.trim(","));
      request({ url: columns[4], encoding: null }, (_err, response) => {
        const buffer = Buffer.concat([response.body]);
        let base64String = buffer.toString("base64");
        let outputRow = `${row.trim("\n")},image/png`;
        while (true) {
          if (base64String.length > 40000) {
            outputRow += `,${base64String.substring(0, 40000)}`;
            base64String = base64String.substring(40000);
          } else if (base64String.length > 0) {
            outputRow += `,${base64String}`;
            break;
          } else {
            break;
          }
        }

        outputRows.push(outputRow);
        counter++;
        if (counter === total) {
          outputRows = [header + "\n", ...outputRows];
          writeFile();
          return;
        }
      });
    }
  }
);
