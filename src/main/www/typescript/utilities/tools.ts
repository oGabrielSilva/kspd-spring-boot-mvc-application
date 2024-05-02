import { AnimationTool } from '../tools/AnimationTool';
import { ImageProcessingTool } from '../tools/ImageProcessingTool';
import { ScreenProgressTool } from '../tools/ScreenProgressTool';
import { ToasterTool } from '../tools/ToasterTool';

export function tools() {
  return {
    toaster: ToasterTool.get(),
    anim: AnimationTool.get(),
    image: ImageProcessingTool.get(),
    screenProgress: ScreenProgressTool.get(),
  };
}
