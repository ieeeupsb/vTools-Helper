/**
 * Project Name
 * https://github.com/GBAS-BCN/vTools-Helper
 *
 * @file      content.js
 * @author    Gil Ben Ami
 * @date      2026-10-09
 * @license   GPL-3.0
 */

(function () {
  let userConfig = {};

  // Load saved settings on init including custom questions
  chrome.storage.sync.get(
    {
      hostOu: "STBXXXXXXXX - hostOu",
      hostEmail: "email@emailprovider.com",
      notifyImmediately: false,
      cosponsor: "",
      ieeeAttendingDefault: "0",
      guestsAttendingDefault: "0",
      categoryDefault: "2",
      subcategoryDefault: "",
      ouList: "SBA00000 - Example University, WIE\nSBC00000 - Example University, CS11\nSBC00000A - Example University, AES10\nSBC00000B - Example University, PE31\nSTB00000 - Example University",
      coHostEnabled: false,
      coHostOu: "",
      coHostEmail: "",
      coHostNotify: false,
      extraContact: "",
      timezone: "Europe/Madrid",
      defaultTags: "#SB #UNI",
      address: "address",
      city: "Barcelona",
      postal: "00000",
      country: "194",
      state: "1663",
      useSurveyUrl: false,
      regType: "Custom",
      regStartMode: "autofill_time",
      regEndMode: "event_start",
      maxReg: "",
      enableCustomQuestions: false,
      customQuestionsCount: 0,
      customQuestions: []
    },
    (items) => {
      userConfig = items;
    }
  );

  const subcategoriesMap = {
    "1": [
      { id: "1", name: "Continuing Education" },
      { id: "2", name: "Professional Development" },
      { id: "3", name: "Industry Relations" },
      { id: "4", name: "Professional (Other)" }
    ],
    "2": [],
    "3": [
      { id: "5", name: "Social" },
      { id: "6", name: "Awards Dinner" },
      { id: "7", name: "Pre-University Activities" },
      { id: "8", name: "Nontechnical (Other)" }
    ],
    "4": [
      { id: "9", name: "ExCom" },
      { id: "10", name: "Officer Training" }
    ],
    "5": [
      { id: "11", name: "SIGHT" },
      { id: "12", name: "Other" }
    ],
    "6": [
      { id: "13", name: "Camp" },
      { id: "14", name: "Career Day" },
      { id: "15", name: "Competition/STEM Fairs" },
      { id: "16", name: "Girls in STEM" },
      { id: "17", name: "Industry/Company Tour" },
      { id: "18", name: "Mentoring" },
      { id: "19", name: "Parent Program" },
      { id: "20", name: "Student Workshop" },
      { id: "21", name: "Teacher Workshop" }
    ]
  };

  function formatVToolsDate(datetimeLocalVal) {
    if (!datetimeLocalVal) return "";
    const dateObj = new Date(datetimeLocalVal);
    if (isNaN(dateObj.getTime())) return "";

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");

    return `${day} ${month} ${year} ${strHours}:${minutes} ${ampm}`;
  }

  function toLocalISOString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  function setRichEditorValue(textareaId, htmlContent) {
    if (!textareaId) return;

    const textarea =
      document.getElementById(textareaId) ||
      document.querySelector(`textarea[id*='${textareaId}'], textarea[name*='${textareaId}']`);
    if (textarea) {
      textarea.value = htmlContent;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const iframe =
      document.getElementById(textareaId + "_ifr") ||
      document.querySelector(`iframe[id*='${textareaId}']`) ||
      (textarea && textarea.parentElement ? textarea.parentElement.querySelector("iframe") : null);

    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
      iframe.contentDocument.body.innerHTML = htmlContent;
    }
  }

  function buildRteComponent(id, placeholder, initialHTML = "", extraClass = "") {
    return `
      <div class="vtools-rte-wrapper ${extraClass}">
        <div class="vtools-rte-toolbar" data-for="${id}">
          <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
          <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
          <button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
          <button type="button" data-cmd="insertUnorderedList" title="Bullet List">• List</button>
          <button type="button" data-cmd="removeFormat" title="Clear Formatting">✕</button>
        </div>
        <div id="${id}" class="vtools-rte-content" contenteditable="true" data-placeholder="${placeholder}">${initialHTML}</div>
      </div>
    `;
  }

  function attachRteToolbarHandlers(container) {
    container.querySelectorAll(".vtools-rte-toolbar button").forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute("data-cmd");
        const toolbar = btn.closest(".vtools-rte-toolbar");
        const targetId = toolbar.getAttribute("data-for");
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.focus();
          document.execCommand(cmd, false, null);
          targetEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
      };
    });
  }

  function bindRedFieldTracker(element) {
    if (!element) return;
    element.classList.add("vtools-red-field");

    const updateStatus = () => {
      const val = (element.value !== undefined ? element.value : element.innerText).trim();
      if (val === "") {
        element.classList.remove("vtools-red-field");
        if (element.classList.contains("vtools-rte-content")) {
          const wrapper = element.closest(".vtools-rte-wrapper");
          if (wrapper) wrapper.classList.remove("vtools-red-field");
        }
      } else {
        element.classList.add("vtools-red-field");
        if (element.classList.contains("vtools-rte-content")) {
          const wrapper = element.closest(".vtools-rte-wrapper");
          if (wrapper) wrapper.classList.add("vtools-red-field");
        }
      }
    };

    element.addEventListener("input", updateStatus);
    element.addEventListener("keyup", updateStatus);
    element.addEventListener("change", updateStatus);
    element.addEventListener("blur", updateStatus);
  }

  function injectAutofillButton() {
    if (document.getElementById("vtools-autofill-btn")) return;
    const target = document.body || document.documentElement;
    if (!target) return;

    const btn = document.createElement("button");
    btn.id = "vtools-autofill-btn";
    btn.innerText = "⚡ Fill Event Form";
    btn.addEventListener("click", openPromptModal);
    target.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectAutofillButton);
  } else {
    injectAutofillButton();
  }

  const escAttr = (t) => String(t || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

  function openPromptModal() {
    if (document.getElementById("vtools-modal")) return;

    const ouOptionsHTML = String(userConfig.ouList || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => `<option value="${escAttr(l)}"></option>`)
      .join("");

    const modal = document.createElement("div");
    modal.id = "vtools-modal";
    modal.className = "vtools-modal-overlay";

    const isExternal = userConfig.regType === "Custom";
    const isStandard = userConfig.regType === "Standard";

    let regFieldsHTML = "";
    if (isExternal) {
      regFieldsHTML = `
        <div class="vtools-form-group">
          <label>Registration Link *</label>
          <input type="url" id="v_reg_link" placeholder="https://..." required />
        </div>
      `;
    } else if (isStandard) {
      let extraRegInputs = "";
      if (userConfig.regStartMode === "manual") {
        extraRegInputs += `
          <div class="vtools-form-group" style="flex: 1;">
            <label>Registration Start Time *</label>
            <input type="datetime-local" id="v_reg_start_time" required />
          </div>`;
      }
      if (userConfig.regEndMode === "manual") {
        extraRegInputs += `
          <div class="vtools-form-group" style="flex: 1;">
            <label>Registration End Time *</label>
            <input type="datetime-local" id="v_reg_end_time" required />
          </div>`;
      }
      if (extraRegInputs) {
        regFieldsHTML = `<div style="display: flex; gap: 10px;">${extraRegInputs}</div>`;
      }
    }

    let surveyFieldHTML = "";
    if (userConfig.useSurveyUrl) {
      surveyFieldHTML = `
        <div class="vtools-form-group">
          <label>Survey URL</label>
          <input type="url" id="v_survey_url" placeholder="https://..." maxlength="512" />
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="vtools-modal-content">
        <h3>IEEE Event Assistant</h3>

        <div class="vtools-form-group">
          <label>Import from Markdown (.md)</label>
          <input type="file" id="v_md_file" accept=".md,.markdown,.txt" />
          <a href="#" id="v_md_template" style="font-size: 12px;">Download template</a>
          <div id="v_md_status" style="font-size: 12px; margin-top: 4px;"></div>
        </div>

        <div class="vtools-form-group">
          <label>Title *</label>
          <input type="text" id="v_title" placeholder="Event Title" required />
        </div>

        <div style="display: flex; gap: 10px;">
          <div class="vtools-form-group" style="flex: 1;">
            <label>Start Time *</label>
            <input type="datetime-local" id="v_start_time" required />
          </div>
          <div class="vtools-form-group" style="flex: 1;">
            <label>End Time *</label>
            <input type="datetime-local" id="v_end_time" required />
          </div>
        </div>

        <div class="vtools-form-group">
          <label>Description * (Rich Text)</label>
          ${buildRteComponent("v_description", "Event Description...")}
        </div>

        ${regFieldsHTML}
        ${surveyFieldHTML}

        <datalist id="v_ou_list">${ouOptionsHTML}</datalist>
        <div class="vtools-form-group">
          <label>Host Organizational Unit (pick from list or type)</label>
          <input type="text" id="v_host_ou" list="v_ou_list" value="${escAttr(userConfig.hostOu)}" />
        </div>

        <div class="vtools-form-group vtools-form-group-checkbox">
          <label>
            <input type="checkbox" id="v_cohost_enable" ${userConfig.coHostEnabled ? "checked" : ""} />
            Add Co-Host
          </label>
        </div>
        <div id="v_cohost_fields" style="display: ${userConfig.coHostEnabled ? "flex" : "none"}; gap: 10px;">
          <div class="vtools-form-group" style="flex: 1;">
            <label>Co-Host Organizational Unit *</label>
            <input type="text" id="v_cohost_ou" list="v_ou_list" value="${(userConfig.coHostOu || "").replace(/"/g, "&quot;")}" placeholder="e.g. SBC00000A - Example University, AES10" />
          </div>
          <div class="vtools-form-group" style="flex: 1;">
            <label>Co-Host Contact Email *</label>
            <input type="email" id="v_cohost_email" value="${(userConfig.coHostEmail || "").replace(/"/g, "&quot;")}" />
          </div>
        </div>

        <details id="v_loc_details" style="margin: 10px 0;">
          <summary style="cursor: pointer; font-weight: bold;">Location (empty = Options defaults)</summary>
          <div class="vtools-form-group">
            <label>Event type</label>
            <select id="v_loc_type">
              <option value="physical">In-Person</option>
              <option value="virtual">Virtual</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div class="vtools-form-group"><label>Address Line 1</label><input type="text" id="v_loc_address1" /></div>
          <div class="vtools-form-group"><label>Address Line 2</label><input type="text" id="v_loc_address2" /></div>
          <div style="display: flex; gap: 10px;">
            <div class="vtools-form-group" style="flex: 1;"><label>Building</label><input type="text" id="v_loc_building" /></div>
            <div class="vtools-form-group" style="flex: 1;"><label>Room Number</label><input type="text" id="v_loc_room" /></div>
          </div>
          <div style="display: flex; gap: 10px;">
            <div class="vtools-form-group" style="flex: 1;"><label>City</label><input type="text" id="v_loc_city" /></div>
            <div class="vtools-form-group" style="flex: 1;"><label>Postal Code</label><input type="text" id="v_loc_postal" /></div>
          </div>
          <div style="display: flex; gap: 10px;">
            <div class="vtools-form-group" style="flex: 1;"><label>Country (name)</label><input type="text" id="v_loc_country" placeholder="e.g. Portugal" /></div>
            <div class="vtools-form-group" style="flex: 1;"><label>State/Province (name)</label><input type="text" id="v_loc_state" placeholder="e.g. Norte" /></div>
          </div>
          <div class="vtools-form-group"><label>Map URL</label><input type="text" id="v_loc_map" /></div>
          <div class="vtools-form-group"><label>Virtual Attendance Info (virtual/hybrid)</label><input type="text" id="v_loc_virtual" /></div>
        </details>

        <hr style="margin: 15px 0;">

        <div style="display: flex; gap: 10px;">
          <div class="vtools-form-group" style="flex: 1;">
            <label>Category *</label>
            <select id="v_category">
              <option value="">Select Category...</option>
              <option value="1">Professional</option>
              <option value="2" selected>Technical</option>
              <option value="3">Nontechnical</option>
              <option value="4">Administrative</option>
              <option value="5">Humanitarian</option>
              <option value="6">Pre-U STEM Program</option>
            </select>
          </div>
          <div class="vtools-form-group" style="flex: 1;">
            <label>Sub-category (non if Technical)</label>
            <select id="v_subcategory" disabled>
              <option value="">Select Subcategory...</option>
            </select>
          </div>
        </div>

        <div class="vtools-form-group vtools-form-group-checkbox">
          <label>
            <input type="checkbox" id="v_wie_event" value="1" />
            Is this a Women in Engineering (WIE) event?
          </label>
        </div>

        <div class="vtools-form-group">
          <label>Additional Tags/Keywords (Base: ${userConfig.defaultTags})</label>
          <input type="text" id="v_extra_tags" placeholder="e.g. #AI #Workshop" />
        </div>

        <hr style="margin: 15px 0;">

        <div class="vtools-form-group">
          <label>Number of Speakers</label>
          <input type="number" id="v_speaker_count" min="0" value="0" style="width: 100px;" />
        </div>

        <div id="v_speakers_container"></div>

        <hr style="margin: 15px 0;">

        <div style="display: flex; gap: 10px;">
          <div class="vtools-form-group" style="flex: 1;">
            <label>IEEE Members Attending</label>
            <input type="number" id="v_ieee_attending" min="0" value="${escAttr(userConfig.ieeeAttendingDefault)}" placeholder="for Future Event leave empty" />
          </div>
          <div class="vtools-form-group" style="flex: 1;">
            <label>Guests Attending</label>
            <input type="number" id="v_guests_attending" min="0" value="${escAttr(userConfig.guestsAttendingDefault)}" placeholder="for Future Event leave empty" />
          </div>
        </div>

        <div style="margin-top: 20px; overflow: hidden;">
          <button type="button" class="vtools-btn-close" id="v_close_btn">Cancel</button>
          <button type="button" class="vtools-btn-submit" id="v_submit_btn">Autofill Form</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    attachRteToolbarHandlers(modal);

    bindRedFieldTracker(document.getElementById("v_ieee_attending"));
    bindRedFieldTracker(document.getElementById("v_guests_attending"));

    if (userConfig.useSurveyUrl) {
      bindRedFieldTracker(document.getElementById("v_survey_url"));
    }

    const startTimeInput = document.getElementById("v_start_time");
    const endTimeInput = document.getElementById("v_end_time");

    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    startTimeInput.value = toLocalISOString(now);
    endTimeInput.value = toLocalISOString(new Date(now.getTime() + 2 * 60 * 60 * 1000));

    startTimeInput.addEventListener("change", () => {
      if (startTimeInput.value) {
        const startDate = new Date(startTimeInput.value);
        if (!isNaN(startDate.getTime())) {
          const calculatedEnd = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
          endTimeInput.value = toLocalISOString(calculatedEnd);
        }
      }
    });

    const catSelect = document.getElementById("v_category");
    const subSelect = document.getElementById("v_subcategory");

    catSelect.addEventListener("change", function () {
      const catVal = this.value;
      subSelect.innerHTML = '<option value="">Select Subcategory...</option>';
      if (subcategoriesMap[catVal] && subcategoriesMap[catVal].length > 0) {
        subSelect.disabled = false;
        subcategoriesMap[catVal].forEach((sub) => {
          const opt = document.createElement("option");
          opt.value = sub.id;
          opt.textContent = sub.name;
          subSelect.appendChild(opt);
        });
      } else {
        subSelect.disabled = true;
      }
    });

    // Prefill category/subcategory from Options defaults
    if (userConfig.categoryDefault) {
      catSelect.value = userConfig.categoryDefault;
      catSelect.dispatchEvent(new Event("change"));
      if (userConfig.subcategoryDefault && !subSelect.disabled) subSelect.value = userConfig.subcategoryDefault;
    }

    const speakerCountInput = document.getElementById("v_speaker_count");
    const speakersContainer = document.getElementById("v_speakers_container");

    function renderSpeakerFields() {
      const count = parseInt(speakerCountInput.value) || 0;
      speakersContainer.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const spkId = `v_spk_bio_${i}`;
        const card = document.createElement("div");
        card.className = "vtools-speaker-card";
        card.innerHTML = `
          <strong>Speaker #${i + 1}</strong>
          <div style="display: flex; gap: 10px; margin-top: 5px; margin-bottom: 8px;">
            <input type="text" class="v_spk_fname" placeholder="First Name *" required style="flex:1;" />
            <input type="text" class="v_spk_lname" placeholder="Last Name" style="flex:1;" />
            <input type="text" class="v_spk_pname" placeholder="Preferred Name *" required style="flex:1;" />
          </div>
          <label style="font-size: 12px; font-weight: bold;">Biography (Rich Text)</label>
          ${buildRteComponent(spkId, "Speaker Biography...", "", "vtools-red-field")}
        `;
        speakersContainer.appendChild(card);

        bindRedFieldTracker(card.querySelector(".v_spk_fname"));
        bindRedFieldTracker(card.querySelector(".v_spk_lname"));
        bindRedFieldTracker(card.querySelector(".v_spk_pname"));
        bindRedFieldTracker(card.querySelector(`#${spkId}`));
      }
      attachRteToolbarHandlers(speakersContainer);
    }

    speakerCountInput.addEventListener("input", renderSpeakerFields);
    renderSpeakerFields();

    document.getElementById("v_cohost_enable").addEventListener("change", (ev) => {
      document.getElementById("v_cohost_fields").style.display = ev.target.checked ? "flex" : "none";
    });

    // ---- Markdown import ----
    const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));
    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el && v !== undefined && v !== "") {
        el.value = v;
        fire(el, "input");
        fire(el, "change");
      }
    };
    const setRte = (id, html) => {
      const el = document.getElementById(id);
      if (el && html) {
        el.innerHTML = html;
        fire(el, "input");
      }
    };

    function applyMarkdown(text) {
      const status = document.getElementById("v_md_status");
      const data = window.vtoolsMd.parse(text);
      const e = data.event;

      setVal("v_title", e.title);
      setVal("v_start_time", e.start);
      if (e.end) {
        setVal("v_end_time", e.end);
      } else if (e.start) {
        endTimeInput.value = toLocalISOString(new Date(new Date(e.start).getTime() + 2 * 60 * 60 * 1000));
      }
      setRte("v_description", data.descriptionHtml);

      if (e.category) {
        const opt = [...catSelect.options].find(
          (o) => o.text.toLowerCase() === e.category.toLowerCase() || o.value === e.category
        );
        if (opt) {
          catSelect.value = opt.value;
          fire(catSelect, "change");
          if (e.subcategory) {
            const nz = (t) => String(t).toLowerCase().replace(/[^a-z0-9]/g, "");
            const want = nz(e.subcategory);
            const sub = [...subSelect.options].find((o) => o.value && (nz(o.text) === want || o.value === e.subcategory));
            if (sub) subSelect.value = sub.value;
            else data.warnings.push(`Subcategory not found: "${e.subcategory}"`);
          }
        } else {
          data.warnings.push(`Category not found: "${e.category}"`);
        }
      }
      document.getElementById("v_wie_event").checked = e.wie;
      setVal("v_extra_tags", e.tags);
      setVal("v_reg_link", e.regLink);
      setVal("v_survey_url", e.surveyUrl);
      if (e.coHostOu || e.coHostEmail) {
        const cb = document.getElementById("v_cohost_enable");
        cb.checked = true;
        fire(cb, "change");
        setVal("v_cohost_ou", e.coHostOu);
        setVal("v_cohost_email", e.coHostEmail);
      }
      const locMap = {
        v_loc_address1: e.address1, v_loc_address2: e.address2, v_loc_building: e.building,
        v_loc_room: e.room, v_loc_city: e.city, v_loc_postal: e.postal, v_loc_country: e.country,
        v_loc_state: e.state, v_loc_map: e.mapUrl, v_loc_virtual: e.virtualInfo
      };
      let locUsed = false;
      for (const [id, v] of Object.entries(locMap)) {
        if (v) { setVal(id, v); locUsed = true; }
      }
      if (e.locationType) {
        const t = e.locationType.toLowerCase().replace(/[^a-z]/g, "");
        const v = t.startsWith("virt") ? "virtual" : t.startsWith("hyb") ? "hybrid" : "physical";
        document.getElementById("v_loc_type").value = v;
        locUsed = true;
      }
      if (locUsed) document.getElementById("v_loc_details").open = true;
      setVal("v_ieee_attending", e.ieeeAttending);
      setVal("v_guests_attending", e.guestsAttending);

      speakerCountInput.value = data.speakers.length;
      renderSpeakerFields();
      const cards = speakersContainer.querySelectorAll(".vtools-speaker-card");
      data.speakers.forEach((s, i) => {
        const card = cards[i];
        if (!card) return;
        const f = (sel, v) => {
          const el = card.querySelector(sel);
          if (el && v) {
            el.value = v;
            fire(el, "input");
          }
        };
        f(".v_spk_fname", s.firstName);
        f(".v_spk_lname", s.lastName);
        f(".v_spk_pname", s.preferredName || s.firstName);
        setRte(`v_spk_bio_${i}`, s.bioHtml);
      });

      status.style.color = data.warnings.length ? "#b36b00" : "#1a7f37";
      status.textContent =
        "Imported. Review fields, then Autofill Form." +
        (data.warnings.length ? " Warnings: " + data.warnings.join("; ") : "");
    }

    document.getElementById("v_md_file").addEventListener("change", async (ev) => {
      const file = ev.target.files[0];
      if (file) applyMarkdown(await file.text());
    });
    document.getElementById("v_md_template").addEventListener("click", (ev) => {
      ev.preventDefault();
      const url = URL.createObjectURL(new Blob([window.vtoolsMd.TEMPLATE], { type: "text/markdown" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "event-template.md";
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById("v_close_btn").onclick = () => modal.remove();
    document.getElementById("v_submit_btn").onclick = async () => {
      try {
        await executeAutofill();
      } catch (err) {
        console.error("vTools Autofill Error:", err);
      } finally {
        modal.remove();
      }
    };
  }

  function setInputValue(target, value) {
    const el = typeof target === "string" ? document.querySelector(target) : target;
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      el.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  }

  async function handleCountryAndState(countryVal, stateVal) {
    const countrySelectElem = document.querySelector("#meeting_country_id, [name='meeting[country_id]']");
    const stateContainer = document.querySelector("#meetingstateselect");

    if (!countrySelectElem || !countryVal) return;

    const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
    if (!/^\d+$/.test(String(countryVal))) {
      const hit = [...countrySelectElem.options].find((o) => norm(o.text) === norm(countryVal));
      if (!hit) {
        console.warn("vTools: country not found:", countryVal);
        return;
      }
      countryVal = hit.value;
    }

    countrySelectElem.value = countryVal;
    countrySelectElem.dispatchEvent(new Event("change", { bubbles: true }));

    try {
      const resp = await fetch(`/meeting/get_states?id=${countryVal}&rectype=meeting`);
      if (resp.ok && stateContainer) {
        const html = await resp.text();
        stateContainer.innerHTML = html;
      }
    } catch (e) {
      console.error("Direct fetch states error:", e);
    }

    const matchAndApplyState = () => {
      const stateElem = document.querySelector("#meeting_state_id, [name='meeting[state_id]']");
      if (!stateElem || !stateElem.options || stateElem.options.length <= 1) return false;

      let setSuccess = false;
      for (let opt of stateElem.options) {
        if (!opt.value) continue;
        if (stateVal && (String(opt.value) === String(stateVal) || norm(opt.text) === norm(stateVal))) {
          stateElem.value = opt.value;
          setSuccess = true;
          break;
        }
      }

      if (setSuccess) {
        stateElem.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return setSuccess;
    };

    matchAndApplyState();
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if (matchAndApplyState()) break;
    }
  }

  async function handleCategoryAndSubcategory(catVal, subcatVal, selectedSubcatText) {
    const catSelectElem = document.querySelector("#meeting_category_id, [name='meeting[category_id]']");
    const subcatContainer = document.querySelector("#_select_subcategory");

    if (!catSelectElem || !catVal) return;

    catSelectElem.value = catVal;
    catSelectElem.dispatchEvent(new Event("change", { bubbles: true }));

    if (!subcatVal && (!selectedSubcatText || selectedSubcatText.includes("Select"))) {
      return;
    }

    try {
      const resp = await fetch(`/meeting/get_subcategories?id=${catVal}&current=0`);
      if (resp.ok && subcatContainer) {
        const html = await resp.text();
        subcatContainer.innerHTML = html;
      }
    } catch (e) {
      console.error("Direct fetch subcategories error:", e);
    }

    const normalize = (str) => (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanTargetText = normalize(selectedSubcatText);

    const matchAndApplySubcategory = () => {
      const subcatElem = document.querySelector("#meeting_subcategory_id");
      if (!subcatElem || !subcatElem.options || subcatElem.options.length <= 1) return false;

      let setSuccess = false;

      for (let opt of subcatElem.options) {
        if (!opt.value) continue;

        if (subcatVal && String(opt.value) === String(subcatVal)) {
          subcatElem.value = opt.value;
          setSuccess = true;
          break;
        }

        const cleanOptText = normalize(opt.text);
        if (cleanTargetText && (cleanOptText.includes(cleanTargetText) || cleanTargetText.includes(cleanOptText))) {
          subcatElem.value = opt.value;
          setSuccess = true;
          break;
        }
      }

      if (setSuccess) {
        subcatElem.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return setSuccess;
    };

    matchAndApplySubcategory();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 100));
      if (matchAndApplySubcategory()) break;
    }
  }

  async function handleSpeakers() {
    const targetCount = parseInt(document.getElementById("v_speaker_count")?.value) || 0;
    if (targetCount <= 0) return;

    const spkCards = document.querySelectorAll("#v_speakers_container .vtools-speaker-card");

    for (let i = 0; i < targetCount; i++) {
      const card = spkCards[i];
      if (!card) continue;

      const fnameVal = card.querySelector(".v_spk_fname")?.value || "";
      const lnameVal = card.querySelector(".v_spk_lname")?.value || "";
      const pnameVal = card.querySelector(".v_spk_pname")?.value || "";
      const bioVal = card.querySelector(".vtools-rte-content")?.innerHTML || "";

      const spkIndex = i + 1;
      const speakerKey = `speaker${spkIndex}`;

      let container = document.getElementById(`_event_speaker${spkIndex}`) ||
                      document.getElementById(`_speaker${spkIndex}`);

      if (!container) {
        const addBtn = document.querySelector("#_add_speaker, #add_speaker_link a, ._add_speaker_button");
        if (addBtn) {
          addBtn.click();

          let attempts = 0;
          while (attempts < 25) {
            await new Promise((r) => setTimeout(r, 200));
            container = document.getElementById(`_event_speaker${spkIndex}`) ||
                        document.getElementById(`_speaker${spkIndex}`) ||
                        document.getElementById(`speakers_${speakerKey}_first_name`)?.closest("._speaker_container, .panel");
            if (container) break;
            attempts++;
          }
        }
      }

      if (!container) {
        console.warn(`vTools Autofill: Could not find or dynamically load Speaker #${spkIndex}`);
        continue;
      }

      const panelCollapse = document.getElementById(`_speaker${spkIndex}`);
      if (panelCollapse && !panelCollapse.classList.contains("in") && !panelCollapse.classList.contains("show")) {
        panelCollapse.classList.add("in", "show");
        panelCollapse.style.height = "auto";
      }

      const fnameInput = document.getElementById(`speakers_${speakerKey}_first_name`) ||
                         container.querySelector("input[name*='first_name']");

      const lnameInput = document.getElementById(`speakers_${speakerKey}_last_name`) ||
                         container.querySelector("input[name*='last_name']");

      const pnameInput = document.getElementById(`speakers_${speakerKey}_display_name`) ||
                         container.querySelector("input[name*='display_name'], input[name*='preferred_name']");

      const bioTextarea = document.getElementById(`speakers_${speakerKey}_biography`) ||
                          container.querySelector("textarea[name*='biography']") ||
                          document.getElementById(`speakers_${speakerKey}_topic_description`) ||
                          container.querySelector("textarea[name*='topic_description'], textarea");

      if (fnameInput) setInputValue(fnameInput, fnameVal);
      if (lnameInput) setInputValue(lnameInput, lnameVal);
      if (pnameInput) setInputValue(pnameInput, pnameVal);

      if (bioTextarea && bioTextarea.id) {
        setRichEditorValue(bioTextarea.id, bioVal);
      }
    }
  }

  function getAddChoiceButton(section) {
    let btn = section.querySelector('a._add_choice_link, a._add_choice, ._add_choice_button, a[id*="add_choice"]');
    if (btn) return btn;

    const candidates = section.querySelectorAll('a, button, input[type="button"]');
    for (const el of candidates) {
      if (el.classList.contains('_remove_choice_link') || el.closest('._remove_choice_link')) continue;
      const txt = (el.textContent || el.value || '').toLowerCase();
      if (txt.includes('add') && txt.includes('choice')) {
        return el;
      }
    }
    return null;
  }

  async function fillQuestionChoices(section, choices) {
    if (!choices || choices.length === 0) return;

    const choicesTextarea = section.querySelector('textarea[name*="[choices]"], textarea[name*="[options]"]');
    if (choicesTextarea) {
      choicesTextarea.value = choices.join("\n");
      choicesTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      choicesTextarea.dispatchEvent(new Event("change", { bubbles: true }));
      choicesTextarea.dispatchEvent(new Event("blur", { bubbles: true }));
      return;
    }

    // Wait for initial default choice fields to settle after selecting answer_type
    let choiceInputs = [];
    for (let retry = 0; retry < 15; retry++) {
      choiceInputs = Array.from(section.querySelectorAll('input._choice_text'));
      if (choiceInputs.length > 0) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    // Add missing choice rows if target choices > available rows
    while (choiceInputs.length < choices.length) {
      const addChoiceBtn = getAddChoiceButton(section);
      if (!addChoiceBtn) break;

      const initialLen = choiceInputs.length;
      addChoiceBtn.click();

      for (let retry = 0; retry < 10; retry++) {
        await new Promise((r) => setTimeout(r, 100));
        choiceInputs = Array.from(section.querySelectorAll('input._choice_text'));
        if (choiceInputs.length > initialLen) break;
      }
    }

    // Remove surplus choice rows if target choices < available rows (or extra blank fields exist)
    while (choiceInputs.length > choices.length) {
      const lastInput = choiceInputs[choiceInputs.length - 1];
      const rowContainer = lastInput.closest('.registration_custom_field_choice_section, .edit_meeting_registration_custom_field_choice_section');
      const removeBtn = rowContainer ? rowContainer.querySelector('._remove_choice_link, a[data-original-title*="Remove"], a[onclick*="remove"]') : null;

      if (removeBtn) {
        removeBtn.click();
        await new Promise((r) => setTimeout(r, 100));
        choiceInputs = Array.from(section.querySelectorAll('input._choice_text'));
      } else {
        break;
      }
    }

    // Populate every target input
    choiceInputs = Array.from(section.querySelectorAll('input._choice_text'));
    for (let i = 0; i < choices.length; i++) {
      if (choiceInputs[i]) {
        choiceInputs[i].value = choices[i];
        choiceInputs[i].dispatchEvent(new Event("input", { bubbles: true }));
        choiceInputs[i].dispatchEvent(new Event("change", { bubbles: true }));
        choiceInputs[i].dispatchEvent(new Event("blur", { bubbles: true }));
      }
    }
  }

  async function handleCustomRegistrationQuestions() {
    console.log("==== CUSTOM QUESTION SCRIPT STARTED ====");

    if (!userConfig.enableCustomQuestions || !userConfig.customQuestions || userConfig.customQuestions.length === 0) {
      console.warn("EXITING: Custom questions are disabled or empty in settings.");
      return;
    }

    const yesRadioId = "#_registration_custom_field_display__registration_custom_field_display_yes";

    let yesRadio = null;
    for (let i = 0; i < 20; i++) {
      yesRadio = document.querySelector(yesRadioId);
      if (yesRadio && (yesRadio.offsetParent !== null || yesRadio.offsetWidth > 0 || yesRadio.offsetHeight > 0)) {
        break;
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    if (!yesRadio) {
      yesRadio = document.querySelector(yesRadioId);
    }

    if (!yesRadio) {
      console.error("EXITING: Timed out waiting for the 'Yes' button.");
      return;
    }

    console.log("Clicking 'Yes' radio button...");
    yesRadio.checked = true;
    yesRadio.click();
    yesRadio.dispatchEvent(new Event("change", { bubbles: true }));

    const container = document.getElementById("_registration_custom_field_container");
    if (container) container.style.display = "block";

    let sections = document.querySelectorAll(".edit_meeting_registration_custom_field_section");
    for (let i = 0; i < 25; i++) {
      sections = document.querySelectorAll(".edit_meeting_registration_custom_field_section");
      if (sections.length > 0) break;
      await new Promise((r) => setTimeout(r, 100));
    }

    for (let idx = 0; idx < userConfig.customQuestions.length; idx++) {
      const qData = userConfig.customQuestions[idx];
      if (!qData) continue;

      sections = document.querySelectorAll(".edit_meeting_registration_custom_field_section");

      if (sections.length <= idx) {
        const addButton = document.getElementById("_add_registration_custom_field");
        if (addButton) {
          addButton.click();
        }

        let attempts = 0;
        while (attempts < 25) {
          await new Promise((r) => setTimeout(r, 100));
          sections = document.querySelectorAll(".edit_meeting_registration_custom_field_section");
          if (sections.length > idx) break;
          attempts++;
        }
      }

      const section = document.querySelectorAll(".edit_meeting_registration_custom_field_section")[idx];
      if (!section) continue;

      const questionText = qData.question || qData.title || "";
      const questionInput = section.querySelector('input[name*="[name]"], input[name*="[title]"]');
      if (questionInput) {
        questionInput.value = questionText;
        questionInput.dispatchEvent(new Event("input", { bubbles: true }));
        questionInput.dispatchEvent(new Event("change", { bubbles: true }));
        questionInput.dispatchEvent(new Event("blur", { bubbles: true }));
      }

      const reqCheckbox = section.querySelector('input[type="checkbox"][name*="[required]"]');
      if (reqCheckbox) {
        reqCheckbox.checked = !!qData.required;
        reqCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
      }

      const typeSelect = section.querySelector('select[name*="[answer_type]"]');
      const targetType = qData.type || "text";

      if (typeSelect) {
        typeSelect.value = targetType;
        typeSelect.dispatchEvent(new Event("input", { bubbles: true }));
        typeSelect.dispatchEvent(new Event("change", { bubbles: true }));
        await new Promise((r) => setTimeout(r, 250));
      }

      if (targetType === "choices" && Array.isArray(qData.choices) && qData.choices.length > 0) {
        await fillQuestionChoices(section, qData.choices);
      }
    }
    console.log("SUCCESS! All custom questions injected.");
  }

  // Click "Add Co-Host", wait for the ajax-loaded block, fill OU/email.
  // "Manage Event" is checked by vTools by default; left untouched.
  async function handleCoHost() {
    if (!document.getElementById("v_cohost_enable")?.checked) return;
    const ou = document.getElementById("v_cohost_ou").value.trim();
    const email = document.getElementById("v_cohost_email").value.trim();
    if (!ou && !email) {
      console.warn("vTools co-host: enabled but OU and email empty");
      return;
    }

    const container = document.querySelector("._additional_hosts_container");
    const addBtn = document.querySelector("._add_additional_host_button");
    if (!container || !addBtn) {
      console.warn("vTools co-host: controls not found", { container, addBtn });
      return;
    }
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const blocks = () => container.querySelectorAll("._additional_host_one_container");
    const before = blocks().length;
    let block = null;

    if (before > 0) {
      // Co-host already added by a previous autofill: reuse it, do not add another.
      block = blocks()[0];
    } else {
      // The Host panel may be collapsed/animating; click works regardless, but make sure it is visible.
      addBtn.scrollIntoView({ block: "center" });
      addBtn.click();
      for (let i = 0; i < 60; i++) {
        await wait(100);
        const all = blocks();
        if (all.length > before) {
          block = all[all.length - 1];
          break;
        }
      }
      if (!block) {
        console.warn("vTools co-host: block did not load after click");
        return;
      }
    }
    await wait(500); // let ou_picker_combined init (it may re-render the input)

    const fillOu = () => {
      const ouInput = block.querySelector("input[name$='[spoid]']");
      if (!ouInput || !ou) return false;
      ouInput.value = ou;
      ouInput.setAttribute("data-spoid", ou.split(" ")[0]);
      ["input", "change", "keyup", "blur"].forEach((t) => ouInput.dispatchEvent(new Event(t, { bubbles: true })));
      return true;
    };
    const fillRest = () => {
      const emailInput = block.querySelector("input[name$='[contact_email]']");
      if (emailInput && email) setInputValue(emailInput, email);
      const notify = block.querySelector("input[name$='[contact_registration_notification]']");
      if (notify) {
        notify.checked = !!userConfig.coHostNotify;
        notify.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };

    fillOu();
    fillRest();

    // Verify; the picker may clear the OU on blur. Retry once.
    await wait(500);
    const ouInput = block.querySelector("input[name$='[spoid]']");
    const emailInput = block.querySelector("input[name$='[contact_email]']");
    if (ou && ouInput && ouInput.value !== ou) {
      console.warn("vTools co-host: OU was cleared, retrying", ouInput.value);
      fillOu();
    }
    if (email && emailInput && emailInput.value !== email) fillRest();
    console.log("vTools co-host result:", { ou: ouInput?.value, email: emailInput?.value });
  }

  async function executeAutofill() {
    // 1. Host Organizational Unit
    const hostOuVal = (document.getElementById("v_host_ou")?.value || "").trim() || userConfig.hostOu;
    const hostInput = document.querySelector("#_event_host_spoid_0, #meeting_meeting_host_0_spoid, input[name*='spoid']");
    if (hostInput && hostOuVal) {
      hostInput.value = hostOuVal;
      hostInput.setAttribute("data-spoid", hostOuVal.split(" ")[0]);
      hostInput.dispatchEvent(new Event("input", { bubbles: true }));
      hostInput.dispatchEvent(new Event("change", { bubbles: true }));
      hostInput.dispatchEvent(new Event("blur", { bubbles: true }));
    }

    // 2. Host Email & Cosponsor
    setInputValue("#meeting_meeting_host_0_contact_email", userConfig.hostEmail);
    setInputValue("#meeting_cosponsor_name", userConfig.cosponsor);

    // 3. Host Options (Notify Immediately)
    const notifyCheckbox = document.querySelector("#meeting_meeting_host_0_contact_registration_notification");
    if (notifyCheckbox) {
      notifyCheckbox.checked = userConfig.notifyImmediately;
      notifyCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 3b. Co-Host (optional)
    await handleCoHost();

    // 4. Extra Contact Info
    if (userConfig.extraContact) {
      const extraContactEl = document.querySelector("#meeting_contact_display, textarea[name*='contact_display']");
      if (extraContactEl) setRichEditorValue(extraContactEl.id, userConfig.extraContact);
    }

    // 5. Location (modal override, else Options defaults)
    const gv = (id) => (document.getElementById(id)?.value || "").trim();
    const locType = gv("v_loc_type") || "physical";
    const locRadio = document.querySelector(`input[name='meeting[location_type]'][value='${locType}']`);
    if (locRadio) {
      locRadio.click();
      locRadio.checked = true;
      locRadio.dispatchEvent(new Event("change", { bubbles: true }));
    }

    if (locType !== "virtual") {
      setInputValue("#meeting_address1, [name='meeting[address1]']", gv("v_loc_address1") || userConfig.address);
      setInputValue("#meeting_address2", gv("v_loc_address2"));
      setInputValue("#meeting_building", gv("v_loc_building"));
      setInputValue("#meeting_room_number", gv("v_loc_room"));
      setInputValue("#meeting_city, [name='meeting[city]']", gv("v_loc_city") || userConfig.city);
      setInputValue("#meeting_postal_code, [name='meeting[postal_code]']", gv("v_loc_postal") || userConfig.postal);
      setInputValue("#meeting_map_url", gv("v_loc_map"));
      await handleCountryAndState(gv("v_loc_country") || userConfig.country, gv("v_loc_state") || userConfig.state);
    } else if (gv("v_loc_city") || gv("v_loc_country")) {
      // virtual: City/Country still required by some units; fill if given
      await handleCountryAndState(gv("v_loc_country") || userConfig.country, gv("v_loc_state") || userConfig.state);
    }
    if (locType !== "physical" && gv("v_loc_virtual")) {
      setRichEditorValue("meeting_virtual_info", "<p>" + gv("v_loc_virtual").replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</p>");
    }

    // 6. Category & Subcategory
    const catVal = document.getElementById("v_category").value;
    const subcatSelectModal = document.getElementById("v_subcategory");
    const subcatVal = subcatSelectModal.value;
    const selectedSubcatText = subcatSelectModal.options[subcatSelectModal.selectedIndex]?.text || "";

    await handleCategoryAndSubcategory(catVal, subcatVal, selectedSubcatText);

    // 7. WIE Checkbox
    const isWieEvent = document.getElementById("v_wie_event").checked;
    const wieCheckbox = document.getElementById("meeting_wie_event");
    if (wieCheckbox && isWieEvent) {
      wieCheckbox.checked = true;
      wieCheckbox.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 8. Registration Logic
    const regMapping = {
      "Custom": "external",
      "Standard": "standard",
      "None": "none"
    };
    const vToolsRegVal = regMapping[userConfig.regType] || "none";

    const regTypeRadio = document.querySelector(`#_registration_type_${vToolsRegVal}`) ||
                         document.querySelector(`input[name="meeting[registration_type]"][value="${vToolsRegVal}"]`) ||
                         document.querySelector(`input[type="radio"][value="${vToolsRegVal}" i]`);

    if (regTypeRadio) {
      regTypeRadio.checked = true;
      regTypeRadio.click();
      regTypeRadio.dispatchEvent(new Event("change", { bubbles: true }));

      let attempts = 0;
      let targetSelector = null;

      if (userConfig.regType === "Custom") {
        targetSelector = "#meeting_registration_url";
      } else if (userConfig.regType === "Standard") {
        targetSelector = "#reg_start_time_in_zone";
      }

      if (targetSelector) {
        while (attempts < 25) {
          const targetField = document.querySelector(targetSelector);
          if (targetField && targetField.offsetParent !== null) {
            break;
          }
          await new Promise((r) => setTimeout(r, 150));
          attempts++;
        }
      }
    }

    if (userConfig.regType === "Custom") {
      const regLink = document.getElementById("v_reg_link")?.value;
      if (regLink) setInputValue("#meeting_registration_url", regLink);
    } else if (userConfig.regType === "Standard") {
      let regStartVal = "";
      if (userConfig.regStartMode === "autofill_time") {
        regStartVal = formatVToolsDate(new Date().toISOString());
      } else if (userConfig.regStartMode === "manual") {
        const startEl = document.getElementById("v_reg_start_time");
        if (startEl && startEl.value) {
           regStartVal = formatVToolsDate(startEl.value);
        } else if (userConfig.manualRegStart) {
           regStartVal = formatVToolsDate(userConfig.manualRegStart);
        }
      }
      setInputValue("#reg_start_time_in_zone", regStartVal);

      let regEndVal = "";
      if (userConfig.regEndMode === "event_start") {
        const evStartEl = document.getElementById("v_start_time");
        regEndVal = evStartEl && evStartEl.value ? formatVToolsDate(evStartEl.value) : "";
      } else if (userConfig.regEndMode === "event_end") {
        const evEndEl = document.getElementById("v_end_time");
        regEndVal = evEndEl && evEndEl.value ? formatVToolsDate(evEndEl.value) : "";
      } else if (userConfig.regEndMode === "manual") {
        const regEndEl = document.getElementById("v_reg_end_time");
        regEndVal = regEndEl && regEndEl.value ? formatVToolsDate(regEndEl.value) : "";
      }
      setInputValue("#reg_end_time_in_zone", regEndVal);

      if (userConfig.maxReg !== "") {
        setInputValue("#meeting_max_registrations", userConfig.maxReg);
      }

      await handleCustomRegistrationQuestions();
    }

    // 8b. Survey URL
    if (userConfig.useSurveyUrl) {
      const surveyUrlVal = document.getElementById("v_survey_url")?.value.trim();
      if (surveyUrlVal) {
        setInputValue("#meeting_survey_url, input[name='meeting[survey_url]']", surveyUrlVal);
      }
    }

    // 9. Title & Description
    setInputValue("#meeting_title", document.getElementById("v_title").value);
    const descContent = document.getElementById("v_description").innerHTML;
    const descEl = document.querySelector("#meeting_description, textarea[name*='description']");
    if (descEl) setRichEditorValue(descEl.id, descContent);

    // 10. Tags
    let finalTags = userConfig.defaultTags;
    const extraTags = document.getElementById("v_extra_tags").value.trim();
    if (extraTags) finalTags += " " + extraTags;
    setInputValue("#meeting_keywords", finalTags);

    // 11. Timezone
    const tzSelect = document.querySelector("#meeting_tm_zone_info, [name='meeting[tm_zone_info]']");
    if (tzSelect && userConfig.timezone) {
      tzSelect.value = userConfig.timezone;
      if (tzSelect.selectedIndex === -1) {
        for (let i = 0; i < tzSelect.options.length; i++) {
          if (tzSelect.options[i].value === userConfig.timezone) {
            tzSelect.selectedIndex = i;
            break;
          }
        }
      }
      tzSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // 12. Start / End Times
    setInputValue("#start_time_in_zone", formatVToolsDate(document.getElementById("v_start_time").value));
    setInputValue("#end_time_in_zone", formatVToolsDate(document.getElementById("v_end_time").value));

    // 13. Speakers
    await handleSpeakers();

    // 14. Attendance Numbers
    const ieeeAttendingVal = document.getElementById("v_ieee_attending").value.trim();
    const guestsAttendingVal = document.getElementById("v_guests_attending").value.trim();
    if (ieeeAttendingVal !== "") setInputValue("#meeting_ieee_attending", ieeeAttendingVal);
    if (guestsAttendingVal !== "") setInputValue("#meeting_guests_attending", guestsAttendingVal);
  }
})();