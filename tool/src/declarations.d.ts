declare module 'dom-to-image-more' {
    const domtoimage: {
      toPng: (node: HTMLElement, options?: object) => Promise<string>;
      toJpeg: (node: HTMLElement, options?: object) => Promise<string>;
      toBlob: (node: HTMLElement, options?: object) => Promise<Blob>;
      toSvg: (node: HTMLElement, options?: object) => Promise<string>;
    };
    export default domtoimage;
  }
  