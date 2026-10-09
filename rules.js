/*
 * REGELVERK – Medlemsansökan SLF
 * ------------------------------------------------------------
 * All logik som styr vilket steg som visas härnäst samlas här,
 * så att den kan stämmas av mot specen och ändras på ett ställe.
 *
 * Varje regel: { steg, villkor (läsbar text), nästa }
 */

const RULES = {
  // Steg 0 – Välj spår
  valjSpar: {
    lakare:   { label: 'Jag är läkare med läkarexamen',                            next: 'lakare-uppgifter' },
    student:  { label: 'Jag studerar till läkare',                                 next: 'student-uppgifter' },
    forening: { label: 'Jag vill bli medlem i en specialitets- eller intresseförening', next: 'forening-ansokan',
                note: 'Notera att du inte blir medlem i Sveriges Läkarförbund när du blir medlem i en specialitets- eller intresseförening.' },
  },

  // Spår läkare, steg 1 – Uppgifter
  //  • "Hämta personuppgifter" (kräver ifyllt personnummer) → visar maskat namn + adress,
  //    knappen blir sekundär och länken till manuell inmatning döljs.
  //    Ändras personnumret efteråt nollställs hämtningen.
  //  • "Jag behöver ange min information manuellt" fäller ut/ihop manuellt formulär.
  //  • "Bor du i Sverige?" – Ja är förvalt.
  //      Ja  → Gatuadress, Postnummer, Ort
  //      Nej → Adressrad 1, Adressrad 2 (valfritt), Postnummer (valfritt), Ort,
  //            Region/delstat/provins (valfritt), Land
  //  • "Nästa steg" alltid synlig → Utbildning.

  // Spår läkare, steg 2 – Utbildning
  //  • Datum för läkarexamen (ÅÅÅÅMMDD, kalenderikonen öppnar datumväljare).
  //  • Land för läkarexamen – Sverige förvalt.
  //  • Land utanför EU/EES → "Har du svenskt läkarlegitimation?" (inget förval)
  //      Ja  → inget mer
  //      Nej → "Bifoga dokumentation för legitimationsvillkor" (en eller flera PDF, max 4,5 MB totalt)
  //  • Land inom EU/EES → inga följdfrågor.
  //  • "Nästa steg" → Yrke.
};

/* Länder: [ISO-kod, namn, inom EU/EES] */
const COUNTRIES = [
  ['se', 'Sverige', true], ['dk', 'Danmark', true], ['fi', 'Finland', true], ['no', 'Norge', true], ['is', 'Island', true],
  ['be', 'Belgien', true], ['bg', 'Bulgarien', true], ['ee', 'Estland', true], ['fr', 'Frankrike', true],
  ['gr', 'Grekland', true], ['ie', 'Irland', true], ['it', 'Italien', true], ['hr', 'Kroatien', true],
  ['cy', 'Cypern', true], ['lv', 'Lettland', true], ['li', 'Liechtenstein', true], ['lt', 'Litauen', true],
  ['lu', 'Luxemburg', true], ['mt', 'Malta', true], ['nl', 'Nederländerna', true], ['pl', 'Polen', true],
  ['pt', 'Portugal', true], ['ro', 'Rumänien', true], ['sk', 'Slovakien', true], ['si', 'Slovenien', true],
  ['es', 'Spanien', true], ['cz', 'Tjeckien', true], ['de', 'Tyskland', true], ['hu', 'Ungern', true], ['at', 'Österrike', true],
  ['af', 'Afghanistan', false], ['au', 'Australien', false], ['ba', 'Bosnien och Hercegovina', false],
  ['eg', 'Egypten', false], ['gb', 'Förenade kungariket', false], ['in', 'Indien', false], ['iq', 'Irak', false],
  ['ir', 'Iran', false], ['ca', 'Kanada', false], ['cn', 'Kina', false], ['lb', 'Libanon', false],
  ['pk', 'Pakistan', false], ['ru', 'Ryssland', false], ['ch', 'Schweiz', false], ['rs', 'Serbien', false],
  ['so', 'Somalia', false], ['sy', 'Syrien', false], ['tr', 'Turkiet', false], ['ua', 'Ukraina', false],
  ['us', 'USA', false],
];

