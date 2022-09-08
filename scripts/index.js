// const http = require("http");

// const options = {
//   host: "https://docs.google.com",
//   path: "/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub?output=csv",
//   method: "GET",
// };

// http
//   .request(options, (res) => {
//     var str = "";

//     //another chunk of data has been received, so append it to `str`
//     response.on("data", function (chunk) {
//       str += chunk;
//     });

//     //the whole response has been received, so we just print it out here
//     response.on("end", function () {
//       console.log(str);
//     });
//   })
//   .end();

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

// var propertiesObject = { output: "csv" };
request(
  {
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkbDvXTEDxtMrbHaLw0_SpO4zWskaL6lX_WkhTfwmZ_cifkTuPQwZkacJwSOO5i1geS6RMOYOW_4aq/pub",
    qs: { output: "csv" },
  },
  function (err, response, body) {
    console.log("Get response: " + response.statusCode);
    if (response.statusCode !== 200) {
      return;
    }
    const rows = response.body.split("\n");
    const total = rows.length - 1;
    let counter = 0;
    const header = rows[0];
    for (let row of rows.slice(1)) {
      const columns = row
        .split(",")
        .map((i) => i.trim())
        .map((i) => i.trim(","));
      // console.log(columns[4]);
      request({ url: columns[4], encoding: null }, (err, response, body) => {
        //console.log(response.read());
        const buffer = Buffer.concat([body]);
        //data:image/png;base64,
        let base64String = buffer.toString("base64");
        let outputRow = `${row.trim("\n")},image/png`;
        while (true) {
          if (base64String.length > 40000) {
            //outputRow.push(base64String.substring(0, 40000));
            outputRow += `,${base64String.substring(0, 40000)}`;
            base64String = base64String.substring(
              40000,
              base64String.length - 1
            );
          } else if (base64String.length > 0) {
            outputRow += `,${base64String}`;
            break;
          } else {
            break;
          }
        }

        // console.log(outputRow);
        outputRows.push(outputRow);
        counter++;
        if (counter === total) {
          outputRows = header + "\n" + outputRows;
          writeFile();
          return;
        }

        //console.log(outputRows);
      });
    }
    // console.log(outputRows);
  }
);
