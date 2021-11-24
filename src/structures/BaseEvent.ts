import { BotClient } from "./BotClient";
import { IEvent } from "../typings";

export class BaseEvent implements IEvent {
    public constructor(public client: BotClient, public readonly name: IEvent["name"]) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public execute(...args: any): any {}
}
