const executeMethod = require("../../db/mysql");
const { success, error } = require('../../helper/response.js');
const fs = require('fs');
const chokidar = require('chokidar');
const path = require('path');
const helper = require('./confHelper.js');
const mointorConfig = require('../../config/mointorConfig.json');

const saveConfig = async (req, res) => {
    try {
        let data = req.body;
        const requiredFeild = ["monitor_interval", "magic_string", "monitor_directory"];
        const missingAttributes = [];
        requiredFeild.forEach(attr => {
            if (!data[attr]) {
                missingAttributes.push(attr);
            }
        });
        if (missingAttributes.length > 0) {
            const result = error(`${missingAttributes.join(", ")} details required!`, 400);
            return res.status(400).send(result);
        }
        let { monitor_interval, magic_string, monitor_directory } = data;
        if (!fs.existsSync(monitor_directory)) {
            fs.mkdirSync(monitor_directory, { recursive: true });
            console.log('Directory created:', monitor_directory);
        }
        fs.writeFileSync('src\\config\\mointorConfig.json', JSON.stringify(data));
        const checkDir = await executeMethod(`SELECT * FROM config WHERE monitor_directory = ? and status = 'active'`, [monitor_directory]);
        if (checkDir.length === 0) {
            const insertConfig = await executeMethod(`
                INSERT INTO config(monitor_interval, magic_string, monitor_directory) 
                VALUES (?, ?, ?)`, [monitor_interval, magic_string, monitor_directory]);

            const configParams = {
                id: insertConfig.insertId,
                directory: monitor_directory,
                interval_time: monitor_interval
            };
            let result = success('Config created successfully!', configParams, 200);
            return res.status(200).send(result);
        } else {
            const updateConfig = await executeMethod(`UPDATE config SET monitor_interval=?, magic_string=?, monitor_directory=? WHERE monitor_directory = ? and status = 'active'`, [monitor_interval, magic_string, monitor_directory, monitor_directory])
            let result = error(`Directory was updated successfully`, 409);
            return res.status(409).send(result);
        }

    } catch (err) {
        console.error('Error in executeMethod:', err);
        let result = error('Internal Server Error', 500);
        return res.status(500).send(result);
    }
};

const monitor = async (req, res) => {
    try {
        const data = req.query;
        const requiredFeild = ["directory"];
        const missingAttributes = [];
        requiredFeild.forEach(attr => {
            if (!data[attr]) {
                missingAttributes.push(attr);
            }
        });
        if (missingAttributes.length > 0) {
            const result = error(`${missingAttributes.join(", ")} details required!`, 400);
            return res.status(400).send(result);
        }
        const directory = data.directory;
        const checkConfig = await executeMethod(`SELECT * FROM config WHERE monitor_directory = ? and status = 'active'`, [directory])
        if (checkConfig.length > 0) {
            const monitor = await executeMethod(`SELECT * FROM dirwatcher WHERE directory = ? `, [directory]);
            if (monitor.length > 0) {
                await Promise.all(monitor.map(async item => {
                    if (item.status === 'active') {
                        await helper.countMagicStringOccurrences(item.fileDirectory, checkConfig[0].magic_string, item.id);
                    }
                }));
                const getMonitor = await executeMethod(`SELECT * FROM dirwatcher WHERE directory = ? `, [directory]);
                let result = success('Ok', getMonitor, 200);
                return res.status(200).send(result);
            } else {
                const result = error(`Directory not found!`, 400);
                return res.status(400).send(result);
            }
        } else {
            const result = error(`Directory not found!`, 400);
            return res.status(400).send(result);
        }

    } catch (err) {
        console.error('Error in executeMethod:', err);
        let result = error('Internal Server Error', 500);
        return res.status(500).send(result);
    }
}

let watcher;

function monitorDirectory(directoryPath) {
    if (!watcher) {
        watcher = chokidar.watch(directoryPath, {
            ignored: /(^|[\/\\])\../, // ignore dotfiles
            persistent: true
        });

        watcher.on('add', async (path) => {
            const checkConfigDir = await executeMethod(`SELECT * FROM config where monitor_directory = ?`, [directoryPath]);
            if (checkConfigDir.length > 0) {
                const checkDir = await executeMethod(`SELECT * FROM dirwatcher where fileDirectory = ?`, [path]);
                if (checkDir.length === 0) {
                    console.log(`File ${path} has been added`);

                    let insert = await executeMethod(`INSERT INTO dirwatcher (directory, fileDirectory)
                VALUES (?, ?)`, [directoryPath, path])
                    await helper.countMagicStringOccurrences(directoryPath, checkConfigDir[0].magic_string, insert.id);

                } else {
                    console.log(`${path} directory alreay exist in db!`);
                }
            } else {
                console.log(`${directoryPath} directory not exist in db!`);

            }
        });

        watcher.on('change', async (path) => {
            console.log("I am working here");
            const checkConfigDir = await executeMethod(`SELECT * FROM config where monitor_directory = ?`, [directoryPath]);
            if (checkConfigDir.length > 0) {
                const checkDir = await executeMethod(`SELECT * FROM dirwatcher where fileDirectory = ?`, [path]);
                if (checkDir.length > 0) {
                    console.log(`${path} changes`);
                    await helper.countMagicStringOccurrences(path, checkConfigDir[0].magic_string, checkDir[0].id);

                } else {
                    console.log(`${path} directory not exist in db!`);
                }
            } else {
                console.log(`${directoryPath} directory not exist in db!`);

            }
        })

        watcher.on('unlink', async (path) => {
            const updated_at = new Date(new Date().getTime() + (330 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
            const checkDir = await executeMethod(`SELECT * FROM dirwatcher where fileDirectory = ?`, [path]);
            if (checkDir.length > 0) {
                console.log(`${path} has been deleted`);
                executeMethod(`UPDATE dirwatcher SET deleted_at = ?,status = ? WHERE fileDirectory = ?`, [updated_at, 'inactive', path])
            } else {
                console.log(`${path} doesn't exist in db`);
            }
        });
    }
}

function startMonitoring(directoryPath, interval) {
    console.log(`Monitoring directory ${directoryPath} at ${interval / 1000} seconds interval...`);
    monitorDirectory(directoryPath);
    setInterval(() => {
        // No need to call monitorDirectory here
    }, interval);
}

// Example usage
const directoryPath = mointorConfig.monitor_directory;
const interval = parseInt(mointorConfig.monitor_interval) * 1000;
startMonitoring(directoryPath, interval);

module.exports = {
    saveConfig: saveConfig,
    monitor: monitor
}