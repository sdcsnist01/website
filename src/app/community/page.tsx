import { notFound } from "next/navigation";

// Community Pulse is hidden. The old static page (page.disabled.tsx + community-pulse.json)
// was removed from this repo; recover it from the original SDC-SNIST project if needed.
export default function CommunityPage() {
  notFound();
}
