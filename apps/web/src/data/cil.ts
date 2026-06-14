// Coal India Limited — Management Trainee eligibility (POST CODE 11–17).
// Shared by the homepage hero carousel and the PSU > CIL page.

export type CilRow = {
  code: string;
  slug: string;
  discipline: string;
  qualification: string;
};

export const CIL_ROWS: CilRow[] = [
  { code: "11", slug: "civil", discipline: "Civil", qualification: "Degree in the relevant branch of Engg. with a minimum of 60% marks" },
  { code: "12", slug: "electrical", discipline: "Electrical", qualification: "Degree in the relevant branch of Engg. with a minimum of 60% marks" },
  { code: "13", slug: "mechanical", discipline: "Mechanical", qualification: "Degree in the relevant branch of Engg. with a minimum of 60% marks" },
  { code: "14", slug: "system", discipline: "System", qualification: "Recognized 1st Class Degree in BE / B.Tech / B.Sc (Engg.) in Computer Science / Computer Engineering / I.T, or any 1st Class Degree with MCA" },
  { code: "15", slug: "e-and-t", discipline: "E&T", qualification: "BE / B.Tech / B.Sc (Engg.) in relevant branch of Engineering with minimum 60% marks" },
  { code: "16", slug: "geology", discipline: "Geology", qualification: "M.Sc. / M.Tech. in Geology or Applied Geology or Geophysics or Applied Geophysics with minimum 60% marks" },
  { code: "17", slug: "industrial-engineering", discipline: "Industrial Engineering", qualification: "Degree in the relevant branch of Engg. with a minimum of 60% marks" },
];

/** Look up a CIL discipline by its URL slug. */
export function getCilDiscipline(slug: string): CilRow | undefined {
  return CIL_ROWS.find((r) => r.slug === slug);
}

// Official CIL Management Trainee recruitment notification (TCS iON).
export const CIL_RECRUITMENT_URL =
  "https://g03.tcsion.com//per/g03/pub/726/EForms/image/ImageDocUpload/71161/5/1501287760.pdf";
