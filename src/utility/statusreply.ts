export const successMessage = (message: string, title?: string) => ({
  embeds: [{
      title,
      description: message,
      color: 0x00ff2a
  }]
});
export const failureMessage = (message: string, title?: string) => ({
  embeds: [{
      title,
      description: message,
      color: 0xff002a
  }]
});
export const warningMessage = (message: string, title?: string) => ({
  embeds: [{
      title,
      description: message,
      color: 0xffaa00
  }]
});