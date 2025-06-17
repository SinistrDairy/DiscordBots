const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandPath = path.join(__dirname, "../../commands");
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
      const filePath = path.join(commandPath, file);
      const command = require(filePath);

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        client.commandArray.push(command.data.toJSON());
        console.log(
          `Command: ${command.data.name} has been passed through the handler.`
        );
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }
    const guildID = "830604135748337673";
    const clientID = "1058382075620769823";
    const rest = new REST({ version: "9" }).setToken(process.env.token);
    try {
      console.log("Started refreshing application (/) commands.");

      await rest.put(Routes.applicationGuildCommands(clientID, guildID), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
