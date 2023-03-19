const { EmbedBuilder, Colors } = require('discord.js');

class ChatGPTClient {
  contextData = new Map();
  whitelistChannels = [];
  apiClient = null;
  options = {};

  constructor(openAIAPIKey, options) {
    if (!openAIAPIKey) throw new TypeError("An OpenAI API key must be provided. Create an OpenAI account and get an API key for free at https://platform.openai.com/account/api-keys");

    const optionDefaults = {
      contextRemembering: true,
      whitelistChannels: [],
      responseType: 'embed'
    };

    this.options = Object.assign(optionDefaults, options);
    import('chatgpt').then(function(lib) {
      const { ChatGPTAPI } = lib;

      
      this.apiClient = new ChatGPTAPI({
        apiKey: openAIAPIKey
      });
      
    }.bind(this));
  }

  async send(message, id) {
    console.log(this.apiClient)
    console.log('send()')
    try {
      if (this.apiClient === null) throw new TypeError("ChatGPT client failed to initialize");
      console.log('send() 1')
      const response = await this.apiClient.sendMessage(message, id ? { parentMessageId:id } : undefined);
      console.log('send() 1 complete')
      return response;
    } catch (err) {
      throw err;
    }
  }

  async chat(interaction, message) {
    console.log('chat()')
    if (!interaction.deferred) await interaction.deferReply();
    
    const context = this.contextData.get(interaction.user.id);
    console.log('chat() 1')
    const reply = await this.send(message, this.options.contextRemembering && context ? context : undefined);
    console.log('chat() 1 complete')

    if (this.options.responseType === 'string') {
      await interaction.editReply(reply.text);
    } else {
      const embed = new EmbedBuilder()
        .setColor(Colors.DarkerGrey)
        .setDescription(reply.text)
        .setAuthor({
          iconURL: 'https://seeklogo.com/images/O/open-ai-logo-8B9BFEDC26-seeklogo.com.png',
          url: 'https://openai.com/blog/chatgpt',
          name: 'Generated by Chat-GPT'
        })
        
      await interaction.editReply({
        embeds: [embed]
      });
    }

    if (this.options.contextRemembering) {
      this.contextData.set(interaction.user.id, reply.id);
    }
  }
}

module.exports = {
  ChatGPTClient
}