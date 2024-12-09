const { to } = require("await-to-js");
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs')
const querystring = require('querystring');
const { createLowDb } = require('./db')
const schedule = require('node-schedule');

const getUrl = ({ access_token, secret }) => {
    const baseURL = 'https://oapi.dingtalk.com/robot/send';
    const timestamp = Math.round(Date.now()).toString();
    const stringToSign = `${timestamp}\n${secret}`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const hmacCode = hmac.digest();
    // 将签名编码为 Base64 并进行 URL 编码
    const sign = querystring.escape(Buffer.from(hmacCode).toString('base64'));
    const query = qs.stringify({
        access_token,
        timestamp,
        sign
    })
    return `${baseURL}?${query}`;
}

const createJob = (dingRobot) => {
    return schedule.scheduleJob(dingRobot.cron, async () => {
        console.log(dingRobot);
        
        // const url = getUrl({ access_token: dingRobot.access_token, secret: dingRobot.secret })
        // const params = {
        //     msgtype: dingRobot.msgtype,
        //     [dingRobot.msgtype]: dingRobot[dingRobot.msgtype],
        //     at: dingRobot.at
        // }
        // const [err, result] = await to(axios.post(url, params))
        // if (err) {
        //     console.err(err);
        // }
    });
}

const scheduleJob = async () => {
    const db = await createLowDb()
    const { robot = [] } = db.data
    const scheduleJobs = robot.map(dingRobot => {
        const job = createJob(dingRobot)
        return {
            job,
            access_token: dingRobot.access_token,
            secret: dingRobot.secret
        }
    })
    return scheduleJobs
}

module.exports = {
    createJob,
    scheduleJob
}




