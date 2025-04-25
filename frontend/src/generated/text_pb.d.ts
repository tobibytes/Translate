import * as jspb from 'google-protobuf'



export class AudioBytes extends jspb.Message {
  getAudiobytes(): Uint8Array | string;
  getAudiobytes_asU8(): Uint8Array;
  getAudiobytes_asB64(): string;
  setAudiobytes(value: Uint8Array | string): AudioBytes;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AudioBytes.AsObject;
  static toObject(includeInstance: boolean, msg: AudioBytes): AudioBytes.AsObject;
  static serializeBinaryToWriter(message: AudioBytes, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AudioBytes;
  static deserializeBinaryFromReader(message: AudioBytes, reader: jspb.BinaryReader): AudioBytes;
}

export namespace AudioBytes {
  export type AsObject = {
    audiobytes: Uint8Array | string,
  }
}

export class TextResponse extends jspb.Message {
  getText(): string;
  setText(value: string): TextResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TextResponse.AsObject;
  static toObject(includeInstance: boolean, msg: TextResponse): TextResponse.AsObject;
  static serializeBinaryToWriter(message: TextResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TextResponse;
  static deserializeBinaryFromReader(message: TextResponse, reader: jspb.BinaryReader): TextResponse;
}

export namespace TextResponse {
  export type AsObject = {
    text: string,
  }
}

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

