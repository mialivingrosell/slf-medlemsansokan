/*
 * Klickbar prototyp – Medlemsansökan SLF
 * Skärmar renderas från SCREENS och navigeras via URL-hash (#skärm-id),
 * så varje steg går att länka direkt. Flödeslogik finns i rules.js.
 */

const state = loadState();

function loadState() {
  try { return JSON.parse(sessionStorage.getItem('slf-state')) || {}; }
  catch { return {}; }
}
function saveState() {
  try { sessionStorage.setItem('slf-state', JSON.stringify(state)); } catch {}
}

/* ---------- Ikoner ---------- */
const STEPS_LAKARE = ['Uppgifter', 'Utbildning', 'Yrke', 'Signera'];
const STEPS_STUDENT = ['Uppgifter', 'Utbildning', 'Signera'];

const ICON = {
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2c2.8 3 4 6.5 4 10s-1.2 7-4 10c-2.8-3-4-6.5-4-10s1.2-7 4-10z"/></svg>',
  mail: '<svg class="prefix-icon" viewBox="0 0 34 24" fill="none" stroke="#1f1f1f" stroke-width="1.4"><rect x="1" y="1" width="32" height="22" rx="1"/><path d="M1 1l16 13L33 1M1 23l12-11M33 23L21 12"/></svg>',
  chevronDown: '<svg viewBox="0 0 16 16" fill="none" stroke="#1f1f1f" stroke-width="1.6"><path d="M2 5l6 6 6-6"/></svg>',
  stepCheck: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 10.5l4 4 8-9"/></svg>',
  calendar: `<svg viewBox="0 0 30 28" fill="none" stroke="#1f1f1f" stroke-width="1.3"><rect x="1" y="3.5" width="28" height="23.5" rx="1.5"/><path d="M1 9h28M8 1v5M22 1v5"/><g fill="#1f1f1f" stroke="none">${[13, 17, 21, 24.5].flatMap(y => [5, 9, 13, 17, 21, 25].map(x => `<circle cx="${x}" cy="${y}" r=".75"/>`)).join('')}</g></svg>`,
  closeSmall: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l14 14M17 3L3 17"/></svg>',
  chevronDownLarge: '<svg class="dd-chev" viewBox="0 0 22 12" fill="none" stroke="#1f1f1f" stroke-width="1.8"><path d="M1 1l10 10L21 1"/></svg>',
  checkSmall: '<svg class="dd-check" viewBox="0 0 22 18" fill="none" stroke="#1f1f1f" stroke-width="2"><path d="M1.5 9.5l6 6L20.5 1.5"/></svg>',
  bankid: '<svg class="bankid" viewBox="0 0 40 34" aria-hidden="true"><g fill="#fff"><path d="M12 3h6l-4 17H8zM20 3h8c6 0 9 3.5 8 8.5S30 20 24 20h-6l1.4-5.5h4.4c2.6 0 4-1.2 4.4-3s-.5-3-3-3h-5.6z"/><circle cx="7" cy="4.5" r="2.4"/></g><text x="20" y="31" text-anchor="middle" fill="#fff" font-family="Inter, Arial" font-size="7.5" font-style="italic" font-weight="700">BankID</text></svg>',
  person: '<svg viewBox="0 0 24 24" fill="#3fb68e"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4"><circle cx="10" cy="10" r="6"/><path d="M14.5 14.5L20 20"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  warning: '<svg class="error-icon" viewBox="0 0 24 22" aria-hidden="true"><path d="M10.3 1.9a2 2 0 0 1 3.4 0l9.6 16.6a2 2 0 0 1-1.7 3H2.4a2 2 0 0 1-1.7-3z" fill="currentColor"/><path d="M12 7.5v6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.3" r="1.3" fill="#fff"/></svg>',
  chevronLeft: '<svg viewBox="0 0 10 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 1L2 8l6 7"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none" stroke="#1f1f1f" stroke-width="2.2"><path d="M2 8.5l4 4 8-9"/></svg>',
  badge: '<svg viewBox="0 0 28 28" fill="none" stroke="#1f1f1f" stroke-width="1.5"><path d="M14 2l3 2.4 3.8-.4 1.2 3.6 3.3 2-1.1 3.6 1.1 3.6-3.3 2-1.2 3.6-3.8-.4L14 26l-3-2.4-3.8.4L6 20.4l-3.3-2L3.8 14.8 2.7 11.2l3.3-2L7.2 5.6l3.8.4z"/><path d="M9.5 14.5l3 3 6-6.5"/></svg>',
};

/* Logga: använder assets/slf-logo.svg eller .png om filen finns, annars en platshållare. */
const LOGO_FALLBACK = `
<svg viewBox="0 0 250 86" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sveriges läkarförbund">
  <rect x="1.5" y="1.5" width="64" height="64" fill="none" stroke="#1b4a9c" stroke-width="3"/>
  <rect x="6" y="6" width="55" height="55" fill="#1b4a9c" opacity=".12"/>
  <text x="33.5" y="42" text-anchor="middle" font-family="Inter, Arial" font-weight="700" font-size="17" fill="#1b4a9c">SLF</text>
  <text x="72" y="28" font-family="Inter, Arial" font-weight="700" font-size="29" letter-spacing="-1" fill="#1b4a9c">Sveriges</text>
  <text x="72" y="60" font-family="Inter, Arial" font-weight="700" font-size="29" letter-spacing="-1" fill="#1b4a9c">läkarförbund</text>
  <text x="1" y="79" font-family="Inter, Arial" font-style="italic" font-weight="500" font-size="11" fill="#1b4a9c">Den medicinska professionens organisation</text>
  <line x1="1" y1="84" x2="245" y2="84" stroke="#1b4a9c" stroke-width="1"/>
</svg>`;

function renderLogo() {
  const el = document.getElementById('logo');
  const sources = ['assets/slf-logo.svg', 'assets/slf-logo.png'];
  const tryNext = (i) => {
    if (i >= sources.length) { el.innerHTML = LOGO_FALLBACK; return; }
    const img = new Image();
    img.alt = 'Sveriges läkarförbund';
    img.onload = () => { el.innerHTML = ''; el.appendChild(img); };
    img.onerror = () => tryNext(i + 1);
    img.src = sources[i];
  };
  tryNext(0);
}

