const executeMethod = require("../../db/mysql");
const { success, error } = require('../../helper/response.js');
const fs = require('fs');
const path = require('path');

const createFile = async (req, res) => {
    try {
        const data = req.body;
        const requiredFeild = ["text", "fileName", "directory"];
        const missingAttributes = [];
        requiredFeild.forEach(attr => {
            if (!data[attr]) {
                missingAttributes.push(attr);
            }
        });
        if (missingAttributes.length > 0) {
            const result = error(`${missingAttributes.join(", ")} details required!`, 400);
            return res.status(400).json(result);
        }

        const { directory, fileName, text } = data;
        const filePath = path.join(directory, fileName);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log('Directory created:', directory);
        }

        fs.writeFile(filePath, text, err => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).json({ error: 'Failed to write file.' });
            }else{
                const result = success('File created successfully.', "",200);
                res.status(200).json(result);
            }
        })
    } catch (err) {
        console.error('Error in createFile:', err);
        const result = error('Internal Server Error', 500);
        res.status(500).json(result);
    }
};

module.exports = {
    createFile: createFile,
};
