const { ROOM_ID } = process.env;

const formatTag = (tag) => `[${tag}]`;

const logger = {
  _defaultTag: formatTag(ROOM_ID),
  _tag: null,

  tag(tag) {
    this._tag = formatTag(tag);
    return this;
  },

  info(...message) {
    const argList = [this._defaultTag];
    if (this._tag) argList.push(this._tag);
    argList.push(...message);
    console.log(...argList);
    this._tag = null;
  },

  error(...message) {
    const argList = [this._defaultTag];
    if (this._tag) argList.push(this._tag);
    argList.push(...message);
    console.error(...argList);
    this._tag = null;
  },

  debug(...message) {
    const argList = [this._defaultTag];
    if (this._tag) argList.push(this._tag);
    argList.push(...message);
    console.log(...argList);
    this._tag = null;
  },
};

export default logger;
