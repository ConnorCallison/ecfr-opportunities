import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { getChapterContent } from '../models/analysis.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const chapterId = params.chapterId;
  if (!chapterId) {
    throw new Response('Chapter ID is required', { status: 400 });
  }

  const content = await getChapterContent(chapterId);

  // Remove YAML frontmatter if present
  const cleanedContent = content.replace(/^---\n(?:.*\n)*?---\n/, '');

  return json({ content: cleanedContent });
}
