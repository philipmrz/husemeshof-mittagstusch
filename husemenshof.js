async function run() {
  const res = await fetch("https://husemeshof.de/mittagstisch");
  const html = await res.text();
 
  const days = {
    "1": "Montag", "2": "Dienstag", "3": "Mittwoch",
    "4": "Donnerstag", "5": "Freitag"
  };
  const today = new Date().getDay().toString();
  const dayName = days[today];
 
  if (!dayName) {
    console.log("Heute geschlossen.");
    return;
  }
 
  const nextDays = ["Dienstag, ", "Mittwoch, ", "Donnerstag, ", "Freitag, ", "Download"];
  const nextIndex = Object.keys(days).indexOf(today) + 1;
  const start = html.indexOf(dayName + ", ");
  const end = html.indexOf(nextDays[nextIndex - 1], start);
  let menu = html.substring(start, end);
 
  menu = menu
    .replace(/&bull;/g, "•")
    .replace(/&#40;/g, "(")
    .replace(/&#41;/g, ")")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/&[a-z]+;/g, "");
  menu = menu.replace(/<[^>]+>/g, "");
  menu = menu.replace(/\([^)]*\)/g, "");
  menu = menu.replace(/\d+,\d+\s*Euro\n?/g, "");
  menu = menu.split("\n").slice(1).join("\n");
  menu = menu
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
 
  console.log("Menü heute:\n" + menu);
 
  const topic = process.env.NTFY_TOPIC;
  await fetch(`https://ntfy.sh/${topic}`, {
    method: "POST",
    headers: {
      "Title": `🍽️ Mittagstisch Husemeshof – ${dayName}`,
      "Priority": "default",
      "Tags": "fork_and_knife"
    },
    body: menu
  });
 
  console.log("Push-Benachrichtigung gesendet!");
}
 
run();