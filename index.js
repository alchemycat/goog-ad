const { executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-core");
const path = require("path");

const { Session } = require("./modules/Session");
const { Random } = require("./modules/Random");

const profileFolder = path.resolve(__dirname, "profiles", "test");

async function main() {
	const browser = await puppeteer.launch({
		headless: false,
		ignoreDefaultArgs: ["--enable-automation"],
		ignoreHTTPSErrors: true,
		executablePath: executablePath(),
	});

	const page = await browser.newPage();

	const session = new Session(page, profileFolder);
    const random = new Random();

	await session
		.loadSession()
		.then(() => console.log("Сессия загружена"))
		.catch(() => console.log("Ошибка загрузки сессии"));

	await page.goto("https://adsense.google.com/start/", { waitUntil: "load" });

	const signup = await page.waitForSelector(`a[track-label="hero"]`, {
		visible: true,
	});

	if (!signup) return console.log("Не удалось найти кнопку для регистрации");

	signup.click({ waitUntil: "load" });

	await page.waitForTimeout(2000);

	const account = await page.waitForSelector("[data-authuser='1']", {
		visible: true,
		timeout: 5000,
	});

	// const account = await page.waitForXPath('//div[@role="link" and @data-identifier]', {visible: true, timeout: 5000});
	//div[@role="link" and @data-identifier]

	if (!account) return console.log("Не удалось найти список аккаунтов");

	await account.click({ waitUntil: "load" });

	await page.waitForSelector('[trackshown="siteless-signup-form"]', {
		visible: true,
		timeout: 25000,
	});

	await page.waitForTimeout(1000);

	await page.click("material-checkbox");

	await page.waitForTimeout(1000);

	await page.click(".disable-emails-radio");

	await page.waitForTimeout(1000);

	await page.click("dropdown-button");
    
    await page.waitForTimeout(1000);

	const html = await page.content();

	const id = html.match(/(?<=id=").*--188(?=">)/gm)[0];

	if (!id) return console.log("Не удалось найти айди для соедененных штатов");

	await page.click(`[id="${id}"]`);

	await page.waitForTimeout(1000);

    const checkbox = await page.waitForSelector('[trackclick="product-agreement-checkbox-click"]', {visible: true, timeout: 5000});

    await checkbox.click();
    
    await page.waitForTimeout(1000);

    const create = await page.waitForSelector('[trackclick="create-account-click"]', {visible: true, timeout: 5000});
    
    await create.click();

    await page.waitForSelector('.mdc-button--unelevated.in-progress-button', {visible: true});

    await page.click(".mdc-button--unelevated.in-progress-button");

    const elementHandle = await page.waitForSelector('#signup-containerIframe', {visible: true});
    
    const frame = await elementHandle.contentFrame();

    await frame.waitForSelector('[name="RECIPIENT"]', {visible: true});

    await page.waitForTimeout(1000);

    const randInt = random.randomInt(1, 999).toString();

    await frame.type('[name="ADDRESS_LINE_1"]', randInt);

    await frame.waitForSelector(".ac-renderer", {visible: true});

    await page.waitForTimeout(1000);

    await frame.click(".ac-row");

    await page.waitForTimeout(1000);

    await page.click(".btn-yes");

    await page.waitForSelector('[src*="getting_ready_icon.svg"]', {visible: true});

    console.log("Адсенс аккаунт создан");
}

main();
