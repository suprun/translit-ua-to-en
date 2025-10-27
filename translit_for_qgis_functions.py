from qgis.core import *
from qgis.gui import *

@qgsfunction(args='auto', group='String')
def translit(value, feature, parent):
    """Транслітерація українського тексту згідно з Постановою КМУ №55 від 27.01.2010"""
    if not value:
        return ""
    text = str(value)

    rules = {
        "А": "A", "а": "a", "Б": "B", "б": "b", "В": "V", "в": "v",
        "Г": "H", "г": "h", "Ґ": "G", "ґ": "g", "Д": "D", "д": "d",
        "Е": "E", "е": "e", "Ж": "Zh", "ж": "zh", "З": "Z", "з": "z",
        "И": "Y", "и": "y", "І": "I", "і": "i",
        "К": "K", "к": "k", "Л": "L", "л": "l", "М": "M", "м": "m",
        "Н": "N", "н": "n", "О": "O", "о": "o", "П": "P", "п": "p",
        "Р": "R", "р": "r", "С": "S", "с": "s", "Т": "T", "т": "t",
        "У": "U", "у": "u", "Ф": "F", "ф": "f", "Х": "Kh", "х": "kh",
        "Ц": "Ts", "ц": "ts", "Ч": "Ch", "ч": "ch", "Ш": "Sh", "ш": "sh",
        "Щ": "Shch", "щ": "shch",
        "Ь": "", "ь": "", "'": "", "’": "", "-": "-"
    }

    contextual = {
        "Є": ("Ye", "ie"), "є": ("Ye", "ie"),
        "Ї": ("Yi", "i"),  "ї": ("Yi", "i"),
        "Й": ("Y", "i"),   "й": ("Y", "i"),
        "Ю": ("Yu", "iu"), "ю": ("Yu", "iu"),
        "Я": ("Ya", "ia"), "я": ("Ya", "ia"),
    }

    separators = {
        ".", ",", ":", ";", "!", "?", ")", "]", "}", "(", "[", "{",
        " ", "\n", "\t", '"', "'", "«", "»", "“", "”"
    }

    multi_letter_translit = {
        "Zh", "zh", "Kh", "kh", "Ts", "ts", "Ch", "ch",
        "Sh", "sh", "Shch", "shch", "Ye", "ye", "Yu", "yu",
        "Ya", "ya", "Yi", "yi", "Ie", "ie"
    }

    import re
    tokens = re.findall(r"[А-Яа-яЁёЇїІіЄєҐґ'\-]+|[^А-Яа-яЁёЇїІіЄєҐґ'\-]+", text)
    result = ""

    for token in tokens:
        if re.match(r"[А-Яа-яЁёЇїІіЄєҐґ'\-]+", token):
            word_result = ""
            is_all_upper = token.isupper()
            i = 0

            while i < len(token):
                ch = token[i]
                next_char = token[i + 1] if i + 1 < len(token) else ""
                is_start = (i == 0)
                next_is_upper = next_char.isupper() if next_char else False

                # спеціальне правило "зг" → "zgh" (на початку слова)
                if (ch in ["З", "з"]) and (next_char in ["Г", "г"]) and is_start:
                    base = "Zgh" if ch.isupper() else "zgh"
                    i += 2
                else:
                    if ch in contextual:
                        base = contextual[ch][0] if is_start else contextual[ch][1]
                    else:
                        base = rules.get(ch, ch)

                    # ініціали / окремі літери: застосовуємо тільки для великих
                    if (len(token) == 1 or (len(token) == 2 and token[1] in separators)) and base in multi_letter_translit:
                        if ch.isupper():
                            base = base[0].upper() + base[1:].lower()
                        else:
                            base = base.lower()
                    elif is_all_upper:
                        base = base.upper()
                    elif ch.isupper() and not next_is_upper:
                        base = base[0].upper() + base[1:].lower()
                    elif ch.isupper() and next_is_upper:
                        base = base.upper()
                    else:
                        base = base.lower()
                    i += 1

                word_result += base

            result += word_result
        else:
            result += token

    return result
