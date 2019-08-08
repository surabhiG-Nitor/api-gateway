const readEnv = (propertyName: string, defaultValue: any = undefined) => {
  const value = process.env[propertyName] || defaultValue;
  if (value) {
    return value;
  }
  throw new Error(`${propertyName} not found`);
};

const UI_PATH = readEnv("UI_PATH", "abc");
const port = readEnv("port", 60761);

const config = {
  UI_PATH,
  creds: {
    clientID: "90dcb25a-183a-4738-a545-e57da5ff952d",
    clientSecret: "ho_8]y0xo4+gtq.rdPbCvugFRRrfp1r?",
    identityMetadata:
      "https://login.microsoftonline.com/8c3dad1d-b6bc-4f8b-939b-8263372eced6/.well-known/openid-configuration"
  },
  port
};

export default { ...config };
