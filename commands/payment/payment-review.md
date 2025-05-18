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

# /payment review

## 查詢付款狀態 (payment review)

### 指令概述

`/payment review` 指令可以讓您查詢此文字頻道中，最近一筆訂單的付款狀態；或透過訂單編號直接查詢特定訂單的付款狀態。

<figure><img src="../../.gitbook/assets/payment_review.png" alt=""><figcaption></figcaption></figure>

### 使用權限

* **一般用戶**：所有用戶皆可使用此指令查詢自己建立的訂單，或在開票頻道中查詢該頻道的最新訂單
* **管理員**：擁有管理員權限的用戶可以查詢伺服器內任何用戶的任何訂單

### 指令參數

<table><thead><tr><th width="208.433349609375">參數</th><th>說明</th></tr></thead><tbody><tr><td><code>smilepay_id</code></td><td><strong>(選填) 付款編號</strong>：您想要查詢的 SmilePay 付款訂單編號</td></tr></tbody></table>

> **注意**: 若未提供訂單編號，系統將自動查詢頻道內最近一筆訂單

### 訂單狀態說明

系統中的訂單可能有以下幾種狀態：

1. **尚未付款／待入帳** (pending)
   * 訂單已建立但尚未確認付款
   * 顯示付款期限、付款方式和應付金額
2. **已繳費** (complete)
   * 訂單已確認付款完成
   * 顯示付款時間、付款方式和實付金額
3. **已過期** (expired)
   * 訂單超過付款期限未付款
   * 顯示訂單建立日期和過期日期

<div align="left"><figure><img src="../../.gitbook/assets/payment_review_pending.png" alt="" width="375"><figcaption></figcaption></figure> <figure><img src="../../.gitbook/assets/payment_review_complete.png" alt="" width="362"><figcaption></figcaption></figure></div>

### 相關指令

* [`/payment create`：建立新的付款訂單](payment-create.md)
* [`/payment history`：查看歷史付款紀錄](payment-history.md)
* &#x20;[`/payment recheck`：管理員重新檢查付款狀態](payment-recheck.md)
* &#x20;[`/fp`：管理員快速建立付款單](fp.md)
