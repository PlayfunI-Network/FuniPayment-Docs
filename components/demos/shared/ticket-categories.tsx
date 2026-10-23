// The ticket categories the Discord demos show beside the channel (components/demo's
// DiscordScene draws the screen itself). Used by the payments and getting-started chapters.
import { ChannelList } from "@/components/discord";

/**
 * A ticket channel moving through categories. Illustrative names, as a merchant could set them
 * on the dashboard's channels tab (the bot has no default names); `here` is the demo's channel.
 */
export function TicketCategories({
  here,
  categories,
}: {
  here: { name: string; category: string };
  categories: { name: string; others: string[] }[];
}) {
  return (
    <ChannelList
      className="h-full rounded-none!"
      categories={[
        { name: "資訊", channels: [{ name: "公告" }, { name: "商品介紹" }] },
        ...categories.map((c) => ({
          name: c.name,
          channels: [
            ...c.others.map((name) => ({ name })),
            ...(here.category === c.name ? [{ name: here.name, highlight: true }] : []),
          ],
        })),
      ]}
    />
  );
}