function showLegitimationQuestion(data) {
  const land = COUNTRIES.find(c => c[0] === data.examensland);
  return !!land && !land[2];
}
function showAttachment(data) {
  return showLegitimationQuestion(data) && data.svenskLeg === 'nej';
}

/* Avgör nästa skärm utifrån nuvarande skärm och insamlad data. */
function nextScreen(current, data) {
  switch (current) {
    case 'valj-spar':
      return RULES.valjSpar[data.spar]?.next ?? 'valj-spar';
    case 'lakare-uppgifter':
      return 'lakare-utbildning';
    case 'lakare-utbildning':
      return 'lakare-yrke';
    case 'lakare-yrke':
      return 'lakare-signera';
    case 'lakare-signera':
    case 'student-signera':
      return arRedanMedlem(data) ? 'redan-medlem' : 'kvittens';
    case 'forening-ansokan':
      return 'kvittens-forening';
    case 'student-uppgifter':
      return 'student-utbildning';
    case 'student-utbildning':
      return 'student-signera';
    default:
      return current;
  }
}


/* ================================================================
 * Spår läkare, steg 3 – Yrke
 * ----------------------------------------------------------------
 *  • Saknar svensk legitimation (land utanför EU/EES + "Nej" i steg 2)
 *      → hela steget ersätts av infotexten "Lokal- och yrkesföreningar".
 *  • Län (inget förval). Lokalförening:
 *      – Skåne län      → "I vilken kommun jobbar du?" → lokalförening beror på kommun
 *      – Stockholm, VGR → lokalförening visas + "Välj sektion för din lokalförening"
 *      – Övriga län     → lokalförening visas direkt
 *  • "Är du färdig specialistläkare?" (alltid synlig, inget förval)
 *      Nej → "Din yrkesförening är Sveriges yngre läkares förening SYLF."
 *      Ja  → "Välj yrkesförening" → efter val:
 *            Sjukhusläkarna + (Stockholm / VGR-sektion / Skånekommun)
 *              → "Din lokalavdelning i din yrkesförening är Sjukhusläkarna <ort>."
 *            annars → "Din yrkesförening är <vald förening>."
 *  • Byte av län nollställer kommun och sektion.
 * ================================================================ */

// EXEMPELDATA – lokalföreningarnas namn ska stämmas av med SLF
const LAN = [
  ['blekinge', 'Blekinge län', 'Blekinge läkarförening'],
  ['dalarna', 'Dalarnas län', 'Dalarnas läkarförening'],
  ['gotland', 'Gotlands län', 'Gotlands läkarförening'],
  ['gavleborg', 'Gävleborgs län', 'Gävleborgs läkarförening'],
  ['halland', 'Hallands län', 'Hallands läkarförening'],
  ['jamtland', 'Jämtlands län', 'Jämtlands läkarförening'],
  ['jonkoping', 'Jönköpings län', 'Jönköpings läns läkarförening'],
  ['kalmar', 'Kalmar län', 'Kalmar läns läkarförening'],
  ['kronoberg', 'Kronobergs län', 'Kronobergs läkarförening'],
  ['norrbotten', 'Norrbottens län', 'Norrbottens läkarförening'],
  ['skane', 'Skåne län', null],                       // beror på kommun
  ['stockholm', 'Stockholms län', 'Stockholms läkarförening'],
  ['sodermanland', 'Södermanlands län', 'Södermanlands läkarförening'],
  ['uppsala', 'Uppsala län', 'Upsala läkareförening'],
  ['varmland', 'Värmlands län', 'Värmlands läkarförening'],
  ['vasterbotten', 'Västerbottens län', 'Västerbottens läkarförening'],
  ['vasternorrland', 'Västernorrlands län', 'Västernorrlands läkarförening'],
  ['vastmanland', 'Västmanlands län', 'Västmanlands läkarförening'],
  ['vgr', 'Västra Götalands län', 'Västra Götalands läkarförening'],
  ['orebro', 'Örebro län', 'Örebro läns läkarförening'],
  ['ostergotland', 'Östergötlands län', 'Östergötlands läkarförening'],
];

