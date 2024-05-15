const e = require("express");
const fs = require('fs');
const executeMethod = require('../../db/mysql.js');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function countMagicStringOccurrences(filePath, magicString, id) {
    console.log(filePath);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const escapedMagicString = escapeRegExp(magicString);
        const occurrences = (data.match(new RegExp(escapedMagicString, 'g')) || []).length;
        console.log(`Occurrences of "${magicString}" in the file:`, occurrences);

        // update
        const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
        executeMethod(`UPDATE dirwatcher SET magicWordCount = ?,updated_at = ? WHERE id=?`,
            [occurrences, updated_at, id]
        )
    });
}

module.exports = {
    countMagicStringOccurrences: countMagicStringOccurrences
}