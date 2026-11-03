/**
 * Markdown import for vTools-Helper
 * https://github.com/GBAS-BCN/vTools-Helper
 *
 * @file      md-import.js
 * @license   GPL-3.0
 *
 * Pure parser (no DOM access except the helper at the bottom is optional).
 * Exposes window.vtoolsMd = { TEMPLATE, parse }.
 */

(function (root) {
  const TEMPLATE = `# Event

<!-- Category / Subcategory valid values (Subcategory optional; Technical has none):
Professional: Continuing Education | Professional Development | Industry Relations | Professional (Other)
Technical: (none)
Nontechnical: Social | Awards Dinner | Pre-University Activities | Nontechnical (Other)
Administrative: ExCom | Officer Training
Humanitarian: SIGHT | Other
Pre-U STEM Program: Camp | Career Day | Competition/STEM Fairs | Girls in STEM | Industry/Company Tour | Mentoring | Parent Program | Student Workshop | Teacher Workshop
-->

Title: My Event Title
Start: 2026-11-20 18:00
End: 2026-11-20 20:00
Category: Technical
Subcategory:
WIE: no
Tags: #AI #Workshop #City #IEEE
Registration Link:
Survey URL:
Co-Host OU:
Co-Host Email:
Location Type: In-Person
Address: 123 Example Street
Address 2:
Building:
Room:
City: Exampleville
Country: United States
State: California
Postal Code: 00000
Map URL:
Virtual Info:
IEEE Attending:
Guests Attending:

## Description

Write the event description here. Supports **bold**, *italic* and lists:

- first point
- second point

## Speaker 1

First Name: Jane
Last Name: Doe
Preferred Name: Jane
Bio:
Short biography of the speaker. Can have **bold**, *italic* and
- lists
`;

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function inline(s) {
    return escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<i>$2</i>");
  }

  // Minimal markdown -> HTML: paragraphs, bold, italic, "-"/"*" lists, "1." lists.
  function mdToHtml(md) {
    const lines = md.replace(/\r\n?/g, "\n").split("\n");
    const out = [];
    let para = [];
    let list = null; // "ul" | "ol"

    const flushPara = () => {
      if (para.length) out.push("<p>" + para.map(inline).join("<br>") + "</p>");
      para = [];
    };
    const flushList = () => {
      if (list) out.push(`</${list}>`);
      list = null;
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const ul = line.match(/^\s*[-*]\s+(.*)$/);
      const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        flushPara();
        const kind = ul ? "ul" : "ol";
        if (list !== kind) {
          flushList();
          out.push(`<${kind}>`);
          list = kind;
        }
        out.push("<li>" + inline((ul || ol)[1]) + "</li>");
      } else if (!line.trim()) {
        flushPara();
        flushList();
      } else {
        flushList();
        para.push(line.trim());
      }
    }
    flushPara();
    flushList();
    return out.join("");
  }

  const KEY_MAP = {
    title: "title",
    start: "start",
    end: "end",
    category: "category",
    subcategory: "subcategory",
    wie: "wie",
    tags: "tags",
    "registration link": "regLink",
    "survey url": "surveyUrl",
    "co-host ou": "coHostOu",
    "co-host email": "coHostEmail",
    "ieee attending": "ieeeAttending",
    "guests attending": "guestsAttending",
    "location type": "locationType",
    address: "address1",
    "address 1": "address1",
    "address 2": "address2",
    building: "building",
    room: "room",
    city: "city",
    country: "country",
    state: "state",
    "postal code": "postal",
    "map url": "mapUrl",
    "virtual info": "virtualInfo",
    "first name": "firstName",
    "last name": "lastName",
    "preferred name": "preferredName"
  };

  function normDate(v) {
    const m = String(v || "").trim().match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})/);
    return m ? `${m[1]}T${m[2].padStart(2, "0")}:${m[3]}` : "";
  }

  function parse(md) {
    const result = { event: {}, descriptionHtml: "", speakers: [], warnings: [] };
    let section = "event"; // event | description | speaker
    let speaker = null;
    let descLines = [];
    let inBio = false;
    let bioLines = [];

    const closeSpeaker = () => {
      if (speaker) {
        speaker.bioHtml = mdToHtml(bioLines.join("\n"));
        result.speakers.push(speaker);
      }
      speaker = null;
      bioLines = [];
      inBio = false;
    };

    md = md.replace(/<!--[\s\S]*?-->/g, "");
    for (const raw of md.replace(/\r\n?/g, "\n").split("\n")) {
      const h = raw.match(/^##\s+(.*)$/);
      if (h) {
        const name = h[1].trim().toLowerCase();
        closeSpeaker();
        if (name === "description") {
          section = "description";
        } else if (/^speaker\b/.test(name)) {
          section = "speaker";
          speaker = {};
        } else {
          section = "ignore";
        }
        continue;
      }
      if (/^#\s/.test(raw)) continue; // top title

      if (section === "description") {
        descLines.push(raw);
      } else if (section === "event" || (section === "speaker" && !inBio)) {
        const kv = raw.match(/^\s*([A-Za-z\- ]+?)\s*:\s*(.*)$/);
        if (!kv) continue;
        const key = kv[1].toLowerCase();
        const val = kv[2].trim();
        if (section === "speaker" && key === "bio") {
          inBio = true;
          if (val) bioLines.push(val);
        } else if (KEY_MAP[key]) {
          (section === "speaker" ? speaker : result.event)[KEY_MAP[key]] = val;
        } else {
          result.warnings.push(`Unknown key: "${kv[1]}"`);
        }
      } else if (section === "speaker" && inBio) {
        bioLines.push(raw);
      }
    }
    closeSpeaker();

    result.descriptionHtml = mdToHtml(descLines.join("\n"));
    const e = result.event;
    e.start = normDate(e.start);
    e.end = normDate(e.end);
    e.wie = /^(yes|y|true|1|sim)$/i.test(e.wie || "");
    if (!e.title) result.warnings.push("Missing Title");
    if (!e.start) result.warnings.push("Missing/invalid Start (use YYYY-MM-DD HH:MM)");
    if (e.tags) e.tags = e.tags.trim();
    return result;
  }

  root.vtoolsMd = { TEMPLATE, parse };
  if (typeof module !== "undefined") module.exports = root.vtoolsMd;
})(typeof window !== "undefined" ? window : globalThis);
