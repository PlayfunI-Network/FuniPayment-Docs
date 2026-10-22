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
