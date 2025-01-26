import { db, schema } from '@ecfr-opportunities/database';

export interface Title {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTitles(): Promise<Title[]> {
  const titles = await db.select().from(schema.titles);

  console.log(titles);
  return titles.map((title) => ({
    ...title,
    createdAt: new Date(title.createdAt).toISOString(),
    updatedAt: new Date(title.updatedAt).toISOString(),
  }));
}
