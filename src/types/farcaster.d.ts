declare module '@farcaster/core' {
  export interface FrameMetadataOptions {
    buttons: Array<{
      label: string;
      action: 'post' | 'link';
    }>;
    image: {
      src: string;
      aspectRatio: string;
    };
    postUrl: string;
    name?: string;
    description?: string;
  }

  export interface Message {
    buttonIndex: number;
    [key: string]: any;
  }

  export function getFrameMetadata(options: FrameMetadataOptions): string;
  export function getFrameMessage(message: any): Promise<Message | null>;
  export const Message: {
    fromJson(json: any): Message;
  };
} 