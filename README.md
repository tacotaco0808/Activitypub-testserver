# Activitypubのサーバーテスト
 nodejsのexpressで即席ActivitypubServer作成
## 必須:
- ドメイン取得-tacotasu.ddo.jp
  - なんでもよい無料のやつとってきた
- SSL認証
  - VPSをどっかで借りて取得したドメインを借りたVPSのIPに割り当てる
  - lets encryptで証明証発行してhttpsに対応させる
- nginx
  -　pm2でサーバーを常に起動(http://localhost:5000)
  - https://tacotasu.ddo.jp → http://localhost:5000  になるようにリバースプロキシ

sites-enabled/default
~~~
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }
}
~~~
sites-enabled/activitypubserver
~~~
server {
    listen 80;
    listen [::]:80;
    server_name tacotasu.ddo.jp;

    # HTTPからHTTPSにリダイレクト
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name tacotasu.ddo.jp;

    ssl_certificate /etc/letsencrypt/live/tacotasu.ddo.jp/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tacotasu.ddo.jp/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

~~~
## つまずいたやつ
- 意味わかんない仕組み
  - getメソッドで該当するjsonを返すだけだった
  -最低限必要なエンドポイント
    - /.well-known/webfinger
    - /actor
    - /inbox
  - /actorのgetメソッドは必ずヘッダー設定必要
    - expressでの例 : res.set("Content-Type", "application/activity+json");
