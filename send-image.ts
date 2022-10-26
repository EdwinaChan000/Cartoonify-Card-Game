import fs from "fs";
import fetch from "cross-fetch";

// function to encode file data to base64 encoded string
function base64Encode(filepath: string) {
  var bitmap = fs.readFileSync(filepath);
  return bitmap.toString("base64");
}

function base64Decode(encoded_image_str: string, file_name: string) {
  var decoded = new Buffer(encoded_image_str, "base64");

  fs.writeFileSync(`./uploads/${file_name}`, decoded);

  return file_name;
}

export async function sendToPythonServer(user_id: any, inputImageFilename: any, style: any) {
  const base64str = base64Encode(`./uploads/${inputImageFilename}`); //"cat.jpeg"
  console.log(base64str);

  try {
    const resp = await fetch("http://localhost:8000/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: base64str,
        user_id: user_id.toString(),
        file_name: inputImageFilename,
        style: style,
      }),
    });

    const output = await resp.json();

    if (output["success"] === "true") {
      const output_image_filename = base64Decode(output["data"], output["file_name"]);

      return output_image_filename;
    }
    return;
  } catch (err) {
    console.log(err);
    console.log("Something went wrong with python server!!!");
    return;
  }
}
