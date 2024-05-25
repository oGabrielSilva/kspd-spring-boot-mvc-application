import { metadataDescription } from '../modules/article/metadata/metadataDescription';
import { metadataEditor } from '../modules/article/metadata/metadataEditor';
import { metadataKeyword } from '../modules/article/metadata/metadataKeyword';
import { metadataStacks } from '../modules/article/metadata/metadataStacks';

export function runEditArticleMetadataPageManager(slug: string) {
  metadataKeyword(slug, document.getElementById('keyword-form') as HTMLFormElement);
  metadataDescription(slug, document.getElementById('description-form') as HTMLFormElement);
  metadataStacks(slug);
  metadataEditor(slug);
}
