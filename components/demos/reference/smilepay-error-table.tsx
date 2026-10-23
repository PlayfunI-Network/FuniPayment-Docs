// The SmilePay status codes on /troubleshooting/smilepay-errors, from SMILEPAY_ERRORS (the bot's
// app/i18n/payment.py SMILEPAY_ERROR_DESCRIPTIONS): the code and the words the bot shows after
// 「錯誤訊息：」. The generated -9999 entry is only a sample of the unknown-code text, so it is
// left out of the table (the page explains unknown codes).
import { SMILEPAY_ERRORS } from "@/content/bot-ui.generated";

/** The sample code the generator adds to show the unknown-code text. */
export const UNKNOWN_SAMPLE = "-9999";

export function smilepayErrorRows(): [code: string, description: string][] {
  return Object.entries(SMILEPAY_ERRORS).filter(([code]) => code !== UNKNOWN_SAMPLE);
}

export function SmilepayErrorTable() {
  return (
    <table>
      <thead>
        <tr>
          <th>代碼</th>
          <th>「錯誤訊息：」後面寫的字</th>
        </tr>
      </thead>
      <tbody>
        {smilepayErrorRows().map(([code, description]) => (
          <tr key={code}>
            <td className="whitespace-nowrap tabular-nums">{code}</td>
            <td>「{description}」</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
