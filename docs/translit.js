const input = document.getElementById('input');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const sampleBtn = document.getElementById('sampleBtn');
const clearBtn = document.getElementById('clearBtn');
const accordionBtn = document.querySelector('.accordion-btn');
const accordionContent = document.querySelector('.accordion-content');

const rules = {
    "А": "A", "а": "a", "Б": "B", "б": "b", "В": "V", "в": "v", "Г": "H", "г": "h",
    "Ґ": "G", "ґ": "g", "Д": "D", "д": "d", "Е": "E", "е": "e", "Ж": "Zh", "ж": "zh",
    "З": "Z", "з": "z", "И": "Y", "и": "y", "І": "I", "і": "i", "К": "K", "к": "k",
    "Л": "L", "л": "l", "М": "M", "м": "m", "Н": "N", "н": "n", "О": "O", "о": "o",
    "П": "P", "п": "p", "Р": "R", "р": "r", "С": "S", "с": "s", "Т": "T", "т": "t",
    "У": "U", "у": "u", "Ф": "F", "ф": "f", "Х": "Kh", "х": "kh", "Ц": "Ts", "ц": "ts",
    "Ч": "Ch", "ч": "ch", "Ш": "Sh", "ш": "sh", "Щ": "Shch", "щ": "shch",
    "Ь": "", "ь": "", "'": "", "’": "", "-": "-"
};

const contextual = {
    "Є": ["Ye", "ie"], "є": ["Ye", "ie"],
    "Ї": ["Yi", "i"], "ї": ["Yi", "i"],
    "Й": ["Y", "i"], "й": ["Y", "i"],
    "Ю": ["Yu", "iu"], "ю": ["Yu", "iu"],
    "Я": ["Ya", "ia"], "я": ["Ya", "ia"]
};

const separators = new Set([
    ".", ",", ":", ";", "!", "?", ")", "]", "}", "(", "[", "{", " ",
    "\n", "\t", '"', "'", "«", "»", "“", "”"
]);

const multiLetterTranslit = new Set([
    "Zh", "zh", "Kh", "kh", "Ts", "ts", "Ch", "ch", "Sh", "sh",
    "Shch", "shch", "Ye", "ye", "Yu", "yu", "Ya", "ya", "Yi", "yi", "Ie", "ie"
]);

function translit(text) {
    if (!text) return "";

    // Спеціальне правило для "зг" → "zgh"
    text = text.replace(/Зг/g, "Zgh")
        .replace(/зг/g, "zgh")
        .replace(/ЗГ/g, "ZGH");
    return text.replace(/[А-Яа-яЁёЇїІіЄєҐґ'’\-]+/g, token => {
        const lower = token.toLowerCase();
        let result = "";
        const isAllUpper = token === token.toUpperCase();

        for (let i = 0; i < token.length; i++) {
            const ch = token[i];
            const next = token[i + 1] || "";
            const isStart = i === 0;
            const nextIsUpper = next === next.toUpperCase();

            let base;
            if (contextual[ch]) base = contextual[ch][isStart ? 0 : 1];
            else base = rules[ch] || ch;

            const isSingleLetter = token.length === 1 || (token.length === 2 && separators.has(token[1]));
            const isMulti = multiLetterTranslit.has(base);

            if (isSingleLetter && isMulti) {
                base = ch === ch.toUpperCase() ? base[0].toUpperCase() + base.slice(1).toLowerCase() : base.toLowerCase();
            } else if (isAllUpper) {
                base = base.toUpperCase();
            } else if (ch === ch.toUpperCase() && !nextIsUpper) {
                base = base[0].toUpperCase() + base.slice(1).toLowerCase();
            } else if (ch === ch.toUpperCase() && nextIsUpper) {
                base = base.toUpperCase();
            } else {
                base = base.toLowerCase();
            }

            result += base;
        }

        result = result.replace(/[ьЬ’']/g, "");
        if (isServiceWord) result = result.toLowerCase();

        return result;
    });
}

input.addEventListener('input', () => {
    output.value = translit(input.value);
});

copyBtn.addEventListener('click', () => {
    output.select();
    document.execCommand('copy');
    copyBtn.textContent = "Скопійовано!";
    setTimeout(() => (copyBtn.textContent = "Копіювати"), 1500);
});

sampleBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('https://github.com/suprun/translit-ua-to-en/raw/refs/heads/main/docs/samples.json');
        const data = await response.json();
        const texts = data.samples;
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        input.value = randomText;
        output.value = translit(randomText);
    } catch (error) {
        console.error('Не вдалося завантажити samples.json:', error);
        input.value = 'Помилка завантаження зразків.';
    }
});

clearBtn.addEventListener('click', () => {
    input.value = "";
    output.value = "";
});

accordionBtn.addEventListener('click', () => {
    const open = accordionContent.style.display === 'block';
    accordionContent.style.display = open ? 'none' : 'block';
    accordionBtn.classList.toggle('active', !open);
});