/* ---------- Skärmar ---------- */
const SCREENS = {
  'valj-spar': {
    render: () => `
      <div class="page">
        <div class="lang-row">
          <button class="lang" type="button"  title="Engelsk version finns i skarp lösning – ej klickbar i prototypen">${ICON.globe} ENG</button>
        </div>
        <div class="cols">
          <section class="intro">
            <h1>Bli medlem i<br>Sveriges Läkarförbund</h1>
            <p>Ju fler medlemmar vi är, desto bättre kan vi driva frågor och påverka svensk hälso- och sjukvård. Ansök om medlemskap, lorem ipsum dolor sit amet.</p>
            <ul class="benefits">
              <li>${ICON.badge} Råd och stöd när du behöver det</li>
              <li>${ICON.badge} Unik lönestatistik för din profession</li>
              <li>${ICON.badge} En inkomstförsäkring att lita på</li>
            </ul>
          </section>

          <div>
            <form class="card" id="form" novalidate>
              <h2>Berätta kort om dig själv</h2>
              <p class="lead">Läkarförbundet finns för alla läkare under hela karriären.</p>

              <fieldset class="options${errClass('spar')}" ${errDescribed('spar')}>
                <legend class="q-label">Vad passar bäst in på dig?</legend>
                ${Object.entries(RULES.valjSpar).map(([value, o], i) => `
                  <label class="option">
                    <input type="radio" name="spar" value="${value}" ${i === 0 ? 'id="f-spar"' : ''} ${state.spar === value ? 'checked' : ''}>
                    <span class="radio"></span>
                    <span>${o.label}${o.note ? `<em class="option-note">${o.note}</em>` : ''}</span>
                  </label>`).join('')}
                ${errMsg('spar')}
              </fieldset>

              <div class="field${errClass('email')}">
                <label for="email">E-postadress</label>
                <div class="input-wrap">
                  ${ICON.mail}
                  <input id="email" name="email" type="email" autocomplete="email" placeholder="Din e-postadress" value="${esc(state.email)}" ${errAttrs('email')}>
                </div>
                ${errMsg('email')}
              </div>

              <div class="field${errClass('telefon')}${errClass('landskod')}">
                <label class="label" id="phone-label" for="f-telefon">Telefonnummer</label>
                <div class="phone">
                  <div class="input-wrap">
                    <input id="f-landskod" name="landskod" type="tel" inputmode="tel" autocomplete="tel-country-code" aria-label="Landskod" value="${esc(state.landskod ?? '+46')}" ${errAttrs('landskod')}>
                  </div>
                  <div class="input-wrap">
                    <input id="f-telefon" name="telefon" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="7XXXXXXXXX" value="${esc(state.telefon)}" ${errAttrs('telefon')}>
                  </div>
                </div>
                ${errMsg('landskod')}
                ${errMsg('telefon')}
              </div>

              <div class="consent-wrap${errClass('samtycke')}">
              <label class="consent">
                <input type="checkbox" id="f-samtycke" name="samtycke" ${state.samtycke ? 'checked' : ''} ${errAttrs('samtycke')}>
                <span class="checkbox">${ICON.check}</span>
                <span>Jag godkänner att Sveriges läkarförbund behandlar mina personuppgifter enligt gällande dataskyddslagstiftning. Uppgifterna används för facklig verksamhet och delas med samarbetspartners, såsom Folksam, för att administrera din inkomstförsäkring. Vi kan komma att kontakta dig även om du inte fullföljer medlemskapet. Du har rätt till registerutdrag. Se vår <a href="#" onclick="return false">integritetspolicy</a> eller kontakta <a href="mailto:medlem@slf.se">medlem@slf.se</a> för frågor.</span>
              </label>
              ${errMsg('samtycke')}
              </div>
            </form>

            <div class="actions">
              <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
              <button class="btn-primary" type="submit" form="form">Nästa steg</button>
            </div>
          </div>
        </div>
      </div>`,
    mount: (root) => {
      const form = root.querySelector('#form');
      form.addEventListener('input', () => collect(form));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        collect(form);
        if (!validera('valj-spar')) return;
        goNext('valj-spar');
      });
    },
    back: null, // Första steget – Tillbaka är inaktiv i prototypen
    validate: valideraKontakt,
    fields: ['spar', 'email', 'landskod', 'telefon', 'samtycke'],
  },

  /* ---------- Spår: Yrkesverksam läkare ---------- */
  'lakare-uppgifter': uppgifterScreen({ id: 'lakare-uppgifter', title: 'Medlemsansökan läkare', steps: STEPS_LAKARE, fragaBoende: true }),

  'lakare-utbildning': {
    layout: 'narrow',
    render: () => {
      if (!state.examensland) state.examensland = 'se'; // Sverige förvalt
      const land = COUNTRIES.find(c => c[0] === state.examensland);
      const visaLeg = showLegitimationQuestion(state);
      const visaBifoga = showAttachment(state);
      const filer = state.legFiler ?? [];
      return `
      <div class="page narrow">
        <h1 class="step-title">Medlemsansökan läkare</h1>
        ${stepper(STEPS_LAKARE, 1)}
        <form class="card" id="form" novalidate>
          <div class="field">
            <label for="f-examensdatum">Datum för läkarexamen</label>
            <div class="input-wrap">
              <button type="button" class="prefix-btn" data-action="kalender" aria-label="Öppna kalender">${ICON.calendar}</button>
              <input id="f-examensdatum" name="examensdatum" inputmode="numeric" placeholder="ÅÅÅÅMMDD" value="${esc(state.examensdatum)}">
              <input type="date" id="datepicker" class="visually-hidden" tabindex="-1" aria-hidden="true">
            </div>
          </div>

          <div class="field">
            <label for="f-examensland">I vilket land tog du din läkarexamen?</label>
            <div class="input-wrap country">
              <span class="fi fi-${land[0]} fis flag" aria-hidden="true"></span>
              ${ICON.chevronDown}
              <select id="f-examensland" name="examensland">
                ${COUNTRIES.map(([code, name]) => `<option value="${code}" ${code === state.examensland ? 'selected' : ''}>${name}</option>`).join('')}
              </select>
            </div>
          </div>

          ${visaLeg ? `
            <fieldset class="options options-tight">
              <legend class="field-legend">Har du svenskt läkarlegitimation?</legend>
              ${radio('svenskLeg', 'ja', 'Ja')}
              ${radio('svenskLeg', 'nej', 'Nej')}
            </fieldset>` : ''}

          ${visaBifoga ? `
            <div class="upload">
              <p class="field-legend">Bifoga dokumentation för legitimationsvillkor</p>
              <p class="hint">En eller flera PDF-filer kan bifogas. Total max filstorlek är 4,5 MB.</p>
              ${filer.length ? `<ul class="files">${filer.map((f, i) => `
                <li><span>${esc(f.name)} (${formatMB(f.size)})</span>
                  <button type="button" class="icon-btn" data-action="taBortFil" data-index="${i}" aria-label="Ta bort ${esc(f.name)}">${ICON.closeSmall}</button></li>`).join('')}</ul>` : ''}
              <label class="btn-outline">Välj fil
                <input type="file" id="fil" accept="application/pdf,.pdf" multiple class="visually-hidden">
              </label>
            </div>` : ''}
        </form>

        <div class="actions actions-split">
          <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
          <button class="btn-primary" type="submit" form="form">Nästa steg</button>
        </div>
      </div>`;
    },
    mount: (root) => {
      const form = root.querySelector('#form');
      form.addEventListener('input', () => collect(form));
      form.addEventListener('change', (e) => {
        if (e.target.id === 'fil') {
          // Filen laddas inte upp i prototypen – bara namn och storlek sparas
          const nya = [...e.target.files].map(f => ({ name: f.name, size: f.size }));
          state.legFiler = [...(state.legFiler ?? []), ...nya]; saveState(); rerender(); return;
        }
        if (e.target.id === 'datepicker') {
          state.examensdatum = e.target.value; saveState(); rerender(); return;
        }
        if (['examensland', 'svenskLeg'].includes(e.target.name)) { collect(form); rerender(); }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        collect(form);
        goNext('lakare-utbildning');
      });
    },
    actions: {
      kalender: () => {
        const dp = document.getElementById('datepicker');
        try { dp.showPicker(); } catch { dp.click(); }
      },
      taBortFil: (btn) => {
        state.legFiler.splice(Number(btn.dataset.index), 1); saveState(); rerender();
      },
    },
    back: 'lakare-uppgifter',
    fields: ['examensdatum', 'examensland', 'svenskLeg', 'legFiler'],
  },

  'lakare-yrke': {
    layout: 'narrow',
    render: () => {
      let body;
      if (saknarSvenskLeg(state)) {
        body = `
          <h2 class="card-heading">Lokal- och yrkesföreningar</h2>
          <p>Medlemmar i Läkarförbundet som har svensk läkarlegitimation blir också medlemmar i lokal- och yrkesföreningar.</p>
          <p>När du har fått din läkarlegitimation kommer du få information om att du kan kontakta oss för att lägga till lokal- och yrkesföreningar. Dessa kommer säkra att du får expertstöd i allt från din lokala arbetsmiljö till din karriärspecifika utveckling. Det garanterar att du får rätt hjälp oavsett om frågan rör din specifika arbetsplats eller din yrkesroll.</p>`;
      } else {
        const lokal = lokalforening(state);
        const sektioner = sektionerFor(state.lan);
        const lokalavd = lokalavdelning(state);
        body = `
          <h2 class="card-heading">Hitta dina föreningar</h2>
          <p>Läkarförbundet har 25 lokalföreningar spridda över hela landet. Som läkare och medlem i Läkarförbundet, tillhör du den lokalförening som är verksam där du arbetar.</p>
          <p>I ditt medlemskap ingår också ett medlemskap i en av våra åtta yrkesföreningar. En yrkesförening driver frågor som är knutet till din ställning och plats i yrket.</p>

          ${dropdown('lan', 'I vilket län har du din primära arbetsplats?', 'Välj län',
              LAN.map(([value, label]) => ({ value, label })))}

          ${state.lan === 'skane' ? dropdown('kommun', 'I vilken kommun jobbar du?', 'Välj kommun',
              SKANE_KOMMUNER.map(([namn]) => ({ value: namn, label: namn }))) : ''}

          ${lokal ? infoBox(`Din lokalförening är <strong>${lokal}.</strong>`) : ''}

          ${sektioner ? dropdown('sektion', 'Välj sektion för din lokalförening baserat på din arbetsplats', 'Välj sektion', sektioner) : ''}

          <fieldset class="options options-tight">
            <legend class="field-legend">Är du färdig specialistläkare?</legend>
            ${radio('specialist', 'ja', 'Ja')}
            ${radio('specialist', 'nej', 'Nej')}
          </fieldset>

          ${state.specialist === 'nej' ? infoBox('Din yrkesförening är <strong>Sveriges yngre läkares förening SYLF.</strong>') : ''}

          ${state.specialist === 'ja' ? dropdown('yrkesforening', 'Välj yrkesförening', 'Välj yrkesförening',
              YRKESFORENINGAR.map(n => ({ value: n, label: n }))) : ''}

          ${state.specialist === 'ja' && state.yrkesforening ? infoBox(lokalavd
              ? `Din lokalavdelning i din yrkesförening är<br><strong>${lokalavd}.</strong>`
              : `Din yrkesförening är <strong>${state.yrkesforening}.</strong>`) : ''}`;
      }
      return `
      <div class="page narrow">
        <h1 class="step-title">Medlemsansökan läkare</h1>
        ${stepper(STEPS_LAKARE, 2)}
        <form class="card card-text" id="form" novalidate>${body}</form>
        <div class="actions actions-split">
          <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
          <button class="btn-primary" type="submit" form="form">Nästa steg</button>
        </div>
      </div>`;
    },
    mount: (root) => {
      const form = root.querySelector('#form');
      form.addEventListener('change', (e) => {
        if (e.target.name === 'specialist') { collect(form); rerender(); }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        goNext('lakare-yrke');
      });
    },
    onSelect: (name, value) => {
      state[name] = value;
      if (name === 'lan') { delete state.kommun; delete state.sektion; }
    },
    back: 'lakare-utbildning',
    fields: ['lan', 'kommun', 'sektion', 'specialist', 'yrkesforening'],
  },

  'lakare-signera': {
    layout: 'narrow',
    render: () => {
      const manuell = harManuellaUppgifter(state);
      const bankid = signeraMedBankId(state);
      const land = COUNTRIES.find(c => c[0] === (state.examensland || 'se'))?.[1];

      const uppgifter = uppgiftsRader();

      const lokalavd = lokalavdelning(state);
      const foreningar = [
        ['Lokalförening', lokalforening(state)],
        ['Sektion för lokalförening', sektionerFor(state.lan)?.find(x => x.value === state.sektion)?.label],
        ['Yrkesförening', state.specialist === 'nej' ? 'Sveriges yngre läkares förening SYLF' : state.yrkesforening],
        ['Lokalavdelning för yrkesförening', lokalavd],
      ].filter(([, v]) => v).map(([k, v]) => [k, esc(v)]);

      return `
      <div class="page narrow signera">
        <h1 class="step-title">Medlemsansökan läkare</h1>
        ${stepper(STEPS_LAKARE, 3)}
        <p class="review-intro">Kontrollera att uppgifterna nedan stämmer innan du skickar in din medlemsansökan.</p>

        ${summaryCard('Dina uppgifter', manuell ? 'lakare-uppgifter' : null, uppgifter)}
        ${summaryCard('Dina kontaktuppgifter', 'valj-spar', [
          ['E-postadress', esc(state.email) || '–'],
          ['Telefonnummer', formatPhone(state.landskod, state.telefon) || '–'],
        ])}
        ${summaryCard('Din läkarexamen', 'lakare-utbildning', [
          ['Datum för läkarexamen', esc(state.examensdatum) || '–'],
          ['Land för läkarexamen', land || '–'],
        ])}
        ${saknarSvenskLeg(state) ? '' : summaryCard('Dina föreningar', 'lakare-yrke', foreningar.length ? foreningar : [['Föreningar', '–']],
          disclosure('merInfoForeningar', 'Mer information om lokal- och yrkesföreningar', `
            <p>Förutom att du blir medlem i vårt fackförbund Sveriges Läkarförening blir du också medlem i lokal- och yrkesföreningar. Här måste vi också förtydliga att man måste vara med i dessa föreningar. Det kostar inget extra för medlemskap i sektioner för lokalföreningar, men några sektioner för yrkesföreningar tar en avgift.</p>`))}

        <section class="card summary summary-fee">
          <h2>Månadsavgift</h2>
          <p class="fee-text">${saknarSvenskLeg(state)
            ? 'Om du är utbildad till läkare utomlands, men ännu inte fått din svenska läkarlegitimation betalar du en lägre medlemsavgift.'
            : 'Din månadsavgift baseras på typ av medlemskap samt vilka lokal- och yrkesföreningar du blir medlem i.'}</p>
          <dl class="summary-list summary-fee-list"><dt>Avgift</dt><dd>${manadsavgift(state)} kr</dd></dl>
          ${disclosure('visaIngar', 'Vad ingår i medlemskapet?', `
            <p>Din månadsavgift baseras på typ av medlemskap samt vilka lokal- och yrkesföreningar du blir medlem i. Inkluderat i medlemskapet är bland annat:</p>
            <ul>
              <li>Medlemskap i Läkarförbundet, lokal- och yrkesförening inkl. ev sektioner</li>
              <li>Inkomstförsäkring via Folksam</li>
              <li>Läkartidningen 10 ggr/år</li>
              <li>Möjlighet att hyra förbundets egna fritidsboenden</li>
            </ul>
            <p>Notera att medlemskap i Läkarförbundet inte inkluderar a-kassa, och någonting mer om detta.</p>`)}
        </section>

        <div class="actions actions-split">
          <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
          <button class="btn-primary btn-submit" type="button" data-action="skicka">${bankid ? ICON.bankid : ''}<span>Skicka in ansökan</span></button>
        </div>

        ${bankid ? `
          <div class="no-bankid">
            ${disclosure('utanBankid', 'Jag har inte BankID', `
              <p>Du kan bli medlem i Sveriges Läkarförbund även om du inte har BankId. Skicka in ansökan nedan så kontaktar vi dig för nästa steg.</p>
              <button class="btn-primary btn-small" type="button" data-action="skicka">Skicka in ansökan</button>`)}
          </div>` : ''}
      </div>`;
    },
    actions: {
      andra: (btn) => { state.returnTo = current(); saveState(); go(btn.dataset.target); },
      toggle: (btn) => { state[btn.dataset.key] = !state[btn.dataset.key]; saveState(); rerender(); },
      skicka: () => go(nextScreen('lakare-signera', state)),
    },
    back: 'lakare-yrke',
    fields: ['merInfoForeningar', 'visaIngar', 'utanBankid'],
    protoTools: () => [uppgiftsVaxel('utland')],
  },

  /* ---------- Spår: Student ---------- */
  'student-uppgifter': uppgifterScreen({ id: 'student-uppgifter', title: 'Medlemsansökan student', steps: STEPS_STUDENT, fragaBoende: true }),

  'student-utbildning': {
    layout: 'narrow',
    render: () => {
      const utland = state.universitet === UTLAND;
      const avd = studentLokalavdelning(state);
      return `
      <div class="page narrow">
        <h1 class="step-title">Medlemsansökan student</h1>
        ${stepper(STEPS_STUDENT, 1)}
        <form class="card" id="form" novalidate>
          ${dropdown('universitet', 'Välj ditt universitet', 'Välj universitet',
              [...UNIVERSITET.map(([value, label]) => ({ value, label })), { value: UTLAND, label: 'Studerar utomlands' }])}
          ${utland ? `
            ${textField('universitetUtl', 'Universitet (utomlands)', {})}
            ${dropdown('studieland', 'Land', 'Välj land', COUNTRIES.filter(c => c[0] !== 'se').map(([value, label]) => ({ value, label })))}` : ''}
          ${avd ? `
            ${infoBox(`Din lokalavdelning är <strong>${avd}.</strong>`)}
            <div class="field">
              <label for="f-examensdatumStudent">Förväntat examensdatum</label>
              <div class="input-wrap">
                <button type="button" class="prefix-btn" data-action="kalender" aria-label="Öppna kalender">${ICON.calendar}</button>
                <input id="f-examensdatumStudent" name="examensdatumStudent" inputmode="numeric" placeholder="ÅÅÅÅ-MM-DD" value="${esc(state.examensdatumStudent)}">
                <input type="date" id="datepicker" class="visually-hidden" tabindex="-1" aria-hidden="true">
              </div>
            </div>` : ''}
        </form>
        <div class="actions actions-split">
          <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
          <button class="btn-primary" type="submit" form="form">Nästa steg</button>
        </div>
      </div>`;
    },
    mount: (root) => {
      const form = root.querySelector('#form');
      form.addEventListener('input', () => collect(form));
      form.addEventListener('change', (e) => {
        if (e.target.id === 'datepicker') { state.examensdatumStudent = e.target.value; saveState(); rerender(); }
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault(); collect(form);
        goNext('student-utbildning');
      });
    },
    actions: {
      kalender: () => { const dp = document.getElementById('datepicker'); try { dp.showPicker(); } catch { dp.click(); } },
    },
    onSelect: (name, value) => {
      state[name] = value;
      if (name === 'universitet' && value !== UTLAND) { delete state.universitetUtl; delete state.studieland; }
    },
    back: 'student-uppgifter',
    fields: ['universitet', 'universitetUtl', 'studieland', 'examensdatumStudent'],
  },

  'student-signera': {
    layout: 'narrow',
    render: () => {
      const bankid = signeraMedBankId(state);
      const univ = state.universitet === UTLAND
        ? state.universitetUtl
        : UNIVERSITET.find(u => u[0] === state.universitet)?.[1];
      const avd = studentLokalavdelning(state);
      return `
      <div class="page narrow signera">
        <h1 class="step-title">Medlemsansökan student</h1>
        ${stepper(STEPS_STUDENT, 2)}
        <p class="review-intro">Kontrollera att uppgifterna nedan stämmer innan du skickar in din medlemsansökan.</p>

        ${summaryCard('Dina uppgifter', harManuellaUppgifter(state) ? 'student-uppgifter' : null, uppgiftsRader())}
        ${summaryCard('Dina kontaktuppgifter', 'valj-spar', [
          ['E-postadress', esc(state.email) || '–'],
          ['Telefonnummer', formatPhone(state.landskod, state.telefon) || '–'],
        ])}
        ${summaryCard('Din utbildning', 'student-utbildning', [
          ['Universitet', esc(univ) || '–'],
          ['Förväntat examensdatum', esc(state.examensdatumStudent) || '–'],
        ])}

        <section class="card summary summary-plain">
          <div class="summary-head"><h2>Dina föreningar</h2></div>
          <ul class="plain-list">
            <li>Sveriges läkarförbund student</li>
            ${avd ? `<li>${avd}</li>` : ''}
          </ul>
          ${disclosure('merInfoStudentForeningar', 'Mer information om dina föreningar', `
            <p>[Text saknas i skissen] Som medlem i Sveriges läkarförbund student blir du automatiskt medlem i lokalavdelningen vid ditt lärosäte.</p>`)}
        </section>

        <section class="card summary summary-plain">
          <div class="summary-head"><h2>Årsavgift</h2></div>
          <p class="fee-text">Som läkarstuderande betalar du en reducerad avgift för ditt medlemskap.</p>
          <dl class="summary-list summary-fee-list"><dt>Avgift</dt><dd>${AVGIFT_STUDENT} kr per år</dd></dl>
          ${disclosure('visaIngarStudent', 'Vad ingår i medlemskapet?', `
            <p>[Text saknas i skissen] Inkluderat i studentmedlemskapet är bland annat:</p>
            <ul>
              <li>Medlemskap i Sveriges läkarförbund student och din lokalavdelning</li>
              <li>Råd och stöd under studietiden</li>
            </ul>`)}
        </section>

        <section class="card summary summary-plain">
          <div class="summary-head"><h2>Läkartidningen</h2></div>
          <label class="consent consent-tight">
            <input type="checkbox" name="lakartidningen" ${state.lakartidningen ? 'checked' : ''} data-action="lakartidningen">
            <span class="checkbox">${ICON.check}</span>
            <span>Ja tack, jag vill prenumerera på Läkartidningen för ${PRIS_LAKARTIDNINGEN} kr/år.</span>
          </label>
        </section>

        <div class="actions actions-split">
          <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
          <button class="btn-primary btn-submit" type="button" data-action="skicka">${bankid ? ICON.bankid : ''}<span>Skicka in ansökan</span></button>
        </div>

        ${bankid ? `
          <div class="no-bankid">
            ${disclosure('utanBankid', 'Jag har inte BankID', `
              <p>Du kan bli medlem i Sveriges Läkarförbund även om du inte har BankId.</p>
              <p>Skicka in ansökan nedan så kontaktar vi dig för nästa steg.</p>
              <button class="btn-primary btn-small" type="button" data-action="skicka">Skicka in ansökan</button>`)}
          </div>` : ''}
      </div>`;
    },
    mount: (root) => {
      root.querySelector('input[name=lakartidningen]').addEventListener('change', (e) => {
        state.lakartidningen = e.target.checked; saveState();
      });
    },
    actions: {
      andra: (btn) => { state.returnTo = current(); saveState(); go(btn.dataset.target); },
      toggle: (btn) => { state[btn.dataset.key] = !state[btn.dataset.key]; saveState(); rerender(); },
      skicka: () => go(nextScreen('student-signera', state)),
      lakartidningen: () => {}, // hanteras av change-lyssnaren
    },
    back: 'student-utbildning',
    fields: ['merInfoStudentForeningar', 'visaIngarStudent', 'lakartidningen', 'utanBankid'],
    protoTools: () => [uppgiftsVaxel('sverige')],
  },

  /* ---------- Spår: Specialitets- eller intresseförening ---------- */
  'forening-ansokan': uppgifterScreen({
    id: 'forening-ansokan',
    title: 'Medlemsansökan specialitets- och intresseförening',
    steps: null,
    fragaBoende: true,
    pageClass: 'forening',
    extra: () => {
      const avdelningar = lokalavdelningarFor(state.forening);
      return `
        <div class="forening-fields">
          ${dropdown('forening', 'Välj förening', 'Välj förening', [
            { group: 'Specialitetsföreningar' },
            ...FORENINGAR.specialitet.map(n => ({ value: n, label: n })),
            { group: 'Intresseföreningar' },
            ...FORENINGAR.intresse.map(n => ({ value: n, label: n })),
          ])}
          ${avdelningar ? dropdown('foreningAvdelning', 'Välj lokal avdelning', 'Välj lokal avdelning',
              avdelningar.map(n => ({ value: n, label: n }))) : ''}
          <p>Om du vill bli medlem i fler än en specialitets- och intresseförening får du göra ytterligare ansökningar.</p>
          <p>Här kan du endast gå med i de föreningar som är kopplade till Läkarförbundets webbnätverk. Letar du efter en annan förening <a href="#" onclick="return false">hittar du dem här</a>.</p>
          <div class="checks">
            ${checkbox('arSTLakare', 'Jag är ST-läkare')}
            ${checkbox('annatYrke', 'Jag har ett annat yrke än läkare')}
            ${checkbox('pensionar', 'Jag är pensionär')}
            ${checkbox('forstarUttrade', 'Jag förstår att vid utträde ur den specialistförening jag sökt medlemskap i måste jag kontakta den samma specialitetsförenings kansli för begäran om utträde.<br><a href="#" onclick="return false">Här hittar du kontaktinformation till specialistföreningarnas kanslier</a>.')}
          </div>
        </div>`;
    },
    buttons: () => `
      <div class="actions actions-split">
        <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
        <button class="btn-primary btn-submit" type="submit" form="form">Skicka in ansökan</button>
      </div>`,
    onSelect: (name, value) => {
      state[name] = value;
      if (name === 'forening') delete state.foreningAvdelning;
    },
    validate: valideraForening,
    fields: ['forening', 'foreningAvdelning', 'arSTLakare', 'annatYrke', 'pensionar', 'forstarUttrade'],
  }),

  'kvittens-forening': {
    layout: 'site',
    render: () => `
      ${siteHeader()}
      <div class="site-page">
        <h1>Tack för din ansökan!</h1>
        <p>Vi besvarar den så fort vi kan.</p>
        <p>Om du inte redan är medlem i Läkarförbundet så vill vi ge några bra argument för att du ska gå med.</p>
        <p>Du kan alltid logga in på Min sida och ändra kontaktuppgifter eller ändra i ditt medlemskap. Kontakta oss på <a href="tel:087903510">08–790 35 10</a> om du har frågor om ditt medlemskap eller behöver hjälp.</p>
      </div>`,
    fields: [],
    protoTools: () => [TILL_FORSTA_STEGET],
  },

  /* ---------- Efter inskickad ansökan (sajtens sidhuvud) ---------- */
  'kvittens': {
    layout: 'site',
    render: () => `
      ${siteHeader()}
      <div class="site-page">
        <h1>Tack för din ansökan!</h1>
        <p>Vi besvarar den så fort vi kan.</p>
        <p>Du kan alltid logga in på Min sida och ändra kontaktuppgifter eller ändra i ditt medlemskap. Kontakta oss på <a href="tel:087903510">08–790 35 10</a> om du har frågor om ditt medlemskap eller behöver hjälp.</p>
        <div class="puff">
          <h2>Logga in på Min sida och ange hur du vill få första fakturan</h2>
          <p>En löspuff har alltid en obligatorisk länk och rubrik samt en frivillig brödtext och en frivillg bild. Den In finibus sit amet neque a dictum.</p>
          <button type="button" class="btn-green">Gå till Min sida</button>
        </div>
      </div>`,
    fields: [],
    protoTools: () => [TILL_FORSTA_STEGET],
  },

  'redan-medlem': {
    layout: 'site',
    render: () => `
      ${siteHeader()}
      <div class="site-page">
        <h1>Du är redan medlem hos oss</h1>
        <p class="loose">Vill du uppdatera dina uppgifter hos oss? Gå till Min sida genom att logga in nedan. Där kan du uppdatera dina uppgifter och val. Kontakta oss på <a href="tel:087903510">08–790 35 10</a> om du har frågor om ditt medlemskap eller behöver hjälp.</p>
        <button type="button" class="btn-green btn-green-wide">Logga in på Min sida</button>
      </div>`,
    fields: [],
    protoTools: () => [TILL_FORSTA_STEGET],
  },
};

