import Link from "next/link";
import Header from "../components/header/header";

export default function NotFound() {
  return (
    <>
      <Header heading="Not Found" />

      <p>
        <Link href="/">&larr; Back to Home</Link>
      </p>
    </>
  );
}
