// 產生檔，勿手改。執行 `npm run sync:bot` 重新產生（scripts/sync-bot-ui.mjs）。
// 來源：bot 專案 FuniPayment 7b7f148 (release/v1.0.0) 的 tests/snapshots/ui.json 與 app/ 原始碼。
// 字串裡的 {token} 由 lib/scenario.ts 依示範情境填入。
import type { BotUiEntry } from "@/lib/bot-ui-types";

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
          "url": "/demo/barcodes.png"
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
          "icon_url": "/brand/playfuni-icon.png"
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
