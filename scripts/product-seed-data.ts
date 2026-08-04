// 검색 기능 시연/테스트용 더미 제품 (기획서 v1.6 7번 "빈 화면 방지를 위해 더미 사료 데이터 시드 준비 필요")

export const DUMMY_PRODUCTS: { name: string; brand: string; ingredients: string[] }[] = [
  {
    name: "오리와 현미 사료",
    brand: "네추럴코어",
    ingredients: ["오리고기", "현미", "연어오일", "타우린"],
  },
  {
    name: "인도어 어덜트",
    brand: "로얄캐닌",
    ingredients: ["닭고기분말", "옥수수", "밀글루텐", "비타민E"],
  },
  {
    name: "연어와 완두콩 그레인프리",
    brand: "지위픽",
    ingredients: ["연어", "완두콩", "아마씨", "프로바이오틱스"],
  },
];
