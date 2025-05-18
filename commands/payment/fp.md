---
layout:
  title:
    visible: true
  description:
    visible: false
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# /fp

## 快速建立付款訂單 (fp)

### 指令概述

`/fp` 是專為管理員設計的訂單建立指令，相較於 [`/payment create`](payment-create.md) 指令，使用此指令時僅需輸入金額而不需提供付款方式，因顧客將可以在介面中自行選擇。這個指令特別適合在 Ticket 頻道中使用。

<figure><img src="../../.gitbook/assets/fp.png" alt=""><figcaption></figcaption></figure>

### 使用權限

* **僅限管理員使用：**&#x6B64;指令只能由具有 「付款管理員身分組」 的用戶使用

### 指令參數

<table><thead><tr><th width="164.23333740234375">參數</th><th>說明</th></tr></thead><tbody><tr><td><code>amount</code></td><td><strong>付款金額</strong>：此筆訂單的金額</td></tr><tr><td><code>customer</code></td><td><strong>(選填) 指定顧客</strong>：提及一位伺服器成員，則只有該名成員可以操作此付款單的後續選擇</td></tr></tbody></table>

{% hint style="info" %}
在絕大多數情況下，此指令在 Ticket 頻道使用時不需指定顧客，因該頻道通常僅有一位顧客
{% endhint %}

### 使用步驟

訂單建立後，顧客可以從下拉選單中選擇付款方式：

* 銀行轉帳（+手續費）
* 四大超商條碼（+手續費）
* 7-11 ibon 代碼（+手續費）
* 全家 FamiPort 代碼（+手續費）
* 萊爾富 Life-ET 代碼（+手續費）
* 商城點數（若伺服器啟用）

<div align="left"><figure><img src="../../.gitbook/assets/image.png" alt="" width="375"><figcaption><p>選擇付款方式</p></figcaption></figure> <figure><img src="../../.gitbook/assets/image (1).png" alt="" width="375"><figcaption><p>確認付款方式</p></figcaption></figure></div>

### 根據訂單狀態自動命名/移動頻道

你可以至 [伺服器設定](broken-reference) 調整訂單的自動命名及移動分類相關功能\
訂單一共分為四種狀態：

* 選擇中 - 使用 `/fp` 後且買家尚未選定付款方式
* **待付款** - 訂單一經建立即標示為待付款
* **已付款** - 買家完成付款後標示為已付款
* **已過期** - 買家未於指定時間內付款標示為已過期

### 相關指令

* &#x20;[`/payment create`：建立新的付款訂單](payment-create.md)
* &#x20;[`/payment review`：查詢訂單付款狀態](payment-review.md)
* &#x20;[`/payment history`：查看歷史付款紀錄](payment-history.md)
* &#x20;[`/payment recheck`：管理員重新檢查付款狀態](payment-recheck.md)