/* Sajtens sidhuvud (slf.se). Knapparna är inaktiva i prototypen – "Bli medlem" startar en ny ansökan. */
function siteHeader() {
  return `
    <header class="site-header">
      <div class="site-header-inner">
        <a class="site-logo" href="#valj-spar" data-action="nyAnsokan" aria-label="Sveriges läkarförbund"><img src="assets/slf-logo.png" alt="Sveriges läkarförbund"></a>
        <nav class="site-nav" aria-label="Huvudmeny">
          <button type="button" class="site-btn site-btn-green desktop-only" data-action="nyAnsokan">Bli medlem</button>
          <button type="button" class="site-btn">${ICON.person}<span>Logga in</span></button>
          <button type="button" class="site-btn desktop-only"><span>Hitta förening</span>${ICON.pin}</button>
          <button type="button" class="site-btn" aria-label="Sök"><span class="desktop-only">Sök</span>${ICON.search}</button>
          <button type="button" class="site-btn" aria-label="Meny"><span class="desktop-only">Meny</span>${ICON.menu}</button>
        </nav>
      </div>
    </header>`;
}


function uppgiftsRader() {
  if (!harManuellaUppgifter(state)) {
    return [['Namn', 'E***** A******** W******'], ['Adress', 'H************ *6A L** ***3<br>****0&nbsp; S********']];
  }
  const adress = state.borISverige === 'nej'
    ? [state.adressrad1, state.adressrad2, [state.postnummerUtl, state.ortUtl].filter(Boolean).join(' '), state.region, state.land]
    : [state.gatuadress, [state.postnummer, state.ort].filter(Boolean).join(' '), 'Sverige'];
  return [
    ['Namn', esc([state.fornamn, state.efternamn].filter(Boolean).join(' ')) || '–'],
    ['Adress', adress.filter(Boolean).map(esc).join('<br>') || '–'],
  ];
}