// EXEMPELDATA – Skånes kommuner → [lokalförening, Sjukhusläkarnas lokalavdelning]
const SKANE_OMRADEN = {
  mellersta: ['Mellersta Skånes läkarförening', 'Sjukhusläkarna Lund'],
  malmo:     ['Malmö läkarförening', 'Sjukhusläkarna Malmö'],
  nordvast:  ['Nordvästra Skånes läkarförening', 'Sjukhusläkarna Helsingborg'],
  nordost:   ['Nordöstra Skånes läkarförening', 'Sjukhusläkarna Kristianstad'],
  sydost:    ['Sydöstra Skånes läkarförening', 'Sjukhusläkarna Ystad'],
};
const SKANE_KOMMUNER = [
  ['Bjuv', 'nordvast'], ['Bromölla', 'nordost'], ['Burlöv', 'malmo'], ['Båstad', 'nordvast'],
  ['Eslöv', 'mellersta'], ['Helsingborg', 'nordvast'], ['Hässleholm', 'nordost'], ['Höganäs', 'nordvast'],
  ['Hörby', 'mellersta'], ['Höör', 'mellersta'], ['Klippan', 'nordvast'], ['Kristianstad', 'nordost'],
  ['Kävlinge', 'mellersta'], ['Landskrona', 'nordvast'], ['Lomma', 'mellersta'], ['Lund', 'mellersta'],
  ['Malmö', 'malmo'], ['Osby', 'nordost'], ['Perstorp', 'nordvast'], ['Simrishamn', 'sydost'],
  ['Sjöbo', 'sydost'], ['Skurup', 'malmo'], ['Staffanstorp', 'mellersta'], ['Svalöv', 'nordvast'],
  ['Svedala', 'malmo'], ['Tomelilla', 'sydost'], ['Trelleborg', 'malmo'], ['Vellinge', 'malmo'],
  ['Ystad', 'sydost'], ['Åstorp', 'nordvast'], ['Ängelholm', 'nordvast'], ['Örkelljunga', 'nordvast'],
  ['Östra Göinge', 'nordost'],
];

// Från skiss – Stockholms sektioner (lokalavdelning i Sjukhusläkarna = Stockholm för alla)
const SEKTIONER_STOCKHOLM = [
  'Danderyds sjukhus läkareförening',
  'Karolinska Universitetssjukhusets läkarförening',
  'Läkarföreningen Tiohundra',
  'S:t Görans sjukhus läkarförening',
  'Sektion statlig - Läkare anställda inom Karolinska Institutet eller annan statlig huvudman inom föreningens verksamhetsområde',
  'SLSO:s läkarförening - Läkare anställda vid Stockholms läns sjukvårdsområde',
  'Stockholms företagsläkarförening',
  'Stor-Stockholms privatläkarförening',
  'Södersjukhusets läkarförening',
  'Södertälje sjukhus läkarförening',
].map(name => ({ value: name, label: name, lokalavd: 'Sjukhusläkarna Stockholm' }));

