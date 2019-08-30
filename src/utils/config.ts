const readEnv = (propertyName: string, defaultValue: any = undefined) => {
  const value = process.env[propertyName] || defaultValue;
  if (value) {
    return value;
  }
  throw new Error(`${propertyName} not found`);
};

const UIPath = readEnv("UI_PATH", "abc");
const port = readEnv("PORT", 60761);

const config = {
  APIPath: readEnv("PMO_API_PATH", "http://localhost:3000"),
  UIPath,
  creds: {
    clientID: readEnv("CLIENT_ID", "90dcb25a-183a-4738-a545-e57da5ff952d"),
    clientSecret: readEnv("CLIENT_SECRET", "ho_8]y0xo4+gtq.rdPbCvugFRRrfp1r?"),
    identityMetadata: readEnv("IDENTITY_METADATA", "https://login.microsoftonline.com/8c3dad1d-b6bc-4f8b-939b-8263372eced6/.well-known/openid-configuration")
  },
  oidcRedirectURL: readEnv("OIDC_REDIRECT_URL", "http://localhost:60761/signin-oidc1"),
  port,
  sessionSecret: readEnv("SESSION_SECRET", "keyboard cat")
};

export default { ...config };
