const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("c")
    .setDescription("Sends a command to the server (Unused for now)"),
    async execute(interaction) {
        await interaction.reply("This command is unused, it will be in a future version...")
    },
};