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

## Install

1. Clone or download this repo.
2. Open `chrome://extensions` (Chrome, Brave, Edge or any Chromium browser).
3. Turn on **Developer mode**.
4. Click **Load unpacked** and select the folder with `manifest.json`.
5. After any code change: click the reload icon on the extension card, then press F5 on the vTools tab.

## Use

1. **Options (once):** right-click the extension icon → **Options**. Set your OU list, host, co-host, location, timezone, tags, default category. Click **Save**.
2. Log in to vTools, then click the extension icon. It opens `https://events.vtools.ieee.org/tego_/event/create`.
3. Click the floating **⚡ Fill Event Form** button.
4. Either fill the modal by hand, or **import a `.md` file** (see below).
5. Click **Autofill Form** and wait a few seconds. vTools loads states, subcategories and speaker blocks from the server, so filling is sequential. The modal closes when done.
6. Review the page and submit the event yourself. The extension never submits for you.

## Markdown format

Copy `templates/event-template.md` and edit it. Rules:

- Header lines are `Key: value`, one per line. Empty value = skipped.
- Dates are `YYYY-MM-DD HH:MM` (24h).
- `## Description` starts the description. It supports `**bold**`, `*italic*`, `-` lists and `1.` lists.
- `## Speaker 1`, `## Speaker 2`... start each speaker. `Bio:` runs until the next `##` heading.
- `<!-- comments -->` are ignored.

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
├── examples/            # Filled example events (fake data)
├── push.sh              # Commit + push helper
└── LICENSE              # GPL-3.0
```


## License

GPL-3.0. See `LICENSE`.
