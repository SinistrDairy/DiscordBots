import {
  CommandInitPlugin,
  CommandType,
  controller
} from "@sern/handler";
import {
  ApplicationCommandType,
  ApplicationCommandOptionType
} from "discord.js";
const CommandTypeRaw = {
  [CommandType.Both]: ApplicationCommandType.ChatInput,
  [CommandType.CtxUser]: ApplicationCommandType.User,
  [CommandType.CtxMsg]: ApplicationCommandType.Message,
  [CommandType.Slash]: ApplicationCommandType.ChatInput
};
function publish(options) {
  return CommandInitPlugin(async ({ module }) => {
    let client;
    try {
      client = (await import("@sern/handler")).Service("@sern/client");
    } catch {
      const { useContainer } = await import("../index.js");
      client = useContainer("@sern/client")[0];
    }
    const defaultOptions = {
      guildIds: [],
      dmPermission: void 0,
      defaultMemberPermissions: null
    };
    options = { ...defaultOptions, ...options };
    let { defaultMemberPermissions, dmPermission, guildIds } = options;
    function c(e) {
      console.error("publish command didnt work for", module.name);
      console.error(e);
    }
    const log = (...message) => () => console.log(...message);
    const logged = (...message) => log(message);
    const appCmd = (t) => {
      return (is, els) => (t & CommandType.Both) !== 0 ? is : els;
    };
    const curAppType = CommandTypeRaw[module.type];
    const createCommandData = () => {
      const cmd = appCmd(module.type);
      return {
        name: module.name,
        type: curAppType,
        description: cmd(module.description, ""),
        options: cmd(
          optionsTransformer(module.options ?? []),
          []
        ),
        defaultMemberPermissions,
        dmPermission
      };
    };
    try {
      const commandData = createCommandData();
      if (!guildIds.length) {
        const cmd = (await client.application.commands.fetch()).find(
          (c2) => c2.name === module.name && c2.type === curAppType
        );
        if (cmd) {
          if (!cmd.equals(commandData, true)) {
            logged(
              `Found differences in global command ${module.name}`
            );
            cmd.edit(commandData).then(
              log(
                `${module.name} updated with new data successfully!`
              )
            );
          }
          return controller.next();
        }
        client.application.commands.create(commandData).then(log("Command created", module.name)).catch(c);
        return controller.next();
      }
      for (const id of guildIds) {
        const guild = await client.guilds.fetch(id).catch(c);
        if (!guild)
          continue;
        const guildCmd = (await guild.commands.fetch()).find(
          (c2) => c2.name === module.name && c2.type === curAppType
        );
        if (guildCmd) {
          if (!guildCmd.equals(commandData, true)) {
            logged(`Found differences in command ${module.name}`);
            guildCmd.edit(commandData).then(
              log(
                `${module.name} updated with new data successfully!`
              )
            ).catch(c);
            continue;
          }
          continue;
        }
        guild.commands.create(commandData).then(log("Guild Command created", module.name, guild.name)).catch(c);
      }
      return controller.next();
    } catch (e) {
      logged("Command did not register" + module.name);
      logged(e);
      return controller.stop();
    }
  });
}
function optionsTransformer(ops) {
  return ops.map((el) => {
    switch (el.type) {
      case ApplicationCommandOptionType.String:
      case ApplicationCommandOptionType.Number:
      case ApplicationCommandOptionType.Integer: {
        return el.autocomplete && "command" in el ? (({ command, ...el2 }) => el2)(el) : el;
      }
      default:
        return el;
    }
  });
}
export {
  CommandTypeRaw,
  optionsTransformer,
  publish
};
