const fs = require("fs");
const fsExtra = require("fs-extra");
const axios = require("axios");
const util = require("util");
const stream = require("stream");

const pipeline = util.promisify(stream.pipeline);

const createFileName = (characterId, characterName) => {
  return `./src/assets/cards/${characterId}-${characterName}.png`;
};

const writeFile = async (fileName, dataStream) => {
  const writeStream = fs.createWriteStream(fileName);
  return await pipeline(dataStream, writeStream);
};

//fsExtra.emptyDirSync("../src/assets/cards");

const doWork = async () => {
  const data = (
    await axios.get(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
      { params: { output: "csv" } }
    )
  ).data;
  let datas = [];

  const rows = data.split("\n");
  for (let row of rows.slice(1)) {
    const columns = row
      .split(",")
      .map((i) => i.trim())
      .map((i) => i.trim(","));

    const imgUrl = columns[4];
    if (imgUrl) {
      const imgData = (
        await axios.get(imgUrl, {
          responseType: "stream",
        })
      ).data;

      const imgName = createFileName(columns[0], columns[1]);
      datas.push([imgName, imgData]);
    }
  }

  for (const [fileName, stream] of datas) {
    console.log(fileName);
    await writeFile(fileName, stream);
  }
  console.log("done!");
};

doWork();
