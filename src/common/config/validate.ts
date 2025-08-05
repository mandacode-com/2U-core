import { Config, configSchema } from '../schemas/config.schema';

const parseIntIfExists = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  }
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? undefined : parsedValue;
};

const parseBooleanIfExists = (value: string | undefined) => {
  if (value === undefined) {
    return undefined;
  }
  return value.toLowerCase() === 'true';
};

export function validate(raw: Record<string, unknown>) {
  const env: Config = {
    server: {
      nodeEnv: raw.NODE_ENV as string,
      port: parseIntIfExists(raw.PORT as string) as number,
    },
    auth: {
      gatewayJwtSecret: raw.AUTH_GATEWAY_JWT_SECRET as string,
      gatewayJwtHeader: raw.AUTH_GATEWAY_JWT_HEADER as string,
    },
    cors: {
      origin: raw.CORS_ORIGIN as string,
      methods: raw.CORS_METHODS as string,
      credentials: parseBooleanIfExists(
        raw.CORS_CREDENTIALS as string,
      ) as boolean,
    },
    storage: {
      path: raw.STORAGE_PATH as string,
      maxFileSize: parseIntIfExists(
        raw.STORAGE_MAX_FILE_SIZE as string,
      ) as number,
      allowedFileTypes:
        (raw.STORAGE_ALLOWED_FILE_TYPES as string)
          ?.split(',')
          .map((type) => type.trim()) || [],
    },
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
