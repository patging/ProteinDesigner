import { BlobServiceClient } from "@azure/storage-blob";

const connectionString: string | null =
  process.env.AZURE_BLOB_CONNECTION_STRING ?? null;

if (connectionString == null) {
  throw new Error("AZURE_BLOB_CONNECTION_STRING not found in .env file");
}

export const AZURE_BLOB_CLIENT: BlobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
