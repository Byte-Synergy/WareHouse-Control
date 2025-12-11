# StockMaster Lite - 在庫管理システム

シンプルな在庫管理システムです。小規模ビジネス向け。

## 機能（Phase 1, 2 & 3完成）

- ✅ ログイン認証（セッションベース）
- ✅ 商品の追加・編集・削除
- ✅ 商品リスト表示
- ✅ 在庫数管理
- ✅ 低在庫表示（赤色ハイライト）
- ✅ レスポンシブデザイン
- ✅ 在庫入庫・出庫操作
- ✅ 在庫自動計算
- ✅ 低在庫アラート表示
- ✅ 低在庫フィルター機能
- ✅ CSVエクスポート機能
- ✅ **フロントエンド・バックエンドバリデーション**
- ✅ **エラーハンドリング改善**
- ✅ **ローディングインジケーター**
- ✅ **入力フォーム改善（プレースホルダー、バリデーション）**
- ✅ **日本語エラーメッセージ**
- ✅ **完全なAPIドキュメント**
- ✅ **詳細なユーザーガイド**

## セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. サーバー起動:
```bash
npm start
```

3. ブラウザで開く:
```
http://localhost:3000
```

## デフォルトログイン情報

- ユーザー名: `admin`
- パスワード: `admin123`

**⚠️ 本番環境では必ずパスワードを変更してください**

## ドキュメント

- **[QUICKSTART.md](QUICKSTART.md)** - 5分でスタート
- **[USER_GUIDE.md](USER_GUIDE.md)** - 機能の使い方
- **[LEARNING_GUIDE.md](LEARNING_GUIDE.md)** - このプロジェクトから学ぶ方法
- **[API.md](API.md)** - API仕様
- **[COMPLETION_REPORT.md](COMPLETION_REPORT.md)** - 完成報告
- **[TODO.md](TODO.md)** - プロジェクト要件

## 技術スタック

- Backend: Express.js + SQLite
- Frontend: Vue.js 3 (CDN)
- Authentication: Session-based
- Database: SQLite (inventory.db)

## プロジェクト構成

```
basic-inventory/
├── server/
│   ├── server.js          # Expressサーバー
│   ├── database.js        # SQLite設定
│   ├── auth.js           # 認証ロジック
│   └── routes/
│       ├── products.js   # 商品API
│       ├── stock.js      # 在庫操作API
│       ├── alerts.js     # 低在庫アラートAPI
│       └── export.js     # CSVエクスポートAPI
├── client/
│   ├── index.html        # メインHTML
│   ├── app.js            # Vue.jsアプリ
│   └── style.css         # スタイル
├── inventory.db          # SQLiteデータベース（自動生成）
└── package.json
```

## Phase 1, 2 & 3 完成内容

**Phase 1: 基礎機能**
- Express.js サーバーとSQLite データベース
- セッションベース認証システム
- 商品CRUD操作（作成・読取・更新・削除）
- Vue.js シングルページアプリケーション
- 日本語UI
- モバイル対応レスポンシブデザイン

**Phase 2: 在庫管理機能**
- 在庫入庫・出庫トランザクション機能
- 在庫レベル自動計算
- 低在庫アラート表示とフィルター
- CSVエクスポート機能
- トランザクション履歴記録

**Phase 3: 品質向上**
- 包括的なフロントエンド・バックエンドバリデーション
- 日本語エラーメッセージ
- ローディングインジケーター
- 改善されたフォーム入力（プレースホルダー、制限）
- 取引履歴がある商品の削除防止
- フォーカス状態とボタンの改善
- 完全なAPIドキュメント（API.md）
- 詳細なユーザーガイド（USER_GUIDE.md）

## ライセンス

MIT
