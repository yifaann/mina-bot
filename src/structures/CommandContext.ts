/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { InteractionTypes, MessageComponentTypes } from "../typings/enum";
import { MessageInteractionAction } from "../typings";
import { ButtonInteraction, Collection, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, GuildMember, Interaction, InteractionReplyOptions, InteractionType, Message, MessageMentions, MessageOptions, MessagePayload, SelectMenuInteraction, TextBasedChannels, User } from "discord.js";

export class CommandContext {
    public additionalArgs: Collection<string, any> = new Collection();
    public channel: TextBasedChannels|null = this.context.channel;
    public guild = this.context.guild;
    public client = this.context.guild!.client;
    public constructor(public readonly context: Interaction|CommandInteraction|SelectMenuInteraction|ContextMenuInteraction|Message, public args: string[] = []) {}

    public setAdditionalArgs(key: string, value: any): CommandContext {
        this.additionalArgs.set(key, value);
        return this;
    }

    public async send(options: string|MessagePayload|MessageOptions|InteractionReplyOptions, type: MessageInteractionAction = "editReply"): Promise<Message> {
        if (this.isInteraction()) {
            (options as InteractionReplyOptions).fetchReply = true;
            const msg = await (this.context as CommandInteraction)[type](options) as Message;
            const channel = this.context.channel;
            const res = await channel!.messages.fetch(msg.id).catch(() => null);
            return res ?? msg;
        }
        return this.context.channel!.send(options);
    }

    public async deferReply(ephemeral = false): Promise<void> {
        if (this.isInteraction()) {
            return (this.context as CommandInteraction).deferReply({ ephemeral });
        }
        return Promise.resolve(undefined);
    }

    public get deferred(): boolean {
        return this.context instanceof Interaction ? (this.context as CommandInteraction).deferred : false;
    }

    public get options(): CommandInteractionOptionResolver<"cached">|null {
        // @ts-expect-error-next-line
        return this.isCommand() ? (this.context as CommandInteraction).options : null;
    }

    public get author(): User {
        return this.context instanceof Interaction ? this.context.user : this.context.author;
    }

    public get member(): GuildMember|null {
        return this.guild!.members.resolve(this.author.id);
    }

    public get mentions(): MessageMentions|null {
        return this.context instanceof Interaction ? null : this.context.mentions;
    }

    public isInteraction(): boolean {
        return this.isCommand() || this.isContextMenu() || this.isMessageComponent() || this.isButton() || this.isSelectMenu();
    }

    public isCommand(): boolean {
        return InteractionTypes[this.context.type as InteractionType] === InteractionTypes.APPLICATION_COMMAND && typeof (this.context as any).targetId === "undefined";
    }

    public isContextMenu(): boolean {
        return InteractionTypes[this.context.type as InteractionType] === InteractionTypes.APPLICATION_COMMAND && typeof (this.context as any).targetId !== "undefined";
    }

    public isMessageComponent(): boolean {
        return InteractionTypes[this.context.type as InteractionType] === InteractionTypes.MESSAGE_COMPONENT;
    }

    public isButton(): boolean {
        return (
            InteractionTypes[this.context.type as InteractionType] === InteractionTypes.MESSAGE_COMPONENT &&
            MessageComponentTypes[(this.context as ButtonInteraction).componentType] === MessageComponentTypes.BUTTON
        );
    }

    public isSelectMenu(): boolean {
        return (
            InteractionTypes[this.context.type as InteractionType] === InteractionTypes.MESSAGE_COMPONENT &&
            MessageComponentTypes[(this.context as SelectMenuInteraction).componentType] === MessageComponentTypes.SELECT_MENU
        );
    }
}
