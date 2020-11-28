const path = require('path');
const fs = require('fs');
const randomColor = require('randomcolor');

const ROOT_FOLDER = path.resolve(__dirname, '..');
const gpxFolderName = 'gpxs';
const GPX_FOLDER = path.resolve(ROOT_FOLDER, 'public', gpxFolderName);

const readFilesInDir = () => {
    const files = fs.readdirSync(GPX_FOLDER).filter(fn => fn.endsWith('.gpx'));

    let content = '{\n    "gpxFiles": [\n'
    console.log('GPX files detected:');

    files.forEach((file, key, arr) => {
        const color = randomColor()

        content += `        {
            "id": "${path.basename(file)}",
            "color": "${color}",
            "fileName": "${gpxFolderName}/${file}"\n`;
        if (Object.is(arr.length - 1, key)) {
            content += '        }\n';
        } else {
            content += '        },\n';
        }
        console.log(file);
    });
    content += '    ]\n}';
    fs.writeFileSync(path.resolve(GPX_FOLDER, 'list.json'), content, 'utf8');
}

readFilesInDir();