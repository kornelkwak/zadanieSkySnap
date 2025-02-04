declare module 'lerc' {
    const LercDecode: any;
    export default LercDecode;

    export function decode(arrayBuffer: ArrayBuffer): unknown {
        throw new Error("Function not implemented.");
    }
  }