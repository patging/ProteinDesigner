import { ContainerClient } from "@azure/storage-blob";
import { AZURE_BLOB_CLIENT } from "./azureBlobClient.js";
import { BlockBlobClient } from "@azure/storage-blob";
import { z } from "zod";
import  { Readable } from 'node:stream';
import * as web from "node:stream/web";


function getAzureBlobContainerName() : string {

    const azureBlobContainerName = process.env.AZURE_BLOB_CONTAINER_NAME ?? null;

    if (getAzureBlobContainerName == null) {
        throw new Error("AZURE_BLOB_CONTAINER_NAME not found in .env")
    }

    return azureBlobContainerName!; // because of line 8
}

function getContainer() : ContainerClient {
    const containerName : string = getAzureBlobContainerName();
    const container : ContainerClient = AZURE_BLOB_CLIENT.getContainerClient(containerName);

    return container
}

async function getStreamFromUrl(client: BlockBlobClient, url : string, lowerBuffer : number, upperBuffer : number) : Promise<web.ReadableStream|null> {
    const headers = {
            'Range' : `bytes=${lowerBuffer}-${upperBuffer}`
        }

    const resp = await fetch(url, {headers : headers});
    return resp.body as web.ReadableStream;
}

export async function getFileSize(url : string) : Promise<number|undefined>{
    const resp = await fetch(url, {method: "HEAD"});
    const headers : Headers = resp.headers;

    const fileSize : string | null = headers.get('content-length');
    const intSchema = z.coerce.number().int();

    if (fileSize == null) {
        return undefined;
    } else {
        return intSchema.parse(fileSize);
    }
}


export async function uploadFile(url : string, newFileName : string) : Promise<string> {
    const container : ContainerClient = getContainer();
    const MAXBUFFERSIZE = 4 * 1024 * 1024;

    const client : BlockBlobClient = container.getBlockBlobClient(newFileName)
    const fileSize = await getFileSize(url);

    if (fileSize === undefined) {
        throw new Error(`FileSize not found in ${url}. Check url to make sure it's correct.`)
    }

    for (let i = 0; i < fileSize; i += MAXBUFFERSIZE) {
        const stream : web.ReadableStream | null = await getStreamFromUrl(client, url, i, i + MAXBUFFERSIZE);

        if (stream == null) {
            throw new Error(`Something went wrong with obtaining stream from the file body. url=${url} lower=${i} upper=${i + MAXBUFFERSIZE}`)
        }
        const streamAsReadable = Readable.fromWeb(stream!);

        try {
            await client.uploadStream(streamAsReadable,MAXBUFFERSIZE ); // finish the stream
        } catch (error) {
            throw error
        }
    }
    return client.url;
}