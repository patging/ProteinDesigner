import { ContainerClient } from "@azure/storage-blob";
import { AZURE_BLOB_CLIENT } from "./azureBlobClient.js";
import { BlockBlobClient } from "@azure/storage-blob";
import { z } from "zod";
import { Readable } from "node:stream";

import { getStreamFromNeurosnapFileUrl } from "./neurosnapAPI.js";

function getAzureBlobContainerName(): string {
  const azureBlobContainerName = process.env.AZURE_BLOB_CONTAINER_NAME ?? null;

  if (azureBlobContainerName == null) {
    throw new Error("AZURE_BLOB_CONTAINER_NAME not found in .env");
  }
  return azureBlobContainerName!; // because of line 8
}

function getContainer(): ContainerClient {
  const containerName: string = getAzureBlobContainerName();
  const container: ContainerClient =
    AZURE_BLOB_CLIENT.getContainerClient(containerName);

  return container;
}

export async function getFileSize(url: string): Promise<number | undefined> {
  const resp = await fetch(url, { method: "HEAD" });
  const headers: Headers = resp.headers;

  const fileSize: string | null = headers.get("content-length");
  const intSchema = z.coerce.number().int();

  if (fileSize == null) {
    return undefined;
  } else {
    return intSchema.parse(fileSize);
  }
}

/**
 * uploadFile
 *
 * Currently uploads a file from neurosnap to an azure blobl storage bucket
 * is opinionated for only a neurosnap file
 *
 * @returns the url to the file on azure
 */
export async function uploadFile(
  url: string,
  newFileName: string,
): Promise<string> {
  const container: ContainerClient = getContainer();
  const MAXBUFFERSIZE = 4 * 1024 * 1024;
  const MAX_CONCURRENCY = 5;
  const client: BlockBlobClient = container.getBlockBlobClient(newFileName);

  const stream: Readable = await getStreamFromNeurosnapFileUrl(url);

  await client.uploadStream(stream, MAXBUFFERSIZE, MAX_CONCURRENCY, {
    blobHTTPHeaders: { blobContentType: "application/octet-stream" },
    onProgress: (e) => console.log(`Uploaded ${e.loadedBytes} bytes`),
  });
  return client.url;
}
