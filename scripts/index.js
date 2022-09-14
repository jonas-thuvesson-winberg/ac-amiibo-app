const fs = require("fs");
const fsExtra = require("fs-extra");
const axios = require("axios");

const createFileName = (characterId, characterName) => {
  return `./src/assets/cards/${characterId}-${characterName}.png`;
};

const writeFile = (fileName, buffer) => {
  fs.writeFileSync(fileName, buffer);
};

//fsExtra.emptyDirSync("../src/assets/cards");

const requests = [];

axios
  .get(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
    { params: { output: "csv" } }
  )
  .then((response) => {
    const imgUrls = [];
    const rows = response.data.split("\n");
    for (let row of rows.slice(1)) {
      const columns = row
        .split(",")
        .map((i) => i.trim())
        .map((i) => i.trim(","));

      const imageUrl = columns[4];
      if (imageUrl) {
        imgUrls.push([createFileName(columns[0], columns[1]), imageUrl]);
      }
    }
    return imgUrls;
  })
  .then((imgUrls) => {
    for (const [fileName, url] of imgUrls) {
      requests.push(
        axios
          .get(url, {
            // encoding: null,
            responseType: "arrayBuffer",
            transformResponse: [
              (data) => {
                // console.log(fileName);
                return [fileName, data];
              },
            ],
          })
          .then((res) => res.data)
      );
    }

    return Promise.all(requests);
  })
  .then((responses) => {
    for (const [fileName, buffer] of responses) {
      console.log(fileName);
      writeFile(fileName, buffer);
    }
    console.log("done!");
  });
