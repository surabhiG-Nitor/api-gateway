const readEnv = (propertyName: string, defaultValue: any= undefined) => {
    const value = process.env[propertyName] || defaultValue;
    if (value) {
    return value;
  }
    throw new Error(`${propertyName} not found`);
};

const UI_PATH = readEnv("UI_PATH");
const port = readEnv("port");

const config = {
    UI_PATH,
    port
};

export default {...config};
