var PatchNote = [
    new PatchInfo("0.9.0", "폭탄 설정 모드 - 로케이션 레이어 개념 구현 (한 곳에 로케이션 중첩 시 탭 키로 레이어 전환)\n" + "자잘한 버그 수정"),
    new PatchInfo("0.8.0", "로케이션 드래그 이동 기능 구현\n" + "로케이션 중첩 시 순차 선택 기능 구현"),
    new PatchInfo("0.7.0", "폭탄 설정 모드의 폭탄 유닛 선택 방식 변경\n" + "장애물 설정 시 이미지 표시\n" + "폭탄 설정 시 종족별로 색깔 다르게 표시"),
    new PatchInfo("0.6.0", "폭탄 설정 모드 기본 기능 구현 완료\n" + "버그 수정 및 코드 개선"),
    new PatchInfo("0.5.0", "지형 모드일 때 로케이션이 보이지 않도록 수정\n" + "프로젝트 개념 도입 및 현재 패턴 표시\n" + "전반적인 코드 개선"),
    new PatchInfo("0.4.0", "로케이션 모드 구현 완료"),
    new PatchInfo("0.3.0", "지형 모드 구현 완료 (지형 복사/붙여넣기는 나중에 지원할 예정)"),
    new PatchInfo("0.2.0", "캔버스 기능 구현 (지형, 로케이션, 그리드)\n" + "Badlands ~ Twilight World 까지 모든 지형 지원\n" + "디자인 패턴 변경 (-> MVC)"),
    new PatchInfo("0.1.0", "데스크탑 브라우저용 기본 UI 설계 작업")
];

function PatchInfo(version, detail) {
    this.version = version;
    this.detail = detail;
}