interface StarRatingProps {
  rating: number; // 0~5, 정수
  className?: string; // 글자 크기는 호출부에서 text-* 유틸리티로 지정
  onSelect?: (rating: number) => void; // 있으면 탭으로 선택 가능한 인터랙티브 버전이 된다
}

const STAR_VALUES = [1, 2, 3, 4, 5];

// rating 이하는 채워진 별(accent), 그 이상은 빈 별(line) — 선택 UI와 읽기 전용 표시 양쪽에서 재사용
export function StarRating({ rating, className, onSelect }: StarRatingProps) {
  if (onSelect) {
    return (
      <div className={`flex gap-1 tracking-[4px] ${className ?? ""}`} role="radiogroup" aria-label="별점 선택">
        {STAR_VALUES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-label={`${value}점`}
            aria-pressed={value <= rating}
            className={`font-body ${value <= rating ? "text-primary" : "text-line"}`}
          >
            {value <= rating ? "★" : "☆"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className={`font-body tracking-[1px] ${className ?? ""}`} aria-label={`별점 ${rating}점`}>
      {STAR_VALUES.map((value) => (
        <span key={value} className={value <= rating ? "text-primary" : "text-line"}>
          {value <= rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}
