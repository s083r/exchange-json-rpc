import { Server } from "@hapi/hapi";
import got from "got";
import { tmpdir } from "os";
import uuid from "uuid/v4";
import { startServer } from "../../src/server";
import { database } from "../../src/services/database";

export const launchServer = async (): Promise<Server> => {
    database.connect(`${tmpdir()}/db.sqlite`);

    return startServer({
        host: "0.0.0.0",
        port: 8080,
        allowRemote: false,
        whitelist: ["127.0.0.1", "::ffff:127.0.0.1"] as any,
        network: "devnet",
    });
};

export const sendRequest = async (method, params: any = {}) => {
    const id: string = uuid();
    const response = await got.post("http://localhost:8080/", {
        body: JSON.stringify({
            jsonrpc: "2.0",
            id,
            method,
            params,
        }),
    });

    response.body = JSON.parse(response.body);

    await expect(response.statusCode).toBe(200);
    await expect(response.body.jsonrpc).toBe("2.0");
    await expect(response.body.id).toBe(id);

    return response;
};