// Från skiss – VGR:s sektioner. Lokalavdelning = EXEMPELDATA (Skaraborg från skiss)
const SEKTIONER_VGR = [
  { value: 'SU', label: 'Sektion SU', desc: 'Omfattar Sahlgrenska universitetssjukhuset – Sahlgrenska sjukhuset, Mölndals sjukhus och Östra sjukhuset.', lokalavd: 'Sjukhusläkarna Göteborg' },
  { value: 'Primärvård', label: 'Sektion Primärvård', desc: 'Omfattar Närhälsan, Regionhälsan, hos privata aktörer inom VG Primärvård samt aktörer inom beställd primärvård.', lokalavd: 'Sjukhusläkarna Göteborg' },
  { value: 'NU', label: 'Sektion NU', desc: 'Omfattar Norra Älvsborgs länssjukhus (NÄL) och Uddevalla sjukhus.', lokalavd: 'Sjukhusläkarna NU-sjukvården' },
  { value: 'SV', label: 'Sektion SV', desc: 'Omfattar Kungälvs sjukhus, Högsbo närsjukhus, Angereds närsjukhus och Alingsås lasarett.', lokalavd: 'Sjukhusläkarna Göteborg' },
  { value: 'SkaS', label: 'Sektion SkaS', desc: 'Omfattar sjukhusen i Skaraborg – Skövde, Mariestad, Lidköping eller Falköping.', lokalavd: 'Sjukhusläkarna Skaraborg' },
  { value: 'SÄS', label: 'Sektion SÄS', desc: 'Omfattar Södra Älvsborgs sjukhus i Borås.', lokalavd: 'Sjukhusläkarna Borås' },
];

// Från skiss – yrkesföreningar (OBS: "Privatläkarföreningen SYLF" står så i skissen – stäm av)
const YRKESFORENINGAR = [
  'LifeScience-läkarna',
  'Privatläkarföreningen SYLF',
  'Sjukhusläkarna',
  'Svenska distriktsläkarföreningen DLF',
  'Svenska företagsläkarföreningen SFLF',
  'Svenska militärläkarföreningen MLF',
  'Sveriges läkarförbunds chefsförening',
  'Sveriges yngre läkares förening SYLF',
];

function saknarSvenskLeg(data) { return showAttachment(data); }

function sektionerFor(lan) {
  return lan === 'stockholm' ? SEKTIONER_STOCKHOLM : lan === 'vgr' ? SEKTIONER_VGR : null;
}

/* Lokalförening utifrån län (+ kommun i Skåne). null = inte avgjord ännu. */
function lokalforening(data) {
  if (!data.lan) return null;
  if (data.lan === 'skane') {
    const k = SKANE_KOMMUNER.find(([namn]) => namn === data.kommun);
    return k ? SKANE_OMRADEN[k[1]][0] : null;
  }
  return LAN.find(l => l[0] === data.lan)?.[2] ?? null;
}

/* Sjukhusläkarnas lokalavdelning – bara i Stockholm, VGR och Skåne (enligt skisserna). */
function lokalavdelning(data) {
  if (data.specialist !== 'ja' || data.yrkesforening !== 'Sjukhusläkarna') return null;
  if (data.lan === 'skane') {
    const k = SKANE_KOMMUNER.find(([namn]) => namn === data.kommun);
    return k ? SKANE_OMRADEN[k[1]][1] : null;
  }
  return sektionerFor(data.lan)?.find(s => s.value === data.sektion)?.lokalavd ?? null;
}


/* ================================================================
 * Spår läkare, steg 4 – Signera (sammanställning)
 * ----------------------------------------------------------------
 *  • Dina uppgifter: hämtade → maskat namn/adress, ingen "Ändra".
 *                    manuellt ifyllda → klartext + "Ändra" (→ steg Uppgifter).
 *  • Dina kontaktuppgifter (→ Välj spår), Din läkarexamen (→ Utbildning): alltid "Ändra".
 *  • Dina föreningar (→ Yrke): döljs om användaren saknar svensk legitimation.
 *  • Månadsavgift: saknar svensk leg → reducerad avgift + annan text. (EXEMPELBELOPP)
 *  • Signering: hämtade uppgifter (personnummer) → "Skicka in ansökan" med BankID
 *               + "Jag har inte BankID" (fäll ut → skicka in utan BankID).
 *               Manuell inmatning → "Skicka in ansökan" utan BankID, ingen "Jag har inte BankID".
 * ================================================================ */
const AVGIFT = { ordinarie: 332, reducerad: 56 }; // EXEMPELBELOPP från skiss

