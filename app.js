window.onload = sendRequest();
let randomCountryName;
let correctCount = 0;
let failedCount = 0;
let gameActive = false; // Még nem fut a játék - a játék állapotát tartjuk nyilván.

function endGame() {
    gameActive = false;
    alert("Vége a játéknak!");
    randomCountryName = "";
    const input = document.querySelector("[type='text']");
    input.value = "";
    const flags = document.querySelectorAll(".flags div img");
    flags.forEach(flag => {
        // Lecseréli a flage-eket azok pontos másolatára (gyermekeiket is) eseményfigyelő nélkül.
        flag.replaceWith(flag.cloneNode(true));
    });
}

// Kérés küldése az API felé:
async function sendRequest() {
    const url = "https://restcountries.com/v3.1/region/europe";
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            throw new Error("Request error!", response.status);
        }
        const data = await response.json();
        console.log(data);
        const flags = getFlags(data);
        renderFlags(flags);
        const countryNames = getNames(data);
        startButtonManager(countryNames, data);
    } catch (error) {
        console.log(error.message);
    }
}
// Zászlóképek listáját elkészíti:
function getFlags(data) {
    const flags = data.map(item => item.flags.png);
    // console.log(flags);
    return flags;
}
// Országok neveinek listája:
function getNames(data) {
    const countries = data.map(({ name }) => name.common);
    console.log(countries);
    return countries;
}

// Zászlók renderelése:
function renderFlags(flags) {
    const container = document.querySelector(".flags");
    container.innerHTML = "";
    const content = flags.map(flag => `
        <div><img src="${flag}"></div>
    `).join("");
    container.innerHTML = content;
}
// Indul a játék! *****************************************
// Véletlen-országnév készítése + a név kivétele a listából:
// Nem kell a neveket globálisan tárolni, mert csak referenciát kap a függvény, nem értékeket!!!
function getRandomName(nameList) { // unit-tesztre jó!
    const countryName = nameList.sort(() => Math.random() - 0.5).splice(0, 1);
    return countryName;
}
// A kitalálandó ország nevét sorsoljuk:
function showRandomName(name) {
    const input = document.querySelector("[type='text']");
    if (input instanceof HTMLInputElement) {
        input.value = "";
        input.value = name;
    }

}

// Flags manager:
function flagsManager(nameList, data) {
    const flags = document.querySelectorAll(".flags div img");
    if (flags.length > 0) {
        flags.forEach(flag => {
            flag.addEventListener("click", (event) => {
                if (!gameActive) return; // Ha a játék inaktív, akkor ne történjen semmi!
                handleClick(event, nameList, data);
                displayScore();
            });
        })
    }
}

// A handleClick összefogja az össze alműveletet, amelyek zászlóra kattintáskor működni kezdenek:
// - kattintott zászló "neve"
// - validálás - a megjelenő országnak a zászlójára kattintottak-e
function handleClick(event, nameList, data) {
    const flagURL = getFlagURL(event);
    console.log(randomCountryName);
    // Ha kattintott zászló === országnevével, akkor alert, és új név Különben alert és új katt. lehetőség
    if (isSame(flagURL, data)) {
        alert("Grautlálok!");
        correctCount += 1;
        randomCountryName = getRandomName(nameList)[0];
        showRandomName(randomCountryName);
        return;
    }
    alert("Próbálja újra!");
    failedCount += 1;
    return;
}
function displayScore() {
    const correctSpan = document.querySelector("#correct");
    const failedSpan = document.querySelector("#failed");
    correctSpan.textContent = correctCount;
    failedSpan.textContent = failedCount;
}

// Visszaszámláló (3 perces):
function countDown() {
    const min = document.querySelector(".clock input:first-child");
    const sec = document.querySelector(".clock input:last-child");
    let secundum = 60;
    let minute = 2;
    const timer = setInterval(() => {
        if (!gameActive) {
            clearInterval(timer); // Ha a játék nem aktív, leállítja a számlálót.
        }
        //value = value == 0 ? value = 60 : value-1;
        if (secundum === 0 && minute > 1) {
            secundum = 60;
            minute -= 1;
        }
        if (secundum === 0 && minute === 1) {
            minute -= 1;
            secundum = 60;
        }
        if (secundum === 0 && minute === 0) {
            clearInterval(timer);
            endGame();
            secundum = 0;
            minute = 0;
        }
        // A logika és megjelenítés elkülönítése? Avagy ez a view része?
        min.value = minute.toString().padStart(2, 0);
        sec.value = secundum.toString().padStart(2, 0);
        secundum -= 1;
    }, 1000)
}

// Zászlóra kattintás --> visszaadja a zászló "nevét" url-címét:
function getFlagURL(event) {
    if (event.target instanceof HTMLImageElement) {
        // console.log(event.target.src);
        return event.target.src;
    }
}

// Validálás:
function isSame(flagURL, data) {
    const dataLength = data.length;
    let i = 0;
    while ((i < dataLength) && (data[i].name.common !== randomCountryName || data[i].flags.png !== flagURL)) {
        i++;
    }
    //console.log(i < dataLength);
    return i < dataLength;
}

// Start button manager:
function startButtonManager(nameListOrig, data) {
    const nameList = [...nameListOrig]; // Így a nameList már egy független, új lista lesz.
    const startButton = document.querySelector("[type='button']");
    startButton.addEventListener("click", () => {
        gameActive = true;
        correctCount = 0;
        failedCount = 0;
        countDown();
        // A kezdés gomb csak először írat ki országnevet: TODO
        const input = document.querySelector("[type='text']");
        randomCountryName = getRandomName(nameList)[0]; // Unit-teszt round volt random helyett...
        if (input instanceof HTMLInputElement && input.value === "") {
            showRandomName(randomCountryName);
        }
        flagsManager(nameList, data);
    })
}
