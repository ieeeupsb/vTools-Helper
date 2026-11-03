# IEEE vTools Event Autofill Assistant

<p align="center">
  <a href="https://www.instagram.com/ieeeupsb/"><img alt="Instagram" src="https://img.shields.io/badge/Instagram-@ieeeupsb-E4405F?style=for-the-badge&logo=instagram&logoColor=white"></a>
  <a href="https://www.linkedin.com/company/ieee-up-sb/posts/"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-IEEE%20UP%20SB-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"></a>
  <a href="http://nuieee.fe.up.pt/"><img alt="Website" src="https://img.shields.io/badge/Website-nuieee.fe.up.pt-00629B?style=for-the-badge&logo=ieee&logoColor=white"></a>
</p>

Browser extension for IEEE Student Branches, Chapters and other Organizational Units. It fills the [IEEE vTools](https://events.vtools.ieee.org/) **Create Event** form for you, either from a pop-up form or from a **Markdown (`.md`) file** that holds all the event information.

Fork of [GBAS-BCN/vTools-Helper](https://github.com/GBAS-BCN/vTools-Helper) (GPL-3.0), extended with Markdown import, a co-host, an editable OU list, and category/subcategory defaults.

## What it can do

| Function | Description |
|---|---|
| **Markdown import** | Pick a `.md` file in the modal; every field is filled from it (title, dates, category, location, speakers, description...). |
| **Event template** | Download/copy a ready template from the modal or from `templates/event-template.md`. |
| **Interactive modal** | Fill or correct any field by hand before pressing **Autofill Form**. Rich-text editor for description and speaker bios. |
| **Category + Subcategory** | All 6 vTools categories and their subcategories, dependent dropdown (disabled for Technical). Default set in Options. |
| **Host / Co-Host** | Choose from an editable OU list (Options). Co-host is reused on repeat autofill, so no duplicate blocks. |
| **Location** | In-Person, Virtual or Hybrid. Address, building, room, city, postal code, map URL, virtual info. Country/State picked by name. |
| **Speakers** | Any number of speakers: first/last/preferred name and bio. |
| **Attendance** | IEEE members / guests attending, default `0` (leave empty for future events). |
| **Registration** | Link, survey URL, registration type, custom registration questions (Text / Multiple Choice). |
| **Tags / WIE** | Default tags from Options plus per-event tags; WIE checkbox. |
| **Options page** | Defaults for host OU, email, cosponsor, OU list, co-host, timezone, location, tags, attending numbers, category/subcategory. |
| **Export / Import settings** | Options page buttons save your settings to a JSON file and load one back as your defaults. Handy to share one config across a team or browser. |

## Install in Chrome / Chromium (step by step)

> The extension is **not** on the Chrome Web Store. You load it yourself as an *unpacked extension*. It takes about one minute and works in every Chromium browser: **Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi, Chromium**. (Firefox and Safari are not supported.)

### 1. Get the code

Pick one:

- **Download ZIP (easiest):** on the GitHub page click **Code → Download ZIP**, then **extract** it. Do not load the `.zip` itself.
- **Git:**
  ```bash
  git clone https://github.com/ieeeupsb/vTools-Helper.git
  ```

You should now have a folder that contains `manifest.json` directly inside it. **That is the folder you will select.** Keep it somewhere permanent (e.g. `Documents/vTools-Helper`): if you move or delete it, the extension stops working.

### 2. Open the extensions page

Type this in the address bar and press Enter:

| Browser | Address |
|---|---|
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Brave | `brave://extensions` |
| Opera | `opera://extensions` |
| Vivaldi | `vivaldi://extensions` |

### 3. Turn on Developer mode

Toggle **Developer mode** (top-right corner in Chrome/Brave, left sidebar in Edge). New buttons appear: *Load unpacked*, *Pack extension*, *Update*.

### 4. Load the extension

1. Click **Load unpacked**.
2. Select the folder that contains `manifest.json` (not a parent folder, not `src/`).
3. Click **Select Folder / Open**.

The card **vTools IEEE Event Autofill Assistant** now appears in the list. If it shows a red **Errors** button, see *Troubleshooting* below.

### 5. Pin it (recommended)

Click the puzzle-piece icon in the toolbar, then the pin next to the extension, so the icon is always visible.

### 6. Configure once

Right-click the extension icon → **Options** (or **Details → Extension options**). Set your OU list, host OU, co-host, location, time zone, tags, default category. Click **Save**.

### Update later

- ZIP: download the new ZIP, extract over the old folder (same location).
- Git: `git pull`.
- Then in `chrome://extensions` click the **reload** icon on the extension card, and press **F5** on any open vTools tab.

> Chrome may show *"Disable developer mode extensions"* on startup. Click the X / keep it. Do not click Disable.

### Troubleshooting

| Problem | Fix |
|---|---|
| `Manifest file is missing or unreadable` | You selected the wrong folder. Select the one with `manifest.json` directly inside. |
| Cannot select a `.zip` | Extract it first. |
| Icon does nothing / no **⚡ Fill Event Form** button | Be logged in to vTools and on `https://events.vtools.ieee.org/tego_/event/create`. Press F5 after loading or reloading the extension. |
| Extension disappeared after moving the folder | Load it again from the new location. |
| Work/school managed browser blocks it | Admin policy disables developer mode. Use a personal browser profile. |
| Options not saved | Click **Save** at the bottom of the Options page. |

## Use

1. Log in to vTools, then click the extension icon. It opens `https://events.vtools.ieee.org/tego_/event/create`.
2. Click the floating **⚡ Fill Event Form** button.
3. Either fill the modal by hand, or **import a `.md` file** (see below).
4. Click **Autofill Form** and wait a few seconds. vTools loads states, subcategories and speaker blocks from the server, so filling is sequential. The modal closes when done.
5. Review the page and submit the event yourself. The extension never submits for you.

Host, location, time zone and default tags come from the **Options** page, not from the Markdown file (the Markdown can override location and co-host).

## Markdown event template

Write each event in a `.md` file, import it in the modal, and the form is filled for you. Start from `templates/event-template.md` (also downloadable from the modal) and copy-edit the example files in `examples/`.

### Quick start

1. Copy `templates/event-template.md` to a new file, e.g. `my-workshop.md`.
2. Edit the values after each `Key:`. Delete the value to skip a field.
3. In vTools click **⚡ Fill Event Form**, then under **Import from Markdown (.md)** choose your file. The modal fields fill in and any problem is shown as a warning.
4. Check the modal, then click **Autofill Form**.

### The template

```markdown
# Event

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
```

### Rules

- Header lines are `Key: value`, one per line. Empty value = skipped.
- Key names are not case sensitive. Keep them spelled as in the table below.
- Dates are `YYYY-MM-DD HH:MM` (24h).
- `## Description` starts the description. It supports `**bold**`, `*italic*`, `-` lists and `1.` lists. It runs until the next `##` heading.
- `## Speaker 1`, `## Speaker 2`... start each speaker (add as many as you need). `Bio:` runs until the next `##` heading.
- `<!-- comments -->` are ignored.
- Save the file as UTF-8 (accents are fine).

### Keys

| Key | Notes |
|---|---|
| `Title`, `Start`, `End` | Required: Title and Start. If End is missing, it is Start + 2 h. |
| `Category` | Professional, Technical, Nontechnical, Administrative, Humanitarian, Pre-U STEM Program |
| `Subcategory` | Optional, matched by name (see below). Technical has none. |
| `WIE` | `yes` / `no` |
| `Tags` | e.g. `#AI #Workshop #IEEE` |
| `Registration Link`, `Survey URL` | URLs |
| `Co-Host OU`, `Co-Host Email` | Enables the co-host block |
| `Location Type` | `In-Person`, `Virtual` or `Hybrid` |
| `Address`, `Address 2`, `Building`, `Room`, `City`, `Postal Code`, `Country`, `State`, `Map URL` | Country and State by name, e.g. `Portugal` / `Norte` |
| `Virtual Info` | Link or instructions for virtual/hybrid events |
| `IEEE Attending`, `Guests Attending` | Numbers |
| `First Name`, `Last Name`, `Preferred Name`, `Bio` | Inside a `## Speaker N` section |

### Categories and subcategories

| Category | Subcategories |
|---|---|
| Professional | Continuing Education, Professional Development, Industry Relations, Professional (Other) |
| Technical | none |
| Nontechnical | Social, Awards Dinner, Pre-University Activities, Nontechnical (Other) |
| Administrative | ExCom, Officer Training |
| Humanitarian | SIGHT, Other |
| Pre-U STEM Program | Camp, Career Day, Competition/STEM Fairs, Girls in STEM, Industry/Company Tour, Mentoring, Parent Program, Student Workshop, Teacher Workshop |

Matching ignores case, spaces and punctuation. Unknown values show a warning in the modal and are left unchanged.

### Templates and examples

- `templates/event-template.md`: empty template to copy (same as the modal's "Download template" link)
- `examples/technical-workshop.md`: Technical, in-person, two speakers
- `examples/administrative-meeting.md`: Administrative → ExCom
- `examples/virtual-talk.md`: Professional → Professional Development, virtual
- `examples/hybrid-social.md`: Nontechnical → Social, hybrid
- `examples/prestem-workshop.md`: Pre-U STEM → Girls in STEM

All names, addresses, emails and OU codes in them are fake. Replace them with your own.

## Not covered yet

Header, Footer, Agenda and Time Zone (time zone comes from Options), and anything the form needs beyond the fields above. Fill those by hand.

## Files

```
.
├── manifest.json        # Manifest V3 config (load this folder as unpacked)
├── src/
│   ├── background.js    # Service worker: toolbar click → open create page / modal
│   ├── content.js       # Modal, Markdown apply, form population logic
│   ├── md-import.js     # Markdown parser + template (also runs in Node)
│   ├── options.html     # Preferences page
│   ├── options.js       # Preferences storage + logic
│   └── styles.css       # Button, modal and editor styling
├── templates/           # Empty event template
├── examples/            # Filled sample events (fake data)
└── LICENSE              # GPL-3.0
```


## License

GPL-3.0. See `LICENSE`.
