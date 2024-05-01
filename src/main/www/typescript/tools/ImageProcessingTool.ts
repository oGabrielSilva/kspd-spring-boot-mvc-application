export class ImageProcessingTool {
  private static tool: ImageProcessingTool;

  private constructor() {}

  public fileToBlobWebp(file: File, width = 192, height = 192) {
    return new Promise<Blob | null>((resolve) => {
      try {
        if (!file) return resolve(null);
        const url = URL.createObjectURL(file as Blob);
        const img = new Image();
        img.onload = async () => {
          const w = img.width;
          const h = img.height;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const nImage =
            ((width !== w || height !== h) &&
              (w < h
                ? await this.resizeHeight(img, w, h)
                : w > h
                ? await this.resizeWidth(img, w, h)
                : img)) ||
            img;
          ctx.canvas.width = width;
          ctx.canvas.height = height;
          ctx.drawImage(nImage, 0, 0, width, height);
          ctx.canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(url);
              resolve(b);
            },
            'image/webp',
            0.9
          );
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
      } catch (error) {
        resolve(null);
      }
    });
  }

  public fileToBlobWebpWithoutResize(file: File, quality = 0.9) {
    return new Promise<Blob | null>((resolve) => {
      try {
        if (!file) return resolve(null);
        const url = URL.createObjectURL(file as Blob);
        const img = new Image();
        img.onload = async () => {
          if (quality > 1) quality = 1;
          if (quality < 0.7) quality = 0.75;
          const w = img.width;
          const h = img.height;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          ctx.canvas.width = w;
          ctx.canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          ctx.canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(url);
              resolve(b);
            },
            'image/webp',
            quality
          );
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
      } catch (error) {
        resolve(null);
      }
    });
  }

  public imageToBlobJpeg(file: File, width = 128, height = 128, resize = true) {
    return new Promise<Blob | null>((resolve) => {
      try {
        if (!file) return resolve(null);
        const url = URL.createObjectURL(file as Blob);
        const img = new Image();
        img.onload = async () => {
          const w = img.width;
          const h = img.height;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const nImage =
            (resize &&
              (w < h
                ? await this.resizeHeight(img, w, h)
                : w > h
                ? await this.resizeWidth(img, w, h)
                : img)) ||
            img;
          ctx.canvas.width = width;
          ctx.canvas.height = height;
          ctx.drawImage(nImage, 0, 0, width, height);
          ctx.canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(url);
              resolve(b);
            },
            'image/jpeg',
            0.9
          );
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
      } catch (error) {
        resolve(null);
      }
    });
  }

  public imageToBlobJpegWhithoutResize(file: File, quality = 0.85) {
    if (quality > 1 || quality < 0) quality = 1;
    return new Promise<Blob | null>((resolve) => {
      try {
        if (!file) return resolve(null);
        const url = URL.createObjectURL(file as Blob);
        const img = new Image();
        img.onload = async () => {
          const w = img.width * 0.8;
          const h = img.height * 0.8;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          ctx.canvas.width = w;
          ctx.canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          ctx.canvas.toBlob(
            (b) => {
              URL.revokeObjectURL(url);
              resolve(b);
            },
            'image/jpeg',
            quality
          );
        };
        img.crossOrigin = 'Anonymous';
        img.src = url;
      } catch (error) {
        resolve(null);
      }
    });
  }

  private resizeHeight(img: HTMLImageElement, width: number, height: number) {
    return new Promise<HTMLImageElement>((resolve) => {
      const cv = document.createElement('canvas');
      const context = cv.getContext('2d')!;
      context.canvas.width = width;
      context.canvas.height = width;
      context.drawImage(img, 0, height * 0.2, width, width, 0, 0, width, width);
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = context.canvas.toDataURL();
    });
  }

  private resizeWidth(img: HTMLImageElement, width: number, height: number) {
    return new Promise<HTMLImageElement>((resolve) => {
      const cv = document.createElement('canvas');
      const context = cv.getContext('2d')!;
      context.canvas.width = height;
      context.canvas.height = height;
      context.drawImage(img, width * 0.2, 0, height, height, 0, 0, height, height);
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = context.canvas.toDataURL();
    });
  }

  public static get() {
    if (!ImageProcessingTool.tool) {
      ImageProcessingTool.tool = new ImageProcessingTool();
    }
    return ImageProcessingTool.tool;
  }
}
