import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getTitles, type Title } from '../models/title.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const titles = await getTitles();
  return json({ titles });
}

export default function Index() {
  const { titles } = useLoaderData<typeof loader>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">eCFR Titles</h1>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {titles.map((title: Title) => (
            <tr key={title.id}>
              <td className="border px-4 py-2">{title.id}</td>
              <td className="border px-4 py-2">{title.name}</td>
              <td className="border px-4 py-2">
                {new Date(title.createdAt).toLocaleString()}
              </td>
              <td className="border px-4 py-2">
                {new Date(title.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