function summaryCard(title, editTarget, rows, extra = '') {
  return `
    <section class="card summary">
      <div class="summary-head">
        <h2>${title}</h2>
        ${editTarget ? `<button type="button" class="link-edit" data-action="andra" data-target="${editTarget}">Ändra</button>` : ''}
      </div>
      <dl class="summary-list">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      ${extra}
    </section>`;
}

function disclosure(key, label, content) {
  const open = !!state[key];
  return `
    <div class="disclosure-block">
      <button type="button" class="disclosure strong" aria-expanded="${open}" data-action="toggle" data-key="${key}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 2l6 6-6 6"/></svg>
        ${label}
      </button>
      ${open ? `<div class="disclosure-content">${content}</div>` : ''}
    </div>`;
}

function formatPhone(kod, nr) {
  const digits = String(nr ?? '').replace(/\D/g, '').replace(/^0/, '');
  if (!digits) return '';
  const grouped = digits.length === 9
    ? digits.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4')
    : digits.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
  const kodSiffror = String(kod ?? '+46').replace(/\D/g, '').replace(/^00/, '') || '46';
  return `+${kodSiffror} ${grouped}`;
}

function infoBox(html) {
  return `<div class="info-box" role="status">${html}</div>`;
}

/* Anpassad rullgardin (som i skisserna): rader med avdelare, bock på valt alternativ,
 * valfri fetstilt rubrik + beskrivning. Väljs via data-action="dd-select". */
function dropdown(name, label, placeholder, options) {
  const sel = options.find(o => !o.group && o.value === state[name]);
  const text = sel ? (sel.desc ? `${sel.label} - ${sel.desc}` : sel.label) : placeholder;
  const open = openDropdown === name;
  return `
    <div class="field dd ${open ? 'is-open' : ''}" data-dd="${name}">
      <span class="label" id="dd-${name}-label">${label}</span>
      <button type="button" class="dd-toggle ${sel ? '' : 'is-placeholder'}" data-action="dd-toggle" data-name="${name}"
        aria-haspopup="listbox" aria-expanded="${open}" aria-labelledby="dd-${name}-label dd-${name}-value">
        <span id="dd-${name}-value">${esc(text)}</span>${ICON.chevronDownLarge}
      </button>
      ${open ? `
        <ul class="dd-list" role="listbox" aria-labelledby="dd-${name}-label">
          <li><button type="button" role="option" class="is-placeholder" data-action="dd-select" data-name="${name}" data-value=""><span>${placeholder}</span></button></li>
          ${options.map(o => o.group ? `
            <li class="dd-group" role="presentation">${o.group}</li>` : `
            <li><button type="button" role="option" aria-selected="${o.value === state[name]}" data-action="dd-select" data-name="${name}" data-value="${esc(o.value)}">
              ${o.value === state[name] ? ICON.checkSmall : ''}
              <span>${o.desc ? `<strong>${o.label}</strong> - ${o.desc}` : o.label}</span>
            </button></li>`).join('')}
        </ul>` : ''}
    </div>`;
}
let openDropdown = null;