function harManuellaUppgifter(data) { return !data.hamtad && !!data.manuell; }
function signeraMedBankId(data) { return !harManuellaUppgifter(data); }
function manadsavgift(data) { return saknarSvenskLeg(data) ? AVGIFT.reducerad : AVGIFT.ordinarie; }


/* ================================================================
 * Efter "Skicka in ansökan" – kontroll om personen redan är medlem
 * ----------------------------------------------------------------
 *  • Redan medlem → "Du är redan medlem hos oss"
 *  • Annars       → kvittens "Tack för din ansökan!"
 *  I prototypen: personnummer (eller samordningsnummer) 200010101010 = redan medlem.
 * ================================================================ */
const TEST_REDAN_MEDLEM = '200010101010';

function arRedanMedlem(data) {
  return normaliseraPnr(data.pnr) === TEST_REDAN_MEDLEM || normaliseraPnr(data.samordningsnr) === TEST_REDAN_MEDLEM;
}


/* ================================================================
 * Spår student
 * ----------------------------------------------------------------
 *  Steg: Uppgifter → Utbildning → Signera → kvittens / redan medlem
 *  • Uppgifter: som läkarspåret men utan "Bor du i Sverige?" (alltid svensk adress).
 *  • Utbildning: "Välj ditt universitet" (inget förval)
 *      Svenskt lärosäte    → "Din lokalavdelning är SLF student <ort>." + Förväntat examensdatum
 *      Studerar utomlands  → Universitet (utomlands) + Land
 *                            → när land valts: "SLF student Utland" + Förväntat examensdatum
 *  • Signera: Dina uppgifter, kontaktuppgifter, utbildning (Ändra), föreningar (ingen Ändra),
 *             årsavgift, valfri prenumeration på Läkartidningen, BankID / "Jag har inte BankID".
 * ================================================================ */
const UTLAND = 'utland';

// EXEMPELDATA – lärosäten med läkarprogram → lokalavdelning
const UNIVERSITET = [
  ['goteborg', 'Göteborg', 'SLF student Göteborg'],
  ['ki', 'Karolinska Institutet', 'SLF student Stockholm'],
  ['linkoping', 'Linköping', 'SLF student Linköping'],
  ['lund', 'Lund', 'SLF student Lund'],
  ['umea', 'Umeå', 'SLF student Umeå'],
  ['uppsala', 'Uppsala', 'SLF student Uppsala'],
  ['orebro', 'Örebro', 'SLF student Örebro'],
];

const AVGIFT_STUDENT = 349;        // kr per år – från skiss
const PRIS_LAKARTIDNINGEN = 150;   // kr per år – från skiss

/* Lokalavdelning för student. null = inte avgjord ännu (styr även när examensdatum visas). */
function studentLokalavdelning(data) {
  if (data.universitet === UTLAND) return data.studieland ? 'SLF student Utland' : null;
  return UNIVERSITET.find(u => u[0] === data.universitet)?.[2] ?? null;
}


/* ================================================================
 * Spår specialitets- eller intresseförening
 * ----------------------------------------------------------------
 *  • Steg 0: när alternativet väljs visas notering om att man INTE blir medlem i SLF.
 *  • Ett enda formulär (ingen stegindikator): personuppgifter (som läkarspåret),
 *    Välj förening (grupperad), Välj lokal avdelning (bara för föreningar som har sådana),
 *    infotext, kryssrutor (ST-läkare, annat yrke, pensionär, förstår utträde).
 *  • "Skicka in ansökan" (utan BankID) → kvittens för förening (ingen "redan medlem"-kontroll).
 * ================================================================ */
