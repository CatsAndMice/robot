
const path = require('path');
const url = path.join(__dirname, './database/db.json')
module.exports = {
    createLowDb: async () => {
        const { JSONFilePreset } = await import('lowdb/node')
        const defaultData = { robot: [] }
        const db = await JSONFilePreset(url, defaultData)
        return db
    }
}