function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}


/* Steg "Uppgifter" – gemensamt för spåren (personnummer / manuell inmatning). */
function uppgifterScreen(cfg) {
  return {
      layout: 'narrow',
      render: () => {
        // Ja är förvalt. Spår utan frågan (student) har alltid svensk adress.
        if (!state.borISverige || !cfg.fragaBoende) state.borISverige = 'ja';
        const adress = state.borISverige === 'ja'
          ? [
              textField('gatuadress', 'Gatuadress', { autocomplete: 'street-address' }),
              textField('postnummer', 'Postnummer', { autocomplete: 'postal-code', inputmode: 'numeric' }),
              textField('ort', 'Ort', { autocomplete: 'address-level2' }),
            ]
          : [
              textField('adressrad1', 'Adressrad 1', { autocomplete: 'address-line1' }),
              textField('adressrad2', 'Adressrad 2 (valfritt)', { autocomplete: 'address-line2' }),
              textField('postnummerUtl', 'Postnummer (valfritt)', { autocomplete: 'postal-code' }),
              textField('ortUtl', 'Ort', { autocomplete: 'address-level2' }),
              textField('region', 'Region, delstat eller provins (valfritt)', { autocomplete: 'address-level1' }),
              textField('land', 'Land', { autocomplete: 'country-name' }),
            ];
  
        return `
        <div class="page narrow ${cfg.pageClass || ''}">
          <h1 class="step-title">${cfg.title}</h1>
          ${cfg.steps ? stepper(cfg.steps, 0) : ''}
          <form class="card" id="form" novalidate>
            <div class="field${errClass('pnr')}">
              <label for="pnr">Personnummer</label>
              <div class="input-wrap"><input id="pnr" name="pnr" inputmode="numeric" autocomplete="off" placeholder="ÅÅÅÅMMDDNNNN" value="${esc(state.pnr)}" ${errAttrs('pnr')}></div>
              ${errMsg('pnr')}
            </div>
            <button type="button" class="btn-primary btn-small ${state.hamtad ? 'is-secondary' : ''}" data-action="hamta">Hämta personuppgifter</button>
  
            ${state.hamtad ? `
              <dl class="fetched">
                <dt>Namn</dt><dd>E***** A******** W******</dd>
                <dt>Adress</dt><dd>H************ *6A L** ***3<br>****0&nbsp; S********</dd>
              </dl>` : `
              <button type="button" class="disclosure" aria-expanded="${!!state.manuell}" data-action="manuell">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 2l6 6-6 6"/></svg>
                Jag behöver ange min information manuellt
              </button>`}
  
            ${!state.hamtad && state.manuell ? `
              <div class="manual">
                ${textField('samordningsnr', 'Samordningsnummer eller personnummer (valfritt)', { placeholder: 'ÅÅÅÅMMXXNNNN', inputmode: 'numeric' })}
                ${textField('fornamn', 'Förnamn', { autocomplete: 'given-name' })}
                ${textField('efternamn', 'Efternamn', { autocomplete: 'family-name' })}
                ${cfg.fragaBoende ? `
                <fieldset class="options options-tight">
                  <legend class="field-legend">Bor du i Sverige?</legend>
                  ${radio('borISverige', 'ja', 'Ja')}
                  ${radio('borISverige', 'nej', 'Nej')}
                </fieldset>` : ''}
                ${adress.join('')}
              </div>` : ''}
            ${cfg.extra ? cfg.extra() : ''}
          </form>
  
          ${cfg.buttons ? cfg.buttons() : `
          <div class="actions actions-split">
            <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
            <button class="btn-primary" type="submit" form="form">Nästa steg</button>
          </div>`}
        </div>`;
      },
      mount: (root) => {
        const form = root.querySelector('#form');
        form.addEventListener('input', (e) => {
          // Nytt personnummer efter hämtning → nollställ hämtat resultat
          if (e.target.name === 'pnr' && state.hamtad) { state.hamtad = false; collect(form); rerender('#pnr'); return; }
          collect(form);
        });
        form.addEventListener('change', (e) => {
          if (e.target.name === 'borISverige') { collect(form); rerender(); }
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          collect(form);
          if (!validera(cfg.id)) return;
          goNext(cfg.id);
        });
      },
      actions: {
        hamta: () => {
          collect(document.getElementById('form'));
          // Bara personnumret kontrolleras – felet visas vid fältet (ingen sammanfattning)
          if (!validera(cfg.id, valideraHamta)) return;
          state.hamtad = true; state.manuell = false; saveState(); rerender();
        },
        manuell: () => {
          collect(document.getElementById('form'));
          state.manuell = !state.manuell; saveState(); rerender();
        },
      },
      onSelect: cfg.onSelect,
      validate: cfg.validate || valideraUppgifter,
      back: 'valj-spar',
      fields: ['pnr', 'hamtad', 'manuell', 'samordningsnr', 'fornamn', 'efternamn', 'borISverige',
               'gatuadress', 'postnummer', 'ort', 'adressrad1', 'adressrad2', 'postnummerUtl', 'ortUtl', 'region', 'land',
               ...(cfg.fields || [])],
    };
}