// Från skiss (dubbletten "Geriatriker i Stockholm - GERIS" borttagen)
const FORENINGAR = {
  specialitet: [
    'Föreningen för Klinisk Mikrobiologi',
    'Geriatriker i Stockholm - GERIS',
    'Nordiskt Neuropediatriskt Sällskap',
    'SFAM (Svensk förening för allmänmedicin)',
  ],
  intresse: [
    'E-hälsoläkarna',
    'Internationella läkarföreningen',
    'Kvinnliga läkares förening',
    'Svensk arbetsmedicinsk och Arbets- och miljömedicinsk förening',
    'Svensk förening för pediatrisk akutsjukvård',
  ],
};

// EXEMPELDATA – föreningar med lokala avdelningar (i skissen bara SFAM)
const FORENING_AVDELNINGAR = {
  'SFAM (Svensk förening för allmänmedicin)': [
    'SFAM Blekinge', 'SFAM Dalarna', 'SFAM Göteborg', 'SFAM Halland', 'SFAM Jönköping',
    'SFAM Norrbotten', 'SFAM Skåne', 'SFAM Stockholm', 'SFAM Uppsala', 'SFAM Västerbotten', 'SFAM Örebro',
  ],
};

function lokalavdelningarFor(forening) { return FORENING_AVDELNINGAR[forening] ?? null; }


/* ================================================================
 * VALIDERING (felhantering)
 * ----------------------------------------------------------------
 *  Principer (GOV.UK / Digg):
 *   • Validering sker när användaren klickar "Nästa steg" – aldrig medan hen skriver.
 *   • Felsammanfattning överst + felmeddelande vid varje fält. Fokus flyttas till sammanfattningen.
 *   • Rättade fel försvinner direkt; nya fel visas först vid nästa klick.
 *   • Meddelanden säger vad användaren ska göra.
 *  Funktionerna returnerar { fältnamn: felmeddelande } – tomt objekt = inga fel.
 * ================================================================ */
const digits = (v) => String(v ?? '').replace(/\D/g, '');

/* Testnummer som alltid godkänns i prototypen (oavsett kontrollsiffra). */
const TESTNUMMER = [TEST_REDAN_MEDLEM, '197001011234'];

function luhnOk(tenDigits) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    let d = Number(tenDigits[i]) * (i % 2 === 0 ? 2 : 1);
    sum += d > 9 ? d - 9 : d;
  }
  return sum % 10 === 0;
}

/* Kontroll av personnummer (eller samordningsnummer: dag + 60). Returnerar felmeddelande eller null. */
/* Gör om personnummer med 10 eller 12 siffror till 12 siffror (ÅÅÅÅMMDDNNNN).
 * 10 siffror: århundradet väljs så att personen är högst 100 år; "+" betyder 100 år eller äldre. */
function normaliseraPnr(value) {
  const raw = String(value ?? '').trim();
  const d = digits(raw);
  if (d.length === 12) return d;
  if (d.length !== 10) return null;
  const nu = new Date().getFullYear();
  const yy = Number(d.slice(0, 2));
  let ar = Math.floor(nu / 100) * 100 + yy;
  if (ar > nu) ar -= 100;
  if (raw.includes('+')) ar -= 100;
  return String(ar) + d.slice(2);
}

function personnummerFel(value, { tom, samordning = false }) {
  const raw = String(value ?? '').trim();
  if (!raw) return tom;
  if (/[^\d\s+-]/.test(raw)) return 'Personnumret får bara innehålla siffror, till exempel 199001011239 eller 9001011239.';
  const d = normaliseraPnr(raw);
  if (!d) return 'Personnumret ska ha 10 eller 12 siffror, till exempel 199001011239 eller 9001011239.';
  if (TESTNUMMER.includes(d)) return null;
  const y = +d.slice(0, 4), m = +d.slice(4, 6);
  let day = +d.slice(6, 8);
  if (samordning && day > 60) day -= 60;
  const date = new Date(y, m - 1, day);
  const giltigtDatum = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === day && date <= new Date();
  if (!giltigtDatum || !luhnOk(d.slice(2))) return 'Personnumret är inte giltigt. Kontrollera att du har skrivit rätt.';
  return null;
}

