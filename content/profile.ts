// TODO: 실제 정보로 교체하세요.
export const profile = {
  name: "이름",
  role: "UX/UI Designer",
  headline: "생각을 연결해 경험을 설계합니다.",
  intro:
    "사용자 리서치에서 인터랙션 디테일까지, 문제를 구조화하고 제품의 경험을 설계하는 UX/UI 디자이너입니다. 이 사이트 역시 제 작업물 중 하나입니다.",
  email: "hello@example.com",
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Behance", href: "https://www.behance.net/" },
    { label: "GitHub", href: "https://github.com/" },
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Design", items: ["UX Research", "Information Architecture", "Interaction Design", "Design System"] },
  { group: "Tools", items: ["Figma", "Framer", "Protopie", "Adobe CC"] },
  { group: "Build", items: ["HTML/CSS", "TypeScript", "React / Next.js", "Three.js"] },
];

export const career: { period: string; company: string; role: string; description: string }[] = [
  { period: "2024 — 현재", company: "회사명", role: "Product Designer", description: "담당 업무와 주요 성과를 적습니다." },
  { period: "2022 — 2024", company: "회사명", role: "UX/UI Designer", description: "담당 업무와 주요 성과를 적습니다." },
  { period: "2018 — 2022", company: "학교명", role: "시각디자인 전공", description: "학업 및 활동 내용을 적습니다." },
];