/* ---------- Komponenter ---------- */
function stepper(steps, active) {
  return `
    <ol class="stepper steps-${steps.length}" aria-label="Steg">
      ${steps.map((s, i) => `
        <li class="${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}" ${i === active ? 'aria-current="step"' : ''}>
          <span class="dot">${i < active ? ICON.stepCheck : i + 1}</span><span class="name">${s}</span>
        </li>`).join('')}
    </ol>`;
}

function textField(name, label, attrs = {}) {
  const extra = Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
  return `
    <div class="field${errClass(name)}">
      <label for="f-${name}">${label}</label>
      <div class="input-wrap"><input id="f-${name}" name="${name}" ${extra} value="${esc(state[name])}" ${errAttrs(name)}></div>
      ${errMsg(name)}
    </div>`;
}

function checkbox(name, labelHtml) {
  return `
    <div class="check-wrap${errClass(name)}">
      <label class="consent check-row">
        <input type="checkbox" id="f-${name}" name="${name}" ${state[name] ? 'checked' : ''} ${errAttrs(name)}>
        <span class="checkbox">${ICON.check}</span>
        <span>${labelHtml}</span>
      </label>
      ${errMsg(name)}
    </div>`;
}

function radio(name, value, label) {
  return `
    <label class="option">
      <input type="radio" name="${name}" value="${value}" ${state[name] === value ? 'checked' : ''}>
      <span class="radio"></span><span>${label}</span>
    </label>`;
}

/* Platshållare för steg som ännu inte har skisser. */
const PENDING = {
};

function renderPending(id) {
  const p = PENDING[id];
  return `
    <div class="page narrow">
      ${p.steps ? `<h1 class="step-title">Medlemsansökan läkare</h1>${stepper(p.steps, p.active)}` : ''}
      <div class="card placeholder-card">
        <span class="tag">Prototyp – skiss saknas</span>
        <h2>${p.title}</h2>
        <p>Det här steget byggs när skisserna finns.</p>
      </div>
      <div class="actions actions-split">
        <button class="btn-back" type="button" data-action="back">${ICON.chevronLeft} Tillbaka</button>
        <button class="btn-primary" type="button" data-action="restart">Till början</button>
      </div>
    </div>`;
}

/* ---------- Motor ---------- */
function esc(v) {
  return String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function collect(form) {
  const fd = new FormData(form);
  for (const el of form.elements) {
    if (!el.name || el.type === 'file') continue;
    if (el.type === 'checkbox') state[el.name] = el.checked;
    else if (el.type === 'radio') state[el.name] = fd.get(el.name) || '';
    else state[el.name] = el.value;
  }
  saveState();
}

function go(id) { location.hash = id; }
function current() { return location.hash.slice(1) || 'valj-spar'; }

function render() {
  const id = current();
  const root = document.getElementById('app');
  const screen = SCREENS[id];
  if (screen) {
    root.innerHTML = screen.render();
    screen.mount?.(root);
  } else if (PENDING[id]) {
    root.innerHTML = renderPending(id);
  } else {
    go('valj-spar');
    return;
  }
  document.body.dataset.layout = screen?.layout ?? (PENDING[id] ? 'narrow' : 'wide');
  renderProtoTools(screen);
}

/* Nästa skärm efter ett steg. Kom man dit via "Ändra" i granskningen går man direkt tillbaka dit
 * – så länge man är kvar i samma spår (byter man spår i första steget gäller vanligt flöde). */
function goNext(screenId) {
  const next = nextScreen(screenId, state);
  const spar = (id) => id.split('-')[0];
  const back = state.returnTo;
  delete state.returnTo; saveState();
  go(back && spar(next) === spar(back) ? back : next);
}

/* Ritar om aktuell skärm utan att hoppa till toppen (t.ex. vid utfällning). */
function rerender(focusSelector) {
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
  if (focusSelector) {
    const el = document.querySelector(focusSelector);
    el?.focus();
    if (el?.setSelectionRange && typeof el.value === 'string') { try { el.setSelectionRange(el.value.length, el.value.length); } catch {} }
  }
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  const action = el?.dataset.action;
  if (action === 'dd-toggle') {
    openDropdown = openDropdown === el.dataset.name ? null : el.dataset.name;
    rerender(`[data-dd="${el.dataset.name}"] ${openDropdown ? '[role=option][aria-selected=true], [role=option]' : '.dd-toggle'}`);
    return;
  }
  if (action === 'dd-select') {
    const { name, value } = el.dataset;
    const screen = SCREENS[current()];
    if (screen?.onSelect) screen.onSelect(name, value || undefined); else state[name] = value || undefined;
    if (!value) delete state[name];
    openDropdown = null; saveState();
    rerender(`[data-dd="${name}"] .dd-toggle`);
    return;
  }
  if (openDropdown && !e.target.closest('.dd')) { openDropdown = null; rerender(); }
  if (!action) return;
  const screenActions = SCREENS[current()]?.actions;
  if (screenActions?.[action]) { screenActions[action](e.target.closest('[data-action]')); return; }
  if (action === 'back') { delete state.returnTo; saveState(); }
  if (action === 'back') { const b = SCREENS[current()]?.back ?? PENDING[current()]?.back; if (b) go(b); }
  if (action === 'restart' || action === 'nyAnsokan') { e.preventDefault(); resetAll(); }
});

