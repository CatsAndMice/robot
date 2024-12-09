const { scheduleJob, createJob } = require('./scheduleJob')
const express = require('express')
const { eq, isEmpty } = require('lodash')
const { createLowDb } = require('./db')
const path = require('path')
const bodyParser = require('body-parser')
const app = express()
const { Router } = express
const port = 3000
const router = Router();
let jobs = []

const updateDb = async (type, data, index) => {
    const db = await createLowDb()
    if (eq(type, 'add')) {
        await db.update(({ robot }) => robot.push(data))
        return
    }
    if (eq(type, 'delete')) {
        await db.update(({ robot }) => {
            robot.splice(index, 1)
            return robot
        })
        return
    }

    if (eq(type, 'set')) {
        await db.update(({ robot }) => {
            console.log(robot);
            robot[index] = data
            console.log(robot);
            return robot
        })
        return
    }
}

// 添加机器人
router.post('/robot', (req, res) => {
    const { access_token = "", secret = "", msgtype = "text", cron = "", content = {} } = req.body

    if (isEmpty(access_token) || isEmpty(secret) || isEmpty(msgtype) || isEmpty(cron) || isEmpty(content)) {
        res.send({ code: 500, message: '参数错误' })
        return
    }

    const findJob = jobs.find(job => {
        return eq(job.access_token, access_token) && eq(job.secret, secret)
    })
    const params = {
        access_token,
        secret,
        msgtype,
        cron,
        content
    }
    // 更改已存在的机器消息
    if (findJob) {
        findJob.job.cancel()
        const index = jobs.indexOf(findJob)
        jobs[index] = {
            job: createJob(params),
            access_token: params.access_token,
            secret: params.secret
        }
        updateDb('set', params, index)
    } else {
        jobs.push(createJob(params))
        updateDb('add', params)
    }
    res.send({ code: 200, message: 'success' })
})


// 删除机器人
router.delete('/robot', (req, res) => {
    const { access_token = "", secret = "" } = req.body
    const findJob = jobs.find(job => {
        return eq(job.access_token, access_token) && eq(job.secret, secret)
    })
    debugger
    // 更改已存在的机器消息
    if (findJob) {
        findJob.job.cancel()
        const index = jobs.indexOf(findJob)
        jobs.splice(index, 1)
        updateDb('delete', null, index)
    }
    res.send({ code: 200, message: 'success' })
})
// 重定向到首页
app.get("/", (req, res) => {
    res.redirect('/index.html')
});
app.use(bodyParser.json())
app.use("/api", router);
app.use(express.static(path.join(__dirname, './pages')))
app.listen(port, async () => {
    jobs = await scheduleJob()
    console.log(`Example app listening on port ${port}`)
})