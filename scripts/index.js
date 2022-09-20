const fs = require("fs");
const fsExtra = require("fs-extra");
const axios = require("axios");
const util = require("util");
const stream = require("stream");
const { create } = require("domain");
const { of, filter } = require("rxjs");

const path = "./src/assets/cards/";

const pipeline = util.promisify(stream.pipeline);

// const readDir = util.promisify(fs.readDir);

const createFileName = (characterId, characterName) => {
  return `${characterId}-${characterName}.png`;
};

const writeFile = async (fileName, dataStream) => {
  const writeStream = fs.createWriteStream(fileName);
  return await pipeline(dataStream, writeStream);
};

//fsExtra.emptyDirSync("../src/assets/cards");

const doWork = async () => {
  const sheetResponse = await axios.get(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
    { params: { output: "csv" }, headers: { accept: "text/plain" } }
  );

  if (sheetResponse.status !== 200) {
    console.log(sheetResponse.statusText);
  } else {
    console.log("Sheet fetched");
  }

  // let imgDataMapping = [];

  const rows = sheetResponse.data.split("\n").splice(1);
  const imagesToFetch = rows.map((i) => {
    const j = i.split(",").map((i) => i.trim());
    return [j[0], j[1]];
  });
  const existingImgs = fs.readdirSync(path);

  console.log(existingImgs);

  const filteredImages = imagesToFetch
    .map(([i, j]) => createFileName(i, j))
    .filter((i) => !existingImgs.includes(i));

  console.log(filteredImages);
  for (let row of rows) {
    const columns = row
      .split(",")
      .map((i) => i.trim())
      .map((i) => i.trim(","));

    const fileName = createFileName(columns[0], columns[1]);

    if (!filteredImages.includes(fileName)) continue;
    else console.log("Image does not exist on disk");

    const imgUrl = columns[4];
    if (imgUrl.trim()) {
      const imgResponse = await axios.get(imgUrl, {
        responseType: "stream",
      });

      if (imgResponse.status !== 200) {
        console.log(imgResponse.statusText);
      } else {
        console.log("Downloaded image", columns[0]);
        console.log("Writing file", fileName);
        await writeFile(path + fileName, imgResponse.data);
        console.log("done");
      }

      // const imgName = createFileName(columns[0], columns[1]);
      // imgDataMapping.push([imgName, imgResponse.data]);
    } else {
      console.log("Image column empty");
    }
  }

  // for (const [fileName, stream] of imgDataMapping) {
  //   console.log("Writing file", fileName);
  //   await writeFile(fileName, stream);
  // }
  console.log("done!");
};

doWork();