/* ================================================================
 * Felhantering – motor
 * errorState[skärm] = { errors: { fält: meddelande }, validator }
 * Felet visas under fältet: röd ram + varningsikon + röd text (ingen sammanfattning).
 * ================================================================ */
const errorState = {};
const FIELD_IDS = { spar: 'f-spar', email: 'email', pnr: 'pnr' };
const fieldId = (name) => FIELD_IDS[name] ?? `f-${name}`;
const currentErrors = () => errorState[current()]?.errors ?? {};

function errClass(name) { return currentErrors()[name] ? ' has-error' : ''; }
function errMsg(name) {
  const m = currentErrors()[name];
  return m ? `<p class="error-msg" id="err-${name}">${ICON.warning}<span><span class="visually-hidden">Fel: </span>${m}</span></p>` : '';
}
function errAttrs(name) { return currentErrors()[name] ? `aria-invalid="true" aria-describedby="err-${name}"` : ''; }
function errDescribed(name) { return currentErrors()[name] ? `aria-describedby="err-${name}"` : ''; }

/* Kör validering (vid "Nästa steg" eller "Hämta"). Visar fel och flyttar fokus. Returnerar true om allt är OK. */
function validera(screenId, validator = SCREENS[screenId].validate) {
  const errors = validator(state);
  if (!Object.keys(errors).length) { delete errorState[screenId]; return true; }
  errorState[screenId] = { errors, validator };
  rerender();
  // Fokus på första fältet med fel (skärmläsare läser upp etikett + felmeddelande)
  const target = document.getElementById(fieldId(Object.keys(errors)[0]));
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  return false;
}

/* Tar bort fel som har rättats (lägger aldrig till nya). Returnerar true om något ändrats. */
function pruneErrors(screenId) {
  const es = errorState[screenId];
  const validator = es?.validator ?? SCREENS[screenId]?.validate;
  if (!es || !validator) return false;
  const now = validator(state);
  let changed = false;
  for (const k of Object.keys(es.errors)) {
    if (!now[k]) { delete es.errors[k]; changed = true; }
    else if (now[k] !== es.errors[k]) { es.errors[k] = now[k]; changed = true; }
  }
  if (!Object.keys(es.errors).length) delete errorState[screenId];
  return changed;
}

// Medan användaren rättar: ta bort fel som inte längre gäller, behåll fokus och markörposition
document.addEventListener('input', (e) => {
  const id = current();
  if (!errorState[id] || !pruneErrors(id)) return;
  const el = e.target;
  const pos = typeof el.selectionStart === 'number' ? [el.selectionStart, el.selectionEnd] : null;
  const y = window.scrollY;
  render(); window.scrollTo(0, y);
  const again = el.id ? document.getElementById(el.id) : null;
  again?.focus();
  if (pos && again?.setSelectionRange) try { again.setSelectionRange(...pos); } catch {}
});

/* ---------- Testverktyg nere till vänster (endast i prototypen) ---------- */
const TILL_FORSTA_STEGET = { label: 'Till första steget', title: 'Gå till Välj spår (ifyllda uppgifter sparas)', run: () => go('valj-spar') };

/* Växlar granskningssteget mellan hämtade (maskade) och manuellt angivna uppgifter. */
function uppgiftsVaxel(exempeladress) {
  const manuell = harManuellaUppgifter(state);
  return {
    label: manuell ? 'Visa hämtade uppgifter' : 'Visa manuella uppgifter',
    title: 'Växla mellan hämtade (maskade) och manuellt angivna personuppgifter',
    run: () => {
      if (manuell) {
        state.manuell = false; state.hamtad = true;
        if (!state.pnr) state.pnr = '199001011239';
      } else {
        state.hamtad = false; state.manuell = true;
        // Fyll exempeluppgifter om inget har angetts manuellt
        if (!state.fornamn && !state.efternamn) {
          Object.assign(state, { fornamn: 'Lisa', efternamn: 'Andersson Moberg' });
          if (exempeladress === 'utland') {
            Object.assign(state, { borISverige: 'nej', adressrad1: '226 Cheltenham Road', postnummerUtl: 'BS6 5QU', ortUtl: 'Bristol', land: 'Storbritannien' });
          } else {
            Object.assign(state, { borISverige: 'ja', gatuadress: 'Storgatan 12', postnummer: '903 26', ort: 'Umeå' });
          }
        }
      }
      saveState(); rerender();
    },
  };
}

function renderProtoTools(screen) {
  const tools = screen?.protoTools?.() ?? [];
  const holder = document.getElementById('proto-extra');
  holder.innerHTML = tools.map((t, i) =>
    `<button type="button" class="proto-reset" data-proto="${i}" title="${esc(t.title || '')}">${t.label}</button>`).join('');
  holder.querySelectorAll('[data-proto]').forEach(btn =>
    btn.addEventListener('click', () => tools[Number(btn.dataset.proto)].run()));
}

/* ---------- Nollställning (endast för test av prototypen) ---------- */
function resetAll() {
  for (const k in errorState) delete errorState[k];
  for (const k in state) delete state[k];
  saveState();
  if (current() === 'valj-spar') { render(); window.scrollTo(0, 0); } else go('valj-spar');
}

function resetStep() {
  delete errorState[current()];
  for (const k of SCREENS[current()]?.fields ?? []) delete state[k];
  saveState();
  render(); window.scrollTo(0, 0);
}

// Krysset: i skarp version stängs ansökan – i prototypen rensas allt och man hamnar på första steget.
document.getElementById('close').addEventListener('click', resetAll);
document.getElementById('reset-step').addEventListener('click', resetStep);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openDropdown) {
    const name = openDropdown; openDropdown = null; rerender(`[data-dd="${name}"] .dd-toggle`);
  }
});
window.addEventListener('hashchange', () => { openDropdown = null; for (const k in errorState) delete errorState[k]; });

// Växla mellan prototypversionerna och stanna på samma steg
document.getElementById('version-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  location.href = e.currentTarget.getAttribute('href') + location.hash;
});

renderLogo();
render();
