export interface ParsedMessage {
  name: string | null;
  email: string | null;
  xHandle: string | null;
  projectType: string | null;
  message: string;
}

export function parseMessage(content: string): ParsedMessage {
  const lines = content.split("\n");
  const parsed: ParsedMessage = {
    name: null,
    email: null,
    xHandle: null,
    projectType: null,
    message: "",
  };

  let messageStart = false;
  const messageLines: string[] = [];

  for (const line of lines) {
    if (messageStart) {
      messageLines.push(line);
      continue;
    }

    if (line.toLowerCase().startsWith("name:")) {
      parsed.name = line.substring(5).trim() || null;
    } else if (line.toLowerCase().startsWith("email:")) {
      parsed.email = line.substring(6).trim() || null;
    } else if (line.toLowerCase().includes("x (twitter):") || line.toLowerCase().includes("twitter:")) {
      const handle = line.match(/@?[\w]+/)?.[0];
      parsed.xHandle = handle ? (handle.startsWith("@") ? handle : `@${handle}`) : null;
    } else if (line.toLowerCase().startsWith("project type:")) {
      parsed.projectType = line.substring(13).trim() || null;
    } else if (line.toLowerCase().startsWith("message:") || line.trim() === "") {
      messageStart = true;
      if (line.toLowerCase().startsWith("message:")) {
        const msg = line.substring(8).trim();
        if (msg) messageLines.push(msg);
      }
    }
  }

  parsed.message = messageLines.join("\n").trim();

  return parsed;
}
