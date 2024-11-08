function removeSpaces(text) {
    return text.split('\n').map(x => x.replaceAll(/\s/g, '')).join('\n').replaceAll(/\n+/g, '\n');
}

function fullPeriod(text) {
    const mapping = {
        from: ',():;',
        to: '，（）：；',
    };
    for (let i = 0; i < mapping.from.length; ++i) {
        text = text.replaceAll(mapping.from[i], mapping.to[i]);
    }
    return text;
}

function spaceEnAndCh(text) {
    let result = '';
    let prev = 's';
    for (let c of text) {
        let uni = c.codePointAt(0);
        if (c.search(/[\s（）]/) >= 0) {
            result += c;
            prev = 's';
        } else if (
            // 48 <= uni && uni <= 57 ||
            // 65 <= uni && uni <= 90 ||
            // 97 <= uni && uni <= 122 ||
            // uni === 46
            uni < 127
        ) {
            if (prev === 'c') {
                result += ' ';
            }
            result += c;
            prev = 'e';
        } else {
            if (prev === 'e') {
                result += ' ';
            }
            result += c;
            prev = 'c';
        }
    }
    return result;
}

export default function (text) {
    return spaceEnAndCh(fullPeriod(removeSpaces(text)));
}