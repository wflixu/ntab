/// <reference types="vite/client" />

declare module "chrome" {
    export namespace runtime {
        export type getURL = (a: string) => string;
    }
}
