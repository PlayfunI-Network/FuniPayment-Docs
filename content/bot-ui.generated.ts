// 產生檔，勿手改。執行 `npm run sync:bot` 重新產生（scripts/sync-bot-ui.mjs）。
// 來源：bot 專案 FuniPayment 7b7f148 (release/v1.0.0) 的 tests/snapshots/ui.json、commands.json 與 app/ 原始碼。
// 字串裡的 {token} 由 lib/scenario.ts 依示範情境填入。
import type { BotUiEntry, CommandData } from "@/lib/bot-ui-types";

export const BOT_SOURCE_COMMIT = "7b7f148 (release/v1.0.0)";

export const BOT_UI = {
  "flow/fp_command/ok": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "請點選下方選單來決定付款方式",
        "description": "訂單金額：__{amount}__ 新台幣\n選擇後會提供付款教學及付款代碼\n\n請於 <t:{expiresIn}:R> 完成選擇，否則訂單將失效過期",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "select",
        "placeholder": "選擇付款方式",
        "disabled": false,
        "options": [
          {
            "label": "銀行轉帳（+{fee:bank_transfer}元）",
            "value": "bank_transfer",
            "description": null,
            "default": false
          },
          {
            "label": "四大超商條碼（+{fee:store_barcode}元）",
            "value": "store_barcode",
            "description": null,
            "default": false
          },
          {
            "label": "7-11 超商代碼（+{fee:ibon}元）",
            "value": "ibon",
            "description": null,
            "default": false
          },
          {
            "label": "全家超商代碼（+{fee:famiport}元）",
            "value": "famiport",
            "description": null,
            "default": false
          },
          {
            "label": "萊爾富超商代碼（+{fee:hilife}元）",
            "value": "hilife",
            "description": null,
            "default": false
          },
          {
            "label": "{balanceName}（+{fee:balance}元）",
            "value": "balance",
            "description": null,
            "default": false
          }
        ]
      }
    ],
    "ephemeral": false
  },
  "flow/fp_reselect": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "請點選下方選單來決定付款方式",
        "description": "訂單金額：__{amount}__ 新台幣\n選擇後會提供付款教學及付款代碼\n\n請於 <t:{expiresIn}:R> 完成選擇，否則訂單將失效過期",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "select",
        "placeholder": "選擇付款方式",
        "disabled": false,
        "options": [
          {
            "label": "銀行轉帳（+{fee:bank_transfer}元）",
            "value": "bank_transfer",
            "description": null,
            "default": false
          },
          {
            "label": "四大超商條碼（+{fee:store_barcode}元）",
            "value": "store_barcode",
            "description": null,
            "default": false
          },
          {
            "label": "7-11 超商代碼（+{fee:ibon}元）",
            "value": "ibon",
            "description": null,
            "default": false
          },
          {
            "label": "全家超商代碼（+{fee:famiport}元）",
            "value": "famiport",
            "description": null,
            "default": false
          },
          {
            "label": "萊爾富超商代碼（+{fee:hilife}元）",
            "value": "hilife",
            "description": null,
            "default": false
          },
          {
            "label": "{balanceName}（+{fee:balance}元）",
            "value": "balance",
            "description": null,
            "default": false
          }
        ]
      }
    ],
    "ephemeral": false
  },
  "builder/fp/famiport/0/designated=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "再次確認您的付款方式",
        "description": "訂單金額：{amount} 新台幣\n付款方式：{method_label:confirm}",
        "color": 47103,
        "fields": [
          {
            "name": "付款金額",
            "value": "```{total} 元```",
            "inline": false
          },
          {
            "name": "手續費",
            "value": "```{fee} 元```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消重選",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "下一步: 確認購買資訊",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/fp_method_confirm": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "📋 購買人資訊確認",
        "description": "根據金流平台相關規定，自 2026/04/23 後之所有訂單\n消費者需提供 **__真實姓名、電話__** 等資料以符合相關法規\n造成不便還請見諒！🙏",
        "color": 47103,
        "fields": [
          {
            "name": "您的姓名",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電話號碼",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電子郵件(Email)",
            "value": "```⚠️ 尚未填寫```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "上一步",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "✏️ 填寫/修改資訊",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": true,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/fp_command/zero_amount": {
    "kind": "message",
    "via": "response.send_message",
    "content": "建立付款訂單時，金額必須大於 0 元！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/fp_command/suspended": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此伺服器的收款功能目前已暫停，暫時無法建立新訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/fp_check_user/stranger": {
    "kind": "message",
    "via": "response.send_message",
    "content": "你沒有權限操作此訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "builder/fp/balance/500/designated=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "正在使用{balanceName}付款",
        "description": "您即將花費 **{amount}** {balanceName}來完成此訂單\n\n目前餘額：{balance}\n付款後餘：{balanceMinus}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消重選",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並支付{balanceName}",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/fp/balance/50/designated=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "{balanceName}餘額不足",
        "description": "此功能目前只支援{balanceName} **[全額支付]** 每筆訂單\n若您想以扣除餘額的方式付款，請聯繫管理員服務！\n歡迎使用 **/top-up <金額>** 自助儲值獲得更多點數\n\n目前餘額：__{balance}__ {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "選擇其他付款方式",
        "style": "primary",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/fp_balance_confirm/500": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "{balanceName}消費通知",
        "description": "<@{buyer}> 已成功支付了 **{amount}** {balanceName}\n目前餘額：{balanceMinus}",
        "color": 1027618,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/fp_balance_confirm/500@Client.send_dm_to_user": {
    "kind": "message",
    "via": "Client.send_dm_to_user",
    "embeds": [
      {
        "title": "{balanceName}消費通知",
        "description": "您在 __{shop}__ 已成功支付了 **{amount}** 點\n目前餘額：{balanceMinus} {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/fp_balance_confirm/0": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "{balanceName}付款失敗",
        "description": "使用{balanceName}付款時發生錯誤，請稍後再試。\n若此情況持續發生請聯繫管理員！",
        "color": 16711680,
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/consumer_info/filled=False/cancel_first=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "📋 購買人資訊確認",
        "description": "根據金流平台相關規定，自 2026/04/23 後之所有訂單\n消費者需提供 **__真實姓名、電話__** 等資料以符合相關法規\n造成不便還請見諒！🙏",
        "color": 47103,
        "fields": [
          {
            "name": "您的姓名",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電話號碼",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電子郵件(Email)",
            "value": "```⚠️ 尚未填寫```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "✏️ 填寫/修改資訊",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "取消操作",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": true,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/consumer_info/filled=True/cancel_first=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "📋 購買人資訊確認",
        "description": "根據金流平台相關規定，自 2026/04/23 後之所有訂單\n消費者需提供 **__真實姓名、電話__** 等資料以符合相關法規\n造成不便還請見諒！🙏",
        "color": 47103,
        "fields": [
          {
            "name": "您的姓名",
            "value": "```{buyerName}```",
            "inline": true
          },
          {
            "name": "電話號碼",
            "value": "```{buyerPhone}```",
            "inline": true
          },
          {
            "name": "電子郵件(Email)",
            "value": "```{buyerEmail}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "✏️ 填寫/修改資訊",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "取消操作",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/consumer_info/filled=True/cancel_first=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "📋 購買人資訊確認",
        "description": "根據金流平台相關規定，自 2026/04/23 後之所有訂單\n消費者需提供 **__真實姓名、電話__** 等資料以符合相關法規\n造成不便還請見諒！🙏",
        "color": 47103,
        "fields": [
          {
            "name": "您的姓名",
            "value": "```{buyerName}```",
            "inline": true
          },
          {
            "name": "電話號碼",
            "value": "```{buyerPhone}```",
            "inline": true
          },
          {
            "name": "電子郵件(Email)",
            "value": "```{buyerEmail}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消操作",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "✏️ 填寫/修改資訊",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/consumer_info_permission/stranger": {
    "kind": "message",
    "via": "response.send_message",
    "content": "你沒有權限操作此訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_create_command/ok": {
    "kind": "message",
    "via": "followup.send",
    "embeds": [
      {
        "title": "📋 購買人資訊確認",
        "description": "根據金流平台相關規定，自 2026/04/23 後之所有訂單\n消費者需提供 **__真實姓名、電話__** 等資料以符合相關法規\n造成不便還請見諒！🙏",
        "color": 47103,
        "fields": [
          {
            "name": "您的姓名",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電話號碼",
            "value": "```⚠️ 尚未填寫```",
            "inline": true
          },
          {
            "name": "電子郵件(Email)",
            "value": "```⚠️ 尚未填寫```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消操作",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "✏️ 填寫/修改資訊",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": true,
        "url": null
      }
    ],
    "ephemeral": true
  },
  "flow/payment_create_command/zero_amount": {
    "kind": "message",
    "via": "response.send_message",
    "content": "付款金額必須大於 0！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_create_command/designated_not_admin": {
    "kind": "message",
    "via": "response.send_message",
    "content": "您只能為自己建立付款訂單喔！\n此功能目前僅管理員可以使用",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_create_command/role_not_allowed": {
    "kind": "message",
    "via": "response.send_message",
    "content": "抱歉，您沒有權限建立付款訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_create_command/suspended": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此伺服器的收款功能目前已暫停，暫時無法建立新訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_create_command/method_disabled": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此商家目前沒有開放 **{method_label:create}** 做為付款方式\n請選擇其他付款方式或聯絡管理員",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "builder/payment_create/bank_transfer/invoice=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（銀行轉帳）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "銀行代碼",
            "value": "```004（台灣銀行）```",
            "inline": true
          },
          {
            "name": "銀行帳號",
            "value": "```{bankAccount}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "bank_transfer"
  },
  "builder/payment_create/bank_transfer/invoice=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（銀行轉帳）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "銀行代碼",
            "value": "```004（台灣銀行）```",
            "inline": true
          },
          {
            "name": "銀行帳號",
            "value": "```{bankAccount}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          },
          {
            "name": "發票抬頭",
            "value": "{invoiceTitle}",
            "inline": false
          },
          {
            "name": "統一編號",
            "value": "{invoiceNumber}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "bank_transfer"
  },
  "builder/payment_create/store_barcode/invoice=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/xV6W-iPCG5g)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（四大超商條碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "image": {
          "url": "{barcodeImage}"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "store_barcode"
  },
  "builder/payment_create/store_barcode/invoice=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/xV6W-iPCG5g)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（四大超商條碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": false
          },
          {
            "name": "發票抬頭",
            "value": "{invoiceTitle}",
            "inline": false
          },
          {
            "name": "統一編號",
            "value": "{invoiceNumber}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "image": {
          "url": "{barcodeImage}"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "store_barcode"
  },
  "builder/payment_create/ibon/invoice=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/dbFgeII7QX4)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（7-11超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```7-11```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "ibon"
  },
  "builder/payment_create/ibon/invoice=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/dbFgeII7QX4)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（7-11超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```7-11```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          },
          {
            "name": "發票抬頭",
            "value": "{invoiceTitle}",
            "inline": false
          },
          {
            "name": "統一編號",
            "value": "{invoiceNumber}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "ibon"
  },
  "builder/payment_create/famiport/invoice=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/MTPEwUcoBTE)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（全家超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```全家```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "famiport"
  },
  "builder/payment_create/famiport/invoice=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](https://youtu.be/MTPEwUcoBTE)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（全家超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```全家```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          },
          {
            "name": "發票抬頭",
            "value": "{invoiceTitle}",
            "inline": false
          },
          {
            "name": "統一編號",
            "value": "{invoiceNumber}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "famiport"
  },
  "builder/payment_create/hilife/invoice=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](/demo/tutorials/hilife.png)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（萊爾富超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```萊爾富```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "hilife"
  },
  "builder/payment_create/hilife/invoice=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "**付款者**：<@{buyer}>\n**手續費**：{fee} 元\n*[點我查看付款教學](/demo/tutorials/hilife.png)*",
        "color": 1027618,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777",
        "author": {
          "name": "速買配－成功建立訂單（萊爾富超商代碼）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款超商",
            "value": "```萊爾富```",
            "inline": true
          },
          {
            "name": "繳費代碼",
            "value": "```{payCode}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": true
          },
          {
            "name": "發票抬頭",
            "value": "{invoiceTitle}",
            "inline": false
          },
          {
            "name": "統一編號",
            "value": "{invoiceNumber}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false,
    "method": "hilife"
  },
  "flow/do_payment_create/db_failure": {
    "kind": "message",
    "via": "followup.send",
    "embeds": [
      {
        "title": "訂單建立失敗...",
        "description": "系統發生錯誤，請聯繫管理員再試一次",
        "color": 16259096,
        "author": {
          "name": "FunI 付款系統",
          "icon_url": "/brand/funi-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/do_payment_create/error-1": {
    "kind": "message",
    "via": "followup.send",
    "embeds": [
      {
        "title": "訂單建立失敗...",
        "description": "錯誤訊息：速買配服務連線異常，請聯繫管理員再試一次",
        "color": 16259096,
        "author": {
          "name": "FunI 付款系統",
          "icon_url": "/brand/funi-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/do_payment_create/error-2001": {
    "kind": "message",
    "via": "followup.send",
    "embeds": [
      {
        "title": "訂單建立失敗...",
        "description": "錯誤訊息：{errorDescription}",
        "color": 16259096,
        "author": {
          "name": "FunI 付款系統",
          "icon_url": "/brand/funi-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/do_payment_create/error-3003": {
    "kind": "message",
    "via": "followup.send",
    "embeds": [
      {
        "title": "訂單建立失敗...",
        "description": "錯誤訊息：此商家目前沒有開放此付款方式，請聯繫管理員再試一次",
        "color": 16259096,
        "author": {
          "name": "FunI 付款系統",
          "icon_url": "/brand/funi-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/do_payment_create/error-3003@client.notify_owner": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的付款方式: {method_label:create}\n因為在速買配尚未啟用此服務，系統已自動關閉此付款方式",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "builder/payment_complete": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "付款者：<@{buyer}>",
        "color": 2834270,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777/8888",
        "author": {
          "name": "速買配－付款完成通知（{method_label:complete}）",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "訂單金額",
            "value": "```{amount}```",
            "inline": true
          },
          {
            "name": "手續費",
            "value": "```{fee}```",
            "inline": true
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款時間",
            "value": "```{paidAt}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/payment_review/pending": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "付款者：<@{buyer}>\n手續費：{fee} 元",
        "color": 14011911,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777/8888",
        "author": {
          "name": "付款進度：尚未付款／待入帳",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款方式",
            "value": "```{method_label:review} ```",
            "inline": false
          },
          {
            "name": "付款金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款期限",
            "value": "```{deadline}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/payment_review/complete": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "付款者：<@{buyer}>\n手續費：{fee} 元",
        "color": 14011911,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777/8888",
        "author": {
          "name": "付款進度：已繳費",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "付款方式",
            "value": "```{method_label:review} ```",
            "inline": false
          },
          {
            "name": "訂單金額",
            "value": "```{total}```",
            "inline": false
          },
          {
            "name": "付款時間",
            "value": "```{paidAtBot}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/payment_review/expired": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "付款編號：{orderId}",
        "description": "付款者：<@{buyer}>\n手續費：{fee} 元\n應繳金額：{total} 元\n",
        "color": 14011911,
        "url": "https://discord.com/channels/111111111111111111/777777777777777777/8888",
        "author": {
          "name": "付款狀態：已過期",
          "icon_url": "/demo/avatars/shop.png"
        },
        "fields": [
          {
            "name": "訂單建立日",
            "value": "```{createdAt}```",
            "inline": false
          },
          {
            "name": "訂單過期日",
            "value": "```{deadline}```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_review/no_id_no_payments": {
    "kind": "message",
    "via": "response.send_message",
    "content": "您目前沒有任何付款訂單喔！",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_review/not_found": {
    "kind": "message",
    "via": "response.send_message",
    "content": "付款訂單 #{orderId} 不存在，請重新輸入。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_review/other_as_customer": {
    "kind": "message",
    "via": "response.send_message",
    "content": "抱歉，您只能查詢自己的付款訂單喔！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/payment_history_command/0": {
    "kind": "message",
    "via": "edit_original_response",
    "embeds": [
      {
        "title": "您總共消費了：__540 新台幣__",
        "description": "\n",
        "color": 14011911,
        "author": {
          "name": "{buyer} 的統計數據",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "fields": [
          {
            "name": "已完成的付款",
            "value": "```4筆```",
            "inline": true
          },
          {
            "name": "待付款的訂單",
            "value": "```0筆```",
            "inline": true
          },
          {
            "name": "已過期的付款",
            "value": "```0筆```",
            "inline": true
          },
          {
            "name": "付款最大單",
            "value": "```135 新台幣```",
            "inline": true
          },
          {
            "name": "手續費",
            "value": "```140 新台幣```",
            "inline": true
          },
          {
            "name": "首次付款日期",
            "value": "```2026/10/15｜135 元```",
            "inline": false
          },
          {
            "name": "最近一次付款",
            "value": "```2026/10/20｜135 元```",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": true,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/payment_history_command/1": {
    "kind": "message",
    "via": "edit_original_response",
    "embeds": [
      {
        "title": "第 1 頁／第 2 頁",
        "description": "－訂單編號：[241020563318](https://discord.com/channels/111111111111111111/777777777777777777/None)\n> 繳費時間：2026/10/20｜21:16:52\n> 付款方式：超商代碼｜全家\n> 付款金額：135 元\n\n－訂單編號：[241018120477](https://discord.com/channels/111111111111111111/777777777777777777/None)\n> 繳費時間：2026/10/18｜13:40:09\n> 付款方式：超商代碼｜全家\n> 付款金額：135 元\n\n－訂單編號：[241016904125](https://discord.com/channels/111111111111111111/777777777777777777/None)\n> 繳費時間：2026/10/16｜19:02:37\n> 付款方式：超商代碼｜全家\n> 付款金額：135 元\n\n...還有 **1** 筆訂單，點擊下方按鈕查看更多",
        "color": 14011911,
        "author": {
          "name": "{buyer} 已完成的付款訂單",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/payment_history/page=2": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "第 2 頁／第 2 頁",
        "description": "－訂單編號：[241015318842](https://discord.com/channels/111111111111111111/777777777777777777/8888)\n> 繳費時間：2026/10/15｜10:24:31\n> 付款方式：超商代碼｜全家\n> 付款金額：135 元\n\n",
        "color": 14011911,
        "author": {
          "name": "{buyer} 已完成的付款訂單",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/payment_history/page=-1": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "description": "請輸入有效的頁數：第 1 頁 ～ 第 2 頁",
        "color": 14011911,
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/paid": {
    "kind": "message",
    "via": "followup.send",
    "content": "付款訂單 #{orderId} 經查詢已完成付款！\n已發送付款完成通知，請留意相關訊息。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/not_paid": {
    "kind": "message",
    "via": "followup.send",
    "content": "付款訂單 #{orderId} 經查詢尚未付款，也可能已過期或不存在。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/expired": {
    "kind": "message",
    "via": "followup.send",
    "content": "付款訂單 #{orderId} 已過期或不存在，無法進行查詢。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/not_found": {
    "kind": "message",
    "via": "response.send_message",
    "content": "付款訂單 #{orderId} 不存在，請重新輸入。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/no_id_no_pending": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此頻道沒有任何標記為未付款的訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/already_complete": {
    "kind": "message",
    "via": "response.send_message",
    "content": "付款訂單 #{orderId} 已是付款完成之訂單！\n歡迎使用 </payment review> 查看更多...",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/paid_underpaid": {
    "kind": "message",
    "via": "followup.send",
    "content": "付款訂單 #{orderId} 的實際付款金額少於應付金額，系統未將此訂單標記為完成，請至速買配後台確認。",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/payment_recheck/paid_underpaid@client.notify_owner": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的付款訂單 #{orderId}\n實際付款金額 **{amount}** 元少於應付金額 **{total}** 元，系統未將此訂單標記為完成，請至速買配後台確認",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/rename_rate_limited": {
    "kind": "message",
    "via": "reply",
    "content": "因受到速率限制，自動更改頻道名稱失敗...\n請手動更改頻道名稱為：***✅-訂單***",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/move_category/50001": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的類別 <#{channel:category}>\n因機器人權限不足而無法移動頻道至此類別，請調整該類別的權限設定",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/move_category/50035": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的類別 <#{channel:category}>\n因頻道數量已達上限，無法移動頻道至此類別！\n請刪除該分類的頻道或在設定中增加更多類別",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/notifier/ticket_channel_forbidden": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的開票頻道 <#{channel:ticket}>\n因機器人權限不足而無法傳送訂單完成訊息，請調整該頻道的權限設定",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/log_channel_forbidden/send_to_log_channel": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的日誌頻道 <#{channel:log}>\n因機器人權限不足而記錄失敗，請調整該頻道的權限設定",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_show/self": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "{buyer}的{balanceName}",
        "description": "目前餘額：**{balance}**",
        "color": 47103,
        "footer": {
          "text": "FunI 付款系統",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_show/other_as_customer": {
    "kind": "message",
    "via": "response.send_message",
    "content": "您只能查詢自己的餘額喔！\n此功能目前僅管理員可以使用",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_transfer_command/ok": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "{balanceName}轉帳確認",
        "description": "您即將轉帳 **{amount}** 點給 <@{recipient}>\n⚠️轉帳後無法反悔，請再次確認金額與對象！",
        "color": 47103,
        "fields": [
          {
            "name": "當前餘額",
            "value": "{balance} 點",
            "inline": true
          },
          {
            "name": "轉帳後餘額",
            "value": "{balanceMinus} 點",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/member.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消操作",
        "style": "danger",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並轉帳",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": true
  },
  "flow/balance_transfer_cancel": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "本次轉帳已取消！",
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_confirm/50": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "{balanceName}轉帳成功",
        "description": "您已成功轉移 **{amount}** 給 <@{recipient}>\n歡迎至私訊查看詳細資訊！",
        "color": 47103,
        "fields": [
          {
            "name": "轉移理由",
            "value": "{reason}",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/member.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_confirm/50@client.send_to_log_channel": {
    "kind": "message",
    "via": "client.send_to_log_channel",
    "embeds": [
      {
        "title": "使用者轉帳紀錄",
        "description": "從 <@{buyer}> 轉帳給 <@{recipient}>\n金額： **{amount}** {balanceName}\n轉帳理由： {reason}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#0": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "{balanceName}轉帳通知",
        "description": "您剛剛在 __{shop}__ 完成了一筆交易\n已成功轉移了 **{amount}** 點給 <@{recipient}>\n",
        "color": 47103,
        "fields": [
          {
            "name": "轉移理由",
            "value": "{reason}",
            "inline": false
          },
          {
            "name": "最新餘額",
            "value": "{balanceMinus}",
            "inline": true
          },
          {
            "name": "原始餘額",
            "value": "{balance}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_confirm/50@client.send_dm_to_user#1": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "{balanceName}轉帳通知",
        "description": "您在 __{shop}__ 收到了一筆轉入款項\n已收到來自 <@{buyer}> 的 **{amount}** 點\n",
        "color": 47103,
        "fields": [
          {
            "name": "最新餘額",
            "value": "{recipientBalancePlus}",
            "inline": true
          },
          {
            "name": "原始餘額",
            "value": "{recipientBalance}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_confirm/10": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "轉帳失敗！",
        "description": "轉移{balanceName}時發生錯誤，請稍後再試。\n若此情況持續發生請聯繫管理員！",
        "color": 16711680,
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_transfer_command/disabled": {
    "kind": "message",
    "via": "response.send_message",
    "content": "伺服器目前**不允許**使用者互相轉帳！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_transfer_command/zero": {
    "kind": "message",
    "via": "response.send_message",
    "content": "轉移金額必須大於 **0**！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_transfer_command/insufficient": {
    "kind": "message",
    "via": "response.send_message",
    "content": "轉移失敗！您當前的{balanceName}不足：\n目前擁有: {balance}",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_transfer_command/to_bot": {
    "kind": "message",
    "via": "response.send_message",
    "content": "機油好難喝！ 你不會想把{balanceName}轉給機器人吧...",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_transfer_command/to_self": {
    "kind": "message",
    "via": "response.send_message",
    "content": "您無法將{balanceName}轉移給自己喔！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_history_command/1": {
    "kind": "message",
    "via": "edit_original_response",
    "embeds": [
      {
        "title": "第 1 頁／第 1 頁",
        "description": "2026/10/20｜21:15:40\n> 管理員幫您增加了 **30** {balanceName}\n\n2026/10/19｜14:02:11\n> 管理員幫您增加了 **20** {balanceName}\n\n2026/10/18｜10:30:05\n> 管理員幫您增加了 **10** {balanceName}\n\n",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}交易紀錄",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/balance_history_command/0": {
    "kind": "message",
    "via": "edit_original_response",
    "embeds": [
      {
        "title": "您目前擁有：__60__ {balanceName}",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}統計數據",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "fields": [
          {
            "name": "總轉入數量",
            "value": "```0 點```",
            "inline": true
          },
          {
            "name": "總轉出數量",
            "value": "```0 點```",
            "inline": true
          },
          {
            "name": "第一筆交易日期",
            "value": "```2026/10/18｜10 點```",
            "inline": false
          },
          {
            "name": "最近交易日期",
            "value": "```2026/10/20｜30 點```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "伺服器排行榜",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/balance_history_command/-1": {
    "kind": "message",
    "via": "edit_original_response",
    "embeds": [
      {
        "title": "我的排名: 第1名",
        "description": "🥇 **{buyer}**: 60 點\n🥈 **從缺**: 0 點\n🥉 **從缺**: 0 點\n4. **從缺**: 0 點\n5. **從缺**: 0 點\n6. **從缺**: 0 點\n7. **從缺**: 0 點\n8. **從缺**: 0 點\n9. **從缺**: 0 點\n10. **從缺**: 0 點\n",
        "color": 47103,
        "author": {
          "name": "{shop} 的{balanceName}排行榜",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/balance_history/page=1/admin=True": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "第 1 頁／第 2 頁",
        "description": "2026/10/21｜12:40:18\n> 管理員 {admin} 增加了 **16** {balanceName}\n> 原因: 無\n\n2026/10/20｜20:05:51\n> 管理員 {admin} 增加了 **15** {balanceName}\n> 原因: 無\n\n2026/10/19｜09:12:30\n> 管理員 {admin} 增加了 **14** {balanceName}\n> 原因: 無\n\n2026/10/18｜16:48:02\n> 管理員 {admin} 增加了 **13** {balanceName}\n> 原因: 無\n\n2026/10/17｜11:27:44\n> 管理員 {admin} 增加了 **12** {balanceName}\n> 原因: 無\n\n...還有 **2** 筆交易紀錄，點擊下方按鈕查看更多",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}交易紀錄",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/balance_history/page=9/admin=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "description": "請輸入有效的頁數：第 1 頁 ～ 第 2 頁",
        "color": 14011911,
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/balance_history/page=1/admin=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "第 1 頁／第 2 頁",
        "description": "2026/10/21｜12:40:18\n> 管理員幫您增加了 **16** {balanceName}\n\n2026/10/20｜20:05:51\n> 管理員幫您增加了 **15** {balanceName}\n\n2026/10/19｜09:12:30\n> 管理員幫您增加了 **14** {balanceName}\n\n2026/10/18｜16:48:02\n> 管理員幫您增加了 **13** {balanceName}\n\n2026/10/17｜11:27:44\n> 管理員幫您增加了 **12** {balanceName}\n\n...還有 **2** 筆交易紀錄，點擊下方按鈕查看更多",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}交易紀錄",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/balance_history/page=2/admin=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "第 2 頁／第 2 頁",
        "description": "2026/10/16｜18:30:15\n> 管理員幫您增加了 **11** {balanceName}\n\n2026/10/15｜10:12:40\n> 管理員幫您增加了 **10** {balanceName}\n\n",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}交易紀錄",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/balance_history/page=0/admin=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "您目前擁有：__91__ {balanceName}",
        "color": 47103,
        "author": {
          "name": "{buyer} 的{balanceName}統計數據",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "fields": [
          {
            "name": "總轉入數量",
            "value": "```0 點```",
            "inline": true
          },
          {
            "name": "總轉出數量",
            "value": "```0 點```",
            "inline": true
          },
          {
            "name": "第一筆交易日期",
            "value": "```2026/10/15｜10 點```",
            "inline": false
          },
          {
            "name": "最近交易日期",
            "value": "```2026/10/21｜16 點```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "伺服器排行榜",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "builder/balance_history/page=-1/admin=False": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "我的排名: 第1名",
        "description": "🥇 **{buyer}**: 91 點\n🥈 **{admin}**: 5 點\n🥉 **從缺**: 0 點\n4. **從缺**: 0 點\n5. **從缺**: 0 點\n6. **從缺**: 0 點\n7. **從缺**: 0 點\n8. **從缺**: 0 點\n9. **從缺**: 0 點\n10. **從缺**: 0 點\n",
        "color": 47103,
        "author": {
          "name": "{shop} 的{balanceName}排行榜",
          "icon_url": "/demo/avatars/buyer.png"
        },
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "回首頁",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "◀️️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "▶️",
        "style": "secondary",
        "disabled": true,
        "url": null
      },
      {
        "type": "button",
        "label": "統計表",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/balance_add/40/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額增加成功",
        "description": "增加了 <@{buyer}> **{amount}** 個{balanceName}\n目前餘額： **{balancePlus}**",
        "color": 47103,
        "fields": [
          {
            "name": "增加理由",
            "value": "無",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_add/40/50/活動": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額增加成功",
        "description": "增加了 <@{buyer}> **{amount}** 個{balanceName}\n目前餘額： **{balancePlus}**",
        "color": 47103,
        "fields": [
          {
            "name": "增加理由",
            "value": "{reason}",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_add/40/50/None@client.send_dm_to_user": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "餘額異動通知",
        "description": "您在 __{shop}__ 被增加了 **{amount}** 點\n目前餘額：**{balancePlus}** {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_add/-20/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額扣除成功",
        "description": "扣除了 <@{buyer}> **{amount}** 個{balanceName}\n目前餘額： **{balanceMinus}**",
        "color": 47103,
        "fields": [
          {
            "name": "扣除理由",
            "value": "無",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_add/-20/50/None@client.send_dm_to_user": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "餘額異動通知",
        "description": "您在 __{shop}__ 被扣除了 **{amount}** 點\n目前餘額：**{balanceMinus}** {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_add/-80/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "content": "**{buyer}** 的{balanceName}不足，無法減少指定金額！\n目前餘額: {balance}",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_add/0/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "content": "增減的金額不能為 **0**！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_set/80/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額設定成功",
        "description": "成功變更了 <@{buyer}> 的{balanceName}\n目前餘額： **{amount}**",
        "color": 47103,
        "fields": [
          {
            "name": "原始餘額",
            "value": "{balance} 點",
            "inline": true
          },
          {
            "name": "餘額更動",
            "value": "+{setIncrease} 點",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          },
          {
            "name": "理由",
            "value": "無",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_set/80/50/活動": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額設定成功",
        "description": "成功變更了 <@{buyer}> 的{balanceName}\n目前餘額： **{amount}**",
        "color": 47103,
        "fields": [
          {
            "name": "原始餘額",
            "value": "{balance} 點",
            "inline": true
          },
          {
            "name": "餘額更動",
            "value": "+{setIncrease} 點",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          },
          {
            "name": "理由",
            "value": "{reason}",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_set/80/50/None@client.send_dm_to_user": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "餘額異動通知",
        "description": "您在 __{shop}__ 被增加了 **{setIncrease}** 點\n目前餘額：**{amount}** {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_set/20/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "餘額設定成功",
        "description": "成功變更了 <@{buyer}> 的{balanceName}\n目前餘額： **{amount}**",
        "color": 47103,
        "fields": [
          {
            "name": "原始餘額",
            "value": "{balance} 點",
            "inline": true
          },
          {
            "name": "餘額更動",
            "value": "-{setDecrease} 點",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          },
          {
            "name": "執行者",
            "value": "{admin}",
            "inline": true
          },
          {
            "name": "理由",
            "value": "無",
            "inline": true
          },
          {
            "name": "​",
            "value": "​",
            "inline": true
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_set/20/50/None@client.send_dm_to_user": {
    "kind": "message",
    "via": "client.send_dm_to_user",
    "embeds": [
      {
        "title": "餘額異動通知",
        "description": "您在 __{shop}__ 被扣除了 **{setDecrease}** 點\n目前餘額：**{amount}** {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/balance_set/50/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "content": "{buyer} 的{balanceName}已經是 {amount} 了！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/balance_set/-1/50/None": {
    "kind": "message",
    "via": "response.send_message",
    "content": "設定的餘額不能為負數！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/topup_command/ok": {
    "kind": "message",
    "via": "response.send_message",
    "embeds": [
      {
        "title": "購買 {amount} {balanceName}",
        "description": "您正在購買 __{shop}__ 的{balanceName}\n儲值金額：*{amount} 新台幣*\n\n⚠️購買前請參照伺服器關於{balanceName}之使用說明",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "select",
        "placeholder": "選擇付款方式",
        "disabled": false,
        "options": [
          {
            "label": "銀行轉帳（+{fee:bank_transfer}元）",
            "value": "bank_transfer",
            "description": null,
            "default": false
          },
          {
            "label": "四大超商條碼（+{fee:store_barcode}元）",
            "value": "store_barcode",
            "description": null,
            "default": false
          },
          {
            "label": "7-11 超商代碼（+{fee:ibon}元）",
            "value": "ibon",
            "description": null,
            "default": false
          },
          {
            "label": "全家超商代碼（+{fee:famiport}元）",
            "value": "famiport",
            "description": null,
            "default": false
          },
          {
            "label": "萊爾富超商代碼（+{fee:hilife}元）",
            "value": "hilife",
            "description": null,
            "default": false
          }
        ]
      }
    ],
    "ephemeral": true
  },
  "flow/topup_reselect": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "購買 {amount} {balanceName}",
        "description": "您正在購買 __{shop}__ 的{balanceName}\n儲值金額：*{amount} 新台幣*\n\n⚠️購買前請參照伺服器關於{balanceName}之使用說明",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "select",
        "placeholder": "選擇付款方式",
        "disabled": false,
        "options": [
          {
            "label": "銀行轉帳（+{fee:bank_transfer}元）",
            "value": "bank_transfer",
            "description": null,
            "default": false
          },
          {
            "label": "四大超商條碼（+{fee:store_barcode}元）",
            "value": "store_barcode",
            "description": null,
            "default": false
          },
          {
            "label": "7-11 超商代碼（+{fee:ibon}元）",
            "value": "ibon",
            "description": null,
            "default": false
          },
          {
            "label": "全家超商代碼（+{fee:famiport}元）",
            "value": "famiport",
            "description": null,
            "default": false
          },
          {
            "label": "萊爾富超商代碼（+{fee:hilife}元）",
            "value": "hilife",
            "description": null,
            "default": false
          }
        ]
      }
    ],
    "ephemeral": false
  },
  "builder/topup/bank_transfer": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "再次確認您的付款方式",
        "description": "正在購買：{amount} {balanceName}\n付款方式：{method_label:confirm}",
        "color": 47103,
        "fields": [
          {
            "name": "付款金額",
            "value": "```{total} 元```",
            "inline": false
          },
          {
            "name": "手續費",
            "value": "```{fee} 元```",
            "inline": false
          }
        ],
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "取消重選",
        "style": "primary",
        "disabled": false,
        "url": null
      },
      {
        "type": "button",
        "label": "確認並獲取付款碼",
        "style": "success",
        "disabled": false,
        "url": null
      }
    ],
    "ephemeral": false
  },
  "flow/topup_confirm": {
    "kind": "message",
    "via": "response.edit_message",
    "embeds": [
      {
        "title": "成功建立付款資訊",
        "description": "你現在可以放心的刪除此訊息了！",
        "color": 47103,
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "flow/topup_command/zero_amount": {
    "kind": "message",
    "via": "response.send_message",
    "content": "{balanceName}的儲值金額必須大於 0！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/topup_command/topup_disabled": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此伺服器目前**未開放**自助儲值功能！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/topup_command/balance_disabled": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此伺服器**尚未啟用**商城點數系統！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "flow/topup_command/suspended": {
    "kind": "message",
    "via": "response.send_message",
    "content": "此伺服器的收款功能目前已暫停，暫時無法建立新訂單。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "builder/topup_success@dm": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "成功儲值 {amount} {balanceName}",
        "description": "您在 __{shop}__ 購買的 {amount} 點儲值已完成！\n目前餘額：**{balancePlus}** {balanceName}",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/shop.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "builder/topup_success@log": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "使用者儲值紀錄",
        "description": "<@{buyer}> 成功購買了 **{amount}** {balanceName}！\n目前餘額：**{balancePlus}**",
        "color": 47103,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "thumbnail": {
          "url": "/demo/avatars/buyer.png"
        },
        "has_timestamp": true
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "guide/dashboard/set_up": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "FunI 付款系統後台",
        "description": "在網頁上查看「{shop}」的訂單、報表，以及修改伺服器設定。\n只有這個伺服器的商家擁有者可以登入。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "開啟後台",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/servers/111111111111111111"
      }
    ],
    "ephemeral": false
  },
  "guide/dashboard/not_set_up_web": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "FunI 付款系統後台",
        "description": "「{shop}」還沒有設定 FunI 付款系統。\n按下方按鈕，幾分鐘就能在網頁上完成設定。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "開始設定",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/setup?server=111111111111111111"
      },
      {
        "type": "button",
        "label": "開啟後台",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/"
      }
    ],
    "ephemeral": false
  },
  "guide/settings/set_up": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "設定已移到網頁後台",
        "description": "Discord 上的設定面板已經停用，所有設定都改在網頁後台完成，畫面更完整。\n用 Discord 帳號登入即可，只有伺服器的商家擁有者可以修改設定。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "前往網頁後台",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/servers/111111111111111111/settings"
      }
    ],
    "ephemeral": false
  },
  "guide/settings/not_set_up": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "設定已移到網頁後台",
        "description": "Discord 上的設定面板已經停用。這個伺服器還沒有設定 FunI 付款系統，按下方按鈕，幾分鐘就能在網頁上完成設定。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "前往網頁後台",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/setup?server=111111111111111111"
      }
    ],
    "ephemeral": false
  },
  "guide/welcome/channel_web": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "感謝邀請 FunI 付款系統！",
        "description": "FunI 付款系統讓你直接在 Discord 建立付款訂單，買家用超商或轉帳付款，付款完成後自動通知你和買家。\n\n**開始使用**\n1. 按「開始設定」，用 Discord 帳號登入後台\n2. 填寫速買配（SmilePay）商家資料\n3. 選擇要開放的付款方式，就能用 `/fp` 建立第一筆訂單\n\n伺服器管理員隨時可以用 `/dashboard` 打開後台。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "開始設定",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/setup?server=111111111111111111"
      },
      {
        "type": "button",
        "label": "社群與說明",
        "style": "link",
        "disabled": false,
        "url": "https://go.funipay.net/discord"
      }
    ],
    "ephemeral": false
  },
  "guide/welcome/dm_web": {
    "kind": "message",
    "via": "builder",
    "embeds": [
      {
        "title": "感謝邀請 FunI 付款系統！",
        "description": "你會收到這則訊息，是因為有人把機器人加入了你的伺服器「{shop}」。\n\nFunI 付款系統讓你直接在 Discord 建立付款訂單，買家用超商或轉帳付款，付款完成後自動通知你和買家。\n\n**開始使用**\n1. 按「開始設定」，用 Discord 帳號登入後台\n2. 填寫速買配（SmilePay）商家資料\n3. 選擇要開放的付款方式，就能用 `/fp` 建立第一筆訂單\n\n伺服器管理員隨時可以用 `/dashboard` 打開後台。",
        "color": 14011911,
        "footer": {
          "text": "Powered by PlayfunI Network",
          "icon_url": "/brand/playfuni-icon.png"
        },
        "has_timestamp": false
      }
    ],
    "components": [
      {
        "type": "button",
        "label": "開始設定",
        "style": "link",
        "disabled": false,
        "url": "https://dashboard.funipay.net/setup?server=111111111111111111"
      },
      {
        "type": "button",
        "label": "社群與說明",
        "style": "link",
        "disabled": false,
        "url": "https://go.funipay.net/discord"
      }
    ],
    "ephemeral": false
  },
  "server/checks/wrong_channel": {
    "kind": "message",
    "via": "reply",
    "content": "您無法在此頻道使用此指令，請前往 <#{channel:command}> 使用",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/checks/no_permission": {
    "kind": "message",
    "via": "reply",
    "content": "抱歉，您沒有權限使用此指令。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/checks/dm": {
    "kind": "message",
    "via": "reply",
    "content": "您無法在私人訊息使用此指令，請前往伺服器內的指令頻道使用",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/checks/balance_not_enabled": {
    "kind": "message",
    "via": "reply",
    "content": "此伺服器**尚未啟用**商城點數系統！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/checks/not_in_service_web": {
    "kind": "message",
    "via": "reply",
    "content": "此伺服器尚未設定 FunI 付款系統。\n伺服器管理員可以到這裡完成設定：https://dashboard.funipay.net/setup?server={serverId}",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/notifier/payment_method_auto_disabled": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的付款方式: {method_label:create}\n因為在速買配尚未啟用此服務，系統已自動關閉此付款方式",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_publish/add_ok": {
    "kind": "message",
    "via": "reply",
    "content": "✅成功將此頻道設定為：自動發佈",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_publish/remove_ok": {
    "kind": "message",
    "via": "reply",
    "content": "⏸️成功將此頻道設定為：不自動發佈",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_publish/not_news": {
    "kind": "message",
    "via": "reply",
    "content": "此指令只能在公告頻道使用。",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/auto_publish/missing_permissions": {
    "kind": "message",
    "via": "reply",
    "content": "抱歉，只有擁有「管理此頻道」權限的人才能使用此指令！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/auto_publish/add_failed": {
    "kind": "message",
    "via": "reply",
    "content": "新增失敗！若此情況持續出現請聯絡作者",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_publish/remove_failed": {
    "kind": "message",
    "via": "reply",
    "content": "移除失敗！若此情況持續出現請聯絡作者",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/direct_rename/ok": {
    "kind": "message",
    "via": "reply",
    "content": "✅成功將此頻道設為動態頻道名稱：**__訂單 %all_orders%__**",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/direct_rename/cooldown": {
    "kind": "message",
    "via": "reply",
    "content": "機器人無法短期間內重複命名<#{channel:voice}>，造成不便請見諒\n我們已儲存您提交的新命名模板：**__訂單 %all_orders%__**\n請稍等約莫 10~20 分鐘後該頻道將會繼續被動態命名！",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/direct_rename/forbidden": {
    "kind": "message",
    "via": "reply",
    "content": "機器人權限不足，無法動態命名語音頻道 <#{channel:voice}>：\n我們已儲存您提交的新命名模板，請盡快調整該頻道之權限設定以便下次動態更新！",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/direct_rename/not_found": {
    "kind": "message",
    "via": "reply",
    "content": "機器人找不到此頻道，請調整相關權限設定！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/direct_rename/db_failed": {
    "kind": "message",
    "via": "reply",
    "content": "❌設定失敗！若此情況持續出現請聯絡作者",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/direct_rename/http_error": {
    "kind": "message",
    "via": "reply",
    "content": "❌設定失敗！若此情況持續出現請聯絡作者",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/dynamic_vc_rename/delete_ok": {
    "kind": "message",
    "via": "reply",
    "content": "✅成功將此頻道**__移除__**自動動態命名",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/dynamic_vc_rename/delete_failed": {
    "kind": "message",
    "via": "reply",
    "content": "❌移除失敗！若此情況持續出現請聯絡作者",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/dynamic_vc_rename/channel_not_configured": {
    "kind": "message",
    "via": "reply",
    "content": "❌該頻道尚未設定動態頻道名稱！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/dynamic_vc_rename/missing_permissions": {
    "kind": "message",
    "via": "reply",
    "content": "抱歉，只有擁有「管理此頻道」權限的人才能使用此指令！",
    "embeds": [],
    "components": [],
    "ephemeral": true
  },
  "server/dynamic_vc_loop/not_found": {
    "kind": "message",
    "via": "client.notify_owner",
    "content": "伺服器 **__{shop}__** 的動態命名語音頻道功能\n因為找不到頻道 {channelId:voice} 而失敗，請確認該頻道是否已被刪除或權限設置有誤\n我們已暫時移除該頻道的動態命名功能，請調整後重新新增設定！",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_reply/dm_trigger": {
    "kind": "message",
    "via": "reply",
    "content": "嗨！我是 FunI 付款機器人！\n一個協助伺服器管理付款訂單的小工具，我不是真人喔 🤖\n如果你有訂單上的問題，請直接尋求客服協助，謝謝 ❤️",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "server/auto_reply/server_mention": {
    "kind": "message",
    "via": "reply",
    "content": "嗨！我是 FunI 付款機器人！\n一個協助伺服器管理付款訂單的小工具，我不是真人喔 🤖\n如果你有訂單上的問題，請直接尋求客服協助，謝謝 ❤️",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "modal/consumer_info": {
    "kind": "modal",
    "title": "填寫購買人資訊",
    "fields": [
      {
        "id": "name",
        "label": "您的姓名",
        "required": true,
        "maxLength": 50
      },
      {
        "id": "mail",
        "label": "電子郵件(Email)",
        "required": true,
        "maxLength": 50
      },
      {
        "id": "phone",
        "label": "電話號碼",
        "required": true,
        "maxLength": 20
      }
    ]
  },
  "defaults/channel_names": {
    "kind": "channel_defaults",
    "rename": {
      "selecting": null,
      "pending": null,
      "complete": null,
      "expired": null
    },
    "disabledValue": "停用",
    "maxLength": 50
  },
  "source/expired_order": {
    "kind": "message",
    "via": "message.edit",
    "embeds": [
      {
        "title": "付款單已過期，請聯繫客服處理",
        "description": "請直接告知客服您需要的付款方式，客服會手動為您開立付款單！",
        "color": 16711680,
        "has_timestamp": false
      }
    ],
    "components": [],
    "ephemeral": false
  },
  "source/payment_create_cancelled": {
    "kind": "message",
    "via": "response.edit_message",
    "content": "操作已取消！",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "source/payment_create_confirming": {
    "kind": "message",
    "via": "response.edit_message",
    "content": "✅ 資訊確認中，請稍候...",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "text/payment/recheck_all_started": {
    "kind": "message",
    "via": "followup.send",
    "content": "開始檢查所有未付款訂單... (0/12)\n預計完成時間：約 0 分鐘",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "text/payment/recheck_all_progress": {
    "kind": "message",
    "via": "message.edit",
    "content": "正在檢查未付款訂單... (5/12)\n預計剩餘時間：約 0 分鐘",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "text/payment/recheck_all_progress/12": {
    "kind": "message",
    "via": "message.edit",
    "content": "正在檢查未付款訂單... (12/12)\n預計剩餘時間：約 0 分鐘",
    "embeds": [],
    "components": [],
    "ephemeral": false
  },
  "text/payment/recheck_all_summary": {
    "kind": "message",
    "via": "followup.send",
    "content": "## 所有未付款訂單更新完畢！\n- 更新成功：3 筆\n- 尚未付款：9 筆\n",
    "embeds": [],
    "components": [],
    "ephemeral": false
  }
} satisfies Record<string, BotUiEntry>;

export const COMMANDS = {
  "auto-publish": {
    "name": "auto-publish",
    "nameZh": "auto-publish",
    "description": "[管理員] 將此公告頻道設為自動發佈",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [],
    "subcommands": []
  },
  "balance": {
    "name": "balance",
    "nameZh": "balance",
    "description": "…",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [],
    "subcommands": [
      {
        "name": "show",
        "nameZh": "show",
        "description": "顯示您的點數餘額",
        "options": [
          {
            "name": "mode",
            "nameZh": "顯示模式",
            "description": "[公開/私人] 顯示點數餘額",
            "required": true,
            "type": "string",
            "choices": [
              {
                "label": "公開顯示",
                "value": "公開顯示"
              },
              {
                "label": "僅自己看到",
                "value": "僅自己看到"
              }
            ]
          },
          {
            "name": "user",
            "nameZh": "指定使用者",
            "description": "[管理員] 查看其他使用者的點數餘額",
            "required": false,
            "type": "user"
          }
        ]
      },
      {
        "name": "transfer",
        "nameZh": "transfer",
        "description": "轉移您的點數給其他使用者",
        "options": [
          {
            "name": "to",
            "nameZh": "接收者",
            "description": "請輸入你要轉移的對象",
            "required": true,
            "type": "user"
          },
          {
            "name": "amount",
            "nameZh": "金額",
            "description": "請輸入要轉移的金額",
            "required": true,
            "type": "integer"
          },
          {
            "name": "reason",
            "nameZh": "備註",
            "description": "(選填) 這個備註只有你能看到",
            "required": false,
            "type": "string"
          }
        ]
      },
      {
        "name": "add",
        "nameZh": "add",
        "description": "[管理員] 增加/減少使用者的點數餘額",
        "options": [
          {
            "name": "user",
            "nameZh": "指定使用者",
            "description": "請輸入欲調整之用戶",
            "required": true,
            "type": "user"
          },
          {
            "name": "amount",
            "nameZh": "金額",
            "description": "請輸入要增加的金額 (負數可以減少)",
            "required": true,
            "type": "integer"
          },
          {
            "name": "reason",
            "nameZh": "備註",
            "description": "(選填) 請輸入原因",
            "required": false,
            "type": "string"
          }
        ]
      },
      {
        "name": "set",
        "nameZh": "set",
        "description": "[管理員] 直接設定使用者的餘額",
        "options": [
          {
            "name": "user",
            "nameZh": "指定使用者",
            "description": "請輸入欲調整之用戶",
            "required": true,
            "type": "user"
          },
          {
            "name": "amount",
            "nameZh": "金額",
            "description": "請輸入要設定的金額",
            "required": true,
            "type": "integer"
          },
          {
            "name": "reason",
            "nameZh": "備註",
            "description": "(選填) 請輸入變更的原因",
            "required": false,
            "type": "string"
          }
        ]
      },
      {
        "name": "history",
        "nameZh": "history",
        "description": "查看您的餘額交易紀錄",
        "options": [
          {
            "name": "mode",
            "nameZh": "顯示模式",
            "description": "[公開/私人] 顯示歷史紀錄",
            "required": true,
            "type": "string",
            "choices": [
              {
                "label": "公開顯示",
                "value": "公開顯示"
              },
              {
                "label": "僅自己看到",
                "value": "僅自己看到"
              }
            ]
          },
          {
            "name": "page",
            "nameZh": "查詢頁數",
            "description": "(選填) 請輸入查詢頁數",
            "required": false,
            "type": "integer"
          },
          {
            "name": "user",
            "nameZh": "指定使用者",
            "description": "[管理員] 查看指定使用者的交易紀錄",
            "required": false,
            "type": "user"
          }
        ]
      }
    ]
  },
  "dashboard": {
    "name": "dashboard",
    "nameZh": "dashboard",
    "description": "[管理員] 開啟網頁後台（訂單、報表與設定）",
    "defaultMemberPermissions": 32,
    "dmPermission": false,
    "contexts": [
      0
    ],
    "options": [],
    "subcommands": []
  },
  "dynamic-vc-rename": {
    "name": "dynamic-vc-rename",
    "nameZh": "dynamic-vc-rename",
    "description": "[管理員] 將語音頻道設為狀態顯示",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [
      {
        "name": "channel",
        "nameZh": "channel",
        "description": "選擇語音頻道",
        "required": true,
        "type": "channel",
        "channelTypes": [
          2
        ]
      },
      {
        "name": "rename_name",
        "nameZh": "rename_name",
        "description": "動態頻道名稱（輸入 delete 停用服務）",
        "required": true,
        "type": "string"
      }
    ],
    "subcommands": []
  },
  "fp": {
    "name": "fp",
    "nameZh": "fp",
    "description": "[管理員] 快速為顧客建立付款訂單",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [
      {
        "name": "amount",
        "nameZh": "金額",
        "description": "付款金額",
        "required": true,
        "type": "integer"
      },
      {
        "name": "designated",
        "nameZh": "指定付款者",
        "description": "僅該用戶能操作此筆訂單",
        "required": false,
        "type": "user"
      }
    ],
    "subcommands": []
  },
  "payment": {
    "name": "payment",
    "nameZh": "payment",
    "description": "…",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [],
    "subcommands": [
      {
        "name": "create",
        "nameZh": "create",
        "description": "建立一筆新的付款訂單",
        "options": [
          {
            "name": "method",
            "nameZh": "付款方式",
            "description": "請選擇付款方式",
            "required": true,
            "type": "string",
            "choices": [
              {
                "label": "銀行轉帳",
                "value": "bank_transfer"
              },
              {
                "label": "四大超商條碼繳費",
                "value": "store_barcode"
              },
              {
                "label": "7-11 ibon 代碼繳費",
                "value": "ibon"
              },
              {
                "label": "全家 FamiPort 代碼繳費",
                "value": "famiport"
              },
              {
                "label": "萊爾富 Life-ET 代碼繳費",
                "value": "hilife"
              }
            ]
          },
          {
            "name": "amount",
            "nameZh": "金額",
            "description": "請輸入付款金額",
            "required": true,
            "type": "integer"
          },
          {
            "name": "buyer",
            "nameZh": "我的姓名",
            "description": "(選填) 請輸入您的姓名",
            "required": false,
            "type": "string"
          },
          {
            "name": "mail",
            "nameZh": "我的信箱",
            "description": "(選填) 請輸入您的信箱",
            "required": false,
            "type": "string"
          },
          {
            "name": "phone",
            "nameZh": "我的電話",
            "description": "(選填) 請輸入您的電話號碼",
            "required": false,
            "type": "string"
          },
          {
            "name": "comment",
            "nameZh": "備註",
            "description": "(選填) 請輸入備註",
            "required": false,
            "type": "string"
          },
          {
            "name": "invoice_number",
            "nameZh": "統一編號",
            "description": "(選填) 請輸入統一編號",
            "required": false,
            "type": "integer"
          },
          {
            "name": "invoice_title",
            "nameZh": "發票抬頭",
            "description": "(選填) 請輸入發票抬頭",
            "required": false,
            "type": "string"
          },
          {
            "name": "designated",
            "nameZh": "指定付款者",
            "description": "[管理員] 協助顧客開設付款訂單",
            "required": false,
            "type": "user"
          }
        ]
      },
      {
        "name": "review",
        "nameZh": "review",
        "description": "查詢最近一筆訂單的付款狀態",
        "options": [
          {
            "name": "smilepay_id",
            "nameZh": "付款編號",
            "description": "(選填) 請輸入付款編號",
            "required": false,
            "type": "integer"
          }
        ]
      },
      {
        "name": "history",
        "nameZh": "history",
        "description": "查詢我的歷史付款紀錄",
        "options": [
          {
            "name": "mode",
            "nameZh": "顯示模式",
            "description": "[公開/私人] 顯示歷史紀錄",
            "required": true,
            "type": "string",
            "choices": [
              {
                "label": "公開顯示",
                "value": "公開顯示"
              },
              {
                "label": "僅自己看到",
                "value": "僅自己看到"
              }
            ]
          },
          {
            "name": "page",
            "nameZh": "查詢頁數",
            "description": "(選填) 請輸入查詢頁數",
            "required": false,
            "type": "integer"
          },
          {
            "name": "user",
            "nameZh": "查詢使用者",
            "description": "[管理員] 查詢指定使用者",
            "required": false,
            "type": "user"
          }
        ]
      },
      {
        "name": "recheck",
        "nameZh": "recheck",
        "description": "[管理員] 複查頻道內最後一筆未付款訂單",
        "options": [
          {
            "name": "smilepay_id",
            "nameZh": "付款編號",
            "description": "(選填) 請輸入標記為未付款的付款編號",
            "required": false,
            "type": "integer"
          },
          {
            "name": "scan_all",
            "nameZh": "檢查所有未付款訂單",
            "description": "(選填) 是否複查所有未付款訂單",
            "required": false,
            "type": "integer",
            "choices": [
              {
                "label": "(預設) 否",
                "value": 0
              },
              {
                "label": "(謹慎使用) 複查伺服器內所有未付款的訂單",
                "value": 1
              }
            ]
          }
        ]
      }
    ]
  },
  "settings": {
    "name": "settings",
    "nameZh": "settings",
    "description": "伺服器設定已移到網頁後台",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [],
    "subcommands": []
  },
  "top-up": {
    "name": "top-up",
    "nameZh": "top-up",
    "description": "購買/儲值此商城的點數",
    "defaultMemberPermissions": null,
    "dmPermission": true,
    "contexts": null,
    "options": [
      {
        "name": "amount",
        "nameZh": "金額",
        "description": "請輸入儲值金額",
        "required": true,
        "type": "integer"
      }
    ],
    "subcommands": []
  }
} satisfies Record<string, CommandData>;

export const SMILEPAY_ERRORS = {
  "-2001": "無參數碼及商家代號錯誤",
  "-2002": "檢查碼錯誤",
  "-2003": "無付款模式",
  "-2004": "日期格式錯誤",
  "-2005": "無交易金額",
  "-2006": "7-11 超商取貨付款相關參數錯誤",
  "-2007": "訂單參數錯誤(內容字數過多)",
  "-3001": "無此商家代號",
  "-3002": "商家使用期限已到期",
  "-3003": "商家未開啟此付款方式",
  "-3004": "超過付款模式設定金額",
  "-3005": "速買配已關閉此付款方式",
  "-4000": "此銀行不提供 ATM 帳號",
  "-4001": "超商代碼取號錯誤",
  "-4002": "簡訊服務忙錄中",
  "-4003": "ibon 服務忙錄中",
  "-4004": "Fami 服務忙錄中",
  "-4005": "簡訊餘額不足",
  "-5000": "Smse 執行錯誤",
  "-9999": "未知的錯誤代碼 -9999"
} satisfies Record<string, string>;

export const BOT_METHOD_LABELS = {
  "dropdown": {
    "bank_transfer": "銀行轉帳",
    "store_barcode": "四大超商條碼",
    "ibon": "7-11 超商代碼",
    "famiport": "全家超商代碼",
    "hilife": "萊爾富超商代碼"
  },
  "confirm": {
    "bank_transfer": "銀行轉帳",
    "store_barcode": "四大超商條碼繳費",
    "ibon": "7-11 代碼繳費",
    "famiport": "全家代碼繳費",
    "hilife": "萊爾富代碼繳費"
  },
  "create": {
    "bank_transfer": "銀行轉帳",
    "store_barcode": "四大超商條碼繳費",
    "ibon": "7-11 ibon 代碼繳費",
    "famiport": "全家 FamiPort 代碼繳費",
    "hilife": "萊爾富 Life-ET 代碼繳費"
  },
  "complete": {
    "bank_transfer": "銀行轉帳",
    "store_barcode": "超商條碼",
    "ibon": "7-11超商代碼",
    "famiport": "全家超商代碼",
    "hilife": "萊爾富超商代碼"
  },
  "review": {
    "bank_transfer": "銀行轉帳",
    "store_barcode": "超商條碼",
    "ibon": "超商代碼｜7-11",
    "famiport": "超商代碼｜全家",
    "hilife": "超商代碼｜萊爾富"
  }
} as const;

export const BOT_DEFAULTS = {
  "balanceNickname": "商城點數"
} as const;
