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

# /payment history

## 查詢付款歷史 (payment history)

### 指令概述

`/payment history` 指令能讓用戶查詢自己的歷史付款紀錄，幫助用戶追蹤過去的交易情況並查看統計數據。

<figure><img src="../../.gitbook/assets/payment_history.png" alt=""><figcaption></figcaption></figure>

### 使用權限

* **一般用戶**：所有用戶皆可查詢自己的歷史付款紀錄
* **管理員：**&#x64C1;有管理員權限的用戶可以查詢伺服器內任何用戶的歷史付款紀錄

### 指令參數

<table><thead><tr><th width="152.36663818359375">參數</th><th>說明</th></tr></thead><tbody><tr><td><code>mode</code></td><td><p><strong>顯示模式</strong>：選擇歷史紀錄的顯示方式。</p><ul><li><code>公開顯示</code>：查詢結果將公開顯示在頻道</li></ul><ul><li><code>僅自己看到</code>：查詢結果僅有您自己能看見 (ephemeral message)</li></ul></td></tr><tr><td><code>page</code></td><td><strong>(選填) 查詢頁數</strong>：預設為第 <code>1</code> 頁，可直接輸入欲查詢的頁數</td></tr><tr><td><code>user</code></td><td><strong>(選填) 查詢指定使用者</strong>：管理員限定功能，查詢特定成員的歷史付款紀錄</td></tr></tbody></table>

### 頁面內容說明

#### 付款歷史頁面

每頁顯示至多三筆付款記錄，每筆記錄包含付款編號、方式、金額以及日期資訊

<div align="left"><figure><img src="../../.gitbook/assets/payment_history_info.png" alt="" width="345"><figcaption></figcaption></figure></div>

#### 統計表頁面

統計表顯示用戶的付款統計資訊，包括：

* 總消費金額
* 已完成/待付款/已過期 的付款訂單數
* 最大金額的一筆訂單
* 總共花費的手續費
* 首次/最近一次 的付款日期

<div align="left"><figure><img src="../../.gitbook/assets/payment_history_statistics.png" alt="" width="356"><figcaption></figcaption></figure></div>

### 相關指令

* &#x20;[`/payment create`：建立新的付款訂單](payment-create.md)
* &#x20;[`/payment review`：查詢訂單付款狀態](payment-review.md)
* &#x20;[`/payment recheck`：管理員重新檢查付款狀態](payment-recheck.md)
* &#x20;[`/fp`：管理員快速建立付款單](fp.md)
