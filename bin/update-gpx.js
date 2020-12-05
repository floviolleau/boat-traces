const path = require('path');
const fs = require('fs');
const randomColor = require('randomcolor');
const yargs = require('yargs');

const ROOT_FOLDER = path.resolve(__dirname, '..');
const gpxFolderName = 'gpxs';
let GPX_FOLDER = path.resolve(ROOT_FOLDER, 'public', gpxFolderName);

yargs.options({
    folder: {
        alias: 'f',
        describe: 'What gpx folder to update (default public/gpx)',
        type: 'string'
    }
});

const destination = yargs.argv['folder'];
if (destination) {
    GPX_FOLDER = path.resolve(ROOT_FOLDER, destination);
}


console.log('\nPath where GPXS files are located: ', GPX_FOLDER)
const stripExtension = (str) => {
    return str.substr(0, str.lastIndexOf('.'));
}

const readFilesInDir = () => {
    const files = fs.readdirSync(GPX_FOLDER).filter(fn => fn.endsWith('.gpx'));

    let content = '{\n    "gpxFiles": [\n'
    console.log('\nGPX files detected:\n');

    const display = {};
    files.forEach((file, key, arr) => {
        const color = randomColor()

        const baseFilename = stripExtension(path.basename(file));
        const year = baseFilename.split('-')[0];

        content += `        {
            "id": "${baseFilename}",
            "color": "${color}",
            "year": ${year},
            "fileName": "${gpxFolderName}/${file}"\n`;

        if (Object.is(arr.length - 1, key)) {
            content += '        }\n';
        } else {
            content += '        },\n';
        }

        if (!Object.prototype.hasOwnProperty.call(display, year)) {
            display[year] = [file];
        } else {
            display[year].push(file)
        }
    });
    content += '    ]\n}';

    for (const [year, files] of Object.entries(display)) {
        console.log(`${year}:`);
        files.forEach((file) => {
            console.log(`   - ${file}`);
        })
    }
    console.log()
    fs.writeFileSync(path.resolve(GPX_FOLDER, 'list.json'), content, 'utf8');
}

readFilesInDir();