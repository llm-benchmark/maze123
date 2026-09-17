const fs = require("fs");
const path = require("path");

const SAVES_DIR = path.resolve(__dirname, "saves");
// 存档 ID 白名单：只允许字母、数字、下划线、连字符，1-64 位。
// 这条校验同时挡住路径穿越（例如 "..%2F..%2Fetc" 解码后含路径分隔符）。
const SAVE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function ensureSavesDir() {
  if (!fs.existsSync(SAVES_DIR)) {
    fs.mkdirSync(SAVES_DIR, { recursive: true });
  }
}

function isValidSaveId(id) {
  return typeof id === "string" && SAVE_ID_PATTERN.test(id);
}

function savePathForId(id) {
  if (!isValidSaveId(id)) {
    return null;
  }

  const filePath = path.resolve(SAVES_DIR, `${id}.json`);

  // 冗余防护：即使白名单以后被放宽，也不允许逃出 saves 目录。
  if (!filePath.startsWith(SAVES_DIR + path.sep)) {
    return null;
  }

  return filePath;
}

function loadSave(id) {
  const filePath = savePathForId(id);
  if (!filePath) return null;
  ensureSavesDir();
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeSave(id, save) {
  const filePath = savePathForId(id);
  if (!filePath) {
    throw new Error("Invalid save id.");
  }
  ensureSavesDir();
  fs.writeFileSync(filePath, JSON.stringify(save, null, 2) + "\n", "utf8");
}

function listSaveIds() {
  ensureSavesDir();
  try {
    return fs.readdirSync(SAVES_DIR)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -5))
      .filter(isValidSaveId);
  } catch {
    return [];
  }
}

module.exports = { loadSave, writeSave, listSaveIds, isValidSaveId };
