const fs = require('fs').promises;
const path = require('path');

class LocalKV {
  constructor() {
    this.filePath = path.join(__dirname, '../data.json');
  }

  async get() {
    try {
      return JSON.parse(await fs.readFile(this.filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  async set(_, value) {
    await fs.writeFile(this.filePath, JSON.stringify(value, null, 2));
    return 'OK';
  }
}

module.exports = LocalKV;