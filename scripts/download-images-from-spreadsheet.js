const fs = require("fs");
const request = require("request");
const fsExtra = require("fs-extra");

const writeFile = (characterId, characterName, buffer) => {
  const fileName = `../src/assets/cards/${characterId}-${characterName}.png`;
  fs.writeFileSync(fileName, buffer);
  return fileName;
};

//fsExtra.emptyDirSync("../src/assets/cards");

request(
  {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
    qs: { output: "csv" },
  },
  (_err, response) => {
    const rows = response.body.split("\n");
    const total = rows.length - 1;
    let counter = 0;
    for (let row of rows.slice(1)) {
      const columns = row
        .split(",")
        .map((i) => i.trim())
        .map((i) => i.trim(","));

      const imageUrl = columns[4];
      if (imageUrl) {
        request({ url: columns[4], encoding: null }, (_err, response) => {
          const buffer = Buffer.concat([response.body]);
          const fileName = writeFile(columns[0], columns[1], buffer);
          console.log(fileName);

          counter++;
          if (counter === total) {
            console.log("done");
            return;
          }
        });
      }
    }
  }
);
