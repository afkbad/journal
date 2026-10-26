const DB_NAME = "daymark-journal";
export function openStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("journal");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function readJournal() {
  const db = await openStore();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("journal");
    const req = tx.objectStore("journal").get("data");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}
export async function writeJournal(data) {
  const db = await openStore();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("journal", "readwrite");
    tx.objectStore("journal").put(data, "data");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => reject(tx.error || new Error("Save interrupted"));
  });
}
export const dateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const fromKey = (key) => new Date(`${key}T12:00:00`);
export function monday(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
export function daysFrom(start, count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}
export function makeDemo() {
  const today = new Date();
  const start = monday(today);
  start.setDate(start.getDate() - 7);
  const values = [325.5, -120, 480, 215, -85];
  const entries = {};
  daysFrom(start, 5).forEach(
    (d, i) =>
      (entries[dateKey(d)] = {
        date: dateKey(d),
        pnl: String(values[i]),
        trades: String([3, 2, 4, 2, 1][i]),
        wins: String([2, 0, 3, 2, 0][i]),
        mood: ["Focused", "Frustrated", "Confident", "Focused", "Patient"][i],
        plan: "Wait for the opening range to form. Only take clean setups at key levels.",
        execution: [
          "Stayed patient and waited for confirmation. Took profit at the planned level.",
          "Entered too early without confirmation. Respected my stop and stepped away.",
          "Two clean continuation setups. Let the winning trade reach its target.",
          "Kept position size consistent and followed the plan.",
          "Market was choppy. Took one attempt, then protected my headspace.",
        ][i],
        lesson: [
          "Patience pays. My best trades come when I let the setup come to me.",
          "A missed trade is better than a forced trade.",
          "Trust the plan, manage the risk, let the trade work.",
          "Simple and repeatable is the goal.",
          "Recognizing when to stop is part of the process.",
        ][i],
        tags: [
          ["Opening range"],
          ["Breakout"],
          ["Pullback", "Trend continuation"],
          ["Pullback"],
          ["Reversal"],
        ][i],
        mistakes: [[], ["Early entry"], [], [], ["Chased price"]][i],
        rules:
          i === 1
            ? ["Respected my risk limit", "Avoided revenge trading"]
            : [
                "Respected my risk limit",
                "Waited for my setup",
                "Followed my exit plan",
                "Avoided revenge trading",
              ],
        tomorrow: "Keep risk consistent. Quality over quantity.",
        images: [],
      }),
  );
  return { entries, demo: true };
}
