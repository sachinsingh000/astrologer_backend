import bodyParser from "body-parser";

export default function loadExpress(app) {
  app.use(bodyParser.json({ limit: "1mb" }));
  app.use(bodyParser.urlencoded({ extended: true }));
}
 