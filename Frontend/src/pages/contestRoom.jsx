import { useParams, useEffect, useState } from "react";

export default function ContestRoom() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE}/api/contests/${id}`)
      .then((r) => r.json())
      .then(setContest)
      .catch(console.error);
  }, [id]);

  if (!contest) return <p className="p-8">Loading contest...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Contest for {contest.userHandle}</h2>
      <ul className="space-y-4">
        {contest.problems.map((p, idx) => (
          <li key={idx} className="bg-white rounded shadow p-4">
            <a href={p.url} target="_blank" className="text-blue-600 font-medium">
              [{p.contestId}{p.index}] {p.name}
            </a>
            <p className="text-sm text-gray-600">Rating: {p.rating} | Tags: {p.tags?.join(", ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
