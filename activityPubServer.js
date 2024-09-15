const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
const port = 5000;

app.use(bodyParser.json());
// 公開鍵をファイルから読み込む
const publicKeyPem = fs.readFileSync("./keys/public.pem", "utf8");
// 改行を \n に置き換える
const formattedPublicKey = publicKeyPem
  .replace(/\r\n/g, "\n")
  .replace(/\r/g, "\n")
  .trimEnd();
//メッセージを送るためのjson読み込み
// const document = fs.readFileSync("./create-hello-world.json", "utf8");

//apiエンドポイント
app.get("/actor", (req, res) => {
  const actor = {
    "@context": [
      "https://www.w3.org/ns/activitystreams",
      "https://w3id.org/security/v1",
    ],
    id: "https://tacotasu.ddo.jp/actor",
    type: "Person",
    name: "tacotaco88",
    preferredUsername: "tacotaco88",
    inbox: "https://tacotasu.ddo.jp/inbox",
    outbox: "https://tacotasu.ddo.jp/outbox",
    discoverable: true,
    publicKey: {
      id: "https://tacotasu.ddo.jp/actor#main-key",
      owner: "https://tacotasu.ddo.jp/actor",
      publicKeyPem: formattedPublicKey,
    },
  };
  console.log("actor get request!!");
  //必須
  res.set("Content-Type", "application/activity+json");
  res.json(actor);
});

app.get("/outbox", (req, res) => {
  const activity = req.body;
  // 処理して保存するなどのロジック
  res.status(201).json(activity);
});

app.get("/inbox", (req, res) => {
  const activity = req.body;
  // 受信したアクティビティを処理するロジック
  console.log("Received activity:", activity);
  res.sendStatus(200);
});

app.get("/.well-known/webfinger", (req, res) => {
  const resource = req.query.resource;
  if (resource === "acct:tacotaco88@tacotasu.ddo.jp") {
    const response = {
      subject: "acct:tacotaco88@tacotasu.ddo.jp",
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: "https://tacotasu.ddo.jp/actor",
        },
      ],
    };
    res.json(response);
  } else {
    res.sendStatus(404);
  }
});
// //メッセージを送るための仮の実装
// // SHA-256 ダイジェストを計算
// const sha256 = crypto.createHash("sha256");
// sha256.update(document);
// const digestBase64 = `SHA-256=${sha256.digest("base64")}`;
// app.get("/sendmessage", () => {
//   console.log("test");
// });

app.listen(port, () => {
  console.log(`Provider server running at http://localhost:${port}`);
});
