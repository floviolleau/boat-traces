const basename = (str, sep) => {
    return str.substr(str.lastIndexOf(sep) + 1);
}

const stripExtension = (str) => {
    return str.substr(0, str.lastIndexOf('.'));
}

const formatDate = (stringDate, locale = 'fr') => {
    const d = new Date(stringDate);
    const year = new Intl.DateTimeFormat(locale, {year: 'numeric'}).format(d);
    const month = new Intl.DateTimeFormat(locale, {month: 'long'}).format(d);
    const date = new Intl.DateTimeFormat(locale, {day: '2-digit'}).format(d);
    const hour = new Intl.DateTimeFormat(locale, {hour: '2-digit'}).format(d);
    let minute = parseInt(new Intl.DateTimeFormat(locale, {minute: '2-digit'}).format(d));

    if (minute < 10) {
        minute = `0${minute}`;
    }

    return `${date} ${month} ${year} à ${hour}${minute}`;
}

// Pad to 2 or 3 digits, default is 2
const pad = (n, z) => {
    z = z || 2;
    return ('00' + n).slice(-z);
}

const msToTime = (s) => {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    return pad(hrs) + 'h' + pad(mins) + 'min ' + pad(secs) + 's';
}

const roundTwoDigits = (num) => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

const cleanDate = (date) => {
    if (date === null) {
        return 'Inconnue';
    }

    return date;
}

const addDays = (date, days) => {
    let result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
}

export {
    addDays,
    basename,
    cleanDate,
    formatDate,
    msToTime,
    pad,
    roundTwoDigits,
    stripExtension
};
