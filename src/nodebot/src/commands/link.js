const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Links your bedrock account with discord (Unused for now)"),
    async execute(interaction) {
        await interaction.reply("This command is unused, it will be in a future version...")
    },
};