import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold mb-4">Welcome to Competitive Helper</h1>
      <p className="text-lg text-gray-700 mb-8">
        Create custom Codeforces mashup contests and improve your problem-solving journey.
      </p>
      <Link
        to="/create"
        className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Create a Contest
      </Link>
    </div>
  );
}