/* Steg 0 – Välj spår och kontaktuppgifter */
function valideraKontakt(data) {
  const fel = {};
  if (!data.spar) fel.spar = 'Välj det alternativ som passar dig bäst.';

  const email = String(data.email ?? '').trim();
  if (!email) fel.email = 'Ange din e-postadress.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) fel.email = 'Ange en e-postadress i rätt format, till exempel namn@exempel.se.';

  const kod = String(data.landskod ?? '+46').replace(/\s/g, '');
  if (!kod) fel.landskod = 'Ange landskod, till exempel +46.';
  else if (!/^(\+|00)?\d{1,4}$/.test(kod)) fel.landskod = 'Ange landskoden med + och 1–4 siffror, till exempel +46.';

  const tel = String(data.telefon ?? '').trim();
  const telSiffror = digits(tel).replace(/^0/, '');
  const svenskt = digits(kod).replace(/^00/, '') === '46';
  if (!tel) fel.telefon = 'Ange ditt telefonnummer.';
  else if (/[^\d\s-]/.test(tel)) fel.telefon = 'Telefonnumret får bara innehålla siffror, till exempel 701234567.';
  else if (svenskt ? (telSiffror.length < 7 || telSiffror.length > 9) : (telSiffror.length < 6 || telSiffror.length > 14))
    fel.telefon = 'Ange ett telefonnummer med rätt antal siffror, till exempel 701234567.';

  if (!data.samtycke) fel.samtycke = 'Du behöver godkänna att vi behandlar dina personuppgifter för att kunna gå vidare.';
  return fel;
}

/* Steg "Uppgifter" – personnummer eller manuellt angivna namn och adress */
function valideraUppgifter(data) {
  const fel = {};
  if (data.hamtad) return fel;

  if (!data.manuell) {
    const pnrFel = personnummerFel(data.pnr, {
      tom: 'Ange ditt personnummer och klicka på Hämta personuppgifter. Har du inget svenskt personnummer kan du ange dina uppgifter manuellt.',
    });
    fel.pnr = pnrFel ?? 'Klicka på Hämta personuppgifter för att hämta ditt namn och din adress.';
    return fel;
  }

  if (String(data.samordningsnr ?? '').trim()) {
    const f = personnummerFel(data.samordningsnr, { tom: null, samordning: true });
    if (f) fel.samordningsnr = f.replace('Personnumret', 'Numret');
  }
  const tom = (k) => !String(data[k] ?? '').trim();
  if (tom('fornamn')) fel.fornamn = 'Ange ditt förnamn.';
  if (tom('efternamn')) fel.efternamn = 'Ange ditt efternamn.';

  if (data.borISverige === 'nej') {
    if (tom('adressrad1')) fel.adressrad1 = 'Ange din adress.';
    if (tom('ortUtl')) fel.ortUtl = 'Ange ort.';
    if (tom('land')) fel.land = 'Ange land.';
  } else {
    if (tom('gatuadress')) fel.gatuadress = 'Ange din gatuadress.';
    const pnr = String(data.postnummer ?? '').trim();
    if (!pnr) fel.postnummer = 'Ange ditt postnummer.';
    else if (!/^\d{3}\s?\d{2}$/.test(pnr)) fel.postnummer = 'Postnumret ska ha 5 siffror, till exempel 123 45.';
    if (tom('ort')) fel.ort = 'Ange ort.';
  }
  return fel;
}

/* Klick på "Hämta personuppgifter" – bara personnumret kontrolleras */
function valideraHamta(data) {
  const f = personnummerFel(data.pnr, { tom: 'Ange ditt personnummer för att hämta dina uppgifter.' });
  return f ? { pnr: f } : {};
}


/* Föreningsansökan: personuppgifter + obligatorisk kryssruta om utträde */
function valideraForening(data) {
  const fel = valideraUppgifter(data);
  if (!data.forstarUttrade) fel.forstarUttrade = 'Du behöver bekräfta att du har förstått hur utträde går till för att kunna skicka in ansökan.';
  return fel;
}
