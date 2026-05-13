import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-red-600">403 – Access Denied</h1>
      <p className="mt-2">You do not have permission to view this page.</p>
      <Link to="/login" className="mt-4 text-blue-500 underline">Go to Login</Link>
    </div>
  );
}