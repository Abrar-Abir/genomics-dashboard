import copyfiles from "copyfiles";

const options = {
  up: true,
};

copyfiles(["../database/schema.json", "src/lib/"], options, (err) => {
  if (err) {
    console.error("Error copying file:", err);
  } else {
    console.log("File copied successfully");
  }
});
