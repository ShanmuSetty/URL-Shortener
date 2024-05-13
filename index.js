const express = require("express");

const path = require("path");

const { connectToMongoDB } = require("./connect");

const URL = require("./models/url");

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");

const app = express();

const PORT = 8001;

app.use(express.json());
connectToMongoDB("mongodb://localhost:27017/URL").then(() =>
  console.log("Mongodb Connected")
);
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRoute);
app.use("/", staticRoute);

app.get("/test", async (req, res) => {
  const allURLs = await URL.find({});
  return res.render("main", {
    urls: allURLs,
  });
});

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/url/:shortID", async (req, res) => {
  const shortID = req.params.shortID;
  const entry = await URL.findOneAndUpdate(
    {
      shortID,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
