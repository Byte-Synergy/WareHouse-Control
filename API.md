# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints except `/login` require authentication via session cookie.

### POST /login
ログイン

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "username": "admin"
}
```

### POST /logout
ログアウト

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### GET /session
セッション確認

**Response (200):**
```json
{
  "authenticated": true,
  "username": "admin"
}
```

---

## Products

### GET /products
全商品取得

**Response (200):**
```json
[
  {
    "id": 1,
    "sku": "PROD-001",
    "name": "ノートパソコン",
    "description": "高性能ノートPC",
    "category": "電子機器",
    "current_stock": 10,
    "min_stock": 5,
    "created_at": "2024-12-11 10:00:00"
  }
]
```

### GET /products/:id
商品詳細取得

**Response (200):**
```json
{
  "id": 1,
  "sku": "PROD-001",
  "name": "ノートパソコン",
  "description": "高性能ノートPC",
  "category": "電子機器",
  "current_stock": 10,
  "min_stock": 5,
  "created_at": "2024-12-11 10:00:00"
}
```

### POST /products
商品作成

**Request Body:**
```json
{
  "sku": "PROD-002",
  "name": "マウス",
  "description": "ワイヤレスマウス",
  "category": "周辺機器",
  "current_stock": 50,
  "min_stock": 10
}
```

**Response (201):**
```json
{
  "id": 2,
  "message": "商品を作成しました"
}
```

**Validation:**
- SKUと商品名は必須
- SKUと商品名は空白のみ不可
- 在庫数は0以上
- SKUは一意である必要あり

### PUT /products/:id
商品更新

**Request Body:**
```json
{
  "sku": "PROD-002",
  "name": "マウス",
  "description": "ワイヤレスマウス",
  "category": "周辺機器",
  "current_stock": 45,
  "min_stock": 10
}
```

**Response (200):**
```json
{
  "message": "商品を更新しました"
}
```

### DELETE /products/:id
商品削除

**Response (200):**
```json
{
  "message": "商品を削除しました"
}
```

**Note:** 取引履歴がある商品は削除できません

---

## Stock Operations

### POST /stock/in
入庫

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 10,
  "notes": "新規入荷"
}
```

**Response (200):**
```json
{
  "message": "Stock added successfully",
  "transaction_id": 1
}
```

**Validation:**
- 数量は正の整数
- 数量は100,000以下

### POST /stock/out
出庫

**Request Body:**
```json
{
  "product_id": 1,
  "quantity": 5,
  "notes": "販売"
}
```

**Response (200):**
```json
{
  "message": "Stock removed successfully",
  "transaction_id": 2
}
```

**Validation:**
- 数量は正の整数
- 数量は100,000以下
- 在庫不足の場合はエラー

### GET /stock/history
全取引履歴取得

**Response (200):**
```json
[
  {
    "id": 1,
    "product_id": 1,
    "product_name": "ノートパソコン",
    "sku": "PROD-001",
    "type": "in",
    "quantity": 10,
    "notes": "新規入荷",
    "created_at": "2024-12-11 10:00:00"
  }
]
```

### GET /stock/history/:product_id
商品別取引履歴取得

**Response (200):**
```json
[
  {
    "id": 1,
    "product_id": 1,
    "type": "in",
    "quantity": 10,
    "notes": "新規入荷",
    "created_at": "2024-12-11 10:00:00"
  }
]
```

---

## Alerts

### GET /alerts
低在庫商品取得

**Response (200):**
```json
[
  {
    "id": 1,
    "sku": "PROD-001",
    "name": "ノートパソコン",
    "current_stock": 3,
    "min_stock": 5,
    "category": "電子機器",
    "description": "高性能ノートPC",
    "created_at": "2024-12-11 10:00:00"
  }
]
```

---

## Export

### GET /export
CSV出力

**Response (200):**
- Content-Type: text/csv
- ファイル名: inventory-{timestamp}.csv

**CSVフォーマット:**
```csv
SKU,Name,Category,Current Stock,Min Stock,Description,Created At
PROD-001,ノートパソコン,電子機器,10,5,高性能ノートPC,2024-12-11 10:00:00
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "エラーメッセージ"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "商品が見つかりません"
}
```

### 500 Internal Server Error
```json
{
  "error": "データベースエラーが発生しました"
}
```
