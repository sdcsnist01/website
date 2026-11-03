/**
 * DEMO RECORDS. Past-board names and tenures below are the sample data shipped with the
 * Claude Design reference (about-data.js, archive.demo = true). They are not verified SDC
 * records. Replace with confirmed board records and set `demo` to false.
 * Only the first 10 of the reference's 20 members per year are copied here.
 */
export type ArchiveMember = { id: string; name: string; role: string };
export type ArchiveYear = { id: string; label: string; tenure: string; members: ArchiveMember[] };

export const ARCHIVE_DEMO = {
  demo: true,
  eyebrow: "PAST LEADERSHIP · SDC SNIST",
  intro:
    "Every board that came before shaped what SDC is today. This archive brings their names, roles and tenures together, batch by batch.",
  empty: "Previous board records are being collected. Names, positions and tenures will appear here once confirmed.",
  years: [
    {
      id: "2024",
      label: "2024",
      tenure: "2024–25",
      members: [
        { id: "sdc-2024-01", name: "Aarav Malhotra", role: "President" },
        { id: "sdc-2024-02", name: "Vihaan Mehta", role: "Vice President" },
        { id: "sdc-2024-03", name: "Aditya Ghosh", role: "Technical Lead" },
        { id: "sdc-2024-04", name: "Arjun Kamath", role: "Secretary" },
        { id: "sdc-2024-05", name: "Ishaan Pandey", role: "Treasurer" },
        { id: "sdc-2024-06", name: "Kabir Mukherjee", role: "AI/ML Lead" },
        { id: "sdc-2024-07", name: "Rohan Trivedi", role: "Web Development Lead" },
        { id: "sdc-2024-08", name: "Neel Menon", role: "App Development Lead" },
        { id: "sdc-2024-09", name: "Dhruv Qureshi", role: "Design Lead" },
        { id: "sdc-2024-10", name: "Yash Pillai", role: "Event Coordinator" },
      ],
    },
    {
      id: "2025",
      label: "2025",
      tenure: "2025–26",
      members: [
        { id: "sdc-2025-01", name: "Ananya Shetty", role: "President" },
        { id: "sdc-2025-02", name: "Diya Mishra", role: "Vice President" },
        { id: "sdc-2025-03", name: "Meera Banerjee", role: "Technical Lead" },
        { id: "sdc-2025-04", name: "Isha Saxena", role: "Secretary" },
        { id: "sdc-2025-05", name: "Kavya Thomas", role: "Treasurer" },
        { id: "sdc-2025-06", name: "Riya Reddy", role: "AI/ML Lead" },
        { id: "sdc-2025-07", name: "Saanvi Kulkarni", role: "Web Development Lead" },
        { id: "sdc-2025-08", name: "Tara Gupta", role: "App Development Lead" },
        { id: "sdc-2025-09", name: "Nisha Raman", role: "Design Lead" },
        { id: "sdc-2025-10", name: "Pooja Desai", role: "Event Coordinator" },
      ],
    },
    {
      id: "2026",
      label: "2026",
      tenure: "2026–27",
      members: [
        { id: "sdc-2026-01", name: "Aditi Bhatia", role: "President" },
        { id: "sdc-2026-02", name: "Kiara Pinto", role: "Vice President" },
        { id: "sdc-2026-03", name: "Naina Verma", role: "Technical Lead" },
        { id: "sdc-2026-04", name: "Ritu Bhat", role: "Secretary" },
        { id: "sdc-2026-05", name: "Sahil Shah", role: "Treasurer" },
        { id: "sdc-2026-06", name: "Tanvi Naidu", role: "AI/ML Lead" },
        { id: "sdc-2026-07", name: "Vikram Prabhu", role: "Web Development Lead" },
        { id: "sdc-2026-08", name: "Omar Tiwari", role: "App Development Lead" },
        { id: "sdc-2026-09", name: "Farhan Chatterjee", role: "Design Lead" },
        { id: "sdc-2026-10", name: "Zoya Lal", role: "Event Coordinator" },
      ],
    },
  ] satisfies ArchiveYear[],
};
