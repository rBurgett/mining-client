const colors = require('colors/safe');
const { exec } = require('child_process');
const fs = require('fs-extra');
const terminate = require('terminate');

const client = fs.readJsonSync('user.json');
const manager = fs.readJsonSync('manager.json');

const miners = [
    // {
    //     name: 'Electroneum',
    //     start: ({ mphUser, worker }) => `start NsCpuCNMiner64.exe -o ssl://us-east.cryptonight-hub.miningpoolhub.com:20596 -u ${mphUser}.${worker} -p x`,
    //     cwd: './miners/Electroneum/'
    // }
];

const mgmtMinutes = 2 * client.mgmtPercentage;
const clientMinutes = 200 - (2 * mgmtMinutes);

const miner = miners[0];

const mineForMgmt = () => new Promise(() => {

    const proc = exec(miner.start(manager), {
        cwd: miner.cwd
    });

    proc.on('error', err => {
        console.error(err);
    });

    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', data => {
        console.log(colors.red(data));
    });

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', data => {
        console.log(data);
    });

    setTimeout(() => {
        terminate(proc.pid, () => {
            mineForClient();
        });
    }, mgmtMinutes * 60000);
});

const mineForClient = () => new Promise(() => {

    const proc = exec(miner.start(client), {
        cwd: miner.cwd
    });

    proc.on('error', err => {
        console.error(err);
    });

    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', data => {
        console.log(colors.red(data));
    });

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', data => {
        console.log(data);
    });

    setTimeout(() => {
        terminate(proc.pid, () => {
            mineForMgmt();
        });
    }, clientMinutes * 60000);
});

mineForMgmt();